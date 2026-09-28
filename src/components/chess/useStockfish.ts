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
  onBestMove?: (bestMove: string, ponder?: string) => void;
  defaultMultiPV?: number;
}

export function useStockfish(options: UseStockfishOptions = {}) {
  const [multipvCount, setMultipvCount] = useState<number>(options.defaultMultiPV || 3);
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
  const lastDepthRef = useRef<number>(20);
  const multiPvMapRef = useRef<Map<number, MultiPVLine>>(new Map());
  const onBestMoveRef = useRef(options.onBestMove);
  onBestMoveRef.current = options.onBestMove;

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
      }, 90);
    }
  }, [flushUpdate]);

  // Initialize worker
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

      // Ready signal
      if (line.includes('readyok')) {
        isReadyRef.current = true;
        worker.postMessage(`setoption name MultiPV value ${multipvCount}`);
        setState(prev => ({ ...prev, isReady: true }));
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

        if (moveUci) {
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

        // Sort lines
        const sortedLines = Array.from(multiPvMapRef.current.values())
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

        scheduleUpdate(updateData);
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

          setState(prev => ({
            ...prev,
            bestMove: bestMove !== '(none)' ? bestMove : prev.bestMove,
            ponderMove: ponder,
            isSearching: false,
          }));
          onBestMoveRef.current?.(bestMove, ponder || undefined);
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
  }, [scheduleUpdate]);

  // Send command
  const sendCommand = useCallback((cmd: string) => {
    workerRef.current?.postMessage(cmd);
  }, []);

  // Update MultiPV option and instantly re-run analysis if active
  const updateMultiPV = useCallback((count: number, currentFen?: string, currentDepth?: number) => {
    const clamped = Math.max(1, Math.min(20, count));
    setMultipvCount(clamped);

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    if (workerRef.current && isReadyRef.current) {
      workerRef.current.postMessage('stop');
      workerRef.current.postMessage(`setoption name MultiPV value ${clamped}`);
      workerRef.current.postMessage('isready');

      const fen = currentFen || currentAnalyzingFenRef.current;
      const depth = currentDepth || lastDepthRef.current || 20;

      if (fen) {
        currentAnalyzingFenRef.current = fen;
        const sideToMove = (fen.split(' ')[1] as 'w' | 'b') || 'w';
        activeTurnRef.current = sideToMove;
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage(`go depth ${depth}`);
        setState(prev => ({
          ...prev,
          analyzedFen: '',
          isSearching: true,
          bestMove: '',
          pvLine: [],
          multiPvLines: [],
        }));
      }
    }
  }, []);

  // Start analysis of a position
  const analyze = useCallback((fen: string, depth: number = 20, activeTurn?: 'w' | 'b') => {
    if (!workerRef.current) return;
    const sideToMove = activeTurn || (fen.split(' ')[1] as 'w' | 'b') || 'w';
    activeTurnRef.current = sideToMove;
    currentAnalyzingFenRef.current = fen;
    lastDepthRef.current = depth;

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    sendCommand('stop');
    sendCommand(`setoption name MultiPV value ${multipvCount}`);
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth}`);

    setState(prev => ({
      ...prev,
      analyzedFen: '', // Cleared so old position arrows disappear immediately!
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, [sendCommand, multipvCount]);

  // Start analysis for playing
  const play = useCallback((fen: string, depth: number = 15, activeTurn?: 'w' | 'b') => {
    if (!workerRef.current) return;
    const sideToMove = activeTurn || (fen.split(' ')[1] as 'w' | 'b') || 'w';
    activeTurnRef.current = sideToMove;
    currentAnalyzingFenRef.current = fen;
    lastDepthRef.current = depth;

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    multiPvMapRef.current.clear();

    sendCommand('stop');
    sendCommand(`setoption name MultiPV value 1`);
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth}`);

    setState(prev => ({
      ...prev,
      analyzedFen: '',
      isSearching: true,
      bestMove: '',
      pvLine: [],
      multiPvLines: [],
    }));
  }, [sendCommand]);

  // Stop current search
  const stop = useCallback(() => {
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
    multiPvMapRef.current.clear();
    currentAnalyzingFenRef.current = '';
    sendCommand('stop');
    sendCommand('ucinewgame');
    sendCommand(`setoption name MultiPV value ${multipvCount}`);
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
  }, [sendCommand, multipvCount]);

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
