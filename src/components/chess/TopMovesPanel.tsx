"use client";

import React from 'react';
import { Chess } from 'chess.js';
import { toFigurineNotation } from './chess-utils';
import type { MultiPVLine } from './useStockfish';

interface TopMovesPanelProps {
  lines: MultiPVLine[];
  fen: string;
  multipvCount: number;
  selectedUci: string | null;
  figurineNotation: boolean;
  onSelectMove: (uci: string) => void;
  onMultiPVChange: (count: number) => void;
  depth?: number;
  onDepthChange?: (depth: number) => void;
}

export default function TopMovesPanel({
  lines,
  fen,
  multipvCount,
  selectedUci,
  figurineNotation,
  onSelectMove,
  onMultiPVChange,
  depth,
  onDepthChange,
}: TopMovesPanelProps) {
  // Convert UCI move to SAN using a temporary chess instance
  const uciToSan = (uci: string, boardFen: string): string => {
    if (!uci || uci.length < 4) return uci;
    try {
      const tempGame = new Chess(boardFen);
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci[4] : undefined;
      const res = tempGame.move({ from, to, promotion });
      if (res) {
        return figurineNotation ? toFigurineNotation(res.san) : res.san;
      }
    } catch {
      // fallback
    }
    return uci;
  };

  // Convert continuation UCI line to SAN string
  const getLineSanPreview = (pvLine: string[], boardFen: string): string => {
    if (!pvLine || pvLine.length <= 1) return '';
    try {
      const tempGame = new Chess(boardFen);
      const sans: string[] = [];
      // skip first move as it is already shown prominently
      for (let i = 0; i < Math.min(pvLine.length, 6); i++) {
        const uci = pvLine[i];
        const from = uci.substring(0, 2);
        const to = uci.substring(2, 4);
        const promotion = uci.length > 4 ? uci[4] : undefined;
        const res = tempGame.move({ from, to, promotion });
        if (!res) break;
        if (i > 0) {
          sans.push(figurineNotation ? toFigurineNotation(res.san) : res.san);
        }
      }
      return sans.join(' ');
    } catch {
      return pvLine.slice(1, 5).join(' ');
    }
  };

  const formatScore = (line: MultiPVLine) => {
    if (line.isMate) {
      return line.mateIn > 0 ? `M${line.mateIn}` : `-M${Math.abs(line.mateIn)}`;
    }
    const val = line.score / 100;
    return (val > 0 ? '+' : '') + val.toFixed(2);
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge rank-gold';
    if (rank === 2) return 'rank-badge rank-silver';
    if (rank === 3) return 'rank-badge rank-bronze';
    return 'rank-badge';
  };

  return (
    <div className="top-moves-panel">
      <div className="top-moves-header">
        <div className="top-moves-title">
          <span>Top Engine Moves</span>
          <span className="top-moves-count">{lines.length} lines</span>
        </div>
        <div className="top-moves-selector" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onDepthChange && (
            <div className="quick-depth-selector" title="Engine Depth">
              <button
                className={`depth-pill-btn ${(depth ?? 16) <= 10 ? 'active' : ''}`}
                onClick={() => onDepthChange(10)}
                title="Fast (Depth 10)"
              >
                Fast
              </button>
              <button
                className={`depth-pill-btn ${(depth ?? 16) > 10 && (depth ?? 16) <= 16 ? 'active' : ''}`}
                onClick={() => onDepthChange(16)}
                title="Normal (Depth 16)"
              >
                Norm
              </button>
              <button
                className={`depth-pill-btn ${(depth ?? 16) > 16 ? 'active' : ''}`}
                onClick={() => onDepthChange(22)}
                title="Deep (Depth 22)"
              >
                Deep
              </button>
            </div>
          )}
          <label className="top-moves-label">Lines:</label>
          <select
            className="top-moves-select"
            value={multipvCount}
            onChange={(e) => onMultiPVChange(parseInt(e.target.value, 10))}
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>

      <div className="top-moves-list">
        {lines.length === 0 && (
          <div className="top-moves-empty">
            <span className="engine-searching">●</span> Calculating top 15 moves...
          </div>
        )}

        {lines.map((line) => {
          const moveSan = uciToSan(line.moveUci, fen);
          const previewLine = getLineSanPreview(line.pvLine, fen);
          const isSelected = selectedUci === line.moveUci || (selectedUci === null && line.multipv === 1);
          const scoreText = formatScore(line);
          const isPositive = line.isMate ? line.mateIn > 0 : line.score > 0;
          const isNegative = line.isMate ? line.mateIn < 0 : line.score < 0;

          return (
            <button
              key={line.multipv}
              className={`top-move-row ${isSelected ? 'top-move-selected' : ''}`}
              onClick={() => onSelectMove(line.moveUci)}
              title={`Click to show ${line.multipv === 1 ? '1st best move' : `${line.multipv}th best move`}`}
            >
              <div className="top-move-rank">
                <span className={getRankBadgeClass(line.multipv)}>
                  {line.multipv === 1 ? '★ #1' : `#${line.multipv}`}
                </span>
              </div>

              <div className="top-move-san">
                <span className="top-move-san-text">{moveSan}</span>
              </div>

              <div className="top-move-eval">
                <span className={`top-move-score ${isPositive ? 'score-pos' : isNegative ? 'score-neg' : 'score-even'}`}>
                  {scoreText}
                </span>
              </div>

              {previewLine && (
                <div className="top-move-continuation" title={previewLine}>
                  {previewLine}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
