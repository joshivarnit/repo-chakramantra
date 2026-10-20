"use client";

import React, { useState, useEffect } from 'react';
import { X, FolderArchive, Play, Trash2, Plus, ClipboardPaste } from 'lucide-react';

export interface SavedGame {
  id: string;
  title: string;
  date: string;
  movesCount: number;
  pgn: string;
  result?: string;
}

interface GamesArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGame: (pgn: string) => void;
  currentPgn: string;
}

const STORAGE_KEY = 'chakrachess_saved_games';

export default function GamesArchiveModal({
  isOpen,
  onClose,
  onLoadGame,
  currentPgn,
}: GamesArchiveModalProps) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => setGames(parsed));
      } else {
        // default sample games
        const sampleGames: SavedGame[] = [
          {
            id: 'sample-wcc-2014-g2',
            title: 'Magnus Carlsen vs. Viswanathan Anand (WCC 2014 Game 2)',
            date: 'Nov 9, 2014',
            movesCount: 35,
            pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. O-O d6 6. Re1 O-O 7. Bxc6 bxc6 8. h3 Re8 9. Nbd2 Nd7 10. Nc4 Bb6 11. a4 a5 12. Nxb6 cxb6 13. d4 Qc7 14. Ra3 Nf8 15. dxe5 dxe5 16. Nh4 Rd8 17. Qh5 f6 18. Nf5 Be6 19. Rg3 Ng6 20. h4 Bxf5 21. exf5 Nf4 22. Bxf4 exf4 23. Rc3 c5 24. Re6 Rab8 25. Rc4 Qd7 26. Kh2 Rf8 27. Rce4 Rb7 28. Qe2 b5 29. b3 bxa4 30. bxa4 Rb4 31. Re7 Qd6 32. Qf3 Rxe4 33. Qxe4 f3+ 34. g3 h5 35. Qb7 1-0',
            result: '1-0',
          },
          {
            id: 'sample-1',
            title: 'Kasparov vs Deep Blue (Game 6)',
            date: 'May 11, 1997',
            movesCount: 19,
            pgn: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6 8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8 15. axb5 cxb5 16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0',
            result: '1-0',
          },
          {
            id: 'sample-2',
            title: 'Immortal Game (Anderssen vs Kieseritzky)',
            date: 'June 21, 1851',
            movesCount: 23,
            pgn: '1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0',
            result: '1-0',
          },
        ];
        queueMicrotask(() => setGames(sampleGames));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleGames));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const saveToStorage = (updated: SavedGame[]) => {
    setGames(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSaveCurrentGame = () => {
    if (!currentPgn || !currentPgn.trim()) {
      alert("No moves played in current game to save.");
      return;
    }
    const moves = currentPgn.split(/\d+\./).filter(Boolean);
    const newGame: SavedGame = {
      id: `game-${Date.now()}`,
      title: `Saved Game #${games.length + 1}`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      movesCount: moves.length,
      pgn: currentPgn,
    };
    saveToStorage([newGame, ...games]);
  };

  const handleDeleteGame = (id: string) => {
    const next = games.filter(g => g.id !== id);
    saveToStorage(next);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const newGame: SavedGame = {
      id: `imported-${Date.now()}`,
      title: `Imported PGN Game`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      movesCount: importText.split(/\d+\./).filter(Boolean).length || 10,
      pgn: importText.trim(),
    };
    saveToStorage([newGame, ...games]);
    setImportText('');
    setShowImport(false);
  };

  if (!isOpen) return null;

  return (
    <div className="archive-modal-overlay">
      <div className="archive-modal-container">
        {/* Header */}
        <div className="archive-modal-header">
          <div className="archive-header-left">
            <FolderArchive size={20} className="archive-icon text-amber" />
            <h2 className="archive-title">Games Archive</h2>
            <span className="archive-count-badge">{games.length}</span>
          </div>
          <button className="archive-close-btn" onClick={onClose} aria-label="Close archive">
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="archive-actions-bar">
          <button className="archive-btn save-btn" onClick={handleSaveCurrentGame}>
            <Plus size={15} /> Save Current Game
          </button>
          <button className="archive-btn import-btn" onClick={() => setShowImport(!showImport)}>
            <ClipboardPaste size={15} /> Import PGN
          </button>
        </div>

        {/* PGN Import Box */}
        {showImport && (
          <div className="archive-import-box">
            <textarea
              className="archive-import-textarea"
              placeholder="Paste PGN notation string here (e.g. 1. e4 e5 2. Nf3...)"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={4}
            />
            <div className="import-box-footer">
              <button className="import-cancel-btn" onClick={() => setShowImport(false)}>
                Cancel
              </button>
              <button className="import-submit-btn" onClick={handleImport}>
                Add to Archive
              </button>
            </div>
          </div>
        )}

        {/* List of Saved Games */}
        <div className="archive-list-scroll">
          {games.map((g) => (
            <div key={g.id} className="archive-item-card">
              <div className="archive-item-info">
                <h4 className="archive-item-title">{g.title}</h4>
                <div className="archive-item-meta">
                  <span>📅 {g.date}</span>
                  <span>•</span>
                  <span>{g.movesCount} moves</span>
                  {g.result && <span className="archive-result-pill">{g.result}</span>}
                </div>
              </div>

              <div className="archive-item-actions">
                <button
                  className="archive-load-btn"
                  onClick={() => {
                    onLoadGame(g.pgn);
                    onClose();
                  }}
                  title="Load and analyze this game"
                >
                  <Play size={15} /> Load
                </button>
                <button
                  className="archive-del-btn"
                  onClick={() => handleDeleteGame(g.id)}
                  title="Delete game"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {games.length === 0 && (
            <div className="archive-empty">
              <p>No saved games in archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
