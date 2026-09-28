"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import {
  Menu,
  RotateCcw,
  Repeat,
  Lightbulb,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Minus,
  Bot,
  Search,
  Swords,
  BarChart3,
  Edit3,
  FolderArchive,
  Target,
  Settings as SettingsIcon,
  Info,
} from 'lucide-react';

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
  toFigurineNotation,
  type GameReportData,
} from './chess-utils';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playBlunderSound,
  playGameOverSound,
} from './sound';

import DrawerSidebar, { type ActiveView } from './DrawerSidebar';
import BoardEditorModal from './BoardEditorModal';
import OpeningsModal from './OpeningsModal';
import BoardOptionsSheet from './BoardOptionsSheet';
import PlaySetupModal from './PlaySetupModal';
import SettingsPanel, { type ChakraSettings } from './SettingsPanel';
import GamesArchiveModal from './GamesArchiveModal';
import AboutModal from './AboutModal';
import GameReport from './GameReport';
import ArrowNumberBadges, { type ArrowBadge } from './ArrowNumberBadges';
import { detectOpening, type Opening } from './openings';
import MoveHistory from './MoveHistory';

import './chess-app.css';

export default function ChessApp() {
  // Navigation / Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('analysis');
  const [showEditor, setShowEditor] = useState(false);
  const [showOpenings, setShowOpenings] = useState(false);
  const [showBoardOptions, setShowBoardOptions] = useState(false);
  const [showPlaySetup, setShowPlaySetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [gameReport, setGameReport] = useState<GameReportData | null>(null);

  // Widescreen Right Hub Tab
  const [desktopRightTab, setDesktopRightTab] = useState<'variations' | 'history' | 'openings'>('variations');

  // Board & Move Selection
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [selectedCandidateUci, setSelectedCandidateUci] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(
    BOARD_THEMES.find(t => t.id === 'walnut') || BOARD_THEMES[0]
  );

  // Play Opponent Config
  const [playElo, setPlayElo] = useState<number>(2000);
  const [enginePaused, setEnginePaused] = useState(false);
  const [engineLineCount, setEngineLineCount] = useState<number>(3);

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [hintActive, setHintActive] = useState(false);

  // Comprehensive Settings State
  const [settings, setSettings] = useState<ChakraSettings>({
    soundEnabled: true,
    fullScreen: false,
    showThreats: true,
    showKeyElements: false,
    useNnue: true,
    engineThreads: 2,
    engineHash: 64,
    engineDepth: 18,
    figurineNotation: true,
    pieceAnimationSpeed: 'default',
    enlargePieceOnDrag: true,
    showAverageCpl: true,
    drawArrows: true,
    showAnalysisArrows: true,
    showArrowNumbers: true,
    showArrowStrengthColor: true,
    username: 'ChakraPlayer',
  });

  const gameState = useGameState();
  const {
    game,
    mode,
    playerColor,
    currentMoveIndex,
    moveHistory,
    isGameOver,
    boardOrientation,
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
    updateMoveEval,
  } = gameState;

  const prevEvalRef = useRef<number>(0);

  // Show Toast Helper
  const showToast = useCallback((msg: string, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  }, []);

  // Audio trigger
  const triggerMoveSound = useCallback((moveResult: any, updatedGame: Chess) => {
    if (!settings.soundEnabled) return;
    if (updatedGame.isGameOver()) {
      playGameOverSound();
    } else if (updatedGame.inCheck()) {
      playCheckSound();
    } else if (moveResult?.captured) {
      playCaptureSound();
    } else {
      playMoveSound();
    }
  }, [settings.soundEnabled]);

  // Handle engine best move in Play mode
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
      }, 400);
    }
  }, [mode, game, playerColor, makeMove, triggerMoveSound]);

  const stockfish = useStockfish({
    onBestMove: handleEngineBestMove,
    defaultMultiPV: engineLineCount,
  });

  // Keep engine MultiPV count synced
  useEffect(() => {
    stockfish.updateMultiPV(engineLineCount);
  }, [engineLineCount, stockfish]);

  // Position feed to engine
  useEffect(() => {
    if (enginePaused) return;
    const fen = game.fen();
    const isAtEnd = currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0;

    if (mode === 'play' && isAtEnd && !isGameOver) {
      if (game.turn() !== playerColor) {
        stockfish.play(fen, settings.engineDepth);
      } else {
        stockfish.analyze(fen, settings.engineDepth);
      }
    } else {
      stockfish.analyze(fen, settings.engineDepth);
    }
  }, [game.fen(), mode, playerColor, settings.engineDepth, currentMoveIndex, moveHistory.length, isGameOver, enginePaused]);

  // Move eval classification
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

        if (classification === 'blunder' && mode === 'play') {
          if (settings.soundEnabled) playBlunderSound();
          showToast(`Blunder! ${entry.move.san} loses ${(cpLoss / 100).toFixed(1)} pawns`);
        }
      }
      prevEvalRef.current = evalFromWhite;
    }
  }, [stockfish.depth, stockfish.evaluation, currentMoveIndex, moveHistory, mode, settings.soundEnabled, updateMoveEval, showToast]);

  // Drag & drop move handler
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
      setHintActive(false);
      return true;
    }

    return false;
  }, [mode, game, playerColor, currentMoveIndex, moveHistory.length, makeMove, triggerMoveSound]);

  // Tap-to-move for touchscreens & smartphones
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
        setHintActive(false);
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

  // Detect current opening from move history
  const currentOpening = useMemo(() => {
    const sanList = moveHistory.slice(0, currentMoveIndex + 1).map(m => m.move.san);
    return detectOpening(sanList);
  }, [moveHistory, currentMoveIndex]);

  // Handle Menu View Selection
  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    switch (view) {
      case 'analysis':
        newGame('analysis', 'w', settings.engineDepth);
        showToast('Switched to Analysis Board');
        break;
      case 'play':
        setShowPlaySetup(true);
        break;
      case 'report':
        handleShowReport();
        break;
      case 'editor':
        setShowEditor(true);
        break;
      case 'archive':
        setShowArchive(true);
        break;
      case 'openings':
        setShowOpenings(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'about':
        setShowAbout(true);
        break;
    }
  };

  // Start game from Play Setup modal
  const handleStartPlayGame = (config: {
    color: 'w' | 'b' | 'random';
    opponentType: 'elo' | 'maia';
    elo: number;
    thinkTimeSec: number;
    chess960: boolean;
    startFen?: string;
  }) => {
    const chosenColor = config.color === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : config.color;
    setPlayElo(config.elo);
    newGame('play', chosenColor, Math.min(18, Math.max(3, Math.round(config.elo / 150))));
    stockfish.newGame();

    if (config.startFen) {
      loadFEN(config.startFen);
    }

    showToast('🔥 Game Started!');
    setSpeechBubble('👋 Best of luck!');
    setTimeout(() => setSpeechBubble(null), 4000);
  };

  // Generate Accuracy Report
  const handleShowReport = useCallback(() => {
    if (moveHistory.length === 0) {
      showToast('Make some moves first to analyze accuracy.');
      return;
    }
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
  }, [moveHistory, mode, playerColor, showToast]);

  // Load Opening on board
  const handleSelectOpening = (op: Opening) => {
    newGame('analysis', 'w', settings.engineDepth);
    stockfish.newGame();
    setTimeout(() => {
      op.moves.forEach(san => {
        makeMove(san);
      });
      showToast(`Loaded ${op.eco}: ${op.name}`);
    }, 100);
  };

  // Trigger hint
  const handleToggleHint = () => {
    setHintActive(!hintActive);
    if (!hintActive && stockfish.bestMove) {
      showToast(`Hint: Engine recommends ${stockfish.bestMove}`);
    }
  };

  // Build Board Square Styles
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

  // Move dots & capture rings
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
  if (settings.showThreats) {
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
  if (settings.showKeyElements) {
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

  // Multi-color Tactical Arrows & Number Badges (#1 Blue, #2 Green, #3 Orange, #4 Yellow)
  const customArrows: Array<{ startSquare: string; endSquare: string; color: string }> = [];
  const arrowBadges: ArrowBadge[] = [];

  const ARROW_COLORS = [
    'rgba(59, 130, 246, 0.9)',  // #1 Blue
    'rgba(34, 197, 94, 0.88)',  // #2 Green
    'rgba(249, 115, 22, 0.88)', // #3 Orange
    'rgba(234, 179, 8, 0.88)',  // #4 Yellow
  ];

  if (settings.drawArrows && settings.showAnalysisArrows) {
    if (selectedCandidateUci) {
      const parsed = parseBestMove(selectedCandidateUci);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_COLORS[0] });
        if (settings.showArrowNumbers) {
          arrowBadges.push({ id: `badge-sel`, square: parsed.to, number: 1, color: ARROW_COLORS[0] });
        }
      }
    } else if (hintActive && stockfish.bestMove) {
      const parsed = parseBestMove(stockfish.bestMove);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_COLORS[0] });
        arrowBadges.push({ id: `badge-hint`, square: parsed.to, number: 1, color: ARROW_COLORS[0] });
      }
    } else if (stockfish.multiPvLines.length > 0) {
      const count = Math.min(engineLineCount, stockfish.multiPvLines.length);
      stockfish.multiPvLines.slice(0, count).forEach((line, idx) => {
        const parsed = parseBestMove(line.moveUci);
        if (parsed) {
          const color = settings.showArrowStrengthColor ? (ARROW_COLORS[idx] || ARROW_COLORS[3]) : ARROW_COLORS[0];
          customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color });
          if (settings.showArrowNumbers) {
            arrowBadges.push({ id: `badge-${line.multipv}`, square: parsed.to, number: line.multipv, color });
          }
        }
      });
    } else if (stockfish.bestMove) {
      const parsed = parseBestMove(stockfish.bestMove);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_COLORS[0] });
        if (settings.showArrowNumbers) {
          arrowBadges.push({ id: `badge-1`, square: parsed.to, number: 1, color: ARROW_COLORS[0] });
        }
      }
    }
  }

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

  // Convert UCI to Figurine SAN
  const uciToSan = (uci: string, boardFen: string): string => {
    if (!uci || uci.length < 4) return uci;
    try {
      const tempGame = new Chess(boardFen);
      const res = tempGame.move({ from: uci.substring(0, 2), to: uci.substring(2, 4), promotion: uci[4] || 'q' });
      if (res) return settings.figurineNotation ? toFigurineNotation(res.san) : res.san;
    } catch {
      // fallback
    }
    return uci;
  };

  const getLinePreview = (pv: string[], fen: string) => {
    if (!pv || pv.length <= 1) return '';
    try {
      const temp = new Chess(fen);
      const moves: string[] = [];
      for (let i = 0; i < Math.min(pv.length, 6); i++) {
        const res = temp.move({ from: pv[i].substring(0, 2), to: pv[i].substring(2, 4), promotion: pv[i][4] || 'q' });
        if (!res) break;
        if (i > 0) moves.push(settings.figurineNotation ? toFigurineNotation(res.san) : res.san);
      }
      return moves.join(' ');
    } catch {
      return pv.slice(1, 5).join(' ');
    }
  };

  const evalFormatted = (stockfish.evaluation >= 0 ? '+' : '') + (stockfish.evaluation / 100).toFixed(2);
  const evalPercent = Math.min(100, Math.max(0, 50 + (stockfish.evaluation / 100) * 8));

  return (
    <div className="chess-app">
      {/* ──────────────────────────────────────────────────────────────────
          TOP APP BAR (Matches Video 00:00 & 00:03)
          ────────────────────────────────────────────────────────────────── */}
      <header className="chess-top-bar">
        <div className="chess-top-left">
          <button
            className="chess-drawer-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Navigation Drawer"
            title="Menu"
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="chess-brand-link">
            <span>ChakraChess</span>
            <span className="chess-pro-badge">PRO</span>
          </Link>
        </div>

        {/* Center Opening Banner & Move Chips */}
        <div className="chess-top-center">
          <button
            className="opening-banner-pill"
            onClick={() => setShowOpenings(true)}
            title="Explore Opening Books"
          >
            <span>{currentOpening ? `${currentOpening.eco}: ${currentOpening.name}` : 'C20: King Pawn Game'}</span>
          </button>

          <div className="move-chips-strip">
            {moveHistory.map((m, idx) => (
              <button
                key={idx}
                className={`move-chip ${idx === currentMoveIndex ? 'active-chip' : ''}`}
                onClick={() => goToMove(idx)}
              >
                {Math.floor(idx / 2) + 1}. {settings.figurineNotation ? toFigurineNotation(m.move.san) : m.move.san}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="chess-top-right">
          <button className="chess-header-icon-btn" onClick={flipBoard} title="Flip Chessboard">
            <Repeat size={16} />
          </button>
          <button
            className="chess-header-icon-btn"
            onClick={() => setEnginePaused(!enginePaused)}
            title={enginePaused ? 'Resume Engine Analysis' : 'Pause Engine Analysis'}
          >
            {enginePaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className="chess-header-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Floating Bottom Toast */}
      {toastMessage && (
        <div className="floating-bottom-toast">
          <span>🔥</span> {toastMessage}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP / WIDESCREEN & MOBILE VIEW CONTAINER
          ────────────────────────────────────────────────────────────────── */}
      <div className="chess-app-desktop-container">
        {/* Left Desktop Persistent Sidebar */}
        <aside className="desktop-persistent-sidebar">
          <div className="drawer-header">
            <div className="drawer-profile">
              <div className="drawer-avatar-ring">
                <span className="drawer-avatar-icon">♟</span>
              </div>
              <div className="drawer-title-group">
                <h2 className="drawer-title">ChakraChess Pro</h2>
                <span className="drawer-subtitle">Grandmaster Edition</span>
              </div>
            </div>
          </div>
          <nav className="desktop-sidebar-nav">
            {[
              { id: 'analysis' as const, label: 'Analysis Board', icon: <Search size={18} /> },
              { id: 'play' as const, label: 'Play Chess', icon: <Swords size={18} /> },
              { id: 'report' as const, label: 'Analyze Game', icon: <BarChart3 size={18} /> },
              { id: 'editor' as const, label: 'Board Editor', icon: <Edit3 size={18} /> },
              { id: 'archive' as const, label: 'Games Archive', icon: <FolderArchive size={18} /> },
              { id: 'openings' as const, label: 'Openings', icon: <Target size={18} /> },
              { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon size={18} /> },
              { id: 'about' as const, label: 'About', icon: <Info size={18} /> },
            ].map(item => (
              <button
                key={item.id}
                className={`drawer-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => handleSelectView(item.id)}
              >
                <span className="drawer-item-icon">{item.icon}</span>
                <span className="drawer-item-label">{item.label}</span>
                {activeView === item.id && <span className="drawer-item-indicator" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center Chessboard Stage (Mobile & Desktop) */}
        <main className="chess-main-viewport desktop-center-stage">
          <div className="board-stage-container">
            {/* Play Mode Opponent Profile Bar */}
            {mode === 'play' && (
              <div className="play-mode-opponent-bar">
                <div className="opponent-profile-tag">
                  <div className="opponent-cpu-icon">
                    <Bot size={16} />
                  </div>
                  <span className="opponent-elo-pill">CPU {playElo}</span>
                </div>
                {speechBubble && (
                  <div className="greeting-speech-bubble">
                    {speechBubble}
                  </div>
                )}
              </div>
            )}

            {/* Chess Board Area */}
            <div className="chess-board-wrapper">
              <Chessboard
                options={{
                  id: "chakrachess-pro-board",
                  position: game.fen(),
                  onPieceDrop,
                  onSquareClick,
                  boardOrientation: boardOrientation,
                  boardStyle: {
                    borderRadius: '8px',
                  },
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                  squareStyles: customSquareStyles,
                  arrows: customArrows,
                  animationDurationInMs: settings.pieceAnimationSpeed === 'fast' ? 120 : settings.pieceAnimationSpeed === 'slow' ? 320 : 200,
                }}
              />

              {/* Numbered Arrow Badges Overlay */}
              <ArrowNumberBadges badges={arrowBadges} boardOrientation={boardOrientation} />
            </div>

            {/* Active player indicator in Play Mode */}
            {mode === 'play' && (
              <div className="play-mode-opponent-bar" style={{ marginTop: 4 }}>
                <div className="active-player-tag">
                  <span className="active-dot" />
                  <span>You</span>
                </div>
              </div>
            )}

            {/* Integrated Horizontal Eval Bar (Matches Video 00:00, 00:18, 00:43) */}
            <div className="integrated-horizontal-eval-bar">
              <div className="eval-progress-track" style={{ width: `${evalPercent}%` }} />
              <div className="eval-bar-content">
                <div className="eval-text-pill">
                  {enginePaused ? (
                    <span>⏸ Engine Paused</span>
                  ) : (
                    <>
                      <span>{currentOpening ? currentOpening.name : 'Stockfish 16'}</span>
                      <span className="eval-score-bold">({evalFormatted})</span>
                    </>
                  )}
                </div>

                <div className="eval-bar-controls">
                  <button
                    className="eval-control-btn"
                    onClick={() => setEngineLineCount(Math.max(1, engineLineCount - 1))}
                    title="Fewer Lines"
                  >
                    <Minus size={13} />
                  </button>
                  <button
                    className="eval-control-btn"
                    onClick={() => setEngineLineCount(Math.min(10, engineLineCount + 1))}
                    title="More Lines"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    className="eval-control-btn"
                    onClick={() => setEnginePaused(!enginePaused)}
                    title={enginePaused ? 'Resume' : 'Pause'}
                  >
                    {enginePaused ? <Play size={13} /> : <Pause size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Multi-PV Engine Lines (Shown directly under board on mobile) */}
            <div className="engine-variations-container">
              <div className="variations-header-pill">
                <span>Engines lines (Variations): {engineLineCount}</span>
                <div className="variations-counter-group">
                  <button className="var-count-btn" onClick={() => setEngineLineCount(Math.max(1, engineLineCount - 1))}>-</button>
                  <button className="var-count-btn" onClick={() => setEngineLineCount(Math.min(10, engineLineCount + 1))}>+</button>
                </div>
              </div>

              {stockfish.multiPvLines.slice(0, engineLineCount).map((line, idx) => {
                const moveSan = uciToSan(line.moveUci, game.fen());
                const preview = getLinePreview(line.pvLine, game.fen());
                const isSelected = selectedCandidateUci === line.moveUci;
                const scoreText = line.isMate ? (line.mateIn > 0 ? `M${line.mateIn}` : `-M${Math.abs(line.mateIn)}`) : ((line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2));
                return (
                  <div
                    key={idx}
                    className={`variation-line-card ${isSelected ? 'active-line' : ''}`}
                    onClick={() => setSelectedCandidateUci(isSelected ? null : line.moveUci)}
                  >
                    <span className={`line-eval-badge ${line.score > 0 ? 'positive' : line.score < 0 ? 'negative' : ''}`}>
                      {scoreText} (depth: {line.depth})
                    </span>
                    <span className="line-moves-sequence">
                      <strong>#{line.multipv} {moveSan}</strong> {preview}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fixed Bottom Dock Toolbar (Video 00:00, 00:03, 00:43) */}
            <div className="chess-bottom-dock">
              <button className="dock-btn" onClick={() => newGame('analysis', 'w', settings.engineDepth)} title="Reset Board">
                <RotateCcw size={20} />
              </button>
              <button className="dock-btn" onClick={flipBoard} title="Flip Board">
                <Repeat size={20} />
              </button>
              <button
                className={`dock-btn ${hintActive ? 'active-hint' : ''}`}
                onClick={handleToggleHint}
                title="Engine Move Hint"
              >
                <Lightbulb size={20} />
              </button>
              <button className="dock-btn" onClick={goToStart} title="First Move">
                <SkipBack size={20} />
              </button>
              <button className="dock-btn" onClick={goBack} title="Previous Move">
                <ChevronLeft size={22} />
              </button>
              <button className="dock-btn" onClick={goForward} title="Next Move">
                <ChevronRight size={22} />
              </button>
              <button className="dock-btn" onClick={goToEnd} title="Latest Move">
                <SkipForward size={20} />
              </button>
              <button className="dock-btn" onClick={() => setShowBoardOptions(true)} title="More Board Options">
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>
        </main>

        {/* Right Desktop Widescreen Hub (Taking full advantage of side space!) */}
        <aside className="desktop-right-widescreen-hub">
          <div className="widescreen-tabs-header">
            <button
              className={`widescreen-tab-btn ${desktopRightTab === 'variations' ? 'active' : ''}`}
              onClick={() => setDesktopRightTab('variations')}
            >
              ★ Engine Lines
            </button>
            <button
              className={`widescreen-tab-btn ${desktopRightTab === 'history' ? 'active' : ''}`}
              onClick={() => setDesktopRightTab('history')}
            >
              📜 Move Tree ({moveHistory.length})
            </button>
            <button
              className={`widescreen-tab-btn ${desktopRightTab === 'openings' ? 'active' : ''}`}
              onClick={() => setDesktopRightTab('openings')}
            >
              🎯 Openings
            </button>
          </div>

          <div className="widescreen-tab-content">
            {desktopRightTab === 'variations' && (
              <div className="desktop-variations-view">
                <div className="variations-header-pill" style={{ marginBottom: 10 }}>
                  <span>Stockfish 16 NNUE Variations ({stockfish.depth} depth)</span>
                  <span className="openings-stats-badge">{stockfish.nps ? `${Math.round(stockfish.nps / 1000)}k nps` : 'Calculating'}</span>
                </div>
                {stockfish.multiPvLines.map((line, idx) => {
                  const moveSan = uciToSan(line.moveUci, game.fen());
                  const preview = getLinePreview(line.pvLine, game.fen());
                  const isSelected = selectedCandidateUci === line.moveUci;
                  const scoreText = line.isMate ? (line.mateIn > 0 ? `M${line.mateIn}` : `-M${Math.abs(line.mateIn)}`) : ((line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2));
                  return (
                    <div
                      key={idx}
                      className={`variation-line-card ${isSelected ? 'active-line' : ''}`}
                      onClick={() => setSelectedCandidateUci(isSelected ? null : line.moveUci)}
                      style={{ marginBottom: 8 }}
                    >
                      <span className={`line-eval-badge ${line.score > 0 ? 'positive' : line.score < 0 ? 'negative' : ''}`}>
                        {scoreText}
                      </span>
                      <span className="line-moves-sequence">
                        <strong>#{line.multipv} {moveSan}</strong> {preview}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {desktopRightTab === 'history' && (
              <MoveHistory
                moves={moveHistory}
                currentIndex={currentMoveIndex}
                figurineNotation={settings.figurineNotation}
                showStrength={true}
                onGoToMove={goToMove}
              />
            )}

            {desktopRightTab === 'openings' && (
              <div className="desktop-openings-inline">
                {currentOpening && (
                  <div className="opening-item" style={{ background: 'rgba(59, 130, 246, 0.1)', marginBottom: 12 }}>
                    <div className="opening-item-left">
                      <span className="opening-pawn-icon">♟</span>
                      <div className="opening-info">
                        <div className="opening-name-row">
                          <span className="opening-eco">{currentOpening.eco}:</span>
                          <span className="opening-name">{currentOpening.name}</span>
                        </div>
                        <div className="opening-moves-row">
                          <span className="opening-moves">{currentOpening.movesStr}</span>
                          <span className="opening-stats-badge">
                            [W: {currentOpening.whiteWinPct}%, B: {currentOpening.blackWinPct}%]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  className="play-start-btn"
                  onClick={() => setShowOpenings(true)}
                  style={{ width: '100%' }}
                >
                  Browse Full Opening Directory
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          ALL INTERACTIVE MODALS & DRAWERS
          ────────────────────────────────────────────────────────────────── */}
      <DrawerSidebar
        isOpen={isDrawerOpen}
        activeView={activeView}
        onSelectView={handleSelectView}
        onClose={() => setIsDrawerOpen(false)}
      />

      <BoardEditorModal
        isOpen={showEditor}
        initialFen={game.fen()}
        onClose={() => setShowEditor(false)}
        onApplyFen={(fen) => {
          loadFEN(fen);
          showToast('Custom position applied!');
        }}
      />

      <OpeningsModal
        isOpen={showOpenings}
        onClose={() => setShowOpenings(false)}
        onSelectOpening={handleSelectOpening}
      />

      <BoardOptionsSheet
        isOpen={showBoardOptions}
        onClose={() => setShowBoardOptions(false)}
        onResetBoard={() => newGame('analysis', 'w', settings.engineDepth)}
        onSharePgn={() => {
          if (navigator.clipboard) navigator.clipboard.writeText(getPGN());
        }}
        onShareFen={() => {
          if (navigator.clipboard) navigator.clipboard.writeText(game.fen());
        }}
        onSavePgn={() => {
          const blob = new Blob([getPGN()], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chakrachess_${Date.now()}.pgn`;
          a.click();
        }}
        onAnalyzePgn={handleShowReport}
        onPlayFromHere={() => {
          setShowPlaySetup(true);
        }}
      />

      <PlaySetupModal
        isOpen={showPlaySetup}
        onClose={() => setShowPlaySetup(false)}
        onStartGame={handleStartPlayGame}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentThemeId={boardTheme.id}
        settings={settings}
        onUpdateSetting={(key, val) => setSettings(prev => ({ ...prev, [key]: val }))}
        onThemeChange={(themeId) => {
          const t = BOARD_THEMES.find(th => th.id === themeId);
          if (t) setBoardTheme(t);
        }}
      />

      <GamesArchiveModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onLoadGame={(pgn) => {
          loadPGN(pgn);
          showToast('Game loaded from archive!');
        }}
        currentPgn={getPGN()}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
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
