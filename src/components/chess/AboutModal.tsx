"use client";

import React from 'react';
import { X, Cpu, ShieldCheck, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="about-modal-overlay">
      <div className="about-modal-container">
        <div className="about-modal-header">
          <div className="about-profile-badge">
            <div className="about-avatar-ring">
              <span className="about-avatar-icon">♟</span>
            </div>
            <div>
              <h2 className="about-title">ChakraChess Pro</h2>
              <span className="about-subtitle">AI Analysis & Training Suite</span>
            </div>
          </div>
          <button className="about-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="about-content-body">
          <div className="about-highlight-card">
            <div className="highlight-item">
              <Cpu size={20} className="highlight-icon text-cyan" />
              <div>
                <strong>Stockfish 16 Engine</strong>
                <p>High-depth Multi-PV real-time tactical evaluation directly in browser.</p>
              </div>
            </div>

            <div className="highlight-item">
              <Zap size={20} className="highlight-icon text-amber" />
              <div>
                <strong>Multi-Color Variation Arrows</strong>
                <p>Instant numbered move strength visualization (#1, #2, #3, #4).</p>
              </div>
            </div>

            <div className="highlight-item">
              <ShieldCheck size={20} className="highlight-icon text-emerald" />
              <div>
                <strong>ECO Opening Explorer</strong>
                <p>Comprehensive master opening directory with live Win/Draw/Loss stats.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h4>Keyboard Shortcuts</h4>
            <div className="about-shortcuts-grid">
              <span className="key-tag">← / →</span>
              <span>Step backward / forward</span>
              <span className="key-tag">Home / End</span>
              <span>Jump to start / latest</span>
              <span className="key-tag">F</span>
              <span>Flip chessboard</span>
            </div>
          </div>

          <div className="about-footer-row">
            <span>Version 2.4.0 (Pro)</span>
            <span>ChakraMantra Studios</span>
          </div>
        </div>
      </div>
    </div>
  );
}
