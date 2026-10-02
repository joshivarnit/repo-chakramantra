import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAKRA_TOPICS } from '../src/lib/constants';
import { publicAuthor, PUBLICATION_NAME } from '../src/lib/public-display';
import { classifyMove, parseBestMove, toFigurineNotation } from '../src/components/chess/chess-utils';
import { detectOpening } from '../src/components/chess/openings';

test('CHAKRA_TOPICS has 24 unique canonical topics', () => {
  assert.equal(CHAKRA_TOPICS.length, 24);
  const uniqueTopics = new Set(CHAKRA_TOPICS);
  assert.equal(uniqueTopics.size, 24);
  assert.ok(CHAKRA_TOPICS.includes('AI'));
  assert.ok(CHAKRA_TOPICS.includes('Neuroscience'));
  assert.ok(CHAKRA_TOPICS.includes('Quantum'));
});

test('publicAuthor returns default publication voice', () => {
  assert.equal(publicAuthor('John Doe'), PUBLICATION_NAME);
  assert.equal(publicAuthor(), PUBLICATION_NAME);
  assert.equal(publicAuthor(''), PUBLICATION_NAME);
});

test('classifyMove classifies centipawn loss accurately', () => {
  // Brilliant: cpl < -50 (e.g. cpl = 100 - 160 = -60)
  assert.equal(classifyMove(100, 160, false, 'e4'), 'brilliant');
  // Great: cpl <= 0 (e.g. cpl = 100 - 100 = 0)
  assert.equal(classifyMove(100, 100, false, 'e4'), 'great');
  // Good: cpl <= 10 (e.g. cpl = 100 - 95 = 5)
  assert.equal(classifyMove(100, 95, false, 'e4'), 'good');
  // Inaccuracy: cpl <= 50 (e.g. cpl = 100 - 60 = 40)
  assert.equal(classifyMove(100, 60, false, 'e4'), 'inaccuracy');
  // Mistake: cpl <= 150 (e.g. cpl = 100 - 0 = 100)
  assert.equal(classifyMove(100, 0, false, 'e4'), 'mistake');
  // Blunder: cpl > 150 (e.g. cpl = 100 - (-100) = 200)
  assert.equal(classifyMove(100, -100, false, 'e4'), 'blunder');
});

test('parseBestMove parses UCI move strings', () => {
  const normalMove = parseBestMove('e2e4');
  assert.deepEqual(normalMove, { from: 'e2', to: 'e4', promotion: undefined });

  const promoMove = parseBestMove('e7e8q');
  assert.deepEqual(promoMove, { from: 'e7', to: 'e8', promotion: 'q' });

  const invalidMove = parseBestMove('bad');
  assert.equal(invalidMove, null);
});

test('toFigurineNotation converts SAN letters to Unicode chess pieces', () => {
  assert.equal(toFigurineNotation('Nf3'), '♘f3');
  assert.equal(toFigurineNotation('Bb5'), '♗b5');
  assert.equal(toFigurineNotation('Qd1'), '♕d1');
  assert.equal(toFigurineNotation('Ke2'), '♔e2');
  assert.equal(toFigurineNotation('Re1'), '♖e1');
  assert.equal(toFigurineNotation('e4'), 'e4');
});

test('detectOpening identifies standard chess openings', () => {
  const ruyLopez = detectOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
  assert.ok(ruyLopez);
  assert.equal(ruyLopez?.name, 'Ruy Lopez');
  assert.equal(ruyLopez?.eco, 'C60');

  const italianGame = detectOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
  assert.ok(italianGame);
  assert.equal(italianGame?.name, 'Italian Game');

  const sicilian = detectOpening(['e4', 'c5']);
  assert.ok(sicilian);
  assert.equal(sicilian?.name, 'Sicilian Defense');

  assert.equal(detectOpening([]), null);
});

test('getOpeningPositionData traverses Master Opening Tree with grandmaster stats', async () => {
  const { getOpeningPositionData } = await import('../src/components/chess/opening-explorer');
  
  // Starting position test
  const startPos = getOpeningPositionData([]);
  assert.equal(startPos.eco, 'A00');
  assert.ok(startPos.continuations.length >= 4);
  const e4Move = startPos.continuations.find(c => c.san === 'e4');
  assert.ok(e4Move);
  assert.ok(e4Move.games > 100000);
  assert.ok(e4Move.whiteWinPct > 30);

  // Sicilian Defense test
  const sicilian = getOpeningPositionData(['e4', 'c5']);
  assert.equal(sicilian.eco, 'B20');
  assert.equal(sicilian.name, 'Sicilian Defense');
  const nf3 = sicilian.continuations.find(c => c.san === 'Nf3');
  assert.ok(nf3);
  assert.ok(nf3.games > 50000);

  // Ruy Lopez test
  const ruyLopez = getOpeningPositionData(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
  assert.equal(ruyLopez.eco, 'C60');
  assert.ok(ruyLopez.name.includes('Ruy Lopez'));
  const a6 = ruyLopez.continuations.find(c => c.san === 'a6');
  assert.ok(a6);
  assert.ok(a6.name?.includes('Morphy Defense'));
});

test('eval mate formatting formats forced mates correctly', () => {
  const formatMate = (isMate: boolean, mateIn: number, evalCp: number) => {
    return isMate
      ? (mateIn > 0 ? `M${Math.abs(mateIn)}` : `-M${Math.abs(mateIn)}`)
      : ((evalCp >= 0 ? '+' : '') + (evalCp / 100).toFixed(2));
  };

  assert.equal(formatMate(true, 3, 10000), 'M3');
  assert.equal(formatMate(true, -2, -10000), '-M2');
  assert.equal(formatMate(true, 1, 10000), 'M1');
  assert.equal(formatMate(false, 0, 154), '+1.54');
  assert.equal(formatMate(false, 0, -85), '-0.85');
  assert.equal(formatMate(false, 0, 0), '+0.00');
});

