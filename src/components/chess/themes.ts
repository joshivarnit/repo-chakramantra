export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlight: string;
  lastMoveLight: string;
  lastMoveDark: string;
  description?: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'lumi-garden',
    name: 'Lumi Garden',
    description: 'Hand-drawn watercolor sage & warm cream vellum',
    lightSquare: '#fbf6ec',
    darkSquare: '#8fa886',
    highlight: 'rgba(244, 162, 97, 0.45)',
    lastMoveLight: '#f4e6af',
    lastMoveDark: '#a9be9d',
  },
  {
    id: 'lumi-storybook',
    name: 'Lumi Storybook',
    description: 'Warm tea-stained parchment & cozy honey wood',
    lightSquare: '#f9f3e5',
    darkSquare: '#bfa588',
    highlight: 'rgba(233, 196, 106, 0.5)',
    lastMoveLight: '#fae8b4',
    lastMoveDark: '#d4be9f',
  },
  {
    id: 'lumi-twilight',
    name: 'Lumi Twilight',
    description: 'Enchanted fairytale moonlit vellum & twilight lavender',
    lightSquare: '#dbe2dc',
    darkSquare: '#6e738c',
    highlight: 'rgba(167, 139, 250, 0.45)',
    lastMoveLight: '#c8d6cb',
    lastMoveDark: '#878da6',
  },
  {
    id: 'lumi-mist',
    name: 'Lumi Ocean Mist',
    description: 'Soft seafoam watercolor & coastal pastel teal',
    lightSquare: '#eef6f5',
    darkSquare: '#7ba6a1',
    highlight: 'rgba(56, 189, 248, 0.45)',
    lastMoveLight: '#d8eeea',
    lastMoveDark: '#94bab6',
  },
  {
    id: 'classic',
    name: 'Classic Club',
    description: 'Traditional tournament green & ivory',
    lightSquare: '#ebecd0',
    darkSquare: '#779556',
    highlight: 'rgba(255, 255, 0, 0.4)',
    lastMoveLight: '#f6f669',
    lastMoveDark: '#baca2b',
  },
  {
    id: 'walnut',
    name: 'Walnut Wood',
    description: 'Rich hand-carved mahogany & birch grain',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlight: 'rgba(255, 200, 0, 0.4)',
    lastMoveLight: '#f7ec6e',
    lastMoveDark: '#dab549',
  },
  {
    id: 'midnight',
    name: 'Midnight Slate',
    description: 'Muted slate blue & cool alabaster',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    highlight: 'rgba(0, 150, 255, 0.3)',
    lastMoveLight: '#a9cce3',
    lastMoveDark: '#7ba3b8',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Marine azure & breezy sky blue',
    lightSquare: '#d4e4f7',
    darkSquare: '#4682b4',
    highlight: 'rgba(0, 255, 200, 0.3)',
    lastMoveLight: '#aee1f7',
    lastMoveDark: '#5a9fd4',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    description: 'Lush woodland moss & sunny cream',
    lightSquare: '#ffffdd',
    darkSquare: '#86a666',
    highlight: 'rgba(100, 255, 100, 0.35)',
    lastMoveLight: '#e5f5a0',
    lastMoveDark: '#a0c45a',
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    description: 'High-contrast nocturnal dark board with green accent',
    lightSquare: '#2a2a3e',
    darkSquare: '#1a1a2e',
    highlight: 'rgba(57, 255, 20, 0.3)',
    lastMoveLight: '#3a3a5e',
    lastMoveDark: '#2a2a4e',
  },
];

export const DIFFICULTY_LEVELS = [
  { label: 'Beginner', depth: 1, description: 'Just learning (Cute friendly moves)' },
  { label: 'Easy', depth: 3, description: 'Casual storybook play' },
  { label: 'Medium', depth: 6, description: 'A cozy challenge' },
  { label: 'Hard', depth: 10, description: 'Strong club player' },
  { label: 'Expert', depth: 15, description: 'Near-master tactical play' },
  { label: 'Maximum', depth: 20, description: 'Full grandmaster engine strength' },
];

// Move classification thresholds (centipawn loss)
export const MOVE_CLASSIFICATIONS = {
  brilliant: { maxCPL: -50, color: '#059669', symbol: '!!', label: 'Brilliant' },   // Gains more than expected
  great:     { maxCPL: 0,   color: '#10b981', symbol: '!',  label: 'Great Move' },
  good:      { maxCPL: 10,  color: '#84cc16', symbol: '',   label: 'Good' },
  book:      { maxCPL: 0,   color: '#b45309', symbol: '📖', label: 'Book Move' },
  inaccuracy:{ maxCPL: 50,  color: '#eab308', symbol: '?!', label: 'Inaccuracy' },
  mistake:   { maxCPL: 150, color: '#f97316', symbol: '?',  label: 'Mistake' },
  blunder:   { maxCPL: 999, color: '#ef4444', symbol: '??', label: 'Blunder' },
  miss:      { maxCPL: 999, color: '#f43f5e', symbol: '✕',  label: 'Miss' },
} as const;

export type MoveClassification = keyof typeof MOVE_CLASSIFICATIONS;

// Piece unicode symbols for figurine notation
export const PIECE_SYMBOLS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};
