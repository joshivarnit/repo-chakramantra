"use client";

import React, { useState } from 'react';
import {
  RotateCcw,
  Share2,
  Copy,
  Download,
  BarChart2,
  Play,
  X,
  Check,
} from 'lucide-react';

interface BoardOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onResetBoard: () => void;
  onSharePgn: () => void;
  onShareFen: () => void;
  onSavePgn: () => void;
  onAnalyzePgn: () => void;
  onPlayFromHere: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
}

export default function BoardOptionsSheet({
  isOpen,
  onClose,
  onResetBoard,
  onSharePgn,
  onShareFen,
  onSavePgn,
  onAnalyzePgn,
  onPlayFromHere,
  onResign,
  onOfferDraw,
}: BoardOptionsSheetProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerFeedback = (msg: string, action: () => void) => {
    action();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-backdrop open" onClick={onClose} aria-hidden="true" />
      <div className="board-options-sheet open">
        <div className="sheet-header">
          <div className="sheet-drag-handle" />
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close options">
            <X size={18} />
          </button>
        </div>

        {toastMessage && (
          <div className="sheet-toast-feedback">
            <Check size={16} /> {toastMessage}
          </div>
        )}

        <div className="sheet-menu-list">
          <button
            className="sheet-menu-item"
            onClick={() => triggerFeedback('Board Reset!', onResetBoard)}
          >
            <RotateCcw size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">RESET BOARD</span>
          </button>

          {onResign && (
            <button
              className="sheet-menu-item"
              onClick={() => {
                onClose();
                onResign();
              }}
            >
              <RotateCcw size={18} style={{ display: 'none' }} />
              <span className="sheet-item-icon" style={{ color: '#f43f5e', fontSize: 16 }}>🏳</span>
              <span className="sheet-item-text" style={{ color: '#fda4af' }}>RESIGN GAME</span>
            </button>
          )}

          {onOfferDraw && (
            <button
              className="sheet-menu-item"
              onClick={() => {
                onClose();
                onOfferDraw();
              }}
            >
              <span className="sheet-item-icon" style={{ color: '#38bdf8', fontSize: 16 }}>🤝</span>
              <span className="sheet-item-text" style={{ color: '#7dd3fc' }}>OFFER / CLAIM DRAW</span>
            </button>
          )}

          <button
            className="sheet-menu-item"
            onClick={() => triggerFeedback('PGN Copied to Clipboard!', onSharePgn)}
          >
            <Share2 size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">SHARE PGN</span>
          </button>

          <button
            className="sheet-menu-item"
            onClick={() => triggerFeedback('FEN Copied to Clipboard!', onShareFen)}
          >
            <Copy size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">SHARE CURRENT FEN</span>
          </button>

          <button
            className="sheet-menu-item"
            onClick={() => triggerFeedback('PGN Downloaded!', onSavePgn)}
          >
            <Download size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">SAVE CURRENT PGN</span>
          </button>

          <button
            className="sheet-menu-item"
            onClick={() => {
              onAnalyzePgn();
              onClose();
            }}
          >
            <BarChart2 size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">ANALYZE CURRENT PGN</span>
          </button>

          <button
            className="sheet-menu-item"
            onClick={() => {
              onPlayFromHere();
              onClose();
            }}
          >
            <Play size={18} className="sheet-item-icon" />
            <span className="sheet-item-text">PLAY FROM HERE</span>
          </button>
        </div>
      </div>
    </>
  );
}
