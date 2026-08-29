"use client";

import React, { useRef, useEffect } from 'react';
import { toFigurineNotation } from './chess-utils';
import { MOVE_CLASSIFICATIONS, MoveClassification } from './themes';
import type { MoveEntry } from './useGameState';

interface MoveHistoryProps {
  moves: MoveEntry[];
  currentIndex: number;
  figurineNotation: boolean;
  showStrength: boolean;
  onGoToMove: (index: number) => void;
}

export default function MoveHistory({
  moves,
  currentIndex,
  figurineNotation,
  showStrength,
  onGoToMove,
}: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active move
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Group moves into pairs (white, black)
  const movePairs: Array<{ moveNumber: number; white?: { entry: MoveEntry; index: number }; black?: { entry: MoveEntry; index: number } }> = [];

  for (let i = 0; i < moves.length; i++) {
    const moveNumber = Math.floor(i / 2) + 1;
    if (i % 2 === 0) {
      movePairs.push({
        moveNumber,
        white: { entry: moves[i], index: i },
      });
    } else {
      const last = movePairs[movePairs.length - 1];
      if (last) {
        last.black = { entry: moves[i], index: i };
      }
    }
  }

  const formatMove = (san: string) => {
    if (figurineNotation) {
      return toFigurineNotation(san);
    }
    return san;
  };

  const getClassColor = (entry: MoveEntry): string | undefined => {
    if (!showStrength || !entry.classification) return undefined;
    const info = MOVE_CLASSIFICATIONS[entry.classification as MoveClassification];
    return info?.color;
  };

  const getClassSymbol = (entry: MoveEntry): string => {
    if (!showStrength || !entry.classification) return '';
    const info = MOVE_CLASSIFICATIONS[entry.classification as MoveClassification];
    return info?.symbol || '';
  };

  return (
    <div className="move-history" ref={containerRef}>
      <div className="move-history-header">
        <span>Moves</span>
      </div>
      <div className="move-history-list">
        {movePairs.length === 0 && (
          <div className="move-history-empty">
            No moves yet. Make a move or load a PGN.
          </div>
        )}
        {movePairs.map((pair) => (
          <div key={pair.moveNumber} className="move-pair">
            <span className="move-number">{pair.moveNumber}.</span>
            {pair.white && (
              <button
                ref={pair.white.index === currentIndex ? activeRef : undefined}
                className={`move-btn ${pair.white.index === currentIndex ? 'move-active' : ''}`}
                style={getClassColor(pair.white.entry) ? { borderLeftColor: getClassColor(pair.white.entry) } : undefined}
                onClick={() => onGoToMove(pair.white!.index)}
              >
                {formatMove(pair.white.entry.move.san)}
                {getClassSymbol(pair.white.entry) && (
                  <span className="move-class-symbol" style={{ color: getClassColor(pair.white.entry) }}>
                    {getClassSymbol(pair.white.entry)}
                  </span>
                )}
              </button>
            )}
            {pair.black && (
              <button
                ref={pair.black.index === currentIndex ? activeRef : undefined}
                className={`move-btn ${pair.black.index === currentIndex ? 'move-active' : ''}`}
                style={getClassColor(pair.black.entry) ? { borderLeftColor: getClassColor(pair.black.entry) } : undefined}
                onClick={() => onGoToMove(pair.black!.index)}
              >
                {formatMove(pair.black.entry.move.san)}
                {getClassSymbol(pair.black.entry) && (
                  <span className="move-class-symbol" style={{ color: getClassColor(pair.black.entry) }}>
                    {getClassSymbol(pair.black.entry)}
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
