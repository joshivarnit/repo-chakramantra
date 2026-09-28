"use client";

import React from 'react';
import { Square } from 'chess.js';

export interface ArrowBadge {
  id: string;
  square: Square;
  number: number;
  color: string;
  isBlunder?: boolean;
  annotation?: string; // e.g. "?!" or "??"
}

interface ArrowNumberBadgesProps {
  badges: ArrowBadge[];
  boardOrientation: 'white' | 'black';
}

export default function ArrowNumberBadges({
  badges,
  boardOrientation,
}: ArrowNumberBadgesProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="arrow-badges-overlay" aria-hidden="true">
      {badges.map((b) => {
        const fileChar = b.square[0];
        const rankNum = parseInt(b.square[1], 10);
        let col = fileChar.charCodeAt(0) - 97; // 0 to 7
        let row = 8 - rankNum; // 0 for rank 8, 7 for rank 1

        if (boardOrientation === 'black') {
          col = 7 - col;
          row = 7 - row;
        }

        const leftPercent = col * 12.5 + 6.25;
        const topPercent = row * 12.5 + 6.25;

        return (
          <div
            key={b.id}
            className="arrow-badge-pill"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              backgroundColor: b.color,
            }}
          >
            {b.annotation ? (
              <span className="annotation-tag">{b.annotation}</span>
            ) : (
              <span className="arrow-num-tag">#{b.number}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
