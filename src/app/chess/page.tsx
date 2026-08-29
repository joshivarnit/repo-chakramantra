import type { Metadata } from 'next';
import ChessApp from '@/components/chess/ChessApp';

export const metadata: Metadata = {
  title: 'ChakraChess | Free Chess Analysis & Play',
  description: 'Play chess against Stockfish, analyze games, and improve your chess skills — all free, all offline. Powered by Chakramantra.',
};

export default function ChessPage() {
  return <ChessApp />;
}
