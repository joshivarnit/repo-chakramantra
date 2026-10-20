"use client";

import React from 'react';
import Image from 'next/image';
import { X, Sparkles, Heart, Feather, BookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="about-modal-overlay lumi-modal-backdrop" onClick={onClose}>
      <div className="about-modal-container lumi-promotion-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="about-modal-header">
          <div className="about-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="about-avatar-ring">
              <Image
                src="/lumi-companion.jpg"
                alt="Lumi Storybook Companion"
                width={52}
                height={52}
                className="lumi-avatar-img"
              />
            </div>
            <div>
              <h2 className="about-title" style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>ChakraChess</h2>
              <span className="lumi-byline" style={{ fontSize: 12 }}>Lumi AI Companion</span>
            </div>
          </div>
          <button className="about-close-btn lumi-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="about-content-body" style={{ marginTop: 16 }}>
          <div className="about-highlight-card" style={{ background: 'rgba(30, 41, 59, 0.55)', padding: 14, borderRadius: 16, border: '1px solid rgba(220, 185, 145, 0.25)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="highlight-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Feather size={20} style={{ color: '#38bdf8', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: 13 }}>Hand-Drawn Watercolor Aesthetic</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                  Stylized illustration aesthetic with soft pastel hues, hand-painted wooden boards, and delicate paper washes.
                </p>
              </div>
            </div>

            <div className="highlight-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Sparkles size={20} style={{ color: '#fbbf24', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: 13 }}>Lumi Companion & Tactile Arrows</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                  Real-time Stockfish 16 Multi-PV analysis with soft watercolor candidate arrows and interactive pawn ascension.
                </p>
              </div>
            </div>

            <div className="highlight-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <BookOpen size={20} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: 13 }}>Master Opening Tree & Fairytale Tales</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                  Browse classical openings with grandmaster win/draw rates and FIDE three-fold repetition accuracy.
                </p>
              </div>
            </div>
          </div>

          <div className="about-section" style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>Keyboard Shortcuts</h4>
            <div className="about-shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: 12, color: '#cbd5e1' }}>
              <span className="key-tag" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textAlign: 'center' }}>← / →</span>
              <span>Step backward / forward in history</span>
              <span className="key-tag" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textAlign: 'center' }}>Home / End</span>
              <span>Jump to start / latest move</span>
              <span className="key-tag" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textAlign: 'center' }}>F</span>
              <span>Flip chessboard perspective</span>
            </div>
          </div>

          <div className="about-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#94a3b8' }}>
            <span>Version 3.1.0 (Lumi AI Companion)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Crafted with <Heart size={11} style={{ color: '#f43f5e', fill: '#f43f5e' }} /> for ChakraMantra
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
