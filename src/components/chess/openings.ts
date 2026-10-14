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
  // ─── 1.e4 King's Pawn Openings ───
  { eco: 'B00', name: "King's Pawn Opening", moves: ['e4'], movesStr: '1.e4', whiteWinPct: 38.0, blackWinPct: 32.5, drawPct: 29.5 },
  { eco: 'C20', name: "King's Pawn Game (Open Game)", moves: ['e4', 'e5'], movesStr: '1.e4 e5', whiteWinPct: 38.5, blackWinPct: 32.2, drawPct: 29.3 },

  // Italian Game & Variations
  { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4', whiteWinPct: 38.2, blackWinPct: 32.4, drawPct: 29.4 },
  { eco: 'C50', name: 'Italian Game: Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5', whiteWinPct: 38.0, blackWinPct: 31.8, drawPct: 30.2 },
  { eco: 'C50', name: 'Italian Game: Giuoco Pianissimo', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'c3'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.d3 Nf6 5.c3', whiteWinPct: 37.8, blackWinPct: 30.2, drawPct: 32.0 },
  { eco: 'C51', name: 'Italian Game: Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4', whiteWinPct: 41.5, blackWinPct: 36.2, drawPct: 22.3 },
  { eco: 'C55', name: 'Italian Game: Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6', whiteWinPct: 39.0, blackWinPct: 34.0, drawPct: 27.0 },
  { eco: 'C57', name: 'Italian Game: Fried Liver Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7', whiteWinPct: 48.2, blackWinPct: 33.1, drawPct: 18.7 },

  // Ruy Lopez & Variations
  { eco: 'C60', name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5', whiteWinPct: 39.8, blackWinPct: 28.2, drawPct: 32.0 },
  { eco: 'C65', name: 'Ruy Lopez: Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6', whiteWinPct: 34.5, blackWinPct: 25.5, drawPct: 40.0 },
  { eco: 'C68', name: 'Ruy Lopez: Exchange Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Bxc6', whiteWinPct: 38.6, blackWinPct: 29.8, drawPct: 31.6 },
  { eco: 'C78', name: 'Ruy Lopez: Archangelsk Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'b5', 'Bb3', 'Bb7'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O b5 6.Bb3 Bb7', whiteWinPct: 36.8, blackWinPct: 31.2, drawPct: 32.0 },
  { eco: 'C80', name: 'Ruy Lopez: Open Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4', whiteWinPct: 37.2, blackWinPct: 30.8, drawPct: 32.0 },
  { eco: 'C84', name: 'Ruy Lopez: Closed', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7', whiteWinPct: 39.5, blackWinPct: 26.5, drawPct: 34.0 },
  { eco: 'C89', name: 'Ruy Lopez: Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d5', whiteWinPct: 32.0, blackWinPct: 26.0, drawPct: 42.0 },

  // Scotch, Four Knights, Petrov & Open Games
  { eco: 'C45', name: 'Scotch Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.d4', whiteWinPct: 39.2, blackWinPct: 31.0, drawPct: 29.8 },
  { eco: 'C45', name: 'Scotch Game: Classical Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5', whiteWinPct: 38.5, blackWinPct: 31.5, drawPct: 30.0 },
  { eco: 'C45', name: 'Scotch Game: Mieses Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5', whiteWinPct: 39.0, blackWinPct: 30.5, drawPct: 30.5 },
  { eco: 'C44', name: 'Scotch Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4', whiteWinPct: 41.2, blackWinPct: 36.4, drawPct: 22.4 },
  { eco: 'C47', name: 'Four Knights Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'], movesStr: '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6', whiteWinPct: 36.5, blackWinPct: 28.5, drawPct: 35.0 },
  { eco: 'C42', name: "Petrov's Defense", moves: ['e4', 'e5', 'Nf3', 'Nf6'], movesStr: '1.e4 e5 2.Nf3 Nf6', whiteWinPct: 33.5, blackWinPct: 26.5, drawPct: 40.0 },
  { eco: 'C42', name: "Petrov's Defense: Classical Attack", moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4', 'd4'], movesStr: '1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4', whiteWinPct: 34.0, blackWinPct: 24.0, drawPct: 42.0 },
  { eco: 'C25', name: 'Vienna Game', moves: ['e4', 'e5', 'Nc3'], movesStr: '1.e4 e5 2.Nc3', whiteWinPct: 39.5, blackWinPct: 32.5, drawPct: 28.0 },
  { eco: 'C29', name: 'Vienna Gambit', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4'], movesStr: '1.e4 e5 2.Nc3 Nf6 3.f4', whiteWinPct: 42.5, blackWinPct: 35.5, drawPct: 22.0 },
  { eco: 'C30', name: "King's Gambit", moves: ['e4', 'e5', 'f4'], movesStr: '1.e4 e5 2.f4', whiteWinPct: 39.0, blackWinPct: 39.0, drawPct: 22.0 },
  { eco: 'C33', name: "King's Gambit Accepted", moves: ['e4', 'e5', 'f4', 'exf4'], movesStr: '1.e4 e5 2.f4 exf4', whiteWinPct: 39.5, blackWinPct: 38.5, drawPct: 22.0 },
  { eco: 'C30', name: "King's Gambit Declined", moves: ['e4', 'e5', 'f4', 'Bc5'], movesStr: '1.e4 e5 2.f4 Bc5', whiteWinPct: 40.0, blackWinPct: 36.0, drawPct: 24.0 },
  { eco: 'C23', name: "Bishop's Opening", moves: ['e4', 'e5', 'Bc4'], movesStr: '1.e4 e5 2.Bc4', whiteWinPct: 38.4, blackWinPct: 33.6, drawPct: 28.0 },
  { eco: 'C41', name: 'Philidor Defense', moves: ['e4', 'e5', 'Nf3', 'd6'], movesStr: '1.e4 e5 2.Nf3 d6', whiteWinPct: 44.5, blackWinPct: 31.5, drawPct: 24.0 },
  { eco: 'C21', name: 'Danish Gambit', moves: ['e4', 'e5', 'd4', 'exd4', 'c3'], movesStr: '1.e4 e5 2.d4 exd4 3.c3', whiteWinPct: 43.0, blackWinPct: 38.0, drawPct: 19.0 },

  // Sicilian Defense & Variations
  { eco: 'B20', name: 'Sicilian Defense', moves: ['e4', 'c5'], movesStr: '1.e4 c5', whiteWinPct: 37.0, blackWinPct: 36.5, drawPct: 26.5 },
  { eco: 'B22', name: 'Sicilian Defense: Alapin Variation', moves: ['e4', 'c5', 'c3'], movesStr: '1.e4 c5 2.c3', whiteWinPct: 37.5, blackWinPct: 32.5, drawPct: 30.0 },
  { eco: 'B23', name: 'Sicilian Defense: Closed', moves: ['e4', 'c5', 'Nc3'], movesStr: '1.e4 c5 2.Nc3', whiteWinPct: 38.2, blackWinPct: 33.8, drawPct: 28.0 },
  { eco: 'B23', name: 'Sicilian Defense: Grand Prix Attack', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'f4'], movesStr: '1.e4 c5 2.Nc3 Nc6 3.f4', whiteWinPct: 40.0, blackWinPct: 35.0, drawPct: 25.0 },
  { eco: 'B27', name: 'Sicilian Defense: Open', moves: ['e4', 'c5', 'Nf3'], movesStr: '1.e4 c5 2.Nf3', whiteWinPct: 37.8, blackWinPct: 35.2, drawPct: 27.0 },
  { eco: 'B90', name: 'Sicilian Defense: Najdorf Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6', whiteWinPct: 38.5, blackWinPct: 33.5, drawPct: 28.0 },
  { eco: 'B90', name: 'Sicilian Najdorf: English Attack', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.Nb3', whiteWinPct: 39.0, blackWinPct: 32.5, drawPct: 28.5 },
  { eco: 'B70', name: 'Sicilian Defense: Dragon Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6', whiteWinPct: 41.0, blackWinPct: 34.0, drawPct: 25.0 },
  { eco: 'B76', name: 'Sicilian Dragon: Yugoslav Attack', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4', whiteWinPct: 42.0, blackWinPct: 33.0, drawPct: 25.0 },
  { eco: 'B35', name: 'Sicilian Defense: Accelerated Dragon', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'], movesStr: '1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6', whiteWinPct: 39.0, blackWinPct: 32.0, drawPct: 29.0 },
  { eco: 'B80', name: 'Sicilian Defense: Scheveningen Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6', whiteWinPct: 39.5, blackWinPct: 32.5, drawPct: 28.0 },
  { eco: 'B56', name: 'Sicilian Defense: Classical Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'], movesStr: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6', whiteWinPct: 39.0, blackWinPct: 32.0, drawPct: 29.0 },
  { eco: 'B33', name: 'Sicilian Defense: Sveshnikov Variation', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'], movesStr: '1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e5', whiteWinPct: 36.0, blackWinPct: 31.0, drawPct: 33.0 },
  { eco: 'B41', name: 'Sicilian Defense: Kan Variation', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'], movesStr: '1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6', whiteWinPct: 38.0, blackWinPct: 32.0, drawPct: 30.0 },
  { eco: 'B46', name: 'Sicilian Defense: Taimanov Variation', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6'], movesStr: '1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6', whiteWinPct: 37.5, blackWinPct: 31.5, drawPct: 31.0 },

  // French Defense & Variations
  { eco: 'C00', name: 'French Defense', moves: ['e4', 'e6'], movesStr: '1.e4 e6', whiteWinPct: 38.2, blackWinPct: 33.4, drawPct: 28.4 },
  { eco: 'C02', name: 'French Defense: Advance Variation', moves: ['e4', 'e6', 'd4', 'd5', 'e5'], movesStr: '1.e4 e6 2.d4 d5 3.e5', whiteWinPct: 39.5, blackWinPct: 32.5, drawPct: 28.0 },
  { eco: 'C03', name: 'French Defense: Tarrasch Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'], movesStr: '1.e4 e6 2.d4 d5 3.Nd2', whiteWinPct: 38.8, blackWinPct: 30.2, drawPct: 31.0 },
  { eco: 'C15', name: 'French Defense: Winawer Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'], movesStr: '1.e4 e6 2.d4 d5 3.Nc3 Bb4', whiteWinPct: 39.5, blackWinPct: 32.5, drawPct: 28.0 },
  { eco: 'C11', name: 'French Defense: Classical Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'], movesStr: '1.e4 e6 2.d4 d5 3.Nc3 Nf6', whiteWinPct: 39.0, blackWinPct: 31.0, drawPct: 30.0 },
  { eco: 'C01', name: 'French Defense: Exchange Variation', moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5'], movesStr: '1.e4 e6 2.d4 d5 3.exd5 exd5', whiteWinPct: 34.0, blackWinPct: 28.0, drawPct: 38.0 },
  { eco: 'C10', name: 'French Defense: Rubinstein Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4'], movesStr: '1.e4 e6 2.d4 d5 3.Nc3 dxe4', whiteWinPct: 38.0, blackWinPct: 29.0, drawPct: 33.0 },

  // Caro-Kann Defense & Variations
  { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e4', 'c6'], movesStr: '1.e4 c6', whiteWinPct: 37.5, blackWinPct: 33.5, drawPct: 29.0 },
  { eco: 'B12', name: 'Caro-Kann Defense: Advance Variation', moves: ['e4', 'c6', 'd4', 'd5', 'e5'], movesStr: '1.e4 c6 2.d4 d5 3.e5', whiteWinPct: 39.0, blackWinPct: 33.0, drawPct: 28.0 },
  { eco: 'B18', name: 'Caro-Kann Defense: Classical Variation', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'], movesStr: '1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5', whiteWinPct: 36.5, blackWinPct: 29.5, drawPct: 34.0 },
  { eco: 'B13', name: 'Caro-Kann Defense: Panov Attack', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4'], movesStr: '1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4', whiteWinPct: 39.0, blackWinPct: 31.0, drawPct: 30.0 },
  { eco: 'B13', name: 'Caro-Kann Defense: Exchange Variation', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3'], movesStr: '1.e4 c6 2.d4 d5 3.exd5 cxd5 4.Bd3', whiteWinPct: 37.5, blackWinPct: 30.5, drawPct: 32.0 },
  { eco: 'B15', name: 'Caro-Kann Defense: Tartakower Variation', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'exf6'], movesStr: '1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nf6 5.Nxf6+ exf6', whiteWinPct: 35.0, blackWinPct: 29.0, drawPct: 36.0 },

  // Scandinavian, Alekhine, Pirc & Modern
  { eco: 'B01', name: 'Scandinavian Defense', moves: ['e4', 'd5'], movesStr: '1.e4 d5', whiteWinPct: 40.0, blackWinPct: 33.0, drawPct: 27.0 },
  { eco: 'B01', name: 'Scandinavian: Mieses-Kotroc Variation', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'], movesStr: '1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5', whiteWinPct: 40.5, blackWinPct: 32.0, drawPct: 27.5 },
  { eco: 'B01', name: 'Scandinavian: Modern Variation', moves: ['e4', 'd5', 'exd5', 'Nf6'], movesStr: '1.e4 d5 2.exd5 Nf6', whiteWinPct: 39.0, blackWinPct: 33.5, drawPct: 27.5 },
  { eco: 'B02', name: "Alekhine's Defense", moves: ['e4', 'Nf6'], movesStr: '1.e4 Nf6', whiteWinPct: 38.5, blackWinPct: 33.5, drawPct: 28.0 },
  { eco: 'B04', name: "Alekhine's Defense: Modern Variation", moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3'], movesStr: '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3', whiteWinPct: 39.5, blackWinPct: 31.5, drawPct: 29.0 },
  { eco: 'B03', name: "Alekhine's Defense: Four Pawns Attack", moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'c4', 'Nb6', 'f4'], movesStr: '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4', whiteWinPct: 42.0, blackWinPct: 34.0, drawPct: 24.0 },
  { eco: 'B07', name: 'Pirc Defense', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'], movesStr: '1.e4 d6 2.d4 Nf6 3.Nc3 g6', whiteWinPct: 41.0, blackWinPct: 31.0, drawPct: 28.0 },
  { eco: 'B09', name: 'Pirc Defense: Austrian Attack', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4'], movesStr: '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f4', whiteWinPct: 43.0, blackWinPct: 31.0, drawPct: 26.0 },
  { eco: 'B06', name: 'Modern Defense', moves: ['e4', 'g6'], movesStr: '1.e4 g6', whiteWinPct: 41.5, blackWinPct: 32.5, drawPct: 26.0 },

  // ─── 1.d4 Queen's Pawn Openings ───
  { eco: 'A40', name: "Queen's Pawn Game", moves: ['d4'], movesStr: '1.d4', whiteWinPct: 39.5, blackWinPct: 29.5, drawPct: 31.0 },
  { eco: 'D00', name: "Queen's Pawn Game: 1...d5", moves: ['d4', 'd5'], movesStr: '1.d4 d5', whiteWinPct: 38.6, blackWinPct: 30.2, drawPct: 31.2 },

  // London System & Colle
  { eco: 'D02', name: 'London System', moves: ['d4', 'd5', 'Bf4'], movesStr: '1.d4 d5 2.Bf4', whiteWinPct: 39.5, blackWinPct: 29.0, drawPct: 31.5 },
  { eco: 'A45', name: 'London System vs Indian', moves: ['d4', 'Nf6', 'Bf4'], movesStr: '1.d4 Nf6 2.Bf4', whiteWinPct: 39.0, blackWinPct: 29.5, drawPct: 31.5 },
  { eco: 'D05', name: 'Colle System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'e3'], movesStr: '1.d4 d5 2.Nf3 Nf6 3.e3', whiteWinPct: 38.5, blackWinPct: 29.5, drawPct: 32.0 },
  { eco: 'A45', name: 'Trompowsky Attack', moves: ['d4', 'Nf6', 'Bg5'], movesStr: '1.d4 Nf6 2.Bg5', whiteWinPct: 40.5, blackWinPct: 32.0, drawPct: 27.5 },
  { eco: 'A46', name: 'Torre Attack', moves: ['d4', 'Nf6', 'Nf3', 'e6', 'Bg5'], movesStr: '1.d4 Nf6 2.Nf3 e6 3.Bg5', whiteWinPct: 39.0, blackWinPct: 29.0, drawPct: 32.0 },

  // Queen's Gambit & Variations
  { eco: 'D06', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'], movesStr: '1.d4 d5 2.c4', whiteWinPct: 40.5, blackWinPct: 28.0, drawPct: 31.5 },
  { eco: 'D20', name: "Queen's Gambit Accepted", moves: ['d4', 'd5', 'c4', 'dxc4'], movesStr: '1.d4 d5 2.c4 dxc4', whiteWinPct: 40.0, blackWinPct: 29.0, drawPct: 31.0 },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'], movesStr: '1.d4 d5 2.c4 e6', whiteWinPct: 38.5, blackWinPct: 27.0, drawPct: 34.5 },
  { eco: 'D35', name: "Queen's Gambit Declined: Exchange", moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5'], movesStr: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5', whiteWinPct: 39.5, blackWinPct: 26.5, drawPct: 34.0 },
  { eco: 'D58', name: "Queen's Gambit Declined: Tartakower", moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6'], movesStr: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6', whiteWinPct: 34.0, blackWinPct: 26.0, drawPct: 40.0 },

  // Slav & Semi-Slav
  { eco: 'D10', name: 'Slav Defense', moves: ['d4', 'd5', 'c4', 'c6'], movesStr: '1.d4 d5 2.c4 c6', whiteWinPct: 36.5, blackWinPct: 28.5, drawPct: 35.0 },
  { eco: 'D15', name: 'Slav Defense: Chebanenko', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'a6'], movesStr: '1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 a6', whiteWinPct: 35.5, blackWinPct: 27.5, drawPct: 37.0 },
  { eco: 'D43', name: 'Semi-Slav Defense', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6'], movesStr: '1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 e6', whiteWinPct: 37.5, blackWinPct: 29.5, drawPct: 33.0 },
  { eco: 'D45', name: 'Semi-Slav: Meran Variation', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'e3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5'], movesStr: '1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 e6 5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5', whiteWinPct: 37.0, blackWinPct: 30.0, drawPct: 33.0 },
  { eco: 'D44', name: 'Semi-Slav: Botvinnik Variation', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'Bg5', 'dxc4', 'e4', 'b5'], movesStr: '1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 e6 5.Bg5 dxc4 6.e4 b5', whiteWinPct: 41.0, blackWinPct: 34.0, drawPct: 25.0 },

  // Catalan Opening
  { eco: 'E00', name: 'Catalan Opening', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3'], movesStr: '1.d4 Nf6 2.c4 e6 3.g3', whiteWinPct: 39.5, blackWinPct: 25.5, drawPct: 35.0 },
  { eco: 'E04', name: 'Catalan Opening: Open', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4'], movesStr: '1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4', whiteWinPct: 39.0, blackWinPct: 26.0, drawPct: 35.0 },
  { eco: 'E06', name: 'Catalan Opening: Closed', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O'], movesStr: '1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O', whiteWinPct: 38.0, blackWinPct: 25.0, drawPct: 37.0 },

  // King's Indian & Grünfeld
  { eco: 'E60', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'], movesStr: '1.d4 Nf6 2.c4 g6', whiteWinPct: 39.1, blackWinPct: 30.9, drawPct: 30.0 },
  { eco: 'E91', name: "King's Indian: Classical Variation", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2', whiteWinPct: 40.0, blackWinPct: 31.0, drawPct: 29.0 },
  { eco: 'E80', name: "King's Indian: Sämisch Variation", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3', whiteWinPct: 41.5, blackWinPct: 30.5, drawPct: 28.0 },
  { eco: 'E62', name: "King's Indian: Fianchetto Variation", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nf3', 'Bg7', 'g3', 'O-O', 'Bg2', 'd6'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nf3 Bg7 4.g3 O-O 5.Bg2 d6', whiteWinPct: 38.5, blackWinPct: 27.5, drawPct: 34.0 },
  { eco: 'D80', name: 'Grünfeld Defense', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nc3 d5', whiteWinPct: 38.0, blackWinPct: 29.0, drawPct: 33.0 },
  { eco: 'D85', name: 'Grünfeld Defense: Exchange Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7', whiteWinPct: 39.0, blackWinPct: 28.0, drawPct: 33.0 },
  { eco: 'D96', name: 'Grünfeld Defense: Russian System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'Qb3', 'dxc4', 'Qxc4', 'O-O', 'e4'], movesStr: '1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qb3 dxc4 6.Qxc4 O-O 7.e4', whiteWinPct: 39.5, blackWinPct: 27.5, drawPct: 33.0 },

  // Nimzo-Indian, Queen's Indian & Bogo-Indian
  { eco: 'E20', name: 'Nimzo-Indian Defense', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], movesStr: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4', whiteWinPct: 36.5, blackWinPct: 27.5, drawPct: 36.0 },
  { eco: 'E32', name: 'Nimzo-Indian: Classical Variation', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2'], movesStr: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2', whiteWinPct: 37.5, blackWinPct: 27.0, drawPct: 35.5 },
  { eco: 'E40', name: 'Nimzo-Indian: Rubinstein Variation', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3'], movesStr: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3', whiteWinPct: 37.0, blackWinPct: 27.0, drawPct: 36.0 },
  { eco: 'E12', name: "Queen's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'], movesStr: '1.d4 Nf6 2.c4 e6 3.Nf3 b6', whiteWinPct: 37.5, blackWinPct: 26.5, drawPct: 36.0 },
  { eco: 'E11', name: 'Bogo-Indian Defense', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'Bb4+'], movesStr: '1.d4 Nf6 2.c4 e6 3.Nf3 Bb4+', whiteWinPct: 37.0, blackWinPct: 26.0, drawPct: 37.0 },

  // Benoni & Benko
  { eco: 'A60', name: 'Modern Benoni', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6'], movesStr: '1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6', whiteWinPct: 42.0, blackWinPct: 32.0, drawPct: 26.0 },
  { eco: 'A57', name: 'Benko Gambit', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'], movesStr: '1.d4 Nf6 2.c4 c5 3.d5 b5', whiteWinPct: 38.0, blackWinPct: 35.0, drawPct: 27.0 },

  // Dutch Defense & Other 1.d4
  { eco: 'A80', name: 'Dutch Defense', moves: ['d4', 'f5'], movesStr: '1.d4 f5', whiteWinPct: 41.2, blackWinPct: 33.5, drawPct: 25.3 },
  { eco: 'A87', name: 'Dutch Defense: Leningrad Variation', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3'], movesStr: '1.d4 f5 2.c4 Nf6 3.g3 g6 4.Bg2 Bg7 5.Nf3', whiteWinPct: 40.5, blackWinPct: 32.5, drawPct: 27.0 },
  { eco: 'A90', name: 'Dutch Defense: Stonewall Variation', moves: ['d4', 'f5', 'c4', 'e6', 'g3', 'Nf6', 'Bg2', 'd5'], movesStr: '1.d4 f5 2.c4 e6 3.g3 Nf6 4.Bg2 d5', whiteWinPct: 41.0, blackWinPct: 31.0, drawPct: 28.0 },
  { eco: 'A52', name: 'Budapest Gambit', moves: ['d4', 'Nf6', 'c4', 'e5'], movesStr: '1.d4 Nf6 2.c4 e5', whiteWinPct: 41.0, blackWinPct: 35.0, drawPct: 24.0 },

  // ─── Flank & System Openings ───
  // English Opening & Variations
  { eco: 'A10', name: 'English Opening', moves: ['c4'], movesStr: '1.c4', whiteWinPct: 38.0, blackWinPct: 31.0, drawPct: 31.0 },
  { eco: 'A30', name: 'English Opening: Symmetrical Variation', moves: ['c4', 'c5'], movesStr: '1.c4 c5', whiteWinPct: 36.5, blackWinPct: 29.5, drawPct: 34.0 },
  { eco: 'A20', name: "English Opening: King's English", moves: ['c4', 'e5'], movesStr: '1.c4 e5', whiteWinPct: 38.5, blackWinPct: 31.5, drawPct: 30.0 },
  { eco: 'A28', name: 'English Opening: Four Knights', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6'], movesStr: '1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6', whiteWinPct: 37.0, blackWinPct: 29.0, drawPct: 34.0 },
  { eco: 'A26', name: 'English Opening: Botvinnik System', moves: ['c4', 'e5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'e4'], movesStr: '1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.e4', whiteWinPct: 40.0, blackWinPct: 29.0, drawPct: 31.0 },

  // Reti & King's Indian Attack
  { eco: 'A04', name: 'Reti Opening', moves: ['Nf3'], movesStr: '1.Nf3', whiteWinPct: 38.5, blackWinPct: 29.5, drawPct: 32.0 },
  { eco: 'A09', name: 'Reti Opening: Reversed Sicilian / King Gambit', moves: ['Nf3', 'd5', 'c4'], movesStr: '1.Nf3 d5 2.c4', whiteWinPct: 39.0, blackWinPct: 29.0, drawPct: 32.0 },
  { eco: 'A07', name: "King's Indian Attack", moves: ['Nf3', 'd5', 'g3'], movesStr: '1.Nf3 d5 2.g3', whiteWinPct: 38.5, blackWinPct: 29.5, drawPct: 32.0 },

  // Bird, Larsen, Grob & Others
  { eco: 'A02', name: "Bird's Opening", moves: ['f4'], movesStr: '1.f4', whiteWinPct: 35.1, blackWinPct: 40.8, drawPct: 24.1 },
  { eco: 'A02', name: "Bird's Opening: From's Gambit", moves: ['f4', 'e5'], movesStr: '1.f4 e5', whiteWinPct: 42.0, blackWinPct: 42.0, drawPct: 16.0 },
  { eco: 'A01', name: "Nimzowitsch-Larsen Attack", moves: ['b3'], movesStr: '1.b3', whiteWinPct: 37.5, blackWinPct: 34.5, drawPct: 28.0 },
  { eco: 'A00', name: 'Sokolsky Opening (Polish)', moves: ['b4'], movesStr: '1.b4', whiteWinPct: 38.0, blackWinPct: 38.0, drawPct: 24.0 },
  { eco: 'A00', name: 'Grob Opening', moves: ['g4'], movesStr: '1.g4', whiteWinPct: 35.3, blackWinPct: 47.3, drawPct: 17.4 },
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
