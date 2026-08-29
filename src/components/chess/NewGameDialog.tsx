"use client";

import React, { useState } from 'react';
import { DIFFICULTY_LEVELS } from './themes';
import type { GameMode, PlayerColor } from './useGameState';

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (mode: GameMode, color: PlayerColor, depth: number) => void;
}

export default function NewGameDialog({ isOpen, onClose, onStart }: NewGameDialogProps) {
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('w');
  const [selectedDifficulty, setSelectedDifficulty] = useState(2); // Medium
  const [mode, setMode] = useState<GameMode>('play');

  if (!isOpen) return null;

  return (
    <div className="chess-dialog-overlay" onClick={onClose}>
      <div className="chess-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="chess-dialog-header">
          <h3>New Game</h3>
          <button className="chess-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="chess-dialog-body">
          {/* Mode selection */}
          <div className="chess-dialog-section">
            <label className="chess-dialog-label">Mode</label>
            <div className="chess-dialog-toggle-group">
              <button
                className={`chess-dialog-toggle ${mode === 'play' ? 'active' : ''}`}
                onClick={() => setMode('play')}
              >
                ♟ Play vs Engine
              </button>
              <button
                className={`chess-dialog-toggle ${mode === 'analysis' ? 'active' : ''}`}
                onClick={() => setMode('analysis')}
              >
                🔍 Analysis Board
              </button>
            </div>
          </div>

          {/* Color selection (only for play mode) */}
          {mode === 'play' && (
            <div className="chess-dialog-section">
              <label className="chess-dialog-label">Play as</label>
              <div className="chess-dialog-color-picker">
                <button
                  className={`chess-color-btn chess-color-white ${selectedColor === 'w' ? 'active' : ''}`}
                  onClick={() => setSelectedColor('w')}
                  title="White"
                >
                  ♔
                </button>
                <button
                  className={`chess-color-btn chess-color-black ${selectedColor === 'b' ? 'active' : ''}`}
                  onClick={() => setSelectedColor('b')}
                  title="Black"
                >
                  ♚
                </button>
              </div>
            </div>
          )}

          {/* Difficulty (only for play mode) */}
          {mode === 'play' && (
            <div className="chess-dialog-section">
              <label className="chess-dialog-label">Difficulty</label>
              <div className="chess-difficulty-grid">
                {DIFFICULTY_LEVELS.map((level, i) => (
                  <button
                    key={level.label}
                    className={`chess-difficulty-btn ${selectedDifficulty === i ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(i)}
                  >
                    <span className="chess-difficulty-name">{level.label}</span>
                    <span className="chess-difficulty-desc">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="chess-dialog-footer">
          <button className="chess-dialog-cancel" onClick={onClose}>Cancel</button>
          <button
            className="chess-dialog-start"
            onClick={() => {
              const depth = mode === 'play' ? DIFFICULTY_LEVELS[selectedDifficulty].depth : 20;
              onStart(mode, selectedColor, depth);
              onClose();
            }}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
