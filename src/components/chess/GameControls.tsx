"use client";

import React, { useState } from 'react';

interface GameControlsProps {
  onNewGame: () => void;
  onFlipBoard: () => void;
  onGoToStart: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoToEnd: () => void;
  onImportPGN: (pgn: string) => boolean;
  onImportFEN: (fen: string) => boolean;
  onExportPGN: () => string;
  currentFEN: string;
  isGameOver: boolean;
  gameResult: string;
  mode: string;
}

export default function GameControls({
  onNewGame,
  onFlipBoard,
  onGoToStart,
  onGoBack,
  onGoForward,
  onGoToEnd,
  onImportPGN,
  onImportFEN,
  onExportPGN,
  currentFEN,
  isGameOver,
  gameResult,
  mode,
}: GameControlsProps) {
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<'pgn' | 'fen'>('pgn');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleImport = () => {
    let success: boolean;
    if (importType === 'pgn') {
      success = onImportPGN(importText);
    } else {
      success = onImportFEN(importText);
    }

    if (success) {
      setShowImport(false);
      setImportText('');
      setImportError('');
    } else {
      setImportError(`Invalid ${importType.toUpperCase()}. Please check your input.`);
    }
  };

  const handleCopyPGN = () => {
    const pgn = onExportPGN();
    navigator.clipboard.writeText(pgn).then(() => {
      setCopyFeedback('PGN copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  };

  const handleCopyFEN = () => {
    navigator.clipboard.writeText(currentFEN).then(() => {
      setCopyFeedback('FEN copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  };

  return (
    <div className="game-controls">
      {/* Game status */}
      {isGameOver && (
        <div className="game-result-banner">
          <span className="game-result-text">Game Over</span>
          <span className="game-result-value">{gameResult}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="controls-nav">
        <button className="ctrl-btn" onClick={onGoToStart} title="Go to start">⏮</button>
        <button className="ctrl-btn" onClick={onGoBack} title="Previous move">◀</button>
        <button className="ctrl-btn" onClick={onGoForward} title="Next move">▶</button>
        <button className="ctrl-btn" onClick={onGoToEnd} title="Go to end">⏭</button>
      </div>

      {/* Action buttons */}
      <div className="controls-actions">
        <button className="ctrl-action-btn" onClick={onNewGame} title="New game">
          <span className="ctrl-icon">+</span>
          <span>New Game</span>
        </button>
        <button className="ctrl-action-btn" onClick={onFlipBoard} title="Flip board">
          <span className="ctrl-icon">↕</span>
          <span>Flip</span>
        </button>
        <button className="ctrl-action-btn" onClick={() => setShowImport(true)} title="Import PGN/FEN">
          <span className="ctrl-icon">📋</span>
          <span>Import</span>
        </button>
      </div>

      {/* Export buttons */}
      <div className="controls-export">
        <button className="ctrl-export-btn" onClick={handleCopyPGN} title="Copy PGN">
          Copy PGN
        </button>
        <button className="ctrl-export-btn" onClick={handleCopyFEN} title="Copy FEN">
          Copy FEN
        </button>
        {copyFeedback && <span className="copy-feedback">{copyFeedback}</span>}
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="chess-dialog-overlay" onClick={() => setShowImport(false)}>
          <div className="chess-dialog chess-dialog-sm" onClick={(e) => e.stopPropagation()}>
            <div className="chess-dialog-header">
              <h3>Import Game</h3>
              <button className="chess-dialog-close" onClick={() => setShowImport(false)}>✕</button>
            </div>
            <div className="chess-dialog-body">
              <div className="chess-dialog-toggle-group" style={{ marginBottom: '12px' }}>
                <button
                  className={`chess-dialog-toggle ${importType === 'pgn' ? 'active' : ''}`}
                  onClick={() => setImportType('pgn')}
                >
                  PGN
                </button>
                <button
                  className={`chess-dialog-toggle ${importType === 'fen' ? 'active' : ''}`}
                  onClick={() => setImportType('fen')}
                >
                  FEN
                </button>
              </div>
              <textarea
                className="chess-import-textarea"
                placeholder={importType === 'pgn'
                  ? 'Paste PGN here...\n1. e4 e5 2. Nf3 ...'
                  : 'Paste FEN here...\nrnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
                }
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                rows={6}
              />
              {importError && <p className="chess-import-error">{importError}</p>}
            </div>
            <div className="chess-dialog-footer">
              <button className="chess-dialog-cancel" onClick={() => setShowImport(false)}>Cancel</button>
              <button className="chess-dialog-start" onClick={handleImport}>Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
