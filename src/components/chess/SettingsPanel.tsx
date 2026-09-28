"use client";

import React, { useState } from 'react';
import { X, Volume2, Maximize, Palette, Cpu, Sliders, Shield, Zap, Sparkles } from 'lucide-react';
import { BOARD_THEMES, type BoardTheme } from './themes';

export interface ChakraSettings {
  soundEnabled: boolean;
  fullScreen: boolean;
  showThreats: boolean;
  showKeyElements: boolean;
  useNnue: boolean;
  engineThreads: number;
  engineHash: number;
  engineDepth: number;
  figurineNotation: boolean;
  pieceAnimationSpeed: 'fast' | 'default' | 'slow';
  enlargePieceOnDrag: boolean;
  showAverageCpl: boolean;
  drawArrows: boolean;
  showAnalysisArrows: boolean;
  showArrowNumbers: boolean;
  showArrowStrengthColor: boolean;
  username: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  settings: ChakraSettings;
  onUpdateSetting: <K extends keyof ChakraSettings>(key: K, value: ChakraSettings[K]) => void;
  onThemeChange: (themeId: string) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  currentThemeId,
  settings,
  onUpdateSetting,
  onThemeChange,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'themes'>('all');

  if (!isOpen) return null;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      onUpdateSetting('fullScreen', true);
    } else {
      document.exitFullscreen().catch(() => {});
      onUpdateSetting('fullScreen', false);
    }
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-container">
        {/* Header */}
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button className="settings-close-btn" onClick={onClose} aria-label="Close Settings">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="settings-modal-body">
          {activeTab === 'themes' ? (
            <div className="settings-subview">
              <div className="subview-header">
                <button className="subview-back-btn" onClick={() => setActiveTab('all')}>
                  ← Back to Settings
                </button>
                <h3 className="subview-title">Board Themes</h3>
              </div>
              <div className="theme-grid">
                {BOARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-swatch ${currentThemeId === theme.id ? 'theme-active' : ''}`}
                    onClick={() => onThemeChange(theme.id)}
                  >
                    <div className="theme-preview">
                      <div className="theme-sq" style={{ backgroundColor: theme.lightSquare }} />
                      <div className="theme-sq" style={{ backgroundColor: theme.darkSquare }} />
                      <div className="theme-sq" style={{ backgroundColor: theme.darkSquare }} />
                      <div className="theme-sq" style={{ backgroundColor: theme.lightSquare }} />
                    </div>
                    <span className="theme-name">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* General Options */}
              <div className="settings-group">
                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Sound</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => onUpdateSetting('soundEnabled', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Full Screen</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.fullScreen}
                      onChange={toggleFullScreen}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <button className="setting-nav-row" onClick={() => setActiveTab('themes')}>
                  <div className="setting-info-col">
                    <span className="setting-item-name">Board Themes</span>
                    <span className="setting-item-desc">Customize Chess Pieces, Colors etc.</span>
                  </div>
                  <span className="nav-chevron">›</span>
                </button>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Threats Settings</span>
                    <span className="setting-item-desc">Highlight attacked & undefended pieces</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showThreats}
                      onChange={(e) => onUpdateSetting('showThreats', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Key Elements (Beta)</span>
                    <span className="setting-item-desc">Understand pins, passed pawns & weak squares</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showKeyElements}
                      onChange={(e) => onUpdateSetting('showKeyElements', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>
              </div>

              {/* Engine Settings (Blue Header) */}
              <div className="settings-section-divider">
                <span className="section-blue-title">Engine Settings</span>
              </div>

              <div className="settings-group">
                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Use NNUE</span>
                    <span className="setting-item-desc">NNUE neural network makes Stockfish stronger</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.useNnue}
                      onChange={(e) => onUpdateSetting('useNnue', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-select-row">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Threads / Cores</span>
                    <span className="setting-item-desc">WebWorker threads Stockfish can use</span>
                  </div>
                  <select
                    className="settings-native-select"
                    value={settings.engineThreads}
                    onChange={(e) => onUpdateSetting('engineThreads', Number(e.target.value))}
                  >
                    <option value={1}>1 Core</option>
                    <option value={2}>2 Cores</option>
                    <option value={4}>4 Cores</option>
                  </select>
                </div>

                <div className="setting-select-row">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Hash (MB)</span>
                    <span className="setting-item-desc">Memory size for engine transposition table</span>
                  </div>
                  <select
                    className="settings-native-select"
                    value={settings.engineHash}
                    onChange={(e) => onUpdateSetting('engineHash', Number(e.target.value))}
                  >
                    <option value={16}>16 MB</option>
                    <option value={32}>32 MB</option>
                    <option value={64}>64 MB</option>
                    <option value={128}>128 MB</option>
                  </select>
                </div>

                <div className="setting-select-row">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Search Depth</span>
                    <span className="setting-item-desc">Target calculation depth per move</span>
                  </div>
                  <select
                    className="settings-native-select"
                    value={settings.engineDepth}
                    onChange={(e) => onUpdateSetting('engineDepth', Number(e.target.value))}
                  >
                    <option value={12}>12 Depth</option>
                    <option value={15}>15 Depth</option>
                    <option value={18}>18 Depth</option>
                    <option value={20}>20 Depth</option>
                    <option value={24}>24 Depth</option>
                  </select>
                </div>
              </div>

              {/* Advanced Settings (Blue Header) */}
              <div className="settings-section-divider">
                <span className="section-blue-title">Advanced Settings</span>
              </div>

              <div className="settings-group">
                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Figurine Notation</span>
                    <span className="setting-item-desc">Use Unicode chess symbols (e.g. ♘f3) in move notation</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.figurineNotation}
                      onChange={(e) => onUpdateSetting('figurineNotation', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Enlarge piece on drag</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.enlargePieceOnDrag}
                      onChange={(e) => onUpdateSetting('enlargePieceOnDrag', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Show Average Cpl In Game Report</span>
                    <span className="setting-item-desc">By default only accuracy is shown</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showAverageCpl}
                      onChange={(e) => onUpdateSetting('showAverageCpl', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Draw Arrows on Board</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.drawArrows}
                      onChange={(e) => onUpdateSetting('drawArrows', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Show Analysis Arrows</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showAnalysisArrows}
                      onChange={(e) => onUpdateSetting('showAnalysisArrows', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Show Analysis Arrows Numbers</span>
                    <span className="setting-item-desc">Show rank number (#1, #2, #3) on analysis arrows</span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showArrowNumbers}
                      onChange={(e) => onUpdateSetting('showArrowNumbers', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>

                <div className="setting-toggle-item">
                  <div className="setting-info-col">
                    <span className="setting-item-name">Show arrow strength color</span>
                    <span className="setting-item-desc">
                      Different colors for multiple arrows: #1 Blue, #2 Green, #3 Orange, #4 Yellow
                    </span>
                  </div>
                  <label className="native-toggle">
                    <input
                      type="checkbox"
                      checked={settings.showArrowStrengthColor}
                      onChange={(e) => onUpdateSetting('showArrowStrengthColor', e.target.checked)}
                    />
                    <span className="native-slider" />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
