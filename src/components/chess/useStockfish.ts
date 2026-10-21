"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getOpeningPositionData } from './opening-explorer';

export interface MultiPVLine {
  multipv: number;          // 1-20 (1st best, 2nd best, etc.)
  depth: number;
  score: number;            // centipawns (from engine's active side or White)
  scoreFromWhite: number;   // normalized from White's perspective
  isMate: boolean;
  mateIn: number;
  moveUci: string;          // e.g. "e2e4"
  pvLine: string[];         // UCI list of moves
}

export interface StockfishState {
  analyzedFen: string;      // The exact position FEN these lines belong to
  evaluation: number;       // centipawns from White's perspective
  depth: number;
  bestMove: string;         // UCI format e.g. "e2e4"
  bestMoveSan: string;
  ponderMove: string;
  isMate: boolean;
  mateIn: number;
  isReady: boolean;
  isSearching: boolean;
  pvLine: string[];         // Principal variation
  multiPvLines: MultiPVLine[]; // Up to 20 best candidate moves
  nodes: number;
  nps: number;
}

interface UseStockfishOptions {
  onBestMove?: (bestMove: string, ponder?: string, analyzedFen?: string) => void;
  defaultMultiPV?: number;
}

interface SearchTask {
  fen: string;
  depth: number;
  multiPv: number;
  mode: 'analyze' | 'play';
}

export function normalizeFen(fen: string): string {
  if (!fen) return '';
  const parts = fen.trim().split(/\s+/);
  return parts.slice(0, 4).join(' '); // pieces, turn, castling, en-passant
}

// Global LRU position cache to provide instant 0ms predictions on revisit or transposition
const globalPositionCache = new Map<string, {
  evaluation: number;
  depth: number;
  bestMove: string;
  isMate: boolean;
  mateIn: number;
  multiPvLines: MultiPVLine[];
}>();

function getInstantBookLines(moves: string[], sideToMove: 'w' | 'b', maxLines: number): MultiPVLine[] {
  try {
    const bookData = getOpeningPositionData(moves);
    if (!bookData || !bookData.continuations || bookData.continuations.length === 0) {
      return [];
    }
    return bookData.continuations.slice(0, maxLines).map((c, idx) => {
      const winPct = sideToMove === 'w' ? c.whiteWinPct : c.blackWinPct;
      const losePct = sideToMove === 'w' ? c.blackWinPct : c.whiteWinPct;
      const score = Math.round((winPct - losePct) * 10);
      const scoreFromWhite = sideToMove === 'w' ? score : -score;
      return {
        multipv: idx + 1,
        depth: 1,
        score,
        scoreFromWhite,
        isMate: false,
        mateIn: 0,
        moveUci: c.uci,
        pvLine: [c.uci],
      };
    });
  } catch {
    return [];
  }
}

export function useStockfish(options: UseStockfishOptions = {}) {
  const [multipvCount, setMultipvCount] = useState<number>(options.defaultMultiPV || 3);
  const multipvRef = useRef<number>(options.defaultMultiPV || 3);
  const [state, setState] = useState<StockfishState>({
    analyzedFen: '',
    evaluation: 0,
    depth: 0,
    bestMove: '',
    bestMoveSan: '',
    ponderMove: '',
    isMate: false,
    mateIn: 0,
    isReady: false,
    isSearching: false,
    pvLine: [],
    multiPvLines: [],
    nodes: 0,
    nps: 0,
  });

  const workerRef = useRef<Worker | null>(null);
  const isReadyRef = useRef(false);
  const engineStatusRef = useRef<'idle' | 'searching' | 'stopping'>('idle');
  const currentTaskRef = useRef<SearchTask | null>(null);
  const queuedTaskRef = useRef<SearchTask | null>(null);
  const activeTurnRef = useRef<'w' | 'b'>('w');
  const currentAnalyzingFenRef = useRef<string>('');
  const multiPvMapRef = useRef<Map<number, MultiPVLine>>(new Map());

  // Sync multipvRef when defaultMultiPV option changes
  useEffect(() => {
    if (options.defaultMultiPV && options.defaultMultiPV !== multipvRef.current) {
      const clamped = Math.max(1, Math.min(20, options.defaultMultiPV));
      multipvRef.current = clamped;
      setMultipvCount(clamped);
    }
  }, [options.defaultMultiPV]);

  const onBestMoveRef = useRef(options.onBestMove);
  useEffect(() => {
    onBestMoveRef.current = options.onBestMove;
  }, [options.onBestMove]);

  // Throttle timer for smooth UI without freezing
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<Partial<StockfishState> | null>(null);

  const flushUpdate = useCallback(() => {
    if (pendingUpdateRef.current) {
      setState(prev => ({
        ...prev,
        ...pendingUpdateRef.current,
      }));
      pendingUpdateRef.current = null;
    }
  }, []);

  const scheduleUpdate = useCallback((partial: Partial<StockfishState>, delayMs: number = 30) => {
    pendingUpdateRef.current = {
      ...(pendingUpdateRef.current || {}),
      ...partial,
    };

    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        flushUpdate();
      }, delayMs);
    }
  }, [flushUpdate]);

  // Execute a search task directly on Stockfish Web Worker
  const startEngineSearch = useCallback((task: SearchTask) => {
    const worker = workerRef.current;
    if (!worker || !isReadyRef.current) {
      queuedTaskRef.current = task;
      return;
    }

    engineStatusRef.current = 'searching';
    currentTaskRef.current = task;
    currentAnalyzingFenRef.current = task.fen;
    activeTurnRef.current = (task.fen.split(' ')[1] as 'w' | 'b') || 'w';
    multiPvMapRef.current.clear();

    worker.postMessage(`setoption name MultiPV value ${task.multiPv}`);
    worker.postMessage(`position fen ${task.fen}`);
    worker.postMessage(`go depth ${task.depth}`);

    setState(prev => ({
      ...prev,
      isSearching: true,
    }));
  }, []);

  // Dispatch or queue search with deterministic state machine
  const requestSearch = useCallback((task: SearchTask) => {
    // If already searching this exact position at the same depth and multipv, do not interrupt
    if (
      engineStatusRef.current === 'searching' &&
      currentTaskRef.current &&
      normalizeFen(currentTaskRef.current.fen) === normalizeFen(task.fen) &&
      currentTaskRef.current.depth === task.depth &&
      currentTaskRef.current.multiPv === task.multiPv
    ) {
      return;
    }

    // Check instant position cache to immediately populate board arrows in 0ms
    const baseFen = normalizeFen(task.fen);
    if (globalPositionCache.has(baseFen)) {
      const cached = globalPositionCache.get(baseFen)!;
      const lines = cached.multiPvLines.slice(0, task.multiPv);
      setState(prev => ({
        ...prev,
        analyzedFen: task.fen,
        evaluation: cached.evaluation,
        depth: cached.depth,
        bestMove: cached.bestMove,
        isMate: cached.isMate,
        mateIn: cached.mateIn,
        multiPvLines: lines,
      }));
    }

    if (engineStatusRef.current === 'idle') {
      startEngineSearch(task);
    } else if (engineStatusRef.current === 'searching') {
      queuedTaskRef.current = task;
      engineStatusRef.current = 'stopping';
      workerRef.current?.postMessage('stop');
    } else if (engineStatusRef.current === 'stopping') {
      // Already stopping, simply replace queued task with the latest request
      queuedTaskRef.current = task;
    }
  }, [startEngineSearch]);

  // Initialize worker once and maintain lifecycle with error recovery
  const initWorker = useCallback(() => {
    if (typeof window === 'undefined') return;

    let worker: Worker;
    try {
      worker = new Worker('/stockfish.js');
      workerRef.current = worker;
    } catch {
      console.warn("Stockfish worker could not be started.");
      return;
    }

    worker.onerror = (e) => {
      console.error("Stockfish worker error:", e);
      try {
        worker.terminate();
      } catch {}
      isReadyRef.current = false;
      engineStatusRef.current = 'idle';
      setTimeout(initWorker, 200);
    };

    worker.onmessage = (event) => {
      const line = event.data;
      if (typeof line !== 'string') return;

      // Engine ready signal
      if (line.includes('readyok')) {
        isReadyRef.current = true;
        setState(prev => ({ ...prev, isReady: true }));

        if (queuedTaskRef.current) {
          const task = queuedTaskRef.current;
          queuedTaskRef.current = null;
          startEngineSearch(task);
        }
        return;
      }

      // Parse UCI info lines
      if (line.startsWith('info') && line.includes('depth')) {
        const depthMatch = line.match(/depth (\d+)/);
        const multipvMatch = line.match(/multipv (\d+)/);
        const cpMatch = line.match(/ cp (-?\d+)/);
        const mateMatch = line.match(/ mate (-?\d+)/);
        const nodesMatch = line.match(/nodes (\d+)/);
        const npsMatch = line.match(/nps (\d+)/);
        const pvMatch = line.match(/ pv (.+)/);

        const currentDepth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
        const currentMultiPV = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;

        let lineScore = 0;
        let isMate = false;
        let mateIn = 0;

        if (cpMatch) {
          lineScore = parseInt(cpMatch[1], 10);
        } else if (mateMatch) {
          mateIn = parseInt(mateMatch[1], 10);
          isMate = true;
          lineScore = mateIn > 0 ? 10000 : -10000;
        }

        const pvMoves = pvMatch ? pvMatch[1].trim().split(/\s+/) : [];
        const moveUci = pvMoves[0] || '';

        // Store candidate lines up to user-selected multipv limit
        if (moveUci && currentMultiPV <= multipvRef.current) {
          const scoreFromWhite = activeTurnRef.current === 'w' ? lineScore : -lineScore;
          multiPvMapRef.current.set(currentMultiPV, {
            multipv: currentMultiPV,
            depth: currentDepth,
            score: lineScore,
            scoreFromWhite,
            isMate,
            mateIn,
            moveUci,
            pvLine: pvMoves,
          });
        }

        const sortedLines = Array.from(multiPvMapRef.current.values())
          .filter(l => l.multipv <= multipvRef.current)
          .sort((a, b) => a.multipv - b.multipv);

        const updateData: Partial<StockfishState> = {
          analyzedFen: currentAnalyzingFenRef.current,
          multiPvLines: sortedLines,
        };

        if (currentDepth > 0) {
          updateData.depth = currentDepth;
        }

        if (currentMultiPV === 1) {
          updateData.evaluation = activeTurnRef.current === 'w' ? lineScore : -lineScore;
          updateData.isMate = isMate;
          updateData.mateIn = activeTurnRef.current === 'w' ? mateIn : -mateIn;
          updateData.bestMove = moveUci;
          if (pvMoves.length > 0) updateData.pvLine = pvMoves;
        }

        if (nodesMatch) updateData.nodes = parseInt(nodesMatch[1], 10);
        if (npsMatch) updateData.nps = parseInt(npsMatch[1], 10);

        // Update global position cache
        if (currentAnalyzingFenRef.current && sortedLines.length > 0) {
          const baseFen = normalizeFen(currentAnalyzingFenRef.current);
          globalPositionCache.set(baseFen, {
            evaluation: updateData.evaluation ?? (activeTurnRef.current === 'w' ? sortedLines[0].score : -sortedLines[0].score),
            depth: currentDepth,
            bestMove: sortedLines[0].moveUci,
            isMate,
            mateIn,
            multiPvLines: sortedLines,
          });
          if (globalPositionCache.size > 500) {
            const firstKey = globalPositionCache.keys().next().value;
            if (firstKey) globalPositionCache.delete(firstKey);
          }
        }

        // Rapid flush when depth 1 lines are complete so all variations appear immediately
        if (sortedLines.length >= multipvRef.current || currentDepth === 1) {
          scheduleUpdate(updateData, 10);
        } else {
          scheduleUpdate(updateData, 30);
        }
      }

      // Best move emitted when search completes or stops
      if (line.startsWith('bestmove')) {
        const match = line.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
        const bestMove = match ? match[1] : '';
        const ponder = match && match[2] ? match[2] : '';

        const finishedTask = currentTaskRef.current;
        engineStatusRef.current = 'idle';
        currentTaskRef.current = null;

        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
          throttleTimerRef.current = null;
        }
        flushUpdate();

        // If another search was queued while stopping, start it immediately
        if (queuedTaskRef.current) {
          const nextTask = queuedTaskRef.current;
          queuedTaskRef.current = null;
          startEngineSearch(nextTask);
        } else {
          setState(prev => ({
            ...prev,
            bestMove: bestMove && bestMove !== '(none)' ? bestMove : prev.bestMove,
            ponderMove: ponder,
            isSearching: false,
          }));
        }

        if (bestMove && bestMove !== '(none)' && finishedTask) {
          onBestMoveRef.current?.(bestMove, ponder || undefined, finishedTask.fen);
        }
      }
    };

    worker.postMessage('uci');
    worker.postMessage('isready');
  }, [flushUpdate, scheduleUpdate, startEngineSearch]);

  useEffect(() => {
    initWorker();

    return () => {
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [initWorker]);

  // Send raw command
  const sendCommand = useCallback((cmd: string) => {
    workerRef.current?.postMessage(cmd);
  }, []);

  // Update MultiPV option dynamically and re-query engine
  const updateMultiPV = useCallback((count: number, currentFen?: string, currentDepth?: number) => {
    const clamped = Math.max(1, Math.min(20, count));
    multipvRef.current = clamped;
    setMultipvCount(clamped);

    const fen = currentFen || currentAnalyzingFenRef.current;
    const depth = currentDepth || 14;

    if (fen) {
      requestSearch({
        fen,
        depth,
        multiPv: clamped,
        mode: 'analyze',
      });
    }
  }, [requestSearch]);

  // Start analysis of a position with instant book / cache restoration
  const analyze = useCallback((fen: string, depth: number = 14, activeTurn?: 'w' | 'b', sanMoves?: string[]) => {
    if (!fen) return;
    const sideToMove = activeTurn || (fen.split(' ')[1] as 'w' | 'b') || 'w';

    // Populate instant opening book lines if not in cache
    const baseFen = normalizeFen(fen);
    if (!globalPositionCache.has(baseFen) && sanMoves && sanMoves.length >= 0) {
      const bookLines = getInstantBookLines(sanMoves, sideToMove, multipvRef.current);
      if (bookLines.length > 0) {
        setState(prev => ({
          ...prev,
          analyzedFen: fen,
          evaluation: bookLines[0].scoreFromWhite,
          depth: 1,
          bestMove: bookLines[0].moveUci,
          multiPvLines: bookLines,
        }));
      }
    }

    requestSearch({
      fen,
      depth,
      multiPv: multipvRef.current,
      mode: 'analyze',
    });
  }, [requestSearch]);

  // Start analysis for bot move, maintaining multiPv count so predictions never drop to 1
  const play = useCallback((fen: string, depth: number = 12, activeTurn?: 'w' | 'b') => {
    if (!fen) return;
    requestSearch({
      fen,
      depth,
      multiPv: multipvRef.current,
      mode: 'play',
    });
  }, [requestSearch]);

  // Stop current search
  const stop = useCallback(() => {
    queuedTaskRef.current = null;
    if (engineStatusRef.current === 'searching') {
      engineStatusRef.current = 'stopping';
      sendCommand('stop');
    }
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    setState(prev => ({ ...prev, isSearching: false }));
  }, [sendCommand]);

  // Reset engine cleanly
  const newGame = useCallback(() => {
    queuedTaskRef.current = null;
    currentTaskRef.current = null;
    engineStatusRef.current = 'idle';
    multiPvMapRef.current.clear();
    currentAnalyzingFenRef.current = '';

    const worker = workerRef.current;
    if (worker) {
      worker.postMessage('stop');
      worker.postMessage('ucinewgame');
      worker.postMessage(`setoption name MultiPV value ${multipvRef.current}`);
      worker.postMessage('isready');
    }

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;

    setState({
      analyzedFen: '',
      evaluation: 0,
      depth: 0,
      bestMove: '',
      bestMoveSan: '',
      ponderMove: '',
      isMate: false,
      mateIn: 0,
      isReady: true,
      isSearching: false,
      pvLine: [],
      multiPvLines: [],
      nodes: 0,
      nps: 0,
    });
  }, []);

  return {
    ...state,
    multipvCount,
    updateMultiPV,
    analyze,
    play,
    stop,
    newGame,
    sendCommand,
  };
}
