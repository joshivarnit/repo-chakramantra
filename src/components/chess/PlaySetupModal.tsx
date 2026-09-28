"use client";

import React, { useState } from 'react';
import { X, ClipboardPaste, Shuffle } from 'lucide-react';

interface PlaySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    color: 'w' | 'b' | 'random';
    opponentType: 'elo' | 'maia';
    elo: number;
    thinkTimeSec: number;
    chess960: boolean;
    startFen?: string;
  }) => void;
}

export default function PlaySetupModal({
  isOpen,
  onClose,
  onStartGame,
}: PlaySetupModalProps) {
  const [chess960, setChess960] = useState(false);
  const [playAs, setPlayAs] = useState<'w' | 'b' | 'random'>('w');
  const [opponentType, setOpponentType] = useState<'elo' | 'maia'>('elo');
  const [elo, setElo] = useState<number>(2000);
  const [thinkTimeSec, setThinkTimeSec] = useState<number>(3);
  const [useTimeLimit, setUseTimeLimit] = useState(true);
  const [startPosition, setStartPosition] = useState('');

  if (!isOpen) return null;

  const getEloLabel = (rating: number) => {
    if (rating < 1200) return 'Beginner';
    if (rating < 1600) return 'Casual';
    if (rating < 1900) return 'Intermediate';
    if (rating < 2200) return 'Hard';
    if (rating < 2500) return 'Master';
    return 'Grandmaster';
  };

  const handlePasteFen = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setStartPosition(text.trim());
    } catch {
      // ignore
    }
  };

  const handleStart = () => {
    onStartGame({
      color: playAs,
      opponentType,
      elo,
      thinkTimeSec: useTimeLimit ? thinkTimeSec : 2,
      chess960,
      startFen: startPosition.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="play-modal-overlay">
      <div className="play-modal-container">
        {/* Header */}
        <div className="play-modal-header">
          <h2 className="play-modal-title">Play Chess</h2>
          <button className="play-modal-close" onClick={onClose} aria-label="Close setup">
            <X size={20} />
          </button>
        </div>

        {/* Chess 960 toggle */}
        <div className="play-setting-row chess960-row">
          <label className="checkbox-toggle-label">
            <input
              type="checkbox"
              checked={chess960}
              onChange={(e) => setChess960(e.target.checked)}
            />
            <span>Chess 960</span>
          </label>
        </div>

        {/* Play As */}
        <div className="play-section">
          <div className="play-section-title">Play As</div>
          <div className="play-as-options">
            <button
              className={`play-as-btn ${playAs === 'w' ? 'selected' : ''}`}
              onClick={() => setPlayAs('w')}
              title="Play as White"
            >
              <div className="piece-icon-circle white-circle">
                <span className="pawn-glyph">♙</span>
              </div>
            </button>

            <button
              className={`play-as-btn ${playAs === 'random' ? 'selected' : ''}`}
              onClick={() => setPlayAs('random')}
              title="Random Color"
            >
              <div className="piece-icon-circle random-circle">
                <Shuffle size={18} />
              </div>
            </button>

            <button
              className={`play-as-btn ${playAs === 'b' ? 'selected' : ''}`}
              onClick={() => setPlayAs('b')}
              title="Play as Black"
            >
              <div className="piece-icon-circle black-circle">
                <span className="pawn-glyph">♟</span>
              </div>
            </button>
          </div>
        </div>

        {/* Play Against */}
        <div className="play-section">
          <div className="play-section-header-row">
            <span className="play-section-title">Play Against</span>
            <div className="opponent-type-toggle">
              <button
                className={`type-toggle-btn ${opponentType === 'maia' ? 'active' : ''}`}
                onClick={() => setOpponentType('maia')}
              >
                Maia
              </button>
              <button
                className={`type-toggle-btn ${opponentType === 'elo' ? 'active' : ''}`}
                onClick={() => setOpponentType('elo')}
              >
                ELO
              </button>
            </div>
          </div>

          <div className="slider-container">
            <div className="slider-label-row">
              <span className="slider-desc">💻 ELO: {elo} ({getEloLabel(elo)})</span>
            </div>
            <input
              type="range"
              min={800}
              max={2800}
              step={50}
              value={elo}
              onChange={(e) => setElo(Number(e.target.value))}
              className="play-range-slider"
            />
          </div>
        </div>

        {/* Time */}
        <div className="play-section">
          <div className="play-section-header-row">
            <span className="play-section-title">Time</span>
            <label className="mini-toggle-switch">
              <input
                type="checkbox"
                checked={useTimeLimit}
                onChange={(e) => setUseTimeLimit(e.target.checked)}
              />
              <span className="switch-slider" />
            </label>
          </div>

          {useTimeLimit && (
            <div className="slider-container">
              <div className="slider-label-row">
                <span className="slider-desc">Engine Think Time: {thinkTimeSec} sec/move</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={thinkTimeSec}
                onChange={(e) => setThinkTimeSec(Number(e.target.value))}
                className="play-range-slider"
              />
            </div>
          )}
        </div>

        {/* Start Position */}
        <div className="play-section">
          <div className="play-section-header-row">
            <span className="play-section-title">Start Position</span>
            <button className="paste-link-btn" onClick={handlePasteFen}>
              <ClipboardPaste size={14} /> Paste Copied Pgn/Fen
            </button>
          </div>
          <input
            type="text"
            className="start-pos-input"
            placeholder="Start Position Fen/Pgn (optional)"
            value={startPosition}
            onChange={(e) => setStartPosition(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button className="play-start-btn" onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
