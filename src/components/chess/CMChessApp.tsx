"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function CMChessApp() {
  const [game, setGame] = useState(new Chess());
  const [evaluation, setEvaluation] = useState<number>(0.0);
  const [depth, setDepth] = useState<number>(0);
  const [bestMove, setBestMove] = useState<string>("");
  const workerRef = useRef<Worker | null>(null);

  // Initialize Stockfish worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker("/stockfish.js");

      workerRef.current.onmessage = (event) => {
        const line = event.data;
        if (typeof line !== "string") return;

        // Parse evaluation and best move
        if (line.includes("info depth")) {
          const depthMatch = line.match(/depth (\d+)/);
          const cpMatch = line.match(/cp (-?\d+)/);
          const mateMatch = line.match(/mate (-?\d+)/);

          if (depthMatch) {
            setDepth(parseInt(depthMatch[1], 10));
          }

          if (cpMatch) {
            // cp is centipawns, convert to pawns
            const cp = parseInt(cpMatch[1], 10);
            let evalScore = cp / 100.0;
            // Stockfish reports relative to the side to move, let's keep it relative to White
            if (game.turn() === "b") {
              evalScore = -evalScore;
            }
            setEvaluation(evalScore);
          } else if (mateMatch) {
            const mateIn = parseInt(mateMatch[1], 10);
            setEvaluation(mateIn > 0 ? 100 : -100);
          }
        }

        if (line.includes("bestmove")) {
          const match = line.match(/bestmove\s+(\S+)/);
          if (match) {
            setBestMove(match[1]);
          }
        }
      };

      workerRef.current.postMessage("uci");
      workerRef.current.postMessage("isready");
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Update engine whenever fen changes
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage("stop");
      workerRef.current.postMessage(`position fen ${game.fen()}`);
      workerRef.current.postMessage("go depth 15");
    }
  }, [game.fen()]);

  // Make a move
  const makeAMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  function onDrop({ sourceSquare, targetSquare, piece }: { sourceSquare: string, targetSquare: string | null, piece: any }) {
    if (!targetSquare) return false;
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece ? piece[1].toLowerCase() : "q",
    });

    // If it's a valid move (e.g. analysis board), it just happens. 
    return move;
  }

  // Calculate Eval Bar Height (cap at +5 / -5)
  const evalPercent = 50 + (Math.max(-5, Math.min(5, evaluation)) / 5) * 50;

  return (
    <div className="flex flex-col w-full h-full bg-[#161512] text-white rounded-2xl overflow-hidden shadow-2xl relative border border-white/10 font-sans">
      {/* Header Info */}
      <div className="p-3 bg-black/40 border-b border-white/10 text-xs font-semibold flex justify-between items-center text-gray-300">
        <span>Analysis Board</span>
        <span className="text-primary font-heading tracking-wide">CMchess App</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Evaluation Bar */}
        <div className="w-4 h-full bg-gray-800 relative flex flex-col-reverse overflow-hidden border-r border-white/5">
          <div 
            className="w-full bg-gray-200 transition-all duration-300 ease-in-out" 
            style={{ height: `${evalPercent}%` }}
          />
        </div>

        {/* Board */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-[#2d2a26]">
            <Chessboard 
              options={{
                position: game.fen(), 
                onPieceDrop: onDrop,
                darkSquareStyle: { backgroundColor: '#779556' },
                lightSquareStyle: { backgroundColor: '#ebecd0' }
              }}
            />
          </div>

          {/* Engine Info */}
          <div className="p-3 bg-black/60 border-t border-white/10 text-xs flex flex-col gap-1 h-[70px]">
            <div className="flex items-center gap-3 font-mono text-gray-300">
              <span className={evaluation > 0 ? "text-green-400 font-bold" : evaluation < 0 ? "text-red-400 font-bold" : "text-gray-400 font-bold"}>
                {evaluation > 0 ? "+" : ""}{evaluation.toFixed(2)}
              </span>
              <span className="text-gray-500">(depth {depth})</span>
            </div>
            {bestMove && (
              <div className="text-gray-400 font-mono truncate">
                Best move: <span className="text-blue-400">{bestMove}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
