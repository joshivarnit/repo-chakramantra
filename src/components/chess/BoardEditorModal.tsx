"use client";

import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { RotateCcw, Trash2, X, Check, Copy, ClipboardPaste } from 'lucide-react';

interface BoardEditorModalProps {
  isOpen: boolean;
  initialFen: string;
  onClose: () => void;
  onApplyFen: (fen: string) => void;
}

const PIECE_SYMBOLS_MAP: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

export default function BoardEditorModal({
  isOpen,
  initialFen,
  onClose,
  onApplyFen,
}: BoardEditorModalProps) {
  const [boardState, setBoardState] = useState<(string | null)[][]>(() => {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  });
  const [toMove, setToMove] = useState<Color>('w');
  const [castling, setCastling] = useState({
    wK: true,
    wQ: true,
    bK: true,
    bQ: true,
  });
  const [selectedPiece, setSelectedPiece] = useState<string | 'trash'>('P');
  const [fenString, setFenString] = useState(initialFen);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Parse FEN into grid whenever modal opens or initialFen changes
  useEffect(() => {
    if (!isOpen) return;
    try {
      const g = new Chess(initialFen);
      const rows = g.board().map(row =>
        row.map(piece => piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : null)
      );
      queueMicrotask(() => {
        setBoardState(rows);
        setToMove(g.turn());
        setCastling({
          wK: initialFen.includes('K'),
          wQ: initialFen.includes('Q'),
          bK: initialFen.includes('k'),
          bQ: initialFen.includes('q'),
        });
        setFenString(initialFen);
      });
    } catch {
      // fallback to start fen
      queueMicrotask(() => setFenString(initialFen));
    }
  }, [isOpen, initialFen]);

  // Compute FEN from current boardState
  const generateFen = (currentBoard: (string | null)[][], turn: Color, castleState: typeof castling) => {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (!p) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += p;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (r < 7) fen += '/';
    }

    fen += ` ${turn} `;
    let castlingStr = '';
    if (castleState.wK) castlingStr += 'K';
    if (castleState.wQ) castlingStr += 'Q';
    if (castleState.bK) castlingStr += 'k';
    if (castleState.bQ) castlingStr += 'q';
    fen += castlingStr || '-';
    fen += ' - 0 1';
    return fen;
  };

  const handleSquareClick = (r: number, c: number) => {
    const newBoard = boardState.map(row => [...row]);
    if (selectedPiece === 'trash') {
      newBoard[r][c] = null;
    } else {
      newBoard[r][c] = selectedPiece;
    }
    setBoardState(newBoard);
    const newFen = generateFen(newBoard, toMove, castling);
    setFenString(newFen);
  };

  const handleReset = () => {
    const g = new Chess();
    const rows = g.board().map(row =>
      row.map(piece => piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : null)
    );
    setBoardState(rows);
    setToMove('w');
    setCastling({ wK: true, wQ: true, bK: true, bQ: true });
    setFenString(g.fen());
  };

  const handleClear = () => {
    const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    setBoardState(emptyBoard);
    setCastling({ wK: false, wQ: false, bK: false, bQ: false });
    const emptyFen = generateFen(emptyBoard, toMove, { wK: false, wQ: false, bK: false, bQ: false });
    setFenString(emptyFen);
  };

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(fenString);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePasteFen = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const clean = text.trim();
        const g = new Chess(clean);
        const rows = g.board().map(row =>
          row.map(piece => piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : null)
        );
        setBoardState(rows);
        setToMove(g.turn());
        setCastling({
          wK: clean.includes('K'),
          wQ: clean.includes('Q'),
          bK: clean.includes('k'),
          bQ: clean.includes('q'),
        });
        setFenString(clean);
      }
    } catch {
      // ignore
    }
  };

  const handleDone = () => {
    try {
      new Chess(fenString);
      onApplyFen(fenString);
      onClose();
    } catch {
      alert("Invalid FEN position. Please check King counts and valid squares.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="editor-modal-overlay">
      <div className="editor-modal-container">
        {/* Top Actions & Config */}
        <div className="editor-top-controls">
          <div className="editor-action-buttons">
            <button className="editor-btn reset-btn" onClick={handleReset}>
              <RotateCcw size={14} /> RESET
            </button>
            <button className="editor-btn clear-btn" onClick={handleClear}>
              <Trash2 size={14} /> CLEAR
            </button>
          </div>

          <div className="editor-meta-controls">
            <div className="editor-control-group">
              <span className="control-group-title">To Move</span>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="toMove"
                    checked={toMove === 'w'}
                    onChange={() => {
                      setToMove('w');
                      setFenString(generateFen(boardState, 'w', castling));
                    }}
                  />
                  <span>⚪ White</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="toMove"
                    checked={toMove === 'b'}
                    onChange={() => {
                      setToMove('b');
                      setFenString(generateFen(boardState, 'b', castling));
                    }}
                  />
                  <span>⚫ Black</span>
                </label>
              </div>
            </div>

            <div className="editor-control-group">
              <span className="control-group-title">Castle Rights</span>
              <div className="checkbox-row">
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={castling.wK}
                    onChange={(e) => {
                      const next = { ...castling, wK: e.target.checked };
                      setCastling(next);
                      setFenString(generateFen(boardState, toMove, next));
                    }}
                  />
                  <span>W 0-0</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={castling.wQ}
                    onChange={(e) => {
                      const next = { ...castling, wQ: e.target.checked };
                      setCastling(next);
                      setFenString(generateFen(boardState, toMove, next));
                    }}
                  />
                  <span>W 0-0-0</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={castling.bK}
                    onChange={(e) => {
                      const next = { ...castling, bK: e.target.checked };
                      setCastling(next);
                      setFenString(generateFen(boardState, toMove, next));
                    }}
                  />
                  <span>B 0-0</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={castling.bQ}
                    onChange={(e) => {
                      const next = { ...castling, bQ: e.target.checked };
                      setCastling(next);
                      setFenString(generateFen(boardState, toMove, next));
                    }}
                  />
                  <span>B 0-0-0</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Board Display */}
        <div className="editor-board-wrapper">
          <div className="editor-chessboard-grid">
            {boardState.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                return (
                  <button
                    key={`${r}-${c}`}
                    className={`editor-square ${isLight ? 'light-square' : 'dark-square'}`}
                    onClick={() => handleSquareClick(r, c)}
                    title={`Square ${String.fromCharCode(97 + c)}${8 - r}`}
                  >
                    {/* Rank coordinate */}
                    {c === 0 && <span className="editor-rank-coord">{8 - r}</span>}
                    {/* File coordinate */}
                    {r === 7 && <span className="editor-file-coord">{String.fromCharCode(97 + c)}</span>}
                    
                    {piece && (
                      <span className={`editor-piece ${piece === piece.toUpperCase() ? 'white-piece' : 'black-piece'}`}>
                        {PIECE_SYMBOLS_MAP[piece] || piece}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Yellow Piece Palette Bar (Matches video 00:12) */}
        <div className="editor-palette-bar">
          <button
            className={`palette-btn trash-palette-btn ${selectedPiece === 'trash' ? 'active' : ''}`}
            onClick={() => setSelectedPiece('trash')}
            title="Delete / Erase piece"
          >
            <Trash2 size={20} />
          </button>
          
          <div className="palette-divider" />

          {/* White pieces */}
          <div className="palette-group">
            {['K', 'Q', 'R', 'B', 'N', 'P'].map((p) => (
              <button
                key={p}
                className={`palette-btn white-palette-btn ${selectedPiece === p ? 'active' : ''}`}
                onClick={() => setSelectedPiece(p)}
              >
                {PIECE_SYMBOLS_MAP[p]}
              </button>
            ))}
          </div>

          <div className="palette-divider" />

          {/* Black pieces */}
          <div className="palette-group">
            {['k', 'q', 'r', 'b', 'n', 'p'].map((p) => (
              <button
                key={p}
                className={`palette-btn black-palette-btn ${selectedPiece === p ? 'active' : ''}`}
                onClick={() => setSelectedPiece(p)}
              >
                {PIECE_SYMBOLS_MAP[p]}
              </button>
            ))}
          </div>
        </div>

        {/* FEN Bar & Actions */}
        <div className="editor-fen-container">
          <div className="editor-fen-actions">
            <button className="fen-action-link" onClick={handlePasteFen}>
              <ClipboardPaste size={14} /> Paste Copied Fen
            </button>
            <button className="fen-action-link" onClick={handleCopyFen}>
              <Copy size={14} /> {copyFeedback ? 'Copied!' : 'Copy Fen'}
            </button>
          </div>
          <input
            type="text"
            className="editor-fen-input"
            value={fenString}
            onChange={(e) => setFenString(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Footer buttons */}
        <div className="editor-footer-buttons">
          <button className="editor-footer-btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="editor-footer-btn done-btn" onClick={handleDone}>
            <Check size={16} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
