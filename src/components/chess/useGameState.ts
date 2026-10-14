"use client";

import { useState, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';

export type GameMode = 'analysis' | 'play';
export type PlayerColor = 'w' | 'b';

export interface MoveEntry {
  move: Move;
  fen: string;           // FEN after this move
  evaluation?: number;   // centipawns after this move (from White's perspective)
  classification?: string;
  cpLoss?: number;
}

export interface GameState {
  game: Chess;
  mode: GameMode;
  playerColor: PlayerColor;
  currentMoveIndex: number;   // -1 = starting position
  moveHistory: MoveEntry[];
  isGameOver: boolean;
  gameResult: string;
  boardOrientation: 'white' | 'black';
  engineDepth: number;
  showThreats: boolean;
  showKeyElements: boolean;
  showBestMoveArrow: boolean;
  showEvalBar: boolean;
  showMoveStrength: boolean;
  pauseOnBlunder: boolean;
  soundEnabled: boolean;
  figurineNotation: boolean;
  autoFlip: boolean;
}

const DEFAULT_STATE: Omit<GameState, 'game'> = {
  mode: 'analysis',
  playerColor: 'w',
  currentMoveIndex: -1,
  moveHistory: [],
  isGameOver: false,
  gameResult: '',
  boardOrientation: 'white',
  engineDepth: 15,
  showThreats: false,
  showKeyElements: false,
  showBestMoveArrow: true,
  showEvalBar: true,
  showMoveStrength: true,
  pauseOnBlunder: true,
  soundEnabled: true,
  figurineNotation: true,
  autoFlip: false,
};

// Helper: clone chess instance with full history intact for accurate repetition detection
function cloneGameWithHistory(source: Chess): Chess {
  const clone = new Chess();
  try {
    const pgn = source.pgn();
    if (pgn && pgn.trim().length > 0) {
      clone.loadPgn(pgn);
      return clone;
    }
  } catch {
    // fallback to fen if pgn parse fails
  }
  return new Chess(source.fen());
}

// Helper: build fresh Chess instance up to a specific move index in history
function buildGameToMoveIndex(history: MoveEntry[], targetIndex: number, startingFen?: string): Chess {
  const chess = startingFen ? new Chess(startingFen) : new Chess();
  for (let i = 0; i <= targetIndex && i < history.length; i++) {
    try {
      chess.move(history[i].move.san);
    } catch {
      break;
    }
  }
  return chess;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const chess = new Chess();
    return {
      game: chess,
      ...DEFAULT_STATE,
    };
  });

  // Keep a mutable ref for rapid updates
  const gameRef = useRef<Chess>(state.game);
  const startingFenRef = useRef<string | null>(null);

  // Make a move
  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }): Move | null => {
    // If the game is already over, don't allow further moves
    if (gameRef.current.isGameOver()) {
      return null;
    }

    try {
      // Clone game with full history intact to preserve threefold repetition tracking!
      const gameCopy = cloneGameWithHistory(gameRef.current);
      const result = gameCopy.move(move);
      if (result) {
        gameRef.current = gameCopy;
        setState(prev => {
          // If we're not at the end of history, truncate to current index
          const truncatedHistory = prev.moveHistory.slice(0, prev.currentMoveIndex + 1);
          const newEntry: MoveEntry = {
            move: result,
            fen: gameCopy.fen(),
          };

          const isGameOver = gameCopy.isGameOver();
          let gameResult = '';
          if (isGameOver) {
            if (gameCopy.isCheckmate()) {
              gameResult = gameCopy.turn() === 'w' ? '0-1 (Black wins by checkmate)' : '1-0 (White wins by checkmate)';
            } else if (gameCopy.isDraw()) {
              if (gameCopy.isThreefoldRepetition()) {
                gameResult = '½-½ (Draw by threefold repetition)';
              } else if (gameCopy.isStalemate()) {
                gameResult = '½-½ (Draw by stalemate)';
              } else if (gameCopy.isInsufficientMaterial()) {
                gameResult = '½-½ (Draw by insufficient material)';
              } else {
                gameResult = '½-½ (Draw by 50-move rule)';
              }
            }
          }

          return {
            ...prev,
            game: gameCopy,
            moveHistory: [...truncatedHistory, newEntry],
            currentMoveIndex: truncatedHistory.length,
            isGameOver,
            gameResult,
          };
        });
        return result;
      }
    } catch {
      // Invalid move
    }
    return null;
  }, []);

  // Navigate to a specific position in history
  const goToMove = useCallback((index: number) => {
    setState(prev => {
      if (index < -1 || index >= prev.moveHistory.length) return prev;

      // Reconstruct accurate game state up to index with full history
      const newGame = buildGameToMoveIndex(prev.moveHistory, index, startingFenRef.current || undefined);
      gameRef.current = newGame;

      return {
        ...prev,
        game: newGame,
        currentMoveIndex: index,
      };
    });
  }, []);

  // Navigation helpers
  const goToStart = useCallback(() => goToMove(-1), [goToMove]);

  const goToEnd = useCallback(() => {
    setState(prev => {
      const lastIndex = prev.moveHistory.length - 1;
      if (lastIndex < 0) return prev;
      const newGame = buildGameToMoveIndex(prev.moveHistory, lastIndex, startingFenRef.current || undefined);
      gameRef.current = newGame;
      return { ...prev, game: newGame, currentMoveIndex: lastIndex };
    });
  }, []);

  const goForward = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentMoveIndex + 1;
      if (nextIndex >= prev.moveHistory.length) return prev;
      const newGame = buildGameToMoveIndex(prev.moveHistory, nextIndex, startingFenRef.current || undefined);
      gameRef.current = newGame;
      return { ...prev, game: newGame, currentMoveIndex: nextIndex };
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.currentMoveIndex - 1;
      if (prevIndex < -1) return prev;
      const newGame = buildGameToMoveIndex(prev.moveHistory, prevIndex, startingFenRef.current || undefined);
      gameRef.current = newGame;
      return { ...prev, game: newGame, currentMoveIndex: prevIndex };
    });
  }, []);

  // New game
  const newGame = useCallback((mode: GameMode = 'analysis', playerColor: PlayerColor = 'w', depth: number = 15) => {
    const chess = new Chess();
    gameRef.current = chess;
    startingFenRef.current = null;
    setState({
      ...DEFAULT_STATE,
      game: chess,
      mode,
      playerColor,
      engineDepth: depth,
      boardOrientation: playerColor === 'w' ? 'white' : 'black',
    });
  }, []);

  // Load PGN
  const loadPGN = useCallback((pgn: string): boolean => {
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(pgn);

      // Replay all moves to build complete history
      const moves = tempGame.history({ verbose: true });
      const newGame = new Chess();
      const history: MoveEntry[] = [];

      for (const move of moves) {
        newGame.move(move.san);
        history.push({
          move,
          fen: newGame.fen(),
        });
      }

      gameRef.current = newGame;
      startingFenRef.current = null;
      setState(prev => ({
        ...prev,
        game: newGame,
        moveHistory: history,
        currentMoveIndex: history.length - 1,
        mode: 'analysis',
        isGameOver: newGame.isGameOver(),
        gameResult: newGame.isGameOver()
          ? (newGame.isCheckmate()
              ? (newGame.turn() === 'w' ? '0-1' : '1-0')
              : '½-½')
          : '',
      }));

      return true;
    } catch {
      return false;
    }
  }, []);

  // Load FEN
  const loadFEN = useCallback((fen: string): boolean => {
    try {
      const chess = new Chess(fen);
      gameRef.current = chess;
      startingFenRef.current = fen;
      setState(prev => ({
        ...prev,
        game: chess,
        moveHistory: [],
        currentMoveIndex: -1,
        mode: 'analysis',
        isGameOver: chess.isGameOver(),
        gameResult: chess.isGameOver()
          ? (chess.isCheckmate()
              ? (chess.turn() === 'w' ? '0-1' : '1-0')
              : '½-½')
          : '',
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Get PGN
  const getPGN = useCallback((): string => {
    return gameRef.current.pgn();
  }, []);

  // Flip board
  const flipBoard = useCallback(() => {
    setState(prev => ({
      ...prev,
      boardOrientation: prev.boardOrientation === 'white' ? 'black' : 'white',
    }));
  }, []);

  // Update a setting
  const updateSetting = useCallback(<K extends keyof GameState>(key: K, value: GameState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update move evaluation data
  const updateMoveEval = useCallback((moveIndex: number, evaluation: number, classification?: string, cpLoss?: number) => {
    setState(prev => {
      const updated = [...prev.moveHistory];
      if (moveIndex >= 0 && moveIndex < updated.length) {
        updated[moveIndex] = {
          ...updated[moveIndex],
          evaluation,
          classification,
          cpLoss,
        };
      }
      return { ...prev, moveHistory: updated };
    });
  }, []);

  return {
    ...state,
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
  };
}
