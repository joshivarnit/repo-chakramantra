"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export interface MultiPVLine {
  multipv: number;          // 1-15 (1st best, 2nd best, etc.)
  depth: number;
  score: number;            // centipawns (from engine's active side or White)
  scoreFromWhite: number;   // normalized from White's perspective
  isMate: boolean;
  mateIn: number;
  moveUci: string;          // e.g. "e2e4"
  pvLine: string[];         // UCI list of moves
}

export interface StockfishState {
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
  multiPvLines: MultiPVLine[]; // Up to 15 best candidate moves
  nodes: number;
  nps: number;
}

interface UseStockfishOptions {
  onBestMove?: (bestMove: string, ponder?: string) => void;
  defaultMultiPV?: number;  // Default 15 lines
}

export function useStockfish(options: UseStockfishOptions = {}) {
  const [multipvCount, setMultipvCount] = useState<number>(options.defaultMultiPV || 15);
  const [state, setState] = useState<StockfishState>({
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
  const multiPvMapRef = useRef<Map<number, MultiPVLine>>(new Map());
  const onBestMoveRef = useRef(options.onBestMove);
  onBestMoveRef.current = options.onBestMove;

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const worker = new Worker('/stockfish.js');
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const line = event.data;
      if (typeof line !== 'string') return;

      // Ready signal
      if (line.includes('readyok')) {
        isReadyRef.current = true;
        // Configure MultiPV to 15
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

        // Sort all multipv lines by rank
        const sortedLines = Array.from(multiPvMapRef.current.values())
          .sort((a, b) => a.multipv - b.multipv);

        setState(prev => {
          const next = { ...prev };

          if (currentDepth > 0) {
            next.depth = currentDepth;
          }

          if (currentMultiPV === 1) {
            next.evaluation = activeTurnRef.current === 'w' ? lineScore : -lineScore;
            next.isMate = isMate;
            next.mateIn = mateIn;
            if (pvMoves.length > 0) next.pvLine = pvMoves;
          }

          next.multiPvLines = sortedLines;
          if (nodesMatch) next.nodes = parseInt(nodesMatch[1], 10);
          if (npsMatch) next.nps = parseInt(npsMatch[1], 10);

          return next;
        });
      }

      // Best move
      if (line.startsWith('bestmove')) {
        const match = line.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
        if (match) {
          const bestMove = match[1];
          const ponder = match[2] || '';
          setState(prev => ({
            ...prev,
            bestMove,
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
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Update MultiPV option
  const updateMultiPV = useCallback((count: number) => {
    const clamped = Math.max(1, Math.min(15, count));
    setMultipvCount(clamped);
    if (workerRef.current && isReadyRef.current) {
      workerRef.current.postMessage(`setoption name MultiPV value ${clamped}`);
    }
  }, []);

  // Send command
  const sendCommand = useCallback((cmd: string) => {
    workerRef.current?.postMessage(cmd);
  }, []);

  // Start analysis of a position
  const analyze = useCallback((fen: string, depth: number = 20, activeTurn: 'w' | 'b' = 'w') => {
    if (!workerRef.current) return;
    activeTurnRef.current = activeTurn;
    multiPvMapRef.current.clear();
    sendCommand('stop');
    sendCommand(`setoption name MultiPV value ${multipvCount}`);
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth}`);
    setState(prev => ({ ...prev, isSearching: true, multiPvLines: [] }));
  }, [sendCommand, multipvCount]);

  // Start analysis for playing
  const play = useCallback((fen: string, depth: number = 15, activeTurn: 'w' | 'b' = 'w') => {
    if (!workerRef.current) return;
    activeTurnRef.current = activeTurn;
    multiPvMapRef.current.clear();
    sendCommand('stop');
    // During actual game play search, use 1 line for maximum speed or keep multiPV
    sendCommand(`setoption name MultiPV value 1`);
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth}`);
    setState(prev => ({ ...prev, isSearching: true, multiPvLines: [] }));
  }, [sendCommand]);

  // Stop current search
  const stop = useCallback(() => {
    sendCommand('stop');
    setState(prev => ({ ...prev, isSearching: false }));
  }, [sendCommand]);

  // Reset engine
  const newGame = useCallback(() => {
    multiPvMapRef.current.clear();
    sendCommand('stop');
    sendCommand('ucinewgame');
    sendCommand(`setoption name MultiPV value ${multipvCount}`);
    sendCommand('isready');
    setState(prev => ({
      ...prev,
      evaluation: 0,
      depth: 0,
      bestMove: '',
      bestMoveSan: '',
      ponderMove: '',
      isMate: false,
      mateIn: 0,
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
