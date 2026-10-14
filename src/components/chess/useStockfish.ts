"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

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

interface PendingSearchTask {
  gen: number;
  fen: string;
  depth: number;
  multiPv: number;
  mode: 'analyze' | 'play';
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
  const activeTurnRef = useRef<'w' | 'b'>('w');
  const currentAnalyzingFenRef = useRef<string>('');
  const lastEmittedFenRef = useRef<string>('');
  const lastDepthRef = useRef<number>(14);
  const multiPvMapRef = useRef<Map<number, MultiPVLine>>(new Map());

  // Search generation counter & pending search barrier to prevent race conditions
  const searchGenRef = useRef<number>(0);
  const activeGenRef = useRef<number>(0);
  const pendingSearchRef = useRef<PendingSearchTask | null>(null);

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

  const scheduleUpdate = useCallback((partial: Partial<StockfishState>) => {
    pendingUpdateRef.current = {
      ...(pendingUpdateRef.current || {}),
      ...partial,
    };

    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        flushUpdate();
      }, 50);
    }
  }, [flushUpdate]);

  // Execute a pending search task once engine is verified ready
  const executePendingSearch = useCallback((task: PendingSearchTask) => {
    const worker = workerRef.current;
    if (!worker) return;

    activeGenRef.current = task.gen;
    currentAnalyzingFenRef.current = task.fen;
    lastDepthRef.current = task.depth;
    lastEmittedFenRef.current = '';

    const sideToMove = (task.fen.split(' ')[1] as 'w' | 'b') || 'w';
    activeTurnRef.current = sideToMove;

    multiPvMapRef.current.clear();

    worker.postMessage(`setoption name MultiPV value ${task.multiPv}`);
    worker.postMessage(`position fen ${task.fen}`);
    worker.postMessage(`go depth ${task.depth}`);

    setState(prev => ({
      ...prev,
      analyzedFen: '', // Reset immediately so previous position arrows vanish
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, []);

  // Initialize worker once and keep alive
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let worker: Worker;
    try {
      worker = new Worker('/stockfish.js');
      workerRef.current = worker;
    } catch {
      console.warn("Stockfish worker could not be started.");
      return;
    }

    worker.onmessage = (event) => {
      const line = event.data;
      if (typeof line !== 'string') return;

      // Ready signal barrier
      if (line.includes('readyok')) {
        isReadyRef.current = true;
        setState(prev => ({ ...prev, isReady: true }));

        // If there is a pending queued search, launch it immediately
        if (pendingSearchRef.current) {
          const task = pendingSearchRef.current;
          pendingSearchRef.current = null;
          executePendingSearch(task);
        }
        return;
      }

      // If we are waiting for engine to finish stopping before starting a new search, ignore old output
      if (pendingSearchRef.current !== null) {
        return;
      }

      // Parse info lines
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

        // Only store lines up to current user-selected multipv limit
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

        // Sort and filter active lines
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

        // Immediate flush on the first depth line for a new position so arrows appear immediately (<20ms)
        if (currentAnalyzingFenRef.current && lastEmittedFenRef.current !== currentAnalyzingFenRef.current && sortedLines.length > 0) {
          lastEmittedFenRef.current = currentAnalyzingFenRef.current;
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          pendingUpdateRef.current = null;
          setState(prev => ({
            ...prev,
            ...updateData,
          }));
        } else {
          scheduleUpdate(updateData);
        }
      }

      // Best move
      if (line.startsWith('bestmove')) {
        const match = line.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
        if (match) {
          const bestMove = match[1];
          const ponder = match[2] || '';
          
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          flushUpdate();

          setState(prev => ({
            ...prev,
            bestMove: bestMove !== '(none)' ? bestMove : prev.bestMove,
            ponderMove: ponder,
            isSearching: false,
          }));

          if (bestMove && bestMove !== '(none)') {
            onBestMoveRef.current?.(bestMove, ponder || undefined, currentAnalyzingFenRef.current);
          }
        }
      }
    };

    worker.postMessage('uci');
    worker.postMessage('isready');

    return () => {
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      worker.terminate();
      workerRef.current = null;
    };
  }, [scheduleUpdate, flushUpdate, executePendingSearch]);

  // Send raw command
  const sendCommand = useCallback((cmd: string) => {
    workerRef.current?.postMessage(cmd);
  }, []);

  // Update MultiPV option and instantly re-run analysis if active
  const updateMultiPV = useCallback((count: number, currentFen?: string, currentDepth?: number) => {
    const clamped = Math.max(1, Math.min(20, count));
    multipvRef.current = clamped;
    setMultipvCount(clamped);

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    const fen = currentFen || currentAnalyzingFenRef.current;
    const depth = currentDepth || lastDepthRef.current || 14;

    if (fen && workerRef.current) {
      searchGenRef.current += 1;
      const gen = searchGenRef.current;
      pendingSearchRef.current = {
        gen,
        fen,
        depth,
        multiPv: clamped,
        mode: 'analyze',
      };
      workerRef.current.postMessage('stop');
      workerRef.current.postMessage('isready');
    }

    setState(prev => ({
      ...prev,
      analyzedFen: '',
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, []);

  // Start analysis of a position with race barrier
  const analyze = useCallback((fen: string, depth: number = 14, activeTurn?: 'w' | 'b') => {
    if (!workerRef.current || !fen) return;
    const sideToMove = activeTurn || (fen.split(' ')[1] as 'w' | 'b') || 'w';

    // If already analyzing this exact position at the same depth and not searching, don't restart
    if (currentAnalyzingFenRef.current === fen && lastDepthRef.current === depth && isReadyRef.current && pendingSearchRef.current === null) {
      return;
    }

    activeTurnRef.current = sideToMove;

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    searchGenRef.current += 1;
    const gen = searchGenRef.current;

    pendingSearchRef.current = {
      gen,
      fen,
      depth,
      multiPv: multipvRef.current,
      mode: 'analyze',
    };

    // Immediate stop and synchronization barrier
    workerRef.current.postMessage('stop');
    workerRef.current.postMessage('isready');

    setState(prev => ({
      ...prev,
      analyzedFen: '', // Reset immediately so old arrows disappear
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, []);

  // Start analysis for playing (MultiPV 1)
  const play = useCallback((fen: string, depth: number = 12, activeTurn?: 'w' | 'b') => {
    if (!workerRef.current || !fen) return;
    const sideToMove = activeTurn || (fen.split(' ')[1] as 'w' | 'b') || 'w';

    if (currentAnalyzingFenRef.current === fen && lastDepthRef.current === depth && isReadyRef.current && pendingSearchRef.current === null) {
      return;
    }

    activeTurnRef.current = sideToMove;

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    searchGenRef.current += 1;
    const gen = searchGenRef.current;

    pendingSearchRef.current = {
      gen,
      fen,
      depth,
      multiPv: 1,
      mode: 'play',
    };

    workerRef.current.postMessage('stop');
    workerRef.current.postMessage('isready');

    setState(prev => ({
      ...prev,
      analyzedFen: '',
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, []);

  // Stop current search
  const stop = useCallback(() => {
    pendingSearchRef.current = null;
    sendCommand('stop');
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    setState(prev => ({ ...prev, isSearching: false }));
  }, [sendCommand]);

  // Reset engine
  const newGame = useCallback(() => {
    pendingSearchRef.current = null;
    searchGenRef.current += 1;
    multiPvMapRef.current.clear();
    currentAnalyzingFenRef.current = '';
    lastEmittedFenRef.current = '';
    sendCommand('stop');
    sendCommand('ucinewgame');
    sendCommand(`setoption name MultiPV value ${multipvRef.current}`);
    sendCommand('isready');
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    setState(prev => ({
      ...prev,
      analyzedFen: '',
      evaluation: 0,
      depth: 0,
      bestMove: '',
      bestMoveSan: '',
      ponderMove: '',
      isSearching: false,
      pvLine: [],
      multiPvLines: [],
      nodes: 0,
      nps: 0,
    }));
  }, [sendCommand]);

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
