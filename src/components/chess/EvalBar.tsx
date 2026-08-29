"use client";

import React from 'react';

interface EvalBarProps {
  evaluation: number;   // centipawns from White's perspective
  isMate: boolean;
  mateIn: number;
  orientation: 'white' | 'black';
}

export default function EvalBar({ evaluation, isMate, mateIn, orientation }: EvalBarProps) {
  // Convert eval to percentage (50% = equal, 100% = white winning completely)
  let percent: number;
  if (isMate) {
    percent = mateIn > 0 ? 100 : 0;
  } else {
    // Sigmoid-like clamping: ±500cp maps to roughly 5-95%
    const clamped = Math.max(-500, Math.min(500, evaluation));
    percent = 50 + (clamped / 500) * 45;
  }

  // Flip for black orientation
  if (orientation === 'black') {
    percent = 100 - percent;
  }

  const displayEval = isMate
    ? (mateIn > 0 ? `M${Math.abs(mateIn)}` : `-M${Math.abs(mateIn)}`)
    : ((evaluation >= 0 ? '+' : '') + (evaluation / 100).toFixed(1));

  const isWhiteAdvantage = isMate ? mateIn > 0 : evaluation > 0;

  return (
    <div className="eval-bar-container" title={`Eval: ${displayEval}`}>
      <div className="eval-bar-track">
        <div
          className="eval-bar-fill"
          style={{ height: `${percent}%` }}
        />
      </div>
      <div className={`eval-bar-label ${isWhiteAdvantage ? 'eval-white' : 'eval-black'}`}>
        {displayEval}
      </div>
    </div>
  );
}
