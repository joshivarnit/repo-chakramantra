"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import EvalBar from './EvalBar';
import MoveHistory from './MoveHistory';
import TopMovesPanel from './TopMovesPanel';
import GameControls from './GameControls';
import SettingsPanel from './SettingsPanel';
import NewGameDialog from './NewGameDialog';
import GameReport from './GameReport';

import './chess-app.css';

export default function ChessApp() {
  const [leftTab, setLeftTab] = useState<'moves' | 'topMoves'>('moves');
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

  // Handle engine's best move (for play mode)
  const handleEngineBestMove = useCallback((bestMoveUci: string) => {
    if (mode !== 'play') return;
    if (game.turn() === playerColor) return; // Not engine's turn

    const parsed = parseBestMove(bestMoveUci);
    if (parsed) {
      // Small delay for UX
      setTimeout(() => {
        makeMove(parsed);
      }, 300);
    }
  }, [mode, game, playerColor, makeMove]);

  const stockfish = useStockfish({
    onBestMove: handleEngineBestMove,
  });

  // Send position to engine whenever game state changes
  useEffect(() => {
    const fen = game.fen();
    const isAtEnd = currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0;

    if (mode === 'play' && isAtEnd && !isGameOver) {
      if (game.turn() !== playerColor) {
        // Engine's turn to play
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
        // Classify the last move
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

        // Blunder alert
        if (classification === 'blunder' && pauseOnBlunder && mode === 'play') {
          setBlunderAlert(`Blunder! ${entry.move.san} loses ${(cpLoss / 100).toFixed(1)} pawns`);
          setTimeout(() => setBlunderAlert(null), 3000);
        }
      }
      prevEvalRef.current = evalFromWhite;
    }
  }, [stockfish.depth, stockfish.evaluation, currentMoveIndex]);

  // Handle piece drop
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }): boolean => {
    if (!targetSquare) return false;

    // In play mode, only allow moves on player's turn
    if (mode === 'play' && game.turn() !== playerColor) {
      return false;
    }

    // Don't allow moves when reviewing history (except analysis)
    if (mode === 'play' && currentMoveIndex < moveHistory.length - 1 && moveHistory.length > 0) {
      return false;
    }

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece?.pieceType?.[1]?.toLowerCase() === 'p' ? 'q' : (piece?.pieceType?.[1]?.toLowerCase() || 'q'),
    });

    return !!move;
  }, [mode, game, playerColor, currentMoveIndex, moveHistory.length, makeMove]);

  // Handle new game
  const handleNewGame = useCallback((gameMode: 'analysis' | 'play', color: 'w' | 'b', depth: number) => {
    newGame(gameMode, color, depth);
    stockfish.newGame();
    prevEvalRef.current = 0;
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
      opacity: 0.6,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: boardTheme.lastMoveDark,
      opacity: 0.6,
    };
  }

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
      // Draw top 3 lines with distinct colors when analyzing
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

  // Engine eval from White's perspective
  const evalFromWhite = game.turn() === 'w'
    ? stockfish.evaluation
    : -stockfish.evaluation;

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
      {/* Blunder alert */}
      {blunderAlert && (
        <div className="blunder-alert">
          <span className="blunder-icon">⚠</span>
          {blunderAlert}
        </div>
      )}

      <div className="chess-app-layout">
        {/* Left panel: Move History or Top 15 Best Moves */}
        <div className="chess-left-panel">
          <div className="left-panel-tabs">
            <button
              className={`left-tab-btn ${leftTab === 'moves' ? 'left-tab-active' : ''}`}
              onClick={() => setLeftTab('moves')}
            >
              Moves ({moveHistory.length})
            </button>
            <button
              className={`left-tab-btn ${leftTab === 'topMoves' ? 'left-tab-active' : ''}`}
              onClick={() => setLeftTab('topMoves')}
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
        <div className="chess-center">
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

            {/* Board */}
            <div className="chess-board-wrapper">
              <Chessboard
                options={{
                  id: "chess-app-board",
                  position: game.fen(),
                  onPieceDrop,
                  boardOrientation: boardOrientation,
                  boardStyle: {
                    borderRadius: '4px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
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

          {/* Engine info bar */}
          <div className="chess-engine-bar">
            <div className="engine-bar-left">
              <span className="engine-label">Stockfish</span>
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
        </div>

        {/* Right panel: Controls */}
        <div className="chess-right-panel">
          <div className="chess-mode-badge">
            {mode === 'play' ? '♟ Playing' : '🔍 Analysis'}
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
                📊 Report
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
