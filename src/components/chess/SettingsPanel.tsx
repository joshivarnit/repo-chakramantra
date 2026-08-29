"use client";

import React from 'react';
import { BOARD_THEMES, DIFFICULTY_LEVELS, type BoardTheme } from './themes';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Current settings
  currentThemeId: string;
  showThreats: boolean;
  showKeyElements: boolean;
  showBestMoveArrow: boolean;
  showEvalBar: boolean;
  showMoveStrength: boolean;
  pauseOnBlunder: boolean;
  soundEnabled: boolean;
  figurineNotation: boolean;
  engineDepth: number;
  // Setters
  onThemeChange: (themeId: string) => void;
  onToggle: (key: string, value: boolean) => void;
  onDepthChange: (depth: number) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  currentThemeId,
  showThreats,
  showKeyElements,
  showBestMoveArrow,
  showEvalBar,
  showMoveStrength,
  pauseOnBlunder,
  soundEnabled,
  figurineNotation,
  engineDepth,
  onThemeChange,
  onToggle,
  onDepthChange,
}: SettingsPanelProps) {
  return (
    <div className={`settings-panel ${isOpen ? 'settings-open' : ''}`}>
      <div className="settings-header">
        <h3>Settings</h3>
        <button className="chess-dialog-close" onClick={onClose}>✕</button>
      </div>

      <div className="settings-body">
        {/* Board Theme */}
        <div className="settings-section">
          <h4 className="settings-section-title">Board Theme</h4>
          <div className="theme-grid">
            {BOARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`theme-swatch ${currentThemeId === theme.id ? 'theme-active' : ''}`}
                onClick={() => onThemeChange(theme.id)}
                title={theme.name}
              >
                <div className="theme-preview">
                  <div className="theme-square-light" style={{ backgroundColor: theme.lightSquare }} />
                  <div className="theme-square-dark" style={{ backgroundColor: theme.darkSquare }} />
                  <div className="theme-square-dark" style={{ backgroundColor: theme.darkSquare }} />
                  <div className="theme-square-light" style={{ backgroundColor: theme.lightSquare }} />
                </div>
                <span className="theme-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Settings */}
        <div className="settings-section">
          <h4 className="settings-section-title">Analysis</h4>
          <SettingToggle label="Evaluation Bar" value={showEvalBar} onChange={(v) => onToggle('showEvalBar', v)} />
          <SettingToggle label="Best Move Arrow" value={showBestMoveArrow} onChange={(v) => onToggle('showBestMoveArrow', v)} />
          <SettingToggle label="Move Strength" value={showMoveStrength} onChange={(v) => onToggle('showMoveStrength', v)} />
          <SettingToggle label="Figurine Notation" value={figurineNotation} onChange={(v) => onToggle('figurineNotation', v)} />
        </div>

        {/* Threats & Key Elements */}
        <div className="settings-section">
          <h4 className="settings-section-title">Threats & Key Elements</h4>
          <SettingToggle label="Show Threats" value={showThreats} onChange={(v) => onToggle('showThreats', v)} />
          <SettingToggle label="Key Elements (Pins, Pawns)" value={showKeyElements} onChange={(v) => onToggle('showKeyElements', v)} />
        </div>

        {/* Play Settings */}
        <div className="settings-section">
          <h4 className="settings-section-title">Play Settings</h4>
          <SettingToggle label="Pause at Blunder" value={pauseOnBlunder} onChange={(v) => onToggle('pauseOnBlunder', v)} />
          <SettingToggle label="Sound" value={soundEnabled} onChange={(v) => onToggle('soundEnabled', v)} />

          <div className="setting-row">
            <span className="setting-label">Engine Depth</span>
            <select
              className="setting-select"
              value={engineDepth}
              onChange={(e) => onDepthChange(parseInt(e.target.value, 10))}
            >
              {[5, 10, 12, 15, 18, 20].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <button
        className={`setting-toggle-btn ${value ? 'setting-toggle-on' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
      >
        <div className="setting-toggle-knob" />
      </button>
    </div>
  );
}
