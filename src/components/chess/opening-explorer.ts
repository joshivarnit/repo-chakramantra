export interface BookMoveContinuation {
  san: string;
  uci: string;
  name?: string;
  games: number;
  whiteWinPct: number;
  drawPct: number;
  blackWinPct: number;
}

export interface OpeningPositionData {
  eco: string;
  name: string;
  moves: string[];
  movesStr: string;
  description?: string;
  continuations: BookMoveContinuation[];
}

// Tree node definition for opening book
interface OpeningTreeNode {
  eco: string;
  name: string;
  description?: string;
  children: Record<string, {
    node: OpeningTreeNode;
    games: number;
    whiteWinPct: number;
    drawPct: number;
    blackWinPct: number;
    uci: string;
  }>;
}

// Comprehensive Master Opening Tree
export const MASTER_OPENING_TREE: OpeningTreeNode = {
  eco: 'A00',
  name: 'Starting Position',
  description: 'Initial chess position before move 1.',
  children: {
    'e4': {
      games: 215480,
      whiteWinPct: 38.5,
      drawPct: 32.2,
      blackWinPct: 29.3,
      uci: 'e2e4',
      node: {
        eco: 'B00',
        name: "King's Pawn Game",
        description: 'The most popular first move in chess history, claiming central space.',
        children: {
          'c5': {
            games: 98450,
            whiteWinPct: 37.1,
            drawPct: 30.2,
            blackWinPct: 32.7,
            uci: 'c7c5',
            node: {
              eco: 'B20',
              name: 'Sicilian Defense',
              description: 'The sharpest, most combative response to 1.e4.',
              children: {
                'Nf3': {
                  games: 78500,
                  whiteWinPct: 37.8,
                  drawPct: 30.5,
                  blackWinPct: 31.7,
                  uci: 'g1f3',
                  node: {
                    eco: 'B27',
                    name: 'Sicilian Defense: Open Variation Prep',
                    children: {
                      'd6': {
                        games: 38200,
                        whiteWinPct: 38.2,
                        drawPct: 29.8,
                        blackWinPct: 32.0,
                        uci: 'd7d6',
                        node: {
                          eco: 'B50',
                          name: 'Sicilian Defense: Classical / Najdorf Setup',
                          children: {
                            'd4': {
                              games: 34100,
                              whiteWinPct: 38.5,
                              drawPct: 29.9,
                              blackWinPct: 31.6,
                              uci: 'd2d4',
                              node: {
                                eco: 'B53',
                                name: 'Sicilian: Open, Main Line',
                                children: {
                                  'cxd4': {
                                    games: 33500,
                                    whiteWinPct: 38.4,
                                    drawPct: 30.0,
                                    blackWinPct: 31.6,
                                    uci: 'c5d4',
                                    node: {
                                      eco: 'B54',
                                      name: 'Open Sicilian',
                                      children: {
                                        'Nxd4': {
                                          games: 33100,
                                          whiteWinPct: 38.4,
                                          drawPct: 30.1,
                                          blackWinPct: 31.5,
                                          uci: 'f3d4',
                                          node: {
                                            eco: 'B54',
                                            name: 'Open Sicilian: Recapture',
                                            children: {
                                              'Nf6': {
                                                games: 25400,
                                                whiteWinPct: 38.1,
                                                drawPct: 30.4,
                                                blackWinPct: 31.5,
                                                uci: 'g8f6',
                                                node: {
                                                  eco: 'B90',
                                                  name: 'Sicilian Defense: Najdorf / Scheveningen Prep',
                                                  children: {
                                                    'Nc3': {
                                                      games: 24900,
                                                      whiteWinPct: 38.2,
                                                      drawPct: 30.3,
                                                      blackWinPct: 31.5,
                                                      uci: 'b1c3',
                                                      node: {
                                                        eco: 'B90',
                                                        name: 'Sicilian: Modern Open Line',
                                                        children: {
                                                          'a6': {
                                                            games: 14200,
                                                            whiteWinPct: 37.9,
                                                            drawPct: 30.8,
                                                            blackWinPct: 31.3,
                                                            uci: 'a7a6',
                                                            node: {
                                                              eco: 'B90',
                                                              name: 'Sicilian Defense: Najdorf Variation',
                                                              description: 'The preferred weapon of Bobby Fischer and Garry Kasparov.',
                                                              children: {}
                                                            }
                                                          },
                                                          'g6': {
                                                            games: 4800,
                                                            whiteWinPct: 39.5,
                                                            drawPct: 28.2,
                                                            blackWinPct: 32.3,
                                                            uci: 'g7g6',
                                                            node: {
                                                              eco: 'B70',
                                                              name: 'Sicilian Defense: Dragon Variation',
                                                              description: 'Fiery tactical battleground with kings castled on opposite wings.',
                                                              children: {}
                                                            }
                                                          },
                                                          'e6': {
                                                            games: 5200,
                                                            whiteWinPct: 37.4,
                                                            drawPct: 32.1,
                                                            blackWinPct: 30.5,
                                                            uci: 'e7e6',
                                                            node: {
                                                              eco: 'B80',
                                                              name: 'Sicilian Defense: Scheveningen Variation',
                                                              children: {}
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              'a6': {
                                                games: 2400,
                                                whiteWinPct: 37.0,
                                                drawPct: 33.0,
                                                blackWinPct: 30.0,
                                                uci: 'a7a6',
                                                node: {
                                                  eco: 'B41',
                                                  name: "Sicilian: O'Kelly Variation",
                                                  children: {}
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      'Nc6': {
                        games: 23100,
                        whiteWinPct: 37.5,
                        drawPct: 31.0,
                        blackWinPct: 31.5,
                        uci: 'b8c6',
                        node: {
                          eco: 'B30',
                          name: 'Sicilian: Old / Classical Line',
                          children: {
                            'd4': {
                              games: 17200,
                              whiteWinPct: 38.1,
                              drawPct: 31.2,
                              blackWinPct: 30.7,
                              uci: 'd2d4',
                              node: {
                                eco: 'B32',
                                name: 'Sicilian: Open Classical',
                                children: {}
                              }
                            },
                            'Bb5': {
                              games: 4800,
                              whiteWinPct: 36.5,
                              drawPct: 34.2,
                              blackWinPct: 29.3,
                              uci: 'f1b5',
                              node: {
                                eco: 'B30',
                                name: 'Sicilian Defense: Rossolimo Attack',
                                description: 'Solid, positional weapon avoiding deep Sicilian theory.',
                                children: {}
                              }
                            }
                          }
                        }
                      },
                      'e6': {
                        games: 15400,
                        whiteWinPct: 37.1,
                        drawPct: 32.4,
                        blackWinPct: 30.5,
                        uci: 'e7e6',
                        node: {
                          eco: 'B40',
                          name: 'Sicilian Defense: French / Paulsen Setup',
                          children: {
                            'd4': {
                              games: 12200,
                              whiteWinPct: 37.8,
                              drawPct: 32.5,
                              blackWinPct: 29.7,
                              uci: 'd2d4',
                              node: {
                                eco: 'B40',
                                name: 'Sicilian Defense: Kan / Taimanov Prep',
                                children: {}
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                'Nc3': {
                  games: 9800,
                  whiteWinPct: 36.0,
                  drawPct: 33.2,
                  blackWinPct: 30.8,
                  uci: 'b1c3',
                  node: {
                    eco: 'B23',
                    name: 'Sicilian Defense: Closed Variation',
                    children: {}
                  }
                },
                'c3': {
                  games: 6200,
                  whiteWinPct: 36.8,
                  drawPct: 34.0,
                  blackWinPct: 29.2,
                  uci: 'c2c3',
                  node: {
                    eco: 'B22',
                    name: 'Sicilian Defense: Alapin Variation',
                    description: 'A solid system aiming for a full classical pawn center.',
                    children: {}
                  }
                }
              }
            }
          },
          'e5': {
            games: 71200,
            whiteWinPct: 39.5,
            drawPct: 33.5,
            blackWinPct: 27.0,
            uci: 'e7e5',
            node: {
              eco: 'C20',
              name: 'Open Game (1.e4 e5)',
              description: 'The classical foundation of chess strategy and tactics.',
              children: {
                'Nf3': {
                  games: 62400,
                  whiteWinPct: 40.1,
                  drawPct: 33.8,
                  blackWinPct: 26.1,
                  uci: 'g1f3',
                  node: {
                    eco: 'C40',
                    name: "King's Knight Opening",
                    children: {
                      'Nc6': {
                        games: 48900,
                        whiteWinPct: 40.4,
                        drawPct: 33.9,
                        blackWinPct: 25.7,
                        uci: 'b8c6',
                        node: {
                          eco: 'C44',
                          name: 'Normal Position (1.e4 e5 2.Nf3 Nc6)',
                          children: {
                            'Bb5': {
                              games: 28500,
                              whiteWinPct: 40.6,
                              drawPct: 34.8,
                              blackWinPct: 24.6,
                              uci: 'f1b5',
                              node: {
                                eco: 'C60',
                                name: 'Ruy Lopez (Spanish Opening)',
                                description: 'One of the oldest, richest, and most prestigious openings in chess.',
                                children: {
                                  'a6': {
                                    games: 17200,
                                    whiteWinPct: 40.2,
                                    drawPct: 35.1,
                                    blackWinPct: 24.7,
                                    uci: 'a7a6',
                                    node: {
                                      eco: 'C68',
                                      name: 'Ruy Lopez: Morphy Defense',
                                      children: {
                                        'Ba4': {
                                          games: 14100,
                                          whiteWinPct: 40.5,
                                          drawPct: 35.5,
                                          blackWinPct: 24.0,
                                          uci: 'b5a4',
                                          node: {
                                            eco: 'C70',
                                            name: 'Ruy Lopez: Morphy Defense, Main Line',
                                            children: {
                                              'Nf6': {
                                                games: 10200,
                                                whiteWinPct: 40.3,
                                                drawPct: 36.1,
                                                blackWinPct: 23.6,
                                                uci: 'g8f6',
                                                node: {
                                                  eco: 'C80',
                                                  name: 'Ruy Lopez: Closed / Open Prep',
                                                  children: {}
                                                }
                                              }
                                            }
                                          }
                                        },
                                        'Bxc6': {
                                          games: 2800,
                                          whiteWinPct: 38.9,
                                          drawPct: 36.0,
                                          blackWinPct: 25.1,
                                          uci: 'b5c6',
                                          node: {
                                            eco: 'C68',
                                            name: 'Ruy Lopez: Exchange Variation',
                                            description: 'Pioneered by Emanuel Lasker and Bobby Fischer.',
                                            children: {}
                                          }
                                        }
                                      }
                                    }
                                  },
                                  'Nf6': {
                                    games: 7800,
                                    whiteWinPct: 39.5,
                                    drawPct: 37.8,
                                    blackWinPct: 22.7,
                                    uci: 'g8f6',
                                    node: {
                                      eco: 'C65',
                                      name: 'Ruy Lopez: Berlin Defense',
                                      description: 'The infamous "Berlin Wall", popularised by Vladimir Kramnik against Kasparov.',
                                      children: {}
                                    }
                                  }
                                }
                              }
                            },
                            'Bc4': {
                              games: 14200,
                              whiteWinPct: 39.8,
                              drawPct: 33.2,
                              blackWinPct: 27.0,
                              uci: 'f1c4',
                              node: {
                                eco: 'C50',
                                name: 'Italian Game',
                                description: 'Romantic classical opening targeting the vulnerable f7 square.',
                                children: {
                                  'Bc5': {
                                    games: 8100,
                                    whiteWinPct: 39.2,
                                    drawPct: 34.0,
                                    blackWinPct: 26.8,
                                    uci: 'f8c5',
                                    node: {
                                      eco: 'C53',
                                      name: 'Italian Game: Giuoco Piano',
                                      description: 'The "Quiet Game", characterized by deep strategic maneuvering.',
                                      children: {
                                        'c3': {
                                          games: 5200,
                                          whiteWinPct: 39.8,
                                          drawPct: 34.5,
                                          blackWinPct: 25.7,
                                          uci: 'c2c3',
                                          node: {
                                            eco: 'C54',
                                            name: 'Italian: Giuoco Piano Main Line',
                                            children: {}
                                          }
                                        },
                                        'b4': {
                                          games: 1200,
                                          whiteWinPct: 41.2,
                                          drawPct: 28.5,
                                          blackWinPct: 30.3,
                                          uci: 'b2b4',
                                          node: {
                                            eco: 'C51',
                                            name: 'Italian Game: Evans Gambit',
                                            description: 'Aggressive pawn sacrifice for rapid development and attacking diagonals.',
                                            children: {}
                                          }
                                        }
                                      }
                                    }
                                  },
                                  'Nf6': {
                                    games: 5400,
                                    whiteWinPct: 40.5,
                                    drawPct: 32.5,
                                    blackWinPct: 27.0,
                                    uci: 'g8f6',
                                    node: {
                                      eco: 'C55',
                                      name: 'Italian Game: Two Knights Defense',
                                      children: {
                                        'Ng5': {
                                          games: 2400,
                                          whiteWinPct: 42.1,
                                          drawPct: 28.9,
                                          blackWinPct: 29.0,
                                          uci: 'f3g5',
                                          node: {
                                            eco: 'C57',
                                            name: 'Italian Game: Fried Liver / Knight Attack',
                                            description: 'High-voltage tactical showdown over the f7 pawn.',
                                            children: {}
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            'd4': {
                              games: 4800,
                              whiteWinPct: 39.2,
                              drawPct: 32.8,
                              blackWinPct: 28.0,
                              uci: 'd2d4',
                              node: {
                                eco: 'C45',
                                name: 'Scotch Game',
                                description: 'Direct central confrontation popularized by Garry Kasparov.',
                                children: {}
                              }
                            }
                          }
                        }
                      },
                      'Nf6': {
                        games: 8900,
                        whiteWinPct: 37.8,
                        drawPct: 38.5,
                        blackWinPct: 23.7,
                        uci: 'g8f6',
                        node: {
                          eco: 'C42',
                          name: "Petrov's Defense (Russian Game)",
                          description: 'Ultra-solid symmetric defense favored at world championship level.',
                          children: {}
                        }
                      }
                    }
                  }
                },
                'f4': {
                  games: 2100,
                  whiteWinPct: 38.5,
                  drawPct: 24.2,
                  blackWinPct: 37.3,
                  uci: 'f2f4',
                  node: {
                    eco: 'C30',
                    name: "King's Gambit",
                    description: 'The quintessential Romantic swashbuckling opening.',
                    children: {}
                  }
                }
              }
            }
          },
          'e6': {
            games: 24500,
            whiteWinPct: 38.7,
            drawPct: 33.1,
            blackWinPct: 28.2,
            uci: 'e7e6',
            node: {
              eco: 'C00',
              name: 'French Defense',
              description: 'Asymmetric, counter-attacking system targeting White d4 pawn.',
              children: {
                'd4': {
                  games: 23100,
                  whiteWinPct: 38.9,
                  drawPct: 33.2,
                  blackWinPct: 27.9,
                  uci: 'd2d4',
                  node: {
                    eco: 'C00',
                    name: 'French Defense: Main Line Setup',
                    children: {
                      'd5': {
                        games: 22800,
                        whiteWinPct: 38.9,
                        drawPct: 33.3,
                        blackWinPct: 27.8,
                        uci: 'd7d5',
                        node: {
                          eco: 'C02',
                          name: 'French Defense: Classical Clash',
                          children: {
                            'e5': {
                              games: 9100,
                              whiteWinPct: 39.5,
                              drawPct: 31.8,
                              blackWinPct: 28.7,
                              uci: 'e4e5',
                              node: {
                                eco: 'C02',
                                name: 'French Defense: Advance Variation',
                                children: {}
                              }
                            },
                            'Nc3': {
                              games: 8600,
                              whiteWinPct: 39.2,
                              drawPct: 33.5,
                              blackWinPct: 27.3,
                              uci: 'b1c3',
                              node: {
                                eco: 'C10',
                                name: 'French Defense: Winawer / Classical',
                                children: {}
                              }
                            },
                            'Nd2': {
                              games: 4400,
                              whiteWinPct: 38.1,
                              drawPct: 35.2,
                              blackWinPct: 26.7,
                              uci: 'b1d2',
                              node: {
                                eco: 'C03',
                                name: 'French Defense: Tarrasch Variation',
                                children: {}
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          'c6': {
            games: 18400,
            whiteWinPct: 38.2,
            drawPct: 36.4,
            blackWinPct: 25.4,
            uci: 'c7c6',
            node: {
              eco: 'B10',
              name: 'Caro-Kann Defense',
              description: 'Rock-solid defense with free light-squared bishop development.',
              children: {
                'd4': {
                  games: 17200,
                  whiteWinPct: 38.4,
                  drawPct: 36.5,
                  blackWinPct: 25.1,
                  uci: 'd2d4',
                  node: {
                    eco: 'B12',
                    name: 'Caro-Kann: Main Setup',
                    children: {
                      'd5': {
                        games: 16900,
                        whiteWinPct: 38.4,
                        drawPct: 36.6,
                        blackWinPct: 25.0,
                        uci: 'd7d5',
                        node: {
                          eco: 'B12',
                          name: 'Caro-Kann: Main Board',
                          children: {
                            'e5': {
                              games: 7800,
                              whiteWinPct: 38.9,
                              drawPct: 34.2,
                              blackWinPct: 26.9,
                              uci: 'e4e5',
                              node: {
                                eco: 'B12',
                                name: 'Caro-Kann Defense: Advance Variation',
                                children: {}
                              }
                            },
                            'Nc3': {
                              games: 6100,
                              whiteWinPct: 38.8,
                              drawPct: 37.5,
                              blackWinPct: 23.7,
                              uci: 'b1c3',
                              node: {
                                eco: 'B15',
                                name: 'Caro-Kann: Classical Variation',
                                children: {}
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          'd5': {
            games: 8900,
            whiteWinPct: 39.8,
            drawPct: 29.5,
            blackWinPct: 30.7,
            uci: 'd7d5',
            node: {
              eco: 'B01',
              name: 'Scandinavian Defense',
              description: 'Direct strike at the White center on move 1.',
              children: {}
            }
          }
        }
      }
    },
    'd4': {
      games: 168900,
      whiteWinPct: 39.6,
      drawPct: 35.8,
      blackWinPct: 24.6,
      uci: 'd2d4',
      node: {
        eco: 'A40',
        name: "Queen's Pawn Game",
        description: 'Strategic, positional game controlling central squares.',
        children: {
          'd5': {
            games: 84200,
            whiteWinPct: 40.1,
            drawPct: 36.2,
            blackWinPct: 23.7,
            uci: 'd7d5',
            node: {
              eco: 'D00',
              name: 'Closed Game (1.d4 d5)',
              children: {
                'c4': {
                  games: 67800,
                  whiteWinPct: 40.8,
                  drawPct: 36.5,
                  blackWinPct: 22.7,
                  uci: 'c2c4',
                  node: {
                    eco: 'D06',
                    name: "Queen's Gambit",
                    description: 'Temporary pawn sacrifice to dominate the center with pawns.',
                    children: {
                      'e6': {
                        games: 34200,
                        whiteWinPct: 39.8,
                        drawPct: 38.4,
                        blackWinPct: 21.8,
                        uci: 'e7e6',
                        node: {
                          eco: 'D30',
                          name: "Queen's Gambit Declined (QGD)",
                          description: 'Classical, impenetrable stronghold used in countless World Championships.',
                          children: {
                            'Nc3': {
                              games: 21500,
                              whiteWinPct: 40.5,
                              drawPct: 38.1,
                              blackWinPct: 21.4,
                              uci: 'b1c3',
                              node: {
                                eco: 'D31',
                                name: 'QGD: Main Setup',
                                children: {
                                  'Nf6': {
                                    games: 18400,
                                    whiteWinPct: 40.2,
                                    drawPct: 38.5,
                                    blackWinPct: 21.3,
                                    uci: 'g8f6',
                                    node: {
                                      eco: 'D35',
                                      name: 'QGD: Classical Defense',
                                      children: {}
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      'c6': {
                        games: 21200,
                        whiteWinPct: 39.2,
                        drawPct: 39.1,
                        blackWinPct: 21.7,
                        uci: 'c7c6',
                        node: {
                          eco: 'D10',
                          name: 'Slav Defense',
                          description: 'Sturdy pawn triangle maintaining options for the c8 bishop.',
                          children: {}
                        }
                      },
                      'dxc4': {
                        games: 7800,
                        whiteWinPct: 42.1,
                        drawPct: 33.2,
                        blackWinPct: 24.7,
                        uci: 'd5c4',
                        node: {
                          eco: 'D20',
                          name: "Queen's Gambit Accepted (QGA)",
                          children: {}
                        }
                      }
                    }
                  }
                },
                'Nf3': {
                  games: 9800,
                  whiteWinPct: 38.2,
                  drawPct: 37.1,
                  blackWinPct: 24.7,
                  uci: 'g1f3',
                  node: {
                    eco: 'D02',
                    name: "Queen's Pawn: London / Colle Setup",
                    children: {}
                  }
                },
                'Bf4': {
                  games: 5200,
                  whiteWinPct: 39.1,
                  drawPct: 36.4,
                  blackWinPct: 24.5,
                  uci: 'c1f4',
                  node: {
                    eco: 'D00',
                    name: 'London System',
                    description: 'Popular harmonious setup with high solidity and ease of play.',
                    children: {}
                  }
                }
              }
            }
          },
          'Nf6': {
            games: 68400,
            whiteWinPct: 39.2,
            drawPct: 35.9,
            blackWinPct: 24.9,
            uci: 'g8f6',
            node: {
              eco: 'A45',
              name: 'Indian Defense',
              description: 'Hypermodern counter-strategy provoking White pawn advances.',
              children: {
                'c4': {
                  games: 58200,
                  whiteWinPct: 39.6,
                  drawPct: 36.2,
                  blackWinPct: 24.2,
                  uci: 'c2c4',
                  node: {
                    eco: 'E00',
                    name: 'Indian Defense: Main Setup',
                    children: {
                      'g6': {
                        games: 24100,
                        whiteWinPct: 40.1,
                        drawPct: 33.5,
                        blackWinPct: 26.4,
                        uci: 'g7g6',
                        node: {
                          eco: 'E60',
                          name: "King's Indian / Grünfeld Defense",
                          description: 'Fierce attacking possibilities for Black on the kingside.',
                          children: {}
                        }
                      },
                      'e6': {
                        games: 23400,
                        whiteWinPct: 39.2,
                        drawPct: 38.5,
                        blackWinPct: 22.3,
                        uci: 'e7e6',
                        node: {
                          eco: 'E10',
                          name: 'Nimzo-Indian / Queen\'s Indian Prep',
                          children: {}
                        }
                      },
                      'c5': {
                        games: 6200,
                        whiteWinPct: 39.5,
                        drawPct: 34.0,
                        blackWinPct: 26.5,
                        uci: 'c7c5',
                        node: {
                          eco: 'A60',
                          name: 'Benoni Defense',
                          children: {}
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    'c4': {
      games: 34200,
      whiteWinPct: 38.8,
      drawPct: 37.1,
      blackWinPct: 24.1,
      uci: 'c2c4',
      node: {
        eco: 'A10',
        name: 'English Opening',
        description: 'Flank opening asserting diagonal and central pressure.',
        children: {
          'e5': {
            games: 12400,
            whiteWinPct: 38.5,
            drawPct: 36.2,
            blackWinPct: 25.3,
            uci: 'e7e5',
            node: {
              eco: 'A20',
              name: 'English: Reversed Sicilian',
              children: {}
            }
          },
          'Nf6': {
            games: 11800,
            whiteWinPct: 39.1,
            drawPct: 38.0,
            blackWinPct: 22.9,
            uci: 'g8f6',
            node: {
              eco: 'A15',
              name: 'English: Anglo-Indian Defense',
              children: {}
            }
          },
          'c5': {
            games: 5200,
            whiteWinPct: 37.2,
            drawPct: 41.5,
            blackWinPct: 21.3,
            uci: 'c7c5',
            node: {
              eco: 'A30',
              name: 'English: Symmetrical Variation',
              children: {}
            }
          }
        }
      }
    },
    'Nf3': {
      games: 21400,
      whiteWinPct: 38.4,
      drawPct: 38.2,
      blackWinPct: 23.4,
      uci: 'g1f3',
      node: {
        eco: 'A04',
        name: 'Réti Opening',
        description: 'Flexible hypermodern system keeping pawn commitments open.',
        children: {
          'd5': {
            games: 10200,
            whiteWinPct: 38.7,
            drawPct: 38.5,
            blackWinPct: 22.8,
            uci: 'd7d5',
            node: {
              eco: 'A06',
              name: 'Réti: Classical Defense',
              children: {}
            }
          },
          'Nf6': {
            games: 6800,
            whiteWinPct: 37.9,
            drawPct: 39.4,
            blackWinPct: 22.7,
            uci: 'g8f6',
            node: {
              eco: 'A05',
              name: 'Réti: King\'s Indian Setup',
              children: {}
            }
          }
        }
      }
    }
  }
};

/**
 * Traverse the Master Opening Tree for a sequence of SAN moves
 */
export function getOpeningPositionData(moves: string[]): OpeningPositionData {
  let currentNode = MASTER_OPENING_TREE;
  const appliedMoves: string[] = [];

  for (const move of moves) {
    // Normalize SAN move for clean matching (strip +, #)
    const cleanSan = move.replace(/[+#]/, '');
    let matchedChild = currentNode.children[cleanSan];

    // If no direct SAN match, try matching keys case-insensitively or stripped
    if (!matchedChild) {
      const foundKey = Object.keys(currentNode.children).find(
        (k) => k.replace(/[+#]/, '').toLowerCase() === cleanSan.toLowerCase()
      );
      if (foundKey) {
        matchedChild = currentNode.children[foundKey];
      }
    }

    if (matchedChild) {
      currentNode = matchedChild.node;
      appliedMoves.push(move);
    } else {
      break;
    }
  }

  // Format continuations sorted by games count
  const continuations: BookMoveContinuation[] = Object.entries(currentNode.children)
    .map(([san, data]) => ({
      san,
      uci: data.uci,
      name: data.node.name,
      games: data.games,
      whiteWinPct: data.whiteWinPct,
      drawPct: data.drawPct,
      blackWinPct: data.blackWinPct,
    }))
    .sort((a, b) => b.games - a.games);

  // Format moves string (e.g. 1.e4 c5 2.Nf3)
  const movesFormattedParts: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      movesFormattedParts.push(`${Math.floor(i / 2) + 1}.${moves[i]}`);
    } else {
      movesFormattedParts.push(moves[i]);
    }
  }

  return {
    eco: currentNode.eco,
    name: currentNode.name,
    moves,
    movesStr: movesFormattedParts.join(' '),
    description: currentNode.description,
    continuations,
  };
}
