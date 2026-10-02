"use client";

import React, { useEffect } from 'react';
import { RotateCcw, Flag, Handshake, AlertTriangle, X } from 'lucide-react';
import { playWarningSound } from './sound';

export type GameConfirmAction = 'reset' | 'resign' | 'draw';

interface ConfirmActionModalProps {
  isOpen: boolean;
  action: GameConfirmAction | null;
  moveCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmActionModal({
  isOpen,
  action,
  moveCount,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  useEffect(() => {
    if (isOpen) {
      playWarningSound();
    }
  }, [isOpen]);

  if (!isOpen || !action) return null;

  const contentMap = {
    reset: {
      title: 'Reset Chess Board?',
      subtitle: moveCount > 0
        ? `You have played ${moveCount} move${moveCount > 1 ? 's' : ''}. Resetting will clear your current game progress and engine evaluation.`
        : 'Are you sure you want to reset the board back to the initial starting setup?',
      icon: <RotateCcw size={28} className="confirm-icon confirm-icon-amber" />,
      confirmLabel: 'Yes, Reset Board',
      confirmClass: 'confirm-btn-danger',
    },
    resign: {
      title: 'Resign Match?',
      subtitle: 'Conceding the game will immediately mark this match as a loss and award victory to your opponent.',
      icon: <Flag size={28} className="confirm-icon confirm-icon-rose" />,
      confirmLabel: 'Resign Game',
      confirmClass: 'confirm-btn-rose',
    },
    draw: {
      title: 'Offer / Claim Draw?',
      subtitle: 'Propose a peaceful draw to your opponent. If agreed, the game concludes with 1/2 - 1/2 score.',
      icon: <Handshake size={28} className="confirm-icon confirm-icon-blue" />,
      confirmLabel: 'Offer Draw',
      confirmClass: 'confirm-btn-blue',
    },
  };

  const current = contentMap[action];

  return (
    <div className="chess-dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="chess-dialog confirm-dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-top">
          <div className="confirm-icon-wrapper">
            {current.icon}
          </div>
          <button className="chess-dialog-close" onClick={onClose} aria-label="Cancel">
            <X size={18} />
          </button>
        </div>

        <div className="confirm-dialog-body">
          <h3 className="confirm-dialog-title">{current.title}</h3>
          <p className="confirm-dialog-subtitle">{current.subtitle}</p>
        </div>

        <div className="confirm-dialog-footer">
          <button className="confirm-btn-secondary" onClick={onClose}>
            Keep Playing
          </button>
          <button
            className={`confirm-btn-action ${current.confirmClass}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {current.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
