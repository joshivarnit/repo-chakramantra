export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlight: string;
  lastMoveLight: string;
  lastMoveDark: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    lightSquare: '#ebecd0',
    darkSquare: '#779556',
    highlight: 'rgba(255, 255, 0, 0.4)',
    lastMoveLight: '#f6f669',
    lastMoveDark: '#baca2b',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    highlight: 'rgba(0, 150, 255, 0.3)',
    lastMoveLight: '#a9cce3',
    lastMoveDark: '#7ba3b8',
  },
  {
    id: 'walnut',
    name: 'Walnut',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlight: 'rgba(255, 200, 0, 0.4)',
    lastMoveLight: '#f7ec6e',
    lastMoveDark: '#dab549',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    lightSquare: '#d4e4f7',
    darkSquare: '#4682b4',
    highlight: 'rgba(0, 255, 200, 0.3)',
    lastMoveLight: '#aee1f7',
    lastMoveDark: '#5a9fd4',
  },
  {
    id: 'neon',
    name: 'Neon',
    lightSquare: '#2a2a3e',
    darkSquare: '#1a1a2e',
    highlight: 'rgba(57, 255, 20, 0.3)',
    lastMoveLight: '#3a3a5e',
    lastMoveDark: '#2a2a4e',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    lightSquare: '#ffffdd',
    darkSquare: '#86a666',
    highlight: 'rgba(100, 255, 100, 0.35)',
    lastMoveLight: '#e5f5a0',
    lastMoveDark: '#a0c45a',
  },
];

export const DIFFICULTY_LEVELS = [
  { label: 'Beginner', depth: 1, description: 'Just learning' },
  { label: 'Easy', depth: 3, description: 'Casual play' },
  { label: 'Medium', depth: 6, description: 'A fair challenge' },
  { label: 'Hard', depth: 10, description: 'Strong play' },
  { label: 'Expert', depth: 15, description: 'Near-master level' },
  { label: 'Maximum', depth: 20, description: 'Full engine strength' },
];

// Move classification thresholds (centipawn loss)
export const MOVE_CLASSIFICATIONS = {
  brilliant: { maxCPL: -50, color: '#1bada6', symbol: '!!' },   // Gains more than expected
  great:     { maxCPL: 0,   color: '#5c9e31', symbol: '!' },
  good:      { maxCPL: 10,  color: '#96bc4b', symbol: '' },
  book:      { maxCPL: 0,   color: '#a88b65', symbol: '' },
  inaccuracy:{ maxCPL: 50,  color: '#f7c631', symbol: '?!' },
  mistake:   { maxCPL: 150, color: '#e69422', symbol: '?' },
  blunder:   { maxCPL: 999, color: '#ca3431', symbol: '??' },
  miss:      { maxCPL: 999, color: '#db5b3e', symbol: '' },
} as const;

export type MoveClassification = keyof typeof MOVE_CLASSIFICATIONS;

// Piece unicode symbols for figurine notation
export const PIECE_SYMBOLS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};
