"use client";

import React from 'react';
import { MOVE_CLASSIFICATIONS, MoveClassification } from './themes';
import type { GameReportData } from './chess-utils';

interface GameReportProps {
  isOpen: boolean;
  onClose: () => void;
  report: GameReportData | null;
  playerColor: 'w' | 'b';
}

export default function GameReport({ isOpen, onClose, report, playerColor }: GameReportProps) {
  if (!isOpen || !report) return null;

  const accuracyColor = report.accuracy >= 90
    ? '#5c9e31'
    : report.accuracy >= 70
    ? '#f7c631'
    : report.accuracy >= 50
    ? '#e69422'
    : '#ca3431';

  const classOrder: MoveClassification[] = ['brilliant', 'great', 'good', 'inaccuracy', 'mistake', 'blunder'];

  return (
    <div className="chess-dialog-overlay" onClick={onClose}>
      <div className="chess-dialog chess-dialog-report" onClick={(e) => e.stopPropagation()}>
        <div className="chess-dialog-header">
          <h3>Game Report</h3>
          <button className="chess-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="chess-dialog-body">
          {/* Accuracy circle */}
          <div className="report-accuracy-section">
            <div className="report-accuracy-circle" style={{ borderColor: accuracyColor }}>
              <span className="report-accuracy-number" style={{ color: accuracyColor }}>
                {report.accuracy.toFixed(1)}%
              </span>
              <span className="report-accuracy-label">Accuracy</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="report-stats-grid">
            <div className="report-stat">
              <span className="report-stat-value">{report.totalMoves}</span>
              <span className="report-stat-label">Moves</span>
            </div>
            <div className="report-stat">
              <span className="report-stat-value">{report.averageCPL.toFixed(1)}</span>
              <span className="report-stat-label">Avg CPL</span>
            </div>
            <div className="report-stat">
              <span className="report-stat-value">{report.bestMoveMatches}</span>
              <span className="report-stat-label">Best Moves</span>
            </div>
          </div>

          {/* Classification breakdown */}
          <div className="report-breakdown">
            <h4 className="report-breakdown-title">Move Breakdown</h4>
            {classOrder.map((cls) => {
              const info = MOVE_CLASSIFICATIONS[cls];
              const count = report.classifications[cls] || 0;
              const percent = report.totalMoves > 0 ? (count / report.totalMoves) * 100 : 0;

              return (
                <div key={cls} className="report-bar-row">
                  <span className="report-bar-label" style={{ color: info.color }}>
                    {info.symbol || ''} {cls.charAt(0).toUpperCase() + cls.slice(1)}
                  </span>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: info.color,
                      }}
                    />
                  </div>
                  <span className="report-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chess-dialog-footer">
          <button className="chess-dialog-start" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
