"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useStockfish } from './useStockfish';
import { useGameState } from './useGameState';
import { BOARD_THEMES, type BoardTheme } from './themes';
import {
  parseBestMove,
  getThreatenedSquares,
  getHangingPieces,
  getPinnedPieces,
  getPassedPawns,
  getIsolatedPawns,
  classifyMove,
  generateGameReport,
  type GameReportData,
} from './chess-utils';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playBlunderSound,
  playGameOverSound,
} from './sound';
import EvalBar from './EvalBar';
import MoveHistory from './MoveHistory';
import TopMovesPanel from './TopMovesPanel';
import GameControls from './GameControls';
import SettingsPanel from './SettingsPanel';
import NewGameDialog from './NewGameDialog';
import GameReport from './GameReport';

import './chess-app.css';

const PIECE_UNICODE: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕',
};

function getCapturedPieces(game: Chess) {
  const STARTING_PIECES: Record<string, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1,
    P: 8, N: 2, B: 2, R: 2, Q: 1,
  };
  const currentPieces: Record<string, number> = {};
  game.board().forEach(row => {
    row.forEach(piece => {
      if (piece) {
        const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        currentPieces[key] = (currentPieces[key] || 0) + 1;
      }
    });
  });

  const capturedByWhite: string[] = [];
  const capturedByBlack: string[] = [];

  ['q', 'r', 'b', 'n', 'p'].forEach(type => {
    const missing = (STARTING_PIECES[type] || 0) - (currentPieces[type] || 0);
    for (let i = 0; i < missing; i++) capturedByWhite.push(type);
  });

  ['Q', 'R', 'B', 'N', 'P'].forEach(type => {
    const missing = (STARTING_PIECES[type] || 0) - (currentPieces[type] || 0);
    for (let i = 0; i < missing; i++) capturedByBlack.push(type);
  });

  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const whiteScore = capturedByWhite.reduce((sum, p) => sum + (pieceValues[p.toLowerCase()] || 0), 0);
  const blackScore = capturedByBlack.reduce((sum, p) => sum + (pieceValues[p.toLowerCase()] || 0), 0);
  const materialDiff = whiteScore - blackScore;

  return { capturedByWhite, capturedByBlack, materialDiff };
}

export default function ChessApp() {
  const [leftTab, setLeftTab] = useState<'moves' | 'topMoves'>('moves');
  const [mobileTab, setMobileTab] = useState<'board' | 'moves' | 'topMoves' | 'controls'>('board');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [selectedCandidateUci, setSelectedCandidateUci] = useState<string | null>(null);
  const [showNewGame, setShowNewGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [gameReport, setGameReport] = useState<GameReportData | null>(null);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(BOARD_THEMES[0]);
  const [blunderAlert, setBlunderAlert] = useState<string | null>(null);

  const gameState = useGameState();
  const {
    game,
    mode,
    playerColor,
    currentMoveIndex,
    moveHistory,
    isGameOver,
    gameResult,
    boardOrientation,
    engineDepth,
    showThreats,
    showKeyElements,
    showBestMoveArrow,
    showEvalBar,
    showMoveStrength,
    pauseOnBlunder,
    soundEnabled,
    figurineNotation,
    makeMove,
    goToMove,
    goToStart,
    goToEnd,
    goForward,
    goBack,
    newGame,
    loadPGN,
    loadFEN,
    getPGN,
    flipBoard,
    updateSetting,
    updateMoveEval,
  } = gameState;

  const prevEvalRef = useRef<number>(0);

  // Play appropriate move audio
  const triggerMoveSound = useCallback((moveResult: any, updatedGame: Chess) => {
    if (!soundEnabled) return;
    if (updatedGame.isGameOver()) {
      playGameOverSound();
    } else if (updatedGame.inCheck()) {
      playCheckSound();
    } else if (moveResult?.captured) {
      playCaptureSound();
    } else {
      playMoveSound();
    }
  }, [soundEnabled]);

  // Handle engine's best move (for play mode)
  const handleEngineBestMove = useCallback((bestMoveUci: string) => {
    if (mode !== 'play') return;
    if (game.turn() === playerColor) return;

    const parsed = parseBestMove(bestMoveUci);
    if (parsed) {
      setTimeout(() => {
        const move = makeMove(parsed);
        if (move) {
          triggerMoveSound(move, game);
        }
      }, 300);
    }
  }, [mode, game, playerColor, makeMove, triggerMoveSound]);

  const stockfish = useStockfish({
    onBestMove: handleEngineBestMove,
  });

  // Send position to engine whenever game state changes
  useEffect(() => {
    const fen = game.fen();
    const isAtEnd = currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0;

    if (mode === 'play' && isAtEnd && !isGameOver) {
      if (game.turn() !== playerColor) {
        // CPU's turn to play
        stockfish.play(fen, engineDepth);
      } else {
        // Player's turn — analyze in background
        stockfish.analyze(fen, engineDepth);
      }
    } else {
      // Analysis mode or reviewing history
      stockfish.analyze(fen, engineDepth);
    }
  }, [game.fen(), mode, playerColor, engineDepth, currentMoveIndex, moveHistory.length, isGameOver]);

  // Store eval for move classification
  useEffect(() => {
    if (stockfish.depth >= 10 && currentMoveIndex >= 0) {
      const evalFromWhite = stockfish.evaluation;
      const entry = moveHistory[currentMoveIndex];
      if (entry && entry.evaluation === undefined) {
        const prevEval = prevEvalRef.current;
        const moveColor = entry.move.color;
        const evalForPlayer = moveColor === 'w' ? evalFromWhite : -evalFromWhite;
        const prevEvalForPlayer = moveColor === 'w' ? prevEval : -prevEval;
        const cpLoss = prevEvalForPlayer - evalForPlayer;

        const classification = classifyMove(
          prevEvalForPlayer,
          evalForPlayer,
          !!entry.move.captured,
          entry.move.san
        );

        updateMoveEval(currentMoveIndex, evalFromWhite / 100, classification, cpLoss);

        if (classification === 'blunder' && pauseOnBlunder && mode === 'play') {
          if (soundEnabled) playBlunderSound();
          setBlunderAlert(`Blunder! ${entry.move.san} loses ${(cpLoss / 100).toFixed(1)} pawns`);
          setTimeout(() => setBlunderAlert(null), 3000);
        }
      }
      prevEvalRef.current = evalFromWhite;
    }
  }, [stockfish.depth, stockfish.evaluation, currentMoveIndex, moveHistory, pauseOnBlunder, mode, soundEnabled, updateMoveEval]);

  // Handle piece drop (drag & drop)
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }): boolean => {
    if (!targetSquare) return false;

    if (mode === 'play' && game.turn() !== playerColor) return false;
    if (mode === 'play' && currentMoveIndex < moveHistory.length - 1 && moveHistory.length > 0) return false;

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece?.pieceType?.[1]?.toLowerCase() === 'p' ? 'q' : (piece?.pieceType?.[1]?.toLowerCase() || 'q'),
    });

    if (move) {
      triggerMoveSound(move, game);
      setSelectedSquare(null);
      setPossibleMoves([]);
      return true;
    }

    return false;
  }, [mode, game, playerColor, currentMoveIndex, moveHistory.length, makeMove, triggerMoveSound]);

  // Handle tap-to-move for touchscreens & mobile
  const onSquareClick = useCallback((args: any) => {
    const square = args?.square;
    if (!square) return;

    if (mode === 'play' && game.turn() !== playerColor) return;
    if (mode === 'play' && currentMoveIndex < moveHistory.length - 1 && moveHistory.length > 0) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (possibleMoves.includes(square)) {
        const move = makeMove({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });
        if (move) {
          triggerMoveSound(move, game);
        }
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      const pieceOnSquare = game.get(square as Square);
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
        const legalMoves = game.moves({ square: square as Square, verbose: true });
        setPossibleMoves(legalMoves.map(m => m.to));
        return;
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const legalMoves = game.moves({ square: square as Square, verbose: true });
      setPossibleMoves(legalMoves.map(m => m.to));
    }
  }, [mode, game, playerColor, currentMoveIndex, moveHistory.length, selectedSquare, possibleMoves, makeMove, triggerMoveSound]);

  // Handle new game
  const handleNewGame = useCallback((gameMode: 'analysis' | 'play', color: 'w' | 'b', depth: number) => {
    newGame(gameMode, color, depth);
    stockfish.newGame();
    prevEvalRef.current = 0;
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameReport(null);
  }, [newGame, stockfish]);

  // Generate report
  const handleShowReport = useCallback(() => {
    if (moveHistory.length === 0) return;

    const playerMoves = moveHistory.filter((_, i) =>
      mode === 'play' ? (i % 2 === (playerColor === 'w' ? 0 : 1)) : true
    );

    const classifications = playerMoves
      .filter(m => m.classification)
      .map(m => m.classification as any);
    const cpLosses = playerMoves
      .filter(m => m.cpLoss !== undefined)
      .map(m => m.cpLoss as number);

    const report = generateGameReport(classifications, cpLosses);
    setGameReport(report);
    setShowReport(true);
  }, [moveHistory, mode, playerColor]);

  // Build custom square styles
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // Last move highlight
  if (currentMoveIndex >= 0 && moveHistory[currentMoveIndex]) {
    const lastMove = moveHistory[currentMoveIndex].move;
    customSquareStyles[lastMove.from] = {
      backgroundColor: boardTheme.lastMoveLight,
      opacity: 0.65,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: boardTheme.lastMoveDark,
      opacity: 0.65,
    };
  }

  // Selected square highlight
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(234, 179, 8, 0.45)',
      boxShadow: 'inset 0 0 0 3px #eab308',
    };
  }

  // Possible move indicators (dots & capture rings)
  possibleMoves.forEach(sq => {
    const isTargetOccupied = !!game.get(sq as Square);
    customSquareStyles[sq] = {
      ...customSquareStyles[sq],
      background: isTargetOccupied
        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 15%, transparent 60%)'
        : 'radial-gradient(circle, rgba(59, 130, 246, 0.65) 22%, transparent 28%)',
      cursor: 'pointer',
    };
  });

  // Threat highlights
  if (showThreats) {
    const currentTurn = game.turn();
    const hanging = getHangingPieces(game, currentTurn);
    const threatened = getThreatenedSquares(game, currentTurn);

    hanging.forEach(sq => {
      customSquareStyles[sq] = {
        ...customSquareStyles[sq],
        boxShadow: 'inset 0 0 0 3px #ca3431',
        borderRadius: '50%',
      };
    });

    threatened.forEach(sq => {
      if (!customSquareStyles[sq]?.boxShadow) {
        customSquareStyles[sq] = {
          ...customSquareStyles[sq],
          boxShadow: 'inset 0 0 0 2px rgba(255, 165, 0, 0.6)',
        };
      }
    });
  }

  // Key elements
  if (showKeyElements) {
    const currentTurn = game.turn();
    const pinned = getPinnedPieces(game, currentTurn);
    const passed = getPassedPawns(game, currentTurn);
    const isolated = getIsolatedPawns(game, currentTurn);

    pinned.forEach(sq => {
      customSquareStyles[sq] = {
        ...customSquareStyles[sq],
        background: `${customSquareStyles[sq]?.backgroundColor || 'transparent'} radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)`,
      };
    });

    passed.forEach(sq => {
      customSquareStyles[sq] = {
        ...customSquareStyles[sq],
        boxShadow: `${customSquareStyles[sq]?.boxShadow || ''} inset 0 0 8px rgba(0, 255, 0, 0.5)`.trim(),
      };
    });

    isolated.forEach(sq => {
      customSquareStyles[sq] = {
        ...customSquareStyles[sq],
        boxShadow: `${customSquareStyles[sq]?.boxShadow || ''} inset 0 0 8px rgba(255, 255, 0, 0.5)`.trim(),
      };
    });
  }

  // Best move / candidate move arrows
  const customArrows: Array<{ startSquare: string; endSquare: string; color: string }> = [];
  if (showBestMoveArrow) {
    if (selectedCandidateUci) {
      const parsed = parseBestMove(selectedCandidateUci);
      if (parsed) {
        customArrows.push({
          startSquare: parsed.from,
          endSquare: parsed.to,
          color: 'rgba(59, 130, 246, 0.85)',
        });
      }
    } else if (stockfish.multiPvLines.length > 0) {
      const colors = ['rgba(59, 130, 246, 0.85)', 'rgba(34, 197, 94, 0.75)', 'rgba(245, 158, 11, 0.65)'];
      stockfish.multiPvLines.slice(0, Math.min(3, stockfish.multiPvLines.length)).forEach((line, idx) => {
        const parsed = parseBestMove(line.moveUci);
        if (parsed) {
          customArrows.push({
            startSquare: parsed.from,
            endSquare: parsed.to,
            color: colors[idx] || 'rgba(148, 163, 184, 0.5)',
          });
        }
      });
    } else if (stockfish.bestMove) {
      const parsed = parseBestMove(stockfish.bestMove);
      if (parsed) {
        customArrows.push({
          startSquare: parsed.from,
          endSquare: parsed.to,
          color: 'rgba(59, 130, 246, 0.85)',
        });
      }
    }
  }

  // Engine evaluation normalized from White's perspective
  const evalFromWhite = stockfish.evaluation;
  const { capturedByWhite, capturedByBlack, materialDiff } = getCapturedPieces(game);

  // Top player vs bottom player pieces based on board orientation
  const topCaptured = boardOrientation === 'white' ? capturedByBlack : capturedByWhite;
  const bottomCaptured = boardOrientation === 'white' ? capturedByWhite : capturedByBlack;
  const topAdvantage = boardOrientation === 'white' ? -materialDiff : materialDiff;
  const bottomAdvantage = boardOrientation === 'white' ? materialDiff : -materialDiff;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowLeft': goBack(); break;
        case 'ArrowRight': goForward(); break;
        case 'Home': goToStart(); break;
        case 'End': goToEnd(); break;
        case 'f': flipBoard(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, goToStart, goToEnd, flipBoard]);

  return (
    <div className="chess-app">
      {/* Top Navigation Bar */}
      <header className="chess-top-bar">
        <Link href="/" className="chess-back-link">
          ← <span className="hidden sm:inline">Chakramantra</span>
        </Link>

        <div className="chess-top-title">
          <span className="chess-icon">♟</span>
          <span className="chess-title-text">ChakraChess</span>
          <span className="chess-engine-badge">CPU Engine</span>
        </div>

        <div className="chess-top-actions">
          <a
            href="/CMchess.apk"
            download
            className="chess-apk-badge"
            title="Download Android App (APK)"
          >
            📱 <span className="hidden sm:inline">App</span> APK
          </a>
          <button onClick={flipBoard} className="chess-icon-btn" title="Flip Board">
            ↕
          </button>
          <button
            onClick={() => updateSetting('soundEnabled', !soundEnabled)}
            className={`chess-icon-btn ${soundEnabled ? 'active-sound' : 'muted-sound'}`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={() => setShowSettings(true)} className="chess-icon-btn" title="Settings">
            ⚙
          </button>
        </div>
      </header>

      {/* Blunder alert */}
      {blunderAlert && (
        <div className="blunder-alert">
          <span className="blunder-icon">⚠</span>
          {blunderAlert}
        </div>
      )}

      {/* Mobile view segmented tabs (visible only on mobile screens) */}
      <div className="chess-mobile-tabs">
        <button
          className={`mobile-tab-btn ${mobileTab === 'board' ? 'active' : ''}`}
          onClick={() => setMobileTab('board')}
        >
          ♟ Board
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'moves' ? 'active' : ''}`}
          onClick={() => setMobileTab('moves')}
        >
          📜 Moves ({moveHistory.length})
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'topMoves' ? 'active' : ''}`}
          onClick={() => setMobileTab('topMoves')}
        >
          ★ Top 15
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'controls' ? 'active' : ''}`}
          onClick={() => setMobileTab('controls')}
        >
          ⚙ Game
        </button>
      </div>

      <div className="chess-app-layout">
        {/* Left panel: Move History or Top 15 Best Moves */}
        <div className={`chess-left-panel ${mobileTab === 'moves' || mobileTab === 'topMoves' ? 'mobile-visible' : ''}`}>
          <div className="left-panel-tabs">
            <button
              className={`left-tab-btn ${leftTab === 'moves' ? 'left-tab-active' : ''}`}
              onClick={() => { setLeftTab('moves'); setMobileTab('moves'); }}
            >
              Moves ({moveHistory.length})
            </button>
            <button
              className={`left-tab-btn ${leftTab === 'topMoves' ? 'left-tab-active' : ''}`}
              onClick={() => { setLeftTab('topMoves'); setMobileTab('topMoves'); }}
            >
              ★ Top 15 Moves
              {stockfish.multiPvLines.length > 0 && (
                <span className="left-tab-badge">{stockfish.multiPvLines.length}</span>
              )}
            </button>
          </div>

          <div className="left-panel-content">
            {leftTab === 'moves' ? (
              <MoveHistory
                moves={moveHistory}
                currentIndex={currentMoveIndex}
                figurineNotation={figurineNotation}
                showStrength={showMoveStrength}
                onGoToMove={goToMove}
              />
            ) : (
              <TopMovesPanel
                lines={stockfish.multiPvLines}
                fen={game.fen()}
                multipvCount={stockfish.multipvCount}
                selectedUci={selectedCandidateUci}
                figurineNotation={figurineNotation}
                onSelectMove={(uci) => setSelectedCandidateUci(uci === selectedCandidateUci ? null : uci)}
                onMultiPVChange={stockfish.updateMultiPV}
              />
            )}
          </div>
        </div>

        {/* Center: Board */}
        <div className={`chess-center ${mobileTab === 'board' ? 'mobile-visible' : ''}`}>
          {/* Top opponent captured pieces bar */}
          <div className="captured-pieces-bar">
            <div className="captured-pieces-list">
              {topCaptured.map((p, i) => (
                <span key={i} className="captured-piece-glyph">
                  {PIECE_UNICODE[p] || p}
                </span>
              ))}
              {topAdvantage > 0 && (
                <span className="material-advantage-pill">+{topAdvantage}</span>
              )}
            </div>
            <div className="opponent-label">
              {mode === 'play'
                ? (boardOrientation === (playerColor === 'w' ? 'white' : 'black') ? 'CPU' : 'You')
                : (boardOrientation === 'white' ? 'Black' : 'White')}
            </div>
          </div>

          <div className="chess-board-area">
            {/* Eval bar */}
            {showEvalBar && (
              <EvalBar
                evaluation={evalFromWhite}
                isMate={stockfish.isMate}
                mateIn={stockfish.mateIn}
                orientation={boardOrientation}
              />
            )}

            {/* Chess Board */}
            <div className="chess-board-wrapper">
              <Chessboard
                options={{
                  id: "chess-app-board",
                  position: game.fen(),
                  onPieceDrop,
                  onSquareClick,
                  boardOrientation: boardOrientation,
                  boardStyle: {
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  },
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                  squareStyles: customSquareStyles,
                  arrows: customArrows,
                  animationDurationInMs: 200,
                }}
              />
            </div>
          </div>

          {/* Bottom player captured pieces bar */}
          <div className="captured-pieces-bar bottom-captured-bar">
            <div className="captured-pieces-list">
              {bottomCaptured.map((p, i) => (
                <span key={i} className="captured-piece-glyph">
                  {PIECE_UNICODE[p] || p}
                </span>
              ))}
              {bottomAdvantage > 0 && (
                <span className="material-advantage-pill">+{bottomAdvantage}</span>
              )}
            </div>
            <div className="opponent-label">
              {mode === 'play'
                ? (boardOrientation === (playerColor === 'w' ? 'white' : 'black') ? 'You' : 'CPU')
                : (boardOrientation === 'white' ? 'White' : 'Black')}
            </div>
          </div>

          {/* Engine info bar */}
          <div className="chess-engine-bar">
            <div className="engine-bar-left">
              <span className="engine-label">CPU</span>
              <span className="engine-depth">depth {stockfish.depth}</span>
              {stockfish.isSearching && <span className="engine-searching">●</span>}
            </div>
            <div className="engine-bar-right">
              <span className={`engine-eval ${evalFromWhite > 0 ? 'eval-positive' : evalFromWhite < 0 ? 'eval-negative' : ''}`}>
                {stockfish.isMate
                  ? (stockfish.mateIn > 0 ? `M${stockfish.mateIn}` : `-M${Math.abs(stockfish.mateIn)}`)
                  : (evalFromWhite >= 0 ? '+' : '') + (evalFromWhite / 100).toFixed(2)
                }
              </span>
              {stockfish.bestMove && (
                <span className="engine-best-move">
                  Best: <strong>{stockfish.bestMove}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Compact Quick Action Bar on mobile */}
          <div className="mobile-action-toolbar">
            <button className="ctrl-btn" onClick={goToStart} title="Start">⏮</button>
            <button className="ctrl-btn" onClick={goBack} title="Back">◀</button>
            <button className="ctrl-btn" onClick={goForward} title="Forward">▶</button>
            <button className="ctrl-btn" onClick={goToEnd} title="End">⏭</button>
            <button className="ctrl-action-btn primary-btn" onClick={() => setShowNewGame(true)}>
              + New
            </button>
            <button className="ctrl-action-btn" onClick={flipBoard}>
              ↕ Flip
            </button>
          </div>
        </div>

        {/* Right panel: Controls */}
        <div className={`chess-right-panel ${mobileTab === 'controls' ? 'mobile-visible' : ''}`}>
          <div className="chess-mode-badge">
            {mode === 'play' ? '♟ Playing vs CPU' : '🔍 Analysis Board'}
          </div>

          <GameControls
            onNewGame={() => setShowNewGame(true)}
            onFlipBoard={flipBoard}
            onGoToStart={goToStart}
            onGoBack={goBack}
            onGoForward={goForward}
            onGoToEnd={goToEnd}
            onImportPGN={loadPGN}
            onImportFEN={loadFEN}
            onExportPGN={getPGN}
            currentFEN={game.fen()}
            isGameOver={isGameOver}
            gameResult={gameResult}
            mode={mode}
          />

          {/* Quick actions */}
          <div className="chess-quick-actions">
            <button
              className="chess-quick-btn"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              ⚙ Settings
            </button>
            {moveHistory.length > 0 && (
              <button
                className="chess-quick-btn chess-report-btn"
                onClick={handleShowReport}
                title="Game Report"
              >
                📊 Accuracy Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewGameDialog
        isOpen={showNewGame}
        onClose={() => setShowNewGame(false)}
        onStart={handleNewGame}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentThemeId={boardTheme.id}
        showThreats={showThreats}
        showKeyElements={showKeyElements}
        showBestMoveArrow={showBestMoveArrow}
        showEvalBar={showEvalBar}
        showMoveStrength={showMoveStrength}
        pauseOnBlunder={pauseOnBlunder}
        soundEnabled={soundEnabled}
        figurineNotation={figurineNotation}
        engineDepth={engineDepth}
        onThemeChange={(id) => {
          const theme = BOARD_THEMES.find(t => t.id === id);
          if (theme) setBoardTheme(theme);
        }}
        onToggle={(key, value) => updateSetting(key as any, value)}
        onDepthChange={(d) => updateSetting('engineDepth', d)}
      />

      <GameReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        report={gameReport}
        playerColor={playerColor}
      />
    </div>
  );
}
