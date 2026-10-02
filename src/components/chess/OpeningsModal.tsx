"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { OPENINGS_DATABASE, type Opening } from './openings';
import OpeningExplorerPanel from './OpeningExplorerPanel';

interface OpeningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpening: (opening: Opening) => void;
  currentMoves?: string[];
  onPlayMove?: (san: string) => void;
}

export default function OpeningsModal({
  isOpen,
  onClose,
  onSelectOpening,
  currentMoves,
  onPlayMove,
}: OpeningsModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'explorer'>(
    currentMoves && currentMoves.length > 0 ? 'explorer' : 'library'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOpenings = useMemo(() => {
    if (!searchQuery.trim()) return OPENINGS_DATABASE;
    const q = searchQuery.toLowerCase();
    return OPENINGS_DATABASE.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.eco.toLowerCase().includes(q) ||
        op.movesStr.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="openings-modal-overlay">
      <div className="openings-modal-container">
        {/* Header */}
        <div className="openings-header">
          <div className="openings-title-group">
            <span className="openings-header-icon">♟</span>
            <h2 className="openings-title">Openings Explorer</h2>
            <span className="openings-count-badge">{filteredOpenings.length}</span>
          </div>

          <div className="openings-header-right">
            <button className="openings-close-btn" onClick={onClose} aria-label="Close openings">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher if in-game moves exist */}
        {currentMoves && currentMoves.length > 0 && onPlayMove && (
          <div className="widescreen-tabs-header" style={{ padding: '0 16px 10px', background: 'transparent' }}>
            <button
              className={`widescreen-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
              onClick={() => setActiveTab('explorer')}
            >
              🧭 Master Continuations ({currentMoves.length} moves)
            </button>
            <button
              className={`widescreen-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              📚 All Openings Catalog ({filteredOpenings.length})
            </button>
          </div>
        )}

        {activeTab === 'explorer' && currentMoves && onPlayMove ? (
          <div style={{ padding: '12px 16px 16px', overflowY: 'auto', maxHeight: '520px' }}>
            <OpeningExplorerPanel
              moves={currentMoves}
              onPlayMove={(san) => {
                onPlayMove(san);
                onClose();
              }}
              onOpenFullLibrary={() => setActiveTab('library')}
            />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="openings-search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search ECO code, opening name, or moves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>

        {/* List of Openings */}
        <div className="openings-list-scroll">
          {filteredOpenings.map((op, idx) => (
            <div
              key={`${op.eco}-${idx}`}
              className="opening-item"
              onClick={() => {
                onSelectOpening(op);
                onClose();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="opening-item-left">
                <span className="opening-pawn-icon">♟</span>
                <div className="opening-info">
                  <div className="opening-name-row">
                    <span className="opening-eco">{op.eco}:</span>
                    <span className="opening-name">{op.name}</span>
                  </div>
                  <div className="opening-moves-row">
                    <span className="opening-moves">{op.movesStr}</span>
                    <span className="opening-stats-badge">
                      [W: {op.whiteWinPct}%, B: {op.blackWinPct}%]
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight size={18} className="opening-arrow-icon" />
            </div>
          ))}

          {filteredOpenings.length === 0 && (
            <div className="openings-empty-state">
              <p>No matching openings found.</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
