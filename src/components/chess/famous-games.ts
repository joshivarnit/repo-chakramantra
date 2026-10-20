export interface FamousGame {
  id: string;
  white: string;
  black: string;
  event: string;
  year: number;
  result: string;
  eco: string;
  description: string;
  pgn: string;
}

export const FAMOUS_GAMES: FamousGame[] = [
  {
    id: "carlsen-anand-wcc-2014-g2",
    white: "Magnus Carlsen",
    black: "Viswanathan Anand",
    event: "World Chess Championship 2014 (Game 2)",
    year: 2014,
    result: "1-0",
    eco: "C65",
    description: "Carlsen's first victory in the 2014 Sochi rematch. After 12. Nxb6 cxb6, Carlsen exchanged Anand's dark-square bishop, gradually turning queenside pawn structure into a crushing endgame win.",
    pgn: `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. O-O d6 6. Re1 O-O 7. Bxc6 bxc6 8. h3 Re8 9. Nbd2 Nd7 10. Nc4 Bb6 11. a4 a5 12. Nxb6 cxb6 13. d4 Qc7 14. Ra3 Nf8 15. dxe5 dxe5 16. Nh4 Rd8 17. Qh5 f6 18. Nf5 Be6 19. Rg3 Ng6 20. h4 Bxf5 21. exf5 Nf4 22. Bxf4 exf4 23. Rc3 c5 24. Re6 Rab8 25. Rc4 Qd7 26. Kh2 Rf8 27. Rce4 Rb7 28. Qe2 b5 29. b3 bxa4 30. bxa4 Rb4 31. Re7 Qd6 32. Qf3 Rxe4 33. Qxe4 f3+ 34. g3 h5 35. Qb7 1-0`
  },
  {
    id: "carlsen-anand-wcc-2014-g11",
    white: "Magnus Carlsen",
    black: "Viswanathan Anand",
    event: "World Chess Championship 2014 (Game 11 - Title Decider)",
    year: 2014,
    result: "1-0",
    eco: "C67",
    description: "The championship-clinching game of the 2014 match in Sochi. Carlsen defended his world title 6.5-4.5 after a tense Berlin Defense where Anand sacrificed an exchange with 27...Rb4.",
    pgn: `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 9. h3 Ke8 10. Nc3 h5 11. Bf4 Be7 12. Rad1 Be6 13. Ng5 Rh6 14. g3 Bxg5 15. Bxg5 Rg6 16. h4 f6 17. exf6 gxf6 18. Bf4 Nxh4 19. f3 Rd8 20. Kf2 Rxd1 21. Nxd1 Nf5 22. Rh1 Bxa2 23. Rxh5 Be6 24. g4 Nd6 25. Rh7 Nf7 26. Ne3 Kd8 27. Nf5 c5 28. Ng3 Ne5 29. Rh8+ Rg8 30. Bxe5 fxe5 31. Rh5 Bxg4 32. fxg4 Rxg4 33. Rxe5 b6 34. Ne4 Rh4 35. Ke2 Rh6 36. b3 Kd7 37. Kd2 Kc6 38. Nc3 a6 39. Re4 Rh2+ 40. Kc1 Rh6 41. Kb2 Rg6 42. Nd1 Rh6 43. Ne3 Rg6 44. Re7 b5 45. Re5 1-0`
  },
  {
    id: "carlsen-anand-wcc-2014-g6",
    white: "Magnus Carlsen",
    black: "Viswanathan Anand",
    event: "World Chess Championship 2014 (Game 6)",
    year: 2014,
    result: "1-0",
    eco: "B41",
    description: "The infamous double-blunder game where Carlsen played 26. Kd2?? and Anand missed the winning 26...Nxe5! before Carlsen went on to win in 38 moves.",
    pgn: `1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. c4 Nf6 6. Nc3 Bb4 7. Qd3 d6 8. Be2 Nbd7 9. O-O O-O 10. Qe3 Bc5 11. Qd2 Ne5 12. b3 Bd7 13. Bb2 Qb6 14. Rad1 Rad8 15. h3 Bc6 16. Qe3 Ng6 17. f4 e5 18. fxe5 dxe5 19. Nd5 Bxd5 20. exd5 exd4 21. Bxd4 Bxd4 22. Rxd4 Rfe8 23. Qf2 Re5 24. Bf3 Rde8 25. Rd2 Qd6 26. Kd1 b6 27. Re2 Rxe2 28. Bxe2 Qe5 29. Kc2 Ne4 30. Qe3 Qd6 31. Bd3 Nf6 32. Qd4 Nd7 33. Bxg6 hxg6 34. Rf2 a5 35. Kd2 Nc5 36. Re2 Rxe2+ 37. Kxe2 Qe7+ 38. Qe3 Kf8 1-0`
  },
  {
    id: "carlsen-anand-wcc-2014-g3",
    white: "Viswanathan Anand",
    black: "Magnus Carlsen",
    event: "World Chess Championship 2014 (Game 3)",
    year: 2014,
    result: "1-0",
    eco: "D37",
    description: "Anand's brilliant preparation victory in Sochi with 1. d4, breaking Carlsen's Queen's Gambit Declined with powerful initiative.",
    pgn: `1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bf4 O-O 6. e3 c5 7. dxc5 Bxc5 8. a3 Nc6 9. Qc2 Qa5 10. O-O-O Be7 11. h4 Rd8 12. Ng5 g6 13. cxd5 exd5 14. Bd3 Nh5 15. g4 Bxg4 16. Rdg1 Nxf4 17. exf4 Nd4 18. Qb1 Bh5 19. f5 Rac8 20. fxg6 Rxc3+ 21. bxc3 Qxc3+ 22. Bc2 Ne2+ 23. Kd1 Nxg1+ 24. f3 Nxf3 25. gxf7+ Kh8 26. Kc1 Qd2+ 27. Kb2 Bf6+ 28. Ka2 Rc8 29. Rc1 Bg6 30. Ne6 Bxf7 31. Qxb7 Rxc2+ 32. Kb3 Rb2+ 33. Ka4 Rxb7 34. Rc8+ Bg8 1-0`
  },
  {
    id: "kasparov-deepblue-1997-g6",
    white: "Deep Blue",
    black: "Garry Kasparov",
    event: "Man vs Machine Rematch (1997 Game 6)",
    year: 1997,
    result: "1-0",
    eco: "B17",
    description: "Deep Blue's shocking knight sacrifice 8. Nxe6! in the Caro-Kann that broke Kasparov and marked the dawn of AI supercomputer supremacy in chess.",
    pgn: `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6 8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8 15. axb5 cxb5 16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0`
  },
  {
    id: "fischer-spassky-1972-g6",
    white: "Bobby Fischer",
    black: "Boris Spassky",
    event: "World Chess Championship 1972 (Game 6)",
    year: 1972,
    result: "1-0",
    eco: "D59",
    description: "Fischer's masterpiece Queen's Gambit Declined Tartakower Defense, so elegant that Spassky joined the audience in standing applause.",
    pgn: `1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`
  },
  {
    id: "anderssen-kieseritzky-1851",
    white: "Adolf Anderssen",
    black: "Lionel Kieseritzky",
    event: "The Immortal Game (1851)",
    year: 1851,
    result: "1-0",
    eco: "C33",
    description: "The most famous romantic chess game in history. Anderssen sacrifices both rooks, a bishop, and finally his queen to deliver checkmate with his remaining minor pieces.",
    pgn: `1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`
  },
  {
    id: "morphy-allies-1858",
    white: "Paul Morphy",
    black: "Duke of Brunswick & Count Isouard",
    event: "The Opera Game (Paris 1858)",
    year: 1858,
    result: "1-0",
    eco: "C41",
    description: "Played in a royal box at the Paris Opera House. Morphy demonstrates the absolute perfection of rapid piece development, open files, and sacrifice in an immortal 17-move brilliancy.",
    pgn: `1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`
  },
  {
    id: "byrne-fischer-1956",
    white: "Donald Byrne",
    black: "Bobby Fischer",
    event: "The Game of the Century (1956)",
    year: 1956,
    result: "0-1",
    eco: "D92",
    description: "13-year-old Bobby Fischer plays the game that stunned the global chess community, sacrificing his queen on move 17 with 17...Be6!! to launch an unstoppable windmill attack.",
    pgn: `1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`
  }
];

export interface MatchedGameResult {
  game: FamousGame;
  moveNumber?: number;
  moveIndex?: number;
}

export function findFamousGameByQuery(query: string): MatchedGameResult | null {
  const q = query.toLowerCase();

  // Extract move number if specified (e.g., "move 12", "move 15", "m12", "move: 12")
  let moveNumber: number | undefined;
  const moveMatch = q.match(/move\s*(\d+)/i) || q.match(/m(\d+)/i);
  if (moveMatch && moveMatch[1]) {
    moveNumber = parseInt(moveMatch[1], 10);
  }

  // 1. Magnus vs Anand / Viswanathan WCC 2014
  if (
    (q.includes("magnus") || q.includes("carlsen")) &&
    (q.includes("viswanathan") || q.includes("anand")) &&
    (q.includes("2014") || q.includes("world chess") || q.includes("wcc") || q.includes("championship"))
  ) {
    if (q.includes("game 11") || q.includes("g11")) {
      const g = FAMOUS_GAMES.find(x => x.id === "carlsen-anand-wcc-2014-g11")!;
      return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
    }
    if (q.includes("game 6") || q.includes("g6")) {
      const g = FAMOUS_GAMES.find(x => x.id === "carlsen-anand-wcc-2014-g6")!;
      return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
    }
    if (q.includes("game 3") || q.includes("g3")) {
      const g = FAMOUS_GAMES.find(x => x.id === "carlsen-anand-wcc-2014-g3")!;
      return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
    }
    // Default to Game 2 (the first classical win with the famous 12. Nxb6 move)
    const g = FAMOUS_GAMES.find(x => x.id === "carlsen-anand-wcc-2014-g2")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  // 2. Kasparov vs Deep Blue
  if (q.includes("deep blue") || (q.includes("kasparov") && q.includes("1997"))) {
    const g = FAMOUS_GAMES.find(x => x.id === "kasparov-deepblue-1997-g6")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  // 3. Fischer vs Spassky
  if ((q.includes("fischer") && q.includes("spassky")) || (q.includes("fischer") && q.includes("1972"))) {
    const g = FAMOUS_GAMES.find(x => x.id === "fischer-spassky-1972-g6")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  // 4. Immortal Game
  if (q.includes("immortal game") || (q.includes("anderssen") && q.includes("kieseritzky"))) {
    const g = FAMOUS_GAMES.find(x => x.id === "anderssen-kieseritzky-1851")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  // 5. Opera Game
  if (q.includes("opera") || (q.includes("morphy") && q.includes("brunswick"))) {
    const g = FAMOUS_GAMES.find(x => x.id === "morphy-allies-1858")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  // 6. Game of the Century
  if (q.includes("game of the century") || (q.includes("byrne") && q.includes("fischer"))) {
    const g = FAMOUS_GAMES.find(x => x.id === "byrne-fischer-1956")!;
    return { game: g, moveNumber, moveIndex: moveNumber ? moveNumber * 2 - 1 : undefined };
  }

  return null;
}
