"use client";

import React from 'react';
import { BookOpen, Compass, ChevronRight, Sparkles } from 'lucide-react';
import { getOpeningPositionData, type BookMoveContinuation } from './opening-explorer';
import { toFigurineNotation } from './chess-utils';

interface OpeningExplorerPanelProps {
  moves: string[];
  figurineNotation?: boolean;
  onPlayMove: (san: string) => void;
  onOpenFullLibrary?: () => void;
}

export default function OpeningExplorerPanel({
  moves,
  figurineNotation = true,
  onPlayMove,
  onOpenFullLibrary,
}: OpeningExplorerPanelProps) {
  const openingData = getOpeningPositionData(moves);
  const hasContinuations = openingData.continuations.length > 0;

  return (
    <div className="opening-explorer-panel">
      {/* Header Info */}
      <div className="explorer-header-card">
        <div className="explorer-eco-row">
          <span className="explorer-eco-badge">{openingData.eco}</span>
          <span className="explorer-book-status">
            {hasContinuations ? 'Master Book Active' : 'End of Curated Book'}
          </span>
        </div>
        <h4 className="explorer-opening-title">{openingData.name}</h4>
        {openingData.description && (
          <p className="explorer-opening-desc">{openingData.description}</p>
        )}
      </div>

      {/* Book Continuations Section */}
      <div className="explorer-continuations-section">
        <div className="explorer-section-title">
          <Compass size={14} className="explorer-title-icon" />
          <span>Book Continuations ({openingData.continuations.length})</span>
        </div>

        {hasContinuations ? (
          <div className="explorer-moves-list">
            {openingData.continuations.map((item: BookMoveContinuation, idx: number) => {
              const displaySan = figurineNotation ? toFigurineNotation(item.san) : item.san;
              return (
                <div
                  key={idx}
                  className="explorer-move-row"
                  onClick={() => onPlayMove(item.san)}
                  role="button"
                  tabIndex={0}
                  title={`Play ${item.san} (${item.games.toLocaleString()} games)`}
                >
                  <div className="explorer-move-left">
                    <span className="explorer-move-san">{displaySan}</span>
                    <span className="explorer-move-name">{item.name || 'Continuation'}</span>
                  </div>

                  <div className="explorer-move-right">
                    <span className="explorer-games-count">
                      {item.games > 1000 ? `${(item.games / 1000).toFixed(1)}k` : item.games} games
                    </span>
                    {/* Win/Draw/Loss distribution bar */}
                    <div className="explorer-pct-bar" title={`White: ${item.whiteWinPct}% | Draw: ${item.drawPct}% | Black: ${item.blackWinPct}%`}>
                      <div className="pct-white" style={{ width: `${item.whiteWinPct}%` }} />
                      <div className="pct-draw" style={{ width: `${item.drawPct}%` }} />
                      <div className="pct-black" style={{ width: `${item.blackWinPct}%` }} />
                    </div>
                    <ChevronRight size={13} className="explorer-arrow" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="explorer-empty-book">
            <Sparkles size={18} className="empty-icon" />
            <p className="empty-text">This position is beyond initial master book lines.</p>
            <span className="empty-subtext">Engine evaluation takes over for deep tactical analysis.</span>
          </div>
        )}
      </div>

      {/* Footer shortcut to Openings Library */}
      {onOpenFullLibrary && (
        <div className="explorer-footer-action">
          <button
            type="button"
            className="explorer-library-btn"
            onClick={onOpenFullLibrary}
          >
            <BookOpen size={14} />
            <span>Browse All 60+ Famous Openings</span>
          </button>
        </div>
      )}
    </div>
  );
}
