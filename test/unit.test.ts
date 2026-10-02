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
