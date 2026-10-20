"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Flag,
  Handshake,
  ExternalLink,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

import { useStockfish } from './useStockfish';
import { useGameState } from './useGameState';
import { BOARD_THEMES, type BoardTheme, type MoveClassification } from './themes';
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
  playWarningSound,
  playResignSound,
  playDrawSound,
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
import ConfirmActionModal, { type GameConfirmAction } from './ConfirmActionModal';
import OpeningExplorerPanel from './OpeningExplorerPanel';
import ArrowNumberBadges, { type ArrowBadge } from './ArrowNumberBadges';
import PawnPromotionModal, { type PromotionMovePending } from './PawnPromotionModal';
import LumiChatModal from './LumiChatModal';
import { detectOpening, type Opening } from './openings';
import MoveHistory from './MoveHistory';

import './chess-app.css';

// Module-level memoization caches to prevent main-thread lag without violating React render purity
const sanGlobalCache = new Map<string, string>();
const pvGlobalCache = new Map<string, string>();

// Lumi Master signature hand-drawn storybook watercolor pastel arrow palette
const ARROW_PALETTE = [
  'rgba(56, 189, 248, 0.94)',  // #1 Sky Pastel Azure
  'rgba(52, 211, 153, 0.94)',  // #2 Mint Watercolor Blossom
  'rgba(251, 146, 60, 0.94)',  // #3 Apricot Coral Pastel
  'rgba(250, 204, 21, 0.94)',  // #4 Buttercup Pastel Gold
  'rgba(192, 132, 252, 0.94)', // #5 Lavender Orchid Wash
  'rgba(244, 114, 182, 0.92)', // #6 Blossom Pink
  'rgba(45, 212, 191, 0.92)',  // #7 Turquoise Watercolor
  'rgba(163, 230, 53, 0.92)',  // #8 Fresh Leaf Green
  'rgba(96, 165, 250, 0.90)',  // #9 Soft Periwinkle
  'rgba(248, 113, 113, 0.90)', // #10 Strawberry Pastel
  'rgba(217, 119, 6, 0.90)',   // #11 Warm Ochre
  'rgba(147, 51, 234, 0.90)',  // #12 Deep Violet
  'rgba(13, 148, 136, 0.90)',  // #13 Deep Jade
  'rgba(225, 29, 72, 0.88)',   // #14 Crimson Wash
  'rgba(2, 132, 199, 0.88)',   // #15 Ocean Indigo
  'rgba(22, 163, 74, 0.88)',   // #16 Forest Moss
  'rgba(234, 88, 12, 0.88)',   // #17 Ember Orange
  'rgba(202, 138, 4, 0.88)',   // #18 Sunlit Gold
  'rgba(124, 58, 237, 0.88)',  // #19 Twilight Iris
  'rgba(190, 24, 93, 0.88)',   // #20 Rosebud
];

export default function ChessApp() {
  // Navigation / Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('analysis');
  const [showEditor, setShowEditor] = useState(false);
  const [showOpenings, setShowOpenings] = useState(false);
  const [showBoardOptions, setShowBoardOptions] = useState(false);
  const [showPlaySetup, setShowPlaySetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showLumiChat, setShowLumiChat] = useState(false);
  const [gameReport, setGameReport] = useState<GameReportData | null>(null);

  // Widescreen Right Hub Tab
  const [desktopRightTab, setDesktopRightTab] = useState<'variations' | 'history' | 'openings'>('variations');

  // Board & Move Selection
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [selectedCandidateUci, setSelectedCandidateUci] = useState<string | null>(null);

  // Default to signature Lumi Garden theme
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(
    BOARD_THEMES.find(t => t.id === 'lumi-garden') || BOARD_THEMES[0]
  );

  // Pawn Promotion Interactive Modal state
  const [pendingPromotion, setPendingPromotion] = useState<PromotionMovePending | null>(null);

  // Play Opponent Config
  const [playElo, setPlayElo] = useState<number>(2000);
  const [enginePaused, setEnginePaused] = useState(false);
  const [engineLineCount, setEngineLineCount] = useState<number>(3);

  // Toasts & Lumi Storybook Companion state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>("✨ Hello! I'm Lumi. Ready for a cozy chess journey?");
  const [hintActive, setHintActive] = useState(false);
  const [confirmAction, setConfirmAction] = useState<GameConfirmAction | null>(null);

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
  const triggerMoveSound = useCallback((moveResult: { captured?: string | boolean } | null | undefined, updatedGame: Chess) => {
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

  const botMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle engine best move in Play mode
  const handleEngineBestMove = useCallback((bestMoveUci: string, _ponder?: string, analyzedFen?: string) => {
    if (mode !== 'play') return;
    if (game.isGameOver()) return;
    if (game.turn() === playerColor) return;
    // Guard against stale bestmove calculations from past turns
    if (analyzedFen && analyzedFen !== game.fen()) return;

    const parsed = parseBestMove(bestMoveUci);
    if (parsed) {
      if (botMoveTimeoutRef.current) clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = setTimeout(() => {
        if (mode === 'play' && !game.isGameOver() && game.turn() !== playerColor) {
          const move = makeMove(parsed);
          if (move) {
            triggerMoveSound(move, game);
          }
        }
      }, 350);
    }
  }, [mode, game, playerColor, makeMove, triggerMoveSound]);

  const stockfish = useStockfish({
    onBestMove: handleEngineBestMove,
    defaultMultiPV: engineLineCount,
  });

  // Change variations count instantly and cleanly re-query engine
  const handleSetLineCount = useCallback((newCount: number) => {
    const clamped = Math.max(1, Math.min(20, newCount));
    setEngineLineCount(clamped);
    stockfish.updateMultiPV(clamped, game.fen(), settings.engineDepth);
    showToast(`Engine lines (Variations): ${clamped}`);
  }, [stockfish, game, settings.engineDepth, showToast]);

  // Toggle engine pause explicitly and reliably
  const toggleEnginePause = useCallback(() => {
    if (!enginePaused) {
      stockfish.stop();
      setEnginePaused(true);
      showToast('⏸ Engine Analysis Paused');
    } else {
      setEnginePaused(false);
      stockfish.analyze(game.fen(), settings.engineDepth);
      showToast('▶ Engine Analysis Resumed');
    }
  }, [enginePaused, stockfish, game, settings.engineDepth, showToast]);

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

  // Reset candidate line selection when board position changes
  useEffect(() => {
    setSelectedCandidateUci(null);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPendingPromotion(null);
  }, [game.fen()]);

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

        if (classification === 'blunder') {
          if (settings.soundEnabled) playBlunderSound();
          showToast(`Blunder! ${entry.move.san} loses ${(cpLoss / 100).toFixed(1)} pawns`);
          setSpeechBubble("🍃 A tricky spot! Let's examine the engine's alternatives.");
        } else if (classification === 'brilliant' || classification === 'great') {
          setSpeechBubble("✨ What a brilliant spark of insight!");
        }
      }
      prevEvalRef.current = evalFromWhite;
    }
  }, [stockfish.depth, stockfish.evaluation, currentMoveIndex, moveHistory, settings.soundEnabled, updateMoveEval, showToast]);

  // Check if a move is a pawn promotion move
  const checkIsPromotion = useCallback((from: string, to: string) => {
    const piece = game.get(from as Square);
    if (!piece || piece.type !== 'p') return false;
    if (piece.color === 'w' && from[1] === '7' && to[1] === '8') return true;
    if (piece.color === 'b' && from[1] === '2' && to[1] === '1') return true;
    return false;
  }, [game]);

  // Drag & drop move handler with promotion intercept
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }): boolean => {
    if (!targetSquare) return false;
    if (isGameOver) return false;
    if (mode === 'play' && game.turn() !== playerColor) return false;
    if (mode === 'play' && currentMoveIndex < moveHistory.length - 1 && moveHistory.length > 0) return false;

    // Check if legal move
    const legalMoves = game.moves({ square: sourceSquare as Square, verbose: true });
    const isLegalTarget = legalMoves.some(m => m.to === targetSquare);
    if (!isLegalTarget) return false;

    // Intercept pawn promotion to show beautiful storybook modal
    if (checkIsPromotion(sourceSquare, targetSquare)) {
      setPendingPromotion({
        from: sourceSquare,
        to: targetSquare,
        color: game.turn(),
      });
      return false;
    }

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move) {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
        botMoveTimeoutRef.current = null;
      }
      triggerMoveSound(move, game);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setSelectedCandidateUci(null);
      setHintActive(false);
      return true;
    }

    return false;
  }, [isGameOver, mode, game, playerColor, currentMoveIndex, moveHistory.length, checkIsPromotion, makeMove, triggerMoveSound]);

  // Tap-to-move for touchscreens & smartphones with promotion intercept
  const onSquareClick = useCallback((args: { square?: string } | string) => {
    const square = typeof args === 'string' ? args : args?.square;
    if (!square || isGameOver) return;

    if (mode === 'play' && game.turn() !== playerColor) return;
    if (mode === 'play' && currentMoveIndex < moveHistory.length - 1 && moveHistory.length > 0) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (possibleMoves.includes(square)) {
        if (checkIsPromotion(selectedSquare, square)) {
          setPendingPromotion({
            from: selectedSquare,
            to: square,
            color: game.turn(),
          });
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }

        const move = makeMove({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });
        if (move) {
          if (botMoveTimeoutRef.current) {
            clearTimeout(botMoveTimeoutRef.current);
            botMoveTimeoutRef.current = null;
          }
          triggerMoveSound(move, game);
        }
        setSelectedSquare(null);
        setPossibleMoves([]);
        setSelectedCandidateUci(null);
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
  }, [isGameOver, mode, game, playerColor, currentMoveIndex, moveHistory.length, selectedSquare, possibleMoves, checkIsPromotion, makeMove, triggerMoveSound]);

  // Confirm Pawn Promotion piece choice
  const handleSelectPromotionPiece = useCallback((chosenPiece: 'q' | 'n' | 'r' | 'b') => {
    if (!pendingPromotion) return;
    const move = makeMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: chosenPiece,
    });
    if (move) {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
        botMoveTimeoutRef.current = null;
      }
      triggerMoveSound(move, game);
      const names = { q: 'Queen', n: 'Knight', r: 'Rook', b: 'Bishop' };
      showToast(`Pawn ascended to ${names[chosenPiece]}! ✨`);
    }
    setPendingPromotion(null);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setSelectedCandidateUci(null);
    setHintActive(false);
  }, [pendingPromotion, makeMove, triggerMoveSound, game, showToast]);

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
        if (botMoveTimeoutRef.current) {
          clearTimeout(botMoveTimeoutRef.current);
          botMoveTimeoutRef.current = null;
        }
        setSelectedSquare(null);
        setPossibleMoves([]);
        setSelectedCandidateUci(null);
        setHintActive(false);
        newGame('analysis', 'w', settings.engineDepth);
        stockfish.newGame();
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
      case 'lumi':
        setShowLumiChat(true);
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
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = null;
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
    setSelectedCandidateUci(null);
    setHintActive(false);

    const chosenColor = config.color === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : config.color;
    setPlayElo(config.elo);
    newGame('play', chosenColor, Math.min(18, Math.max(3, Math.round(config.elo / 150))));
    stockfish.newGame();

    if (config.startFen) {
      loadFEN(config.startFen);
    }

    showToast('✨ Cozy Match Begun! May your pieces dance gracefully.');
    setSpeechBubble('👋 Best of luck! Remember to control the center.');
    setTimeout(() => setSpeechBubble(null), 5000);
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
      .map(m => m.classification as MoveClassification);
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
    setSelectedCandidateUci(null);
    setTimeout(() => {
      op.moves.forEach(san => {
        makeMove(san);
      });
      showToast(`Loaded ${op.eco}: ${op.name}`);
      setSpeechBubble(`📖 ${op.name}: A delightful storybook opening!`);
    }, 100);
  };

  // Execute clean board reset
  const executeResetBoard = useCallback(() => {
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = null;
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
    setSelectedCandidateUci(null);
    setHintActive(false);
    stockfish.newGame();
    newGame(mode, playerColor, settings.engineDepth);
    showToast('Board reset to starting position');
    setSpeechBubble("✨ Clean slate! What story will we write this time?");
  }, [mode, playerColor, settings.engineDepth, newGame, stockfish, showToast]);

  // Safe reset triggering confirmation if moves exist
  const handleResetBoard = useCallback(() => {
    if (moveHistory.length > 0) {
      setConfirmAction('reset');
    } else {
      executeResetBoard();
    }
  }, [moveHistory.length, executeResetBoard]);

  // Resignation flow with audio and confirmation
  const handleResign = useCallback(() => {
    setConfirmAction('resign');
  }, []);

  const handleConfirmResign = useCallback(() => {
    playResignSound();
    const opponent = playerColor === 'w' ? 'Black' : 'White';
    showToast(`You resigned. ${opponent} wins!`);
    setSpeechBubble("🍂 A noble resignation. Honor in bowing to a clever adversary.");
    stockfish.stop();
  }, [playerColor, showToast, stockfish]);

  // Draw offer / claim flow
  const handleOfferDraw = useCallback(() => {
    setConfirmAction('draw');
  }, []);

  const handleConfirmDraw = useCallback(() => {
    if (mode === 'analysis') {
      playDrawSound();
      showToast('Game drawn by mutual agreement (1/2 - 1/2).');
      return;
    }
    // In play mode against CPU, evaluate balance
    const evalScore = Math.abs(stockfish.evaluation);
    if (stockfish.isMate || evalScore > 150) {
      playWarningSound();
      showToast(`CPU declines your draw offer! Position is not balanced.`);
      setSpeechBubble("🌲 The forest spirit senses an advantage and wishes to play on!");
    } else {
      playDrawSound();
      showToast('CPU accepts draw offer! Balanced game (1/2 - 1/2).');
      setSpeechBubble("🍵 A peaceful draw by the warm hearth. Well played!");
      stockfish.stop();
    }
  }, [mode, stockfish.evaluation, stockfish.isMate, showToast, stockfish]);

  // Play opening continuation book move
  const handlePlayContinuationMove = useCallback((san: string) => {
    makeMove(san);
    showToast(`Book move: ${san}`);
  }, [makeMove, showToast]);

  // Fast / Normal / Deep engine depth switch
  const handleQuickDepthChange = useCallback((depth: number) => {
    setSettings((prev) => ({ ...prev, engineDepth: depth }));
    if (!enginePaused) {
      stockfish.analyze(game.fen(), depth);
    }
    const label = depth <= 10 ? 'Fast' : depth <= 16 ? 'Normal' : 'Deep';
    showToast(`Engine calculation depth set to ${depth} (${label})`);
  }, [enginePaused, stockfish, game, showToast]);

  // Trigger hint
  const handleToggleHint = () => {
    setHintActive(!hintActive);
    if (!hintActive && stockfish.bestMove) {
      showToast(`Hint: Engine recommends ${stockfish.bestMove}`);
      setSpeechBubble(`💡 Lumi whispered: "${stockfish.bestMove}" looks promising!`);
    }
  };

  // Build Board Square Styles
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // Last move highlight with watercolor warmth
  if (currentMoveIndex >= 0 && moveHistory[currentMoveIndex]) {
    const lastMove = moveHistory[currentMoveIndex].move;
    customSquareStyles[lastMove.from] = {
      backgroundColor: boardTheme.lastMoveLight,
      opacity: 0.72,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: boardTheme.lastMoveDark,
      opacity: 0.72,
    };
  }

  // Selected square highlight
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(234, 179, 8, 0.45)',
      boxShadow: 'inset 0 0 0 3px #eab308, 0 0 12px rgba(234, 179, 8, 0.4)',
    };
  }

  // Move dots & capture rings in cozy pastel tones
  possibleMoves.forEach(sq => {
    const isTargetOccupied = !!game.get(sq as Square);
    customSquareStyles[sq] = {
      ...customSquareStyles[sq],
      background: isTargetOccupied
        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.55) 18%, transparent 64%)'
        : 'radial-gradient(circle, rgba(56, 189, 248, 0.7) 24%, transparent 30%)',
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
          boxShadow: 'inset 0 0 0 2px rgba(249, 115, 22, 0.6)',
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
        boxShadow: `${customSquareStyles[sq]?.boxShadow || ''} inset 0 0 8px rgba(34, 197, 94, 0.5)`.trim(),
      };
    });
    isolated.forEach(sq => {
      customSquareStyles[sq] = {
        ...customSquareStyles[sq],
        boxShadow: `${customSquareStyles[sq]?.boxShadow || ''} inset 0 0 8px rgba(250, 204, 21, 0.5)`.trim(),
      };
    });
  }

  // Multi-color Tactical Arrows & Number Badges in Lumi Master pastel tones
  const isHumanTurn = mode !== 'play' || game.turn() === playerColor;
  const isPositionCurrent = stockfish.analyzedFen === game.fen();
  const customArrows: Array<{ startSquare: string; endSquare: string; color: string }> = [];
  const arrowBadges: ArrowBadge[] = [];

  if (settings.drawArrows && settings.showAnalysisArrows && !enginePaused && !selectedSquare && isPositionCurrent && isHumanTurn) {
    if (selectedCandidateUci) {
      const parsed = parseBestMove(selectedCandidateUci);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_PALETTE[0] });
        if (settings.showArrowNumbers) {
          arrowBadges.push({ id: `badge-sel`, square: parsed.to, number: 1, color: ARROW_PALETTE[0] });
        }
      }
    } else if (hintActive && stockfish.bestMove) {
      const parsed = parseBestMove(stockfish.bestMove);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_PALETTE[0] });
        arrowBadges.push({ id: `badge-hint`, square: parsed.to, number: 1, color: ARROW_PALETTE[0] });
      }
    } else if (stockfish.multiPvLines.length > 0) {
      const count = Math.min(engineLineCount, stockfish.multiPvLines.length);
      stockfish.multiPvLines.slice(0, count).forEach((line, idx) => {
        const parsed = parseBestMove(line.moveUci);
        if (parsed) {
          const color = settings.showArrowStrengthColor ? (ARROW_PALETTE[idx] || ARROW_PALETTE[ARROW_PALETTE.length - 1]) : ARROW_PALETTE[0];
          customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color });
          if (settings.showArrowNumbers) {
            arrowBadges.push({ id: `badge-${line.multipv}`, square: parsed.to, number: line.multipv, color });
          }
        }
      });
    } else if (stockfish.bestMove) {
      const parsed = parseBestMove(stockfish.bestMove);
      if (parsed) {
        customArrows.push({ startSquare: parsed.from, endSquare: parsed.to, color: ARROW_PALETTE[0] });
        if (settings.showArrowNumbers) {
          arrowBadges.push({ id: `badge-1`, square: parsed.to, number: 1, color: ARROW_PALETTE[0] });
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

  // Memoized UCI to SAN converter
  const uciToSan = useCallback((uci: string, boardFen: string): string => {
    if (!uci || uci.length < 4) return uci;
    const key = `${boardFen}_${uci}`;
    if (sanGlobalCache.has(key)) {
      return sanGlobalCache.get(key)!;
    }
    try {
      const tempGame = new Chess(boardFen);
      const res = tempGame.move({ from: uci.substring(0, 2), to: uci.substring(2, 4), promotion: uci[4] || 'q' });
      if (res) {
        const result = settings.figurineNotation ? toFigurineNotation(res.san) : res.san;
        if (sanGlobalCache.size > 2000) sanGlobalCache.clear();
        sanGlobalCache.set(key, result);
        return result;
      }
    } catch {
      // fallback
    }
    return uci;
  }, [settings.figurineNotation]);

  const getLinePreview = useCallback((pv: string[], fen: string) => {
    if (!pv || pv.length <= 1) return '';
    const key = `${fen}_${pv.slice(0, 5).join('_')}`;
    if (pvGlobalCache.has(key)) {
      return pvGlobalCache.get(key)!;
    }
    try {
      const temp = new Chess(fen);
      const moves: string[] = [];
      for (let i = 0; i < Math.min(pv.length, 6); i++) {
        const res = temp.move({ from: pv[i].substring(0, 2), to: pv[i].substring(2, 4), promotion: pv[i][4] || 'q' });
        if (!res) break;
        if (i > 0) moves.push(settings.figurineNotation ? toFigurineNotation(res.san) : res.san);
      }
      const out = moves.join(' ');
      if (pvGlobalCache.size > 2000) pvGlobalCache.clear();
      pvGlobalCache.set(key, out);
      return out;
    } catch {
      return pv.slice(1, 5).join(' ');
    }
  }, [settings.figurineNotation]);

  const isMate = stockfish.isMate;
  const mateIn = stockfish.mateIn;
  const evalFormatted = isMate
    ? (mateIn > 0 ? `M${Math.abs(mateIn)}` : `-M${Math.abs(mateIn)}`)
    : ((stockfish.evaluation >= 0 ? '+' : '') + (stockfish.evaluation / 100).toFixed(2));

  // Compute eval percentage with board orientation perspective
  let evalPercent: number;
  if (isMate) {
    evalPercent = mateIn > 0 ? 100 : 0;
  } else {
    evalPercent = Math.min(96, Math.max(4, 50 + (stockfish.evaluation / 100) * 8.5));
  }

  if (boardOrientation === 'black') {
    evalPercent = 100 - evalPercent;
  }

  let evalTrackClass = "eval-progress-track";
  if (isMate) {
    evalTrackClass += mateIn > 0 ? " eval-mate-white" : " eval-mate-black";
  } else if (stockfish.evaluation > 200) {
    evalTrackClass += " eval-advantage-white";
  } else if (stockfish.evaluation < -200) {
    evalTrackClass += " eval-advantage-black";
  }

  const evalScoreClass = isMate
    ? (mateIn > 0 ? 'eval-score-bold score-mate-white' : 'eval-score-bold score-mate-black')
    : 'eval-score-bold';

  // Handle drawer button click
  const handleMenuButtonClick = () => {
    if (window.innerWidth < 900) {
      setIsDrawerOpen(true);
    } else {
      setDesktopSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className="chess-app lumi-theme-active">
      {/* ──────────────────────────────────────────────────────────────────
          TOP APP BAR WITH LUMI COMPANION PILL & STORYBOOK ACCENTS
          ────────────────────────────────────────────────────────────────── */}
      <header className="chess-top-bar">
        <div className="chess-top-left">
          <button
            className="chess-drawer-btn"
            onClick={handleMenuButtonClick}
            aria-label="Toggle Navigation Drawer"
            title="Menu"
          >
            <Menu size={22} />
          </button>
          <Link href="/chess" className="chess-brand-link" title="ChakraChess">
            <span className="lumi-brand-icon">✨</span>
            <span className="lumi-brand-name">ChakraChess</span>
          </Link>
          <Link href="/" className="chess-mantra-nav-btn" title="Go to ChakraMantra">
            <ExternalLink size={13} />
            <span>ChakraMantra</span>
          </Link>
        </div>

        {/* Center Opening Banner & Move Chips */}
        <div className="chess-top-center">
          <button
            className="opening-banner-pill"
            onClick={() => setShowOpenings(true)}
            title="Explore Opening Books"
          >
            <span className="lumi-book-leaf">🍃</span>
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
            className={`chess-header-icon-btn ${enginePaused ? 'paused-indicator' : ''}`}
            onClick={toggleEnginePause}
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
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP / WIDESCREEN & MOBILE VIEW CONTAINER
          ────────────────────────────────────────────────────────────────── */}
      <div className="chess-app-desktop-container">
        {/* Left Desktop Persistent Sidebar */}
        <aside className={`desktop-persistent-sidebar ${desktopSidebarOpen ? '' : 'collapsed'}`}>
          <div className="drawer-header">
            <div className="drawer-profile">
              <div className="drawer-avatar-ring">
                <Image
                  src="/lumi-companion.jpg"
                  alt="Lumi Companion"
                  width={42}
                  height={42}
                  className="lumi-avatar-img"
                />
              </div>
              <div className="drawer-title-group">
                <h2 className="drawer-title">ChakraChess</h2>
              </div>
            </div>
          </div>
          <nav className="desktop-sidebar-nav">
            {[
              { id: 'analysis' as const, label: 'Analysis Board', icon: <Search size={18} /> },
              { id: 'lumi' as const, label: 'Talk to Lumi ✨', icon: <MessageCircle size={18} /> },
              { id: 'play' as const, label: 'Play Chess', icon: <Swords size={18} /> },
              { id: 'report' as const, label: 'Analyze Game', icon: <BarChart3 size={18} /> },
              { id: 'editor' as const, label: 'Board Editor', icon: <Edit3 size={18} /> },
              { id: 'archive' as const, label: 'Games Archive', icon: <FolderArchive size={18} /> },
              { id: 'openings' as const, label: 'Openings Book', icon: <Target size={18} /> },
              { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon size={18} /> },
              { id: 'about' as const, label: 'About Lumi', icon: <Info size={18} /> },
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
            <div style={{ height: 1, margin: '8px 12px', background: 'rgba(180, 140, 110, 0.2)' }} />
            <a
              href="/"
              className="drawer-item drawer-mantra-item"
              title="Go to ChakraMantra Home"
            >
              <span className="drawer-item-icon"><ExternalLink size={18} /></span>
              <span className="drawer-item-label">ChakraMantra</span>
            </a>
          </nav>
        </aside>

        {/* Center Chessboard Stage (Mobile & Desktop) */}
        <main className="chess-main-viewport desktop-center-stage">
          <div className="board-stage-container">
            {/* Lumi AI Companion Header Bar */}
            <div className="lumi-companion-strip">
              <div
                className="lumi-companion-avatar-wrap"
                onClick={() => setShowLumiChat(true)}
                title="Click to chat with Lumi!"
              >
                <Image
                  src="/lumi-companion.jpg"
                  alt="Lumi Scholar"
                  width={34}
                  height={34}
                  className="lumi-small-avatar"
                />
                <span className="lumi-halo-sparkle">✦</span>
              </div>
              <div
                className="lumi-speech-bubble"
                onClick={() => setShowLumiChat(true)}
                title="Click to chat with Lumi!"
              >
                <span>{speechBubble || (currentOpening ? `Lumi: ${currentOpening.name}` : "Lumi: Make your move, friend!")}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLumiChat(true);
                }}
                className="lumi-chat-trigger-btn"
                title="Chat with Lumi AI Companion"
              >
                <MessageCircle size={13} />
                <span>Talk to Lumi</span>
              </button>
            </div>

            {/* Play Mode Opponent Profile Bar */}
            {mode === 'play' && (
              <div className="play-mode-opponent-bar">
                <div className="opponent-profile-tag">
                  <div className="opponent-cpu-icon">
                    <Bot size={16} />
                  </div>
                  <span className="opponent-elo-pill">CPU {playElo}</span>
                </div>
              </div>
            )}

            {/* Chess Board Area with Hand-Drawn Storybook Deckle Frame */}
            <div className="chess-board-wrapper lumi-board-deckle">
              <Chessboard
                options={{
                  id: "chakrachess-board",
                  position: game.fen(),
                  onPieceDrop,
                  onSquareClick,
                  boardOrientation: boardOrientation,
                  boardStyle: {
                    borderRadius: '12px',
                  },
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                  squareStyles: customSquareStyles,
                  arrows: customArrows,
                  animationDurationInMs: settings.pieceAnimationSpeed === 'fast' ? 120 : settings.pieceAnimationSpeed === 'slow' ? 320 : 200,
                }}
              />

              {/* Numbered Arrow Badges Overlay in Storybook Pills */}
              <ArrowNumberBadges badges={arrowBadges} boardOrientation={boardOrientation} />
            </div>

            {/* Active player indicator in Play Mode */}
            {mode === 'play' && (
              <div className="play-mode-opponent-bar" style={{ marginTop: 4 }}>
                <div className="active-player-tag">
                  <span className="active-dot" />
                  <span>You ({playerColor === 'w' ? 'White' : 'Black'})</span>
                </div>
              </div>
            )}

            {/* Integrated Horizontal Eval Bar in Watercolor Pastel */}
            <div className="integrated-horizontal-eval-bar">
              <div className={evalTrackClass} style={{ width: `${evalPercent}%` }} />
              <div className="eval-bar-content">
                <div className="eval-text-pill">
                  {enginePaused ? (
                    <span style={{ color: '#f59e0b' }}>⏸ Engine Paused</span>
                  ) : (
                    <>
                      <span>{currentOpening ? currentOpening.name : 'Stockfish 16'}</span>
                      <span className={evalScoreClass}>({evalFormatted})</span>
                    </>
                  )}
                </div>

                <div className="eval-bar-controls">
                  {/* Quick Engine Depth Selector */}
                  <div className="quick-depth-selector" title="Quick Engine Calculation Depth">
                    <button
                      type="button"
                      className={`depth-pill-btn ${settings.engineDepth <= 10 ? 'active' : ''}`}
                      onClick={() => handleQuickDepthChange(10)}
                      title="Fast (Depth 10)"
                    >
                      Fast
                    </button>
                    <button
                      type="button"
                      className={`depth-pill-btn ${settings.engineDepth > 10 && settings.engineDepth <= 16 ? 'active' : ''}`}
                      onClick={() => handleQuickDepthChange(16)}
                      title="Normal (Depth 16)"
                    >
                      Norm
                    </button>
                    <button
                      type="button"
                      className={`depth-pill-btn ${settings.engineDepth > 16 ? 'active' : ''}`}
                      onClick={() => handleQuickDepthChange(22)}
                      title="Deep (Depth 22)"
                    >
                      Deep
                    </button>
                  </div>

                  <button
                    className="eval-control-btn"
                    onClick={() => handleSetLineCount(engineLineCount - 1)}
                    title="Fewer Lines"
                  >
                    <Minus size={13} />
                  </button>
                  <button
                    className="eval-control-btn"
                    onClick={() => handleSetLineCount(engineLineCount + 1)}
                    title="More Lines"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    className="eval-control-btn"
                    onClick={toggleEnginePause}
                    title={enginePaused ? 'Resume Engine' : 'Pause Engine'}
                  >
                    {enginePaused ? <Play size={13} /> : <Pause size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Multi-PV Engine Lines (Mobile view) */}
            <div className="engine-variations-container">
              <div className="variations-header-pill">
                <span>Engines lines (Variations): {engineLineCount}</span>
                <div className="variations-counter-group">
                  <button className="var-count-btn" onClick={() => handleSetLineCount(engineLineCount - 1)}>-</button>
                  <button className="var-count-btn" onClick={() => handleSetLineCount(engineLineCount + 1)}>+</button>
                </div>
              </div>

              {stockfish.multiPvLines.slice(0, engineLineCount).map((line, idx) => {
                const moveSan = uciToSan(line.moveUci, game.fen());
                const preview = getLinePreview(line.pvLine, game.fen());
                const isSelected = selectedCandidateUci === line.moveUci;
                const scoreVal = line.scoreFromWhite !== undefined ? line.scoreFromWhite : line.score;
                const isMateLine = line.isMate;
                const mateScore = isMateLine ? (game.turn() === 'w' ? line.mateIn : -line.mateIn) : 0;
                const scoreText = isMateLine
                  ? (mateScore > 0 ? `M${mateScore}` : `-M${Math.abs(mateScore)}`)
                  : ((scoreVal >= 0 ? '+' : '') + (scoreVal / 100).toFixed(2));
                const isPositive = isMateLine ? mateScore > 0 : scoreVal > 0;
                const isNegative = isMateLine ? mateScore < 0 : scoreVal < 0;
                return (
                  <div
                    key={idx}
                    className={`variation-line-card ${isSelected ? 'active-line' : ''}`}
                    onClick={() => setSelectedCandidateUci(isSelected ? null : line.moveUci)}
                  >
                    <span className={`line-eval-badge ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                      {scoreText} (depth: {line.depth})
                    </span>
                    <span className="line-moves-sequence">
                      <strong>#{line.multipv} {moveSan}</strong> {preview}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Dock Toolbar in Warm Illustrated River-Stone Style */}
            <div className="chess-bottom-dock">
              <button className="dock-btn" onClick={handleResetBoard} title="Reset Board">
                <RotateCcw size={20} />
              </button>
              <button className="dock-btn" onClick={flipBoard} title="Flip Board">
                <Repeat size={20} />
              </button>
              {mode === 'play' && (
                <>
                  <button className="dock-btn dock-btn-resign" onClick={handleResign} title="Resign Game">
                    <Flag size={18} />
                  </button>
                  <button className="dock-btn dock-btn-draw" onClick={handleOfferDraw} title="Offer / Claim Draw">
                    <Handshake size={18} />
                  </button>
                </>
              )}
              <button
                className={`dock-btn ${hintActive ? 'active-hint' : ''}`}
                onClick={handleToggleHint}
                title="Ask Lumi for a Move Hint"
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

        {/* Right Desktop Widescreen Hub */}
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
              📜 Story Moves ({moveHistory.length})
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
                  <span>Engines lines (Variations): {engineLineCount}</span>
                  <div className="variations-counter-group">
                    <button className="var-count-btn" onClick={() => handleSetLineCount(engineLineCount - 1)}>-</button>
                    <button className="var-count-btn" onClick={() => handleSetLineCount(engineLineCount + 1)}>+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px', fontSize: 11, color: 'var(--lumi-ink-soft, #94a3b8)' }}>
                  <span>{enginePaused ? '⏸ Paused' : `Depth: ${stockfish.depth}`}</span>
                  <span>{stockfish.nps ? `${Math.round(stockfish.nps / 1000)}k nps` : ''}</span>
                </div>

                {stockfish.multiPvLines.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--lumi-ink-soft, #94a3b8)', fontSize: 13 }}>
                    {enginePaused ? 'Engine is paused. Tap Play to resume.' : 'Lumi is listening to the pieces whisper...'}
                  </div>
                ) : (
                  stockfish.multiPvLines.slice(0, engineLineCount).map((line, idx) => {
                    const moveSan = uciToSan(line.moveUci, game.fen());
                    const preview = getLinePreview(line.pvLine, game.fen());
                    const isSelected = selectedCandidateUci === line.moveUci;
                    const scoreVal = line.scoreFromWhite !== undefined ? line.scoreFromWhite : line.score;
                    const isMateLine = line.isMate;
                    const mateScore = isMateLine ? (game.turn() === 'w' ? line.mateIn : -line.mateIn) : 0;
                    const scoreText = isMateLine
                      ? (mateScore > 0 ? `M${mateScore}` : `-M${Math.abs(mateScore)}`)
                      : ((scoreVal >= 0 ? '+' : '') + (scoreVal / 100).toFixed(2));
                    const isPositive = isMateLine ? mateScore > 0 : scoreVal > 0;
                    const isNegative = isMateLine ? mateScore < 0 : scoreVal < 0;
                    return (
                      <div
                        key={idx}
                        className={`variation-line-card ${isSelected ? 'active-line' : ''}`}
                        onClick={() => setSelectedCandidateUci(isSelected ? null : line.moveUci)}
                        style={{ marginBottom: 8 }}
                      >
                        <span className={`line-eval-badge ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                          {scoreText}
                        </span>
                        <span className="line-moves-sequence">
                          <strong>#{line.multipv} {moveSan}</strong> {preview}
                        </span>
                      </div>
                    );
                  })
                )}
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
                <OpeningExplorerPanel
                  moves={moveHistory.map((m) => m.move.san)}
                  figurineNotation={settings.figurineNotation}
                  onPlayMove={handlePlayContinuationMove}
                  onOpenFullLibrary={() => setShowOpenings(true)}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          ALL INTERACTIVE MODALS & DRAWERS
          ────────────────────────────────────────────────────────────────── */}
      <PawnPromotionModal
        isOpen={pendingPromotion !== null}
        pendingMove={pendingPromotion}
        onSelectPiece={handleSelectPromotionPiece}
        onCancel={() => setPendingPromotion(null)}
      />

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
        currentMoves={moveHistory.map((m) => m.move.san)}
        onPlayMove={(san) => {
          handlePlayContinuationMove(san);
          setShowOpenings(false);
        }}
      />

      <BoardOptionsSheet
        isOpen={showBoardOptions}
        onClose={() => setShowBoardOptions(false)}
        onResetBoard={handleResetBoard}
        onResign={mode === 'play' ? handleResign : undefined}
        onOfferDraw={mode === 'play' ? handleOfferDraw : undefined}
        onSharePgn={() => {
          if (navigator.clipboard) navigator.clipboard.writeText(getPGN());
          showToast('PGN copied to clipboard! 📋');
        }}
        onShareFen={() => {
          if (navigator.clipboard) navigator.clipboard.writeText(game.fen());
          showToast('FEN copied to clipboard! 📋');
        }}
        onSavePgn={() => {
          const blob = new Blob([getPGN()], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chakrachess_${Date.now()}.pgn`;
          a.click();
          showToast('PGN downloaded! 💾');
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
        pgn={getPGN()}
      />

      <ConfirmActionModal
        isOpen={confirmAction !== null}
        action={confirmAction}
        moveCount={moveHistory.length}
        onConfirm={() => {
          if (confirmAction === 'reset') {
            executeResetBoard();
          } else if (confirmAction === 'resign') {
            handleConfirmResign();
          } else if (confirmAction === 'draw') {
            handleConfirmDraw();
          }
        }}
        onClose={() => setConfirmAction(null)}
      />

      <LumiChatModal
        isOpen={showLumiChat}
        onClose={() => setShowLumiChat(false)}
        fen={game.fen()}
        lastMove={moveHistory[moveHistory.length - 1]?.move.san}
        bestMove={stockfish.bestMoveSan || stockfish.bestMove || (customArrows[0] ? `${customArrows[0].startSquare}-${customArrows[0].endSquare}` : undefined)}
        evalCentipawns={stockfish.evaluation}
        opening={currentOpening?.name}
        turn={game.turn()}
        isCheck={game.inCheck()}
        isGameOver={game.isGameOver()}
        onLumiSpeechUpdate={(text) => setSpeechBubble(`✨ ${text.slice(0, 100)}...`)}
      />
    </div>
  );
}
