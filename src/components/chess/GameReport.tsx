"use client";

import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, FileText } from 'lucide-react';
import { MOVE_CLASSIFICATIONS, MoveClassification } from './themes';
import type { GameReportData } from './chess-utils';
import { playSuccessSound } from './sound';

interface GameReportProps {
  isOpen: boolean;
  onClose: () => void;
  report: GameReportData | null;
  playerColor: 'w' | 'b';
  pgn?: string;
}

export default function GameReport({ isOpen, onClose, report, playerColor, pgn }: GameReportProps) {
  const [copied, setCopied] = useState(false);
  const [showPgnPreview, setShowPgnPreview] = useState(false);

  if (!isOpen || !report) return null;

  const accuracyColor = report.accuracy >= 90
    ? '#5c9e31'
    : report.accuracy >= 70
    ? '#f7c631'
    : report.accuracy >= 50
    ? '#e69422'
    : '#ca3431';

  const classOrder: MoveClassification[] = ['brilliant', 'great', 'good', 'inaccuracy', 'mistake', 'blunder'];

  const effectivePgn = pgn?.trim() || '[Event "ChakraChess Casual Match"]\n[Site "Chakramantra"]\n[Result "*"]\n*';

  const handleCopyPgn = async () => {
    try {
      await navigator.clipboard.writeText(effectivePgn);
      setCopied(true);
      playSuccessSound();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = effectivePgn;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      playSuccessSound();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPgn = () => {
    try {
      const blob = new Blob([effectivePgn], { type: 'application/x-chess-pgn;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `ChakraChess-Match-${timestamp}.pgn`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      playSuccessSound();
    } catch {
      // handle error gracefully
    }
  };

  const lichessImportUrl = `https://lichess.org/analysis/pgn/${encodeURIComponent(effectivePgn.replace(/\n/g, ' '))}`;

  return (
    <div className="chess-dialog-overlay" onClick={onClose}>
      <div className="chess-dialog chess-dialog-report" onClick={(e) => e.stopPropagation()}>
        <div className="chess-dialog-header">
          <h3>Game Report & Analysis</h3>
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

          {/* PGN Export & Sharing Action Hub */}
          <div className="report-export-section">
            <h4 className="report-breakdown-title" style={{ marginTop: 14 }}>Export & Share Match</h4>
            <div className="report-export-buttons">
              <button
                type="button"
                className={`report-export-btn ${copied ? 'copied-active' : ''}`}
                onClick={handleCopyPgn}
                title="Copy PGN to clipboard"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied PGN!' : 'Copy PGN'}</span>
              </button>

              <button
                type="button"
                className="report-export-btn"
                onClick={handleDownloadPgn}
                title="Download .pgn file to your device"
              >
                <Download size={15} />
                <span>Download .pgn</span>
              </button>

              <a
                href={lichessImportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="report-export-btn report-export-link"
                title="Open and analyze game on Lichess"
              >
                <ExternalLink size={15} />
                <span>Lichess Analysis</span>
              </a>
            </div>

            <button
              type="button"
              className="report-toggle-pgn-btn"
              onClick={() => setShowPgnPreview(!showPgnPreview)}
            >
              <FileText size={13} />
              <span>{showPgnPreview ? 'Hide PGN preview' : 'View Raw PGN notation'}</span>
            </button>

            {showPgnPreview && (
              <pre className="report-pgn-preview-box">
                {effectivePgn}
              </pre>
            )}
          </div>
        </div>

        <div className="chess-dialog-footer">
          <button className="chess-dialog-start" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

