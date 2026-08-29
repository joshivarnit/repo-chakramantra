import { Chess, Move, Square } from 'chess.js';
import { MoveClassification, MOVE_CLASSIFICATIONS } from './themes';

/**
 * Classify a move based on centipawn loss.
 * evalBefore/evalAfter are from the perspective of the player who moved.
 */
export function classifyMove(
  evalBefore: number,
  evalAfter: number,
  isCapture: boolean,
  _moveStr: string
): MoveClassification {
  // Centipawn loss: higher = worse move
  const cpl = evalBefore - evalAfter;

  if (cpl < MOVE_CLASSIFICATIONS.brilliant.maxCPL) return 'brilliant';
  if (cpl <= MOVE_CLASSIFICATIONS.great.maxCPL) return 'great';
  if (cpl <= MOVE_CLASSIFICATIONS.good.maxCPL) return 'good';
  if (cpl <= MOVE_CLASSIFICATIONS.inaccuracy.maxCPL) return 'inaccuracy';
  if (cpl <= MOVE_CLASSIFICATIONS.mistake.maxCPL) return 'mistake';
  return 'blunder';
}

/**
 * Get classification info for display
 */
export function getClassificationInfo(classification: MoveClassification) {
  return MOVE_CLASSIFICATIONS[classification];
}

/**
 * Detect threatened (attacked but not defended, or attacked by lower-value piece) squares.
 * Returns attacked squares for the given color.
 */
export function getThreatenedSquares(game: Chess, color: 'w' | 'b'): Square[] {
  const threatened: Square[] = [];
  const board = game.board();
  const opponentColor = color === 'w' ? 'b' : 'w';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const sq = piece.square as Square;
        // Check if this piece is attacked by opponent
        if (game.isAttacked(sq, opponentColor)) {
          threatened.push(sq);
        }
      }
    }
  }
  return threatened;
}

/**
 * Detect hanging pieces — pieces that are attacked but not defended.
 */
export function getHangingPieces(game: Chess, color: 'w' | 'b'): Square[] {
  const hanging: Square[] = [];
  const board = game.board();
  const opponentColor = color === 'w' ? 'b' : 'w';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color && piece.type !== 'k') {
        const sq = piece.square as Square;
        const isAttacked = game.isAttacked(sq, opponentColor);
        const isDefended = game.isAttacked(sq, color);
        if (isAttacked && !isDefended) {
          hanging.push(sq);
        }
      }
    }
  }
  return hanging;
}

/**
 * Detect pinned pieces — pieces that can't move without exposing the king.
 */
export function getPinnedPieces(game: Chess, color: 'w' | 'b'): Square[] {
  const pinned: Square[] = [];
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color && piece.type !== 'k') {
        const sq = piece.square as Square;
        // A piece is pinned if removing it would result in check
        // We can detect this by checking if the piece has any legal moves
        const legalMoves = game.moves({ square: sq, verbose: true });
        // Try to see if the piece is restricted by a pin
        // Simple heuristic: if piece is on a line between king and an attacking slider
        if (legalMoves.length === 0 && !game.isCheck()) {
          // Piece has no legal moves and we're not in check — likely pinned or blocked
          pinned.push(sq);
        }
      }
    }
  }
  return pinned;
}

/**
 * Find passed pawns — pawns with no opposing pawns in front on same/adjacent files.
 */
export function getPassedPawns(game: Chess, color: 'w' | 'b'): Square[] {
  const passed: Square[] = [];
  const board = game.board();
  const opponentColor = color === 'w' ? 'b' : 'w';
  const direction = color === 'w' ? -1 : 1; // White pawns move up (decreasing row)

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color && piece.type === 'p') {
        let isPassed = true;
        // Check all rows in front of this pawn
        const startRow = row + direction;
        const endRow = color === 'w' ? 0 : 7;
        const step = direction;

        for (let r = startRow; color === 'w' ? r >= endRow : r <= endRow; r += step) {
          for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
            const blocker = board[r][c];
            if (blocker && blocker.color === opponentColor && blocker.type === 'p') {
              isPassed = false;
              break;
            }
          }
          if (!isPassed) break;
        }

        if (isPassed) {
          passed.push(piece.square as Square);
        }
      }
    }
  }
  return passed;
}

/**
 * Find isolated pawns — pawns with no friendly pawns on adjacent files.
 */
export function getIsolatedPawns(game: Chess, color: 'w' | 'b'): Square[] {
  const isolated: Square[] = [];
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color && piece.type === 'p') {
        let hasAdjacentPawn = false;
        // Check adjacent files for friendly pawns
        for (let r = 0; r < 8; r++) {
          if (col > 0) {
            const left = board[r][col - 1];
            if (left && left.color === color && left.type === 'p') {
              hasAdjacentPawn = true;
              break;
            }
          }
          if (col < 7) {
            const right = board[r][col + 1];
            if (right && right.color === color && right.type === 'p') {
              hasAdjacentPawn = true;
              break;
            }
          }
        }
        if (!hasAdjacentPawn) {
          isolated.push(piece.square as Square);
        }
      }
    }
  }
  return isolated;
}

/**
 * Convert a UCI move string (e.g. "e2e4") to source/target squares.
 */
export function parseBestMove(uciMove: string): { from: Square; to: Square; promotion?: string } | null {
  if (!uciMove || uciMove.length < 4) return null;
  const from = uciMove.substring(0, 2) as Square;
  const to = uciMove.substring(2, 4) as Square;
  const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
  return { from, to, promotion };
}

/**
 * Generate a game report summary.
 */
export interface GameReportData {
  totalMoves: number;
  accuracy: number; // 0-100
  classifications: Record<MoveClassification, number>;
  averageCPL: number;
  bestMoveMatches: number;
}

export function generateGameReport(
  moveClassifications: MoveClassification[],
  cpLosses: number[]
): GameReportData {
  const classifications: Record<MoveClassification, number> = {
    brilliant: 0,
    great: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    miss: 0,
  };

  moveClassifications.forEach(c => {
    classifications[c]++;
  });

  const totalMoves = moveClassifications.length;
  const totalCPL = cpLosses.reduce((sum, cpl) => sum + Math.max(0, cpl), 0);
  const averageCPL = totalMoves > 0 ? totalCPL / totalMoves : 0;

  // Accuracy formula (similar to chess.com): 100 - (averageCPL / 3)
  const accuracy = Math.max(0, Math.min(100, 100 - (averageCPL / 3)));

  const bestMoveMatches = classifications.brilliant + classifications.great + classifications.good;

  return {
    totalMoves,
    accuracy,
    classifications,
    averageCPL,
    bestMoveMatches,
  };
}

/**
 * Format a move in figurine notation (Unicode piece symbols).
 */
export function toFigurineNotation(san: string): string {
  return san
    .replace(/^K/, '♔')
    .replace(/^Q/, '♕')
    .replace(/^R/, '♖')
    .replace(/^B/, '♗')
    .replace(/^N/, '♘');
}

/**
 * Convert centipawns to a display string.
 */
export function formatEval(cp: number, isMate: boolean = false, mateIn: number = 0): string {
  if (isMate) {
    return mateIn > 0 ? `M${mateIn}` : `-M${Math.abs(mateIn)}`;
  }
  const val = cp / 100;
  return (val > 0 ? '+' : '') + val.toFixed(1);
}
