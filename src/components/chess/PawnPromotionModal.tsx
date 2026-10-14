"use client";

import React from 'react';
import { Crown, Shield, Castle, Sparkles, X } from 'lucide-react';

export interface PromotionMovePending {
  from: string;
  to: string;
  color: 'w' | 'b';
}

interface PawnPromotionModalProps {
  isOpen: boolean;
  pendingMove: PromotionMovePending | null;
  onSelectPiece: (piece: 'q' | 'n' | 'r' | 'b') => void;
  onCancel: () => void;
}

export default function PawnPromotionModal({
  isOpen,
  pendingMove,
  onSelectPiece,
  onCancel,
}: PawnPromotionModalProps) {
  if (!isOpen || !pendingMove) return null;

  const isWhite = pendingMove.color === 'w';

  const choices: Array<{
    piece: 'q' | 'n' | 'r' | 'b';
    name: string;
    symbol: string;
    title: string;
    desc: string;
    bgClass: string;
  }> = [
    {
      piece: 'q',
      name: 'Queen',
      symbol: isWhite ? '♕' : '♛',
      title: 'The Sovereign',
      desc: 'Most versatile & powerful',
      bgClass: 'promo-queen',
    },
    {
      piece: 'n',
      name: 'Knight',
      symbol: isWhite ? '♘' : '♞',
      title: 'The Gallant',
      desc: 'Clever jumping tactician',
      bgClass: 'promo-knight',
    },
    {
      piece: 'r',
      name: 'Rook',
      symbol: isWhite ? '♖' : '♜',
      title: 'The Fortress',
      desc: 'Dominant open-file power',
      bgClass: 'promo-rook',
    },
    {
      piece: 'b',
      name: 'Bishop',
      symbol: isWhite ? '♗' : '♝',
      title: 'The Mystic',
      desc: 'Long-range diagonal sniper',
      bgClass: 'promo-bishop',
    },
  ];

  return (
    <div className="lumi-modal-backdrop" onClick={onCancel}>
      <div
        className="lumi-promotion-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Pawn Promotion Dialog"
      >
        <button
          className="lumi-modal-close-btn"
          onClick={onCancel}
          aria-label="Cancel Promotion"
          title="Cancel Move"
        >
          <X size={18} />
        </button>

        <div className="lumi-promo-header">
          <div className="lumi-promo-icon-badge">
            <Sparkles size={20} className="lumi-sparkle-spin" />
          </div>
          <h3 className="lumi-promo-title">Ascend Your Pawn</h3>
          <p className="lumi-promo-subtitle">
            Your pawn reached the final rank! Choose a noble form to transform into:
          </p>
        </div>

        <div className="lumi-promo-grid">
          {choices.map((c) => (
            <button
              key={c.piece}
              className={`lumi-promo-piece-btn ${c.bgClass}`}
              onClick={() => onSelectPiece(c.piece)}
              title={`Promote to ${c.name}`}
            >
              <div className="lumi-promo-symbol">{c.symbol}</div>
              <div className="lumi-promo-meta">
                <span className="lumi-promo-piece-name">{c.name}</span>
                <span className="lumi-promo-piece-desc">{c.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
