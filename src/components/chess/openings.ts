export interface Opening {
  eco: string;
  name: string;
  moves: string[]; // SAN moves e.g. ["e4", "e5"]
  movesStr: string;
  whiteWinPct: number;
  blackWinPct: number;
  drawPct: number;
  description?: string;
}

export const OPENINGS_DATABASE: Opening[] = [
  { eco: 'E00', name: 'Amar Opening', moves: ['Nh3'], movesStr: '1.Nh3', whiteWinPct: 41.5, blackWinPct: 40.0, drawPct: 18.5 },
  { eco: 'A00', name: 'Anderssen Opening', moves: ['a3'], movesStr: '1.a3', whiteWinPct: 35.2, blackWinPct: 39.2, drawPct: 25.6 },
  { eco: 'A00', name: 'Barnes Opening', moves: ['f3'], movesStr: '1.f3', whiteWinPct: 29.8, blackWinPct: 52.4, drawPct: 17.8 },
  { eco: 'A02', name: 'Bird Opening', moves: ['f4'], movesStr: '1.f4', whiteWinPct: 35.1, blackWinPct: 40.8, drawPct: 24.1 },
  { eco: 'A00', name: 'Clemenz Opening', moves: ['h3'], movesStr: '1.h3', whiteWinPct: 36.1, blackWinPct: 41.7, drawPct: 22.2 },
  { eco: 'A10', name: 'English Opening', moves: ['c4'], movesStr: '1.c4', whiteWinPct: 37.1, blackWinPct: 35.8, drawPct: 27.1 },
  { eco: 'A00', name: 'Grob Opening', moves: ['g4'], movesStr: '1.g4', whiteWinPct: 35.3, blackWinPct: 47.3, drawPct: 17.4 },
  { eco: 'A00', name: "King's Fianchetto Opening", moves: ['g3'], movesStr: '1.g3', whiteWinPct: 38.6, blackWinPct: 32.0, drawPct: 29.4 },
  { eco: 'A00', name: 'Kadas Opening', moves: ['h4'], movesStr: '1.h4', whiteWinPct: 34.0, blackWinPct: 39.3, drawPct: 26.7 },
  { eco: 'B00', name: "King's Pawn Opening", moves: ['e4'], movesStr: '1.e4', whiteWinPct: 38.0, blackWinPct: 39.3, drawPct: 22.7 },
  { eco: 'B00', name: 'Borg Defense', moves: ['e4', 'g5'], movesStr: '1.e4 g5', whiteWinPct: 58.2, blackWinPct: 29.4, drawPct: 12.4 },
  { eco: 'B00', name: 'Carr Defense', moves: ['e4', 'h6'], movesStr: '1.e4 h6', whiteWinPct: 51.2, blackWinPct: 33.1, drawPct: 15.7 },
  { eco: 'B00', name: 'Duras Gambit', moves: ['e4', 'f5'], movesStr: '1.e4 f5', whiteWinPct: 62.4, blackWinPct: 25.8, drawPct: 11.8 },
  { eco: 'B01', name: 'Scandinavian Defense', moves: ['e4', 'd5'], movesStr: '1.e4 d5', whiteWinPct: 37.5, blackWinPct: 44.6, drawPct: 17.9 },
  { eco: 'B02', name: "Alekhine's Defense", moves: ['e4', 'Nf6'], movesStr: '1.e4 Nf6', whiteWinPct: 37.8, blackWinPct: 35.2, drawPct: 27.0 },
  { eco: 'B07', name: 'Pirc Defense', moves: ['e4', 'd6'], movesStr: '1.e4 d6', whiteWinPct: 39.4, blackWinPct: 34.1, drawPct: 26.5 },
  { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e4', 'c6'], movesStr: '1.e4 c6', whiteWinPct: 38.3, blackWinPct: 38.4, drawPct: 23.3 },
  { eco: 'B20', name: 'Sicilian Defense', moves: ['e4', 'c5'], movesStr: '1.e4 c5', whiteWinPct: 34.0, blackWinPct: 41.6, drawPct: 24.4 },
  { eco: 'B00', name: 'St. George Defense', moves: ['e4', 'a6'], movesStr: '1.e4 a6', whiteWinPct: 45.1, blackWinPct: 36.2, drawPct: 18.7 },
  { eco: 'C00', name: 'French Defense', moves: ['e4', 'e6'], movesStr: '1.e4 e6', whiteWinPct: 38.2, blackWinPct: 36.4, drawPct: 25.4 },
  { eco: 'C00', name: 'French Defense, Knight Variation', moves: ['e4', 'e6', 'Nf3', 'd5'], movesStr: '1.e4 e6 2.Nf3 d5', whiteWinPct: 39.1, blackWinPct: 35.2, drawPct: 25.7 },
  { eco: 'C00', name: 'French Defense, Normal Variation', moves: ['e4', 'e6', 'd4', 'd5'], movesStr: '1.e4 e6 2.d4 d5', whiteWinPct: 38.7, blackWinPct: 36.1, drawPct: 25.2 },
  { eco: 'C20', name: 'King Pawn Game', moves: ['e4', 'e5'], movesStr: '1.e4 e5', whiteWinPct: 39.5, blackWinPct: 33.2, drawPct: 27.3 },
  { eco: 'C20', name: 'King Pawn Game, Alapin Opening', moves: ['e4', 'e5', 'Ne2'], movesStr: '1.e4 e5 2.Ne2', whiteWinPct: 38.5, blackWinPct: 36.9, drawPct: 24.6 },
  { eco: 'C20', name: 'King Pawn Game, Leonardis Variation', moves: ['e4', 'e5', 'd3'], movesStr: '1.e4 e5 2.d3', whiteWinPct: 37.6, blackWinPct: 42.7, drawPct: 19.7 },
  { eco: 'C20', name: 'King Pawn Game, Macleod Attack', moves: ['e4', 'e5', 'c3'], movesStr: '1.e4 e5 2.c3', whiteWinPct: 37.6, blackWinPct: 42.7, drawPct: 19.7 },
  { eco: 'C20', name: 'King Pawn Game, Napoleon Attack', moves: ['e4', 'e5', 'Qf3'], movesStr: '1.e4 e5 2.Qf3', whiteWinPct: 38.2, blackWinPct: 43.1, drawPct: 18.7 },
  { eco: 'C20', name: 'King Pawn Game, Tortise Opening', moves: ['e4', 'e5', 'Bd3'], movesStr: '1.e4 e5 2.Bd3', whiteWinPct: 32.1, blackWinPct: 48.5, drawPct: 19.4 },
  { eco: 'C42', name: "Petrov's Defense", moves: ['e4', 'e5', 'Nf3', 'Nf6'], movesStr: '1.e4 e5 2.Nf3 Nf6', whiteWinPct: 33.5, blackWinPct: 26.5, drawPct: 40.0 },
  { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4', whiteWinPct: 38.2, blackWinPct: 32.4, drawPct: 29.4 },
  { eco: 'C60', name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5', whiteWinPct: 39.8, blackWinPct: 28.2, drawPct: 32.0 },
  { eco: 'A40', name: "Queen's Pawn Game", moves: ['d4'], movesStr: '1.d4', whiteWinPct: 39.2, blackWinPct: 31.5, drawPct: 29.3 },
  { eco: 'A40', name: "Queen Pawn Game, Modern Defense", moves: ['d4', 'g6'], movesStr: '1.d4 g6', whiteWinPct: 42.1, blackWinPct: 32.4, drawPct: 25.5 },
  { eco: 'A41', name: 'Rat Defense', moves: ['d4', 'd6'], movesStr: '1.d4 d6', whiteWinPct: 39.5, blackWinPct: 34.2, drawPct: 26.3 },
  { eco: 'A45', name: 'Indian Game', moves: ['d4', 'Nf6'], movesStr: '1.d4 Nf6', whiteWinPct: 37.2, blackWinPct: 30.1, drawPct: 32.7 },
  { eco: 'A45', name: 'Indian Game, Paleface Attack', moves: ['d4', 'Nf6', 'f3'], movesStr: '1.d4 Nf6 2.f3', whiteWinPct: 33.9, blackWinPct: 50.1, drawPct: 16.0 },
  { eco: 'A45', name: 'Indian Game, Pawn Push Variation', moves: ['d4', 'Nf6', 'd5'], movesStr: '1.d4 Nf6 2.d5', whiteWinPct: 36.6, blackWinPct: 32.4, drawPct: 31.0 },
  { eco: 'A45', name: 'Indian Game, Tartakower Attack', moves: ['d4', 'Nf6', 'g3'], movesStr: '1.d4 Nf6 2.g3', whiteWinPct: 37.1, blackWinPct: 28.5, drawPct: 34.4 },
  { eco: 'A80', name: 'Dutch Defense', moves: ['d4', 'f5'], movesStr: '1.d4 f5', whiteWinPct: 41.2, blackWinPct: 33.5, drawPct: 25.3 },
  { eco: 'D00', name: "Queen's Pawn Game", moves: ['d4', 'd5'], movesStr: '1.d4 d5', whiteWinPct: 38.6, blackWinPct: 30.2, drawPct: 31.2 },
  { eco: 'D02', name: 'Queen Pawn Game, Zukertort Variation', moves: ['d4', 'd5', 'Nf3'], movesStr: '1.d4 d5 2.Nf3', whiteWinPct: 38.9, blackWinPct: 29.8, drawPct: 31.3 },
  { eco: 'D06', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'], movesStr: '1.d4 d5 2.c4', whiteWinPct: 41.2, blackWinPct: 27.8, drawPct: 31.0 },
  { eco: 'D10', name: 'Slav Defense', moves: ['d4', 'd5', 'c4', 'c6'], movesStr: '1.d4 d5 2.c4 c6', whiteWinPct: 35.8, blackWinPct: 28.4, drawPct: 35.8 },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'], movesStr: '1.d4 d5 2.c4 e6', whiteWinPct: 37.4, blackWinPct: 26.5, drawPct: 36.1 },
  { eco: 'E60', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'], movesStr: '1.d4 Nf6 2.c4 g6', whiteWinPct: 39.1, blackWinPct: 30.9, drawPct: 30.0 },
];

/**
 * Detect the matching opening from a sequence of SAN moves
 */
export function detectOpening(moves: string[]): Opening | null {
  if (!moves || moves.length === 0) return null;

  let bestMatch: Opening | null = null;
  let maxMatchLength = 0;

  for (const opening of OPENINGS_DATABASE) {
    if (opening.moves.length <= moves.length) {
      let isMatch = true;
      for (let i = 0; i < opening.moves.length; i++) {
        if (opening.moves[i].replace(/[+#]/, '') !== moves[i].replace(/[+#]/, '')) {
          isMatch = false;
          break;
        }
      }
      if (isMatch && opening.moves.length > maxMatchLength) {
        bestMatch = opening;
        maxMatchLength = opening.moves.length;
      }
    }
  }

  return bestMatch;
}
