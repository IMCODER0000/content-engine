// 캐러셀 데모 — 손으로 쓴 풍부한 Piece로 모든 슬라이드 타입(표지/전개×3/원문/CTA)을 보여준다.
// (API 키 없이도 전개 슬라이드까지 시연하기 위함)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderDeck, renderStrip } from '../src/carousel/deck.js';
import type { Piece } from '../src/carousel/types.js';
import type { Recipe } from '../src/design/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out/deck-demo');

const PIECE: Piece = {
  id: 'demo',
  eyebrow: 'Stoicism',
  hook: 'You control less than you think — and that frees you.', // 표지(긴장)
  tension: 'You replay the argument. You rehearse the worst. None of it is happening now.',
  turn: 'Marcus Aurelius ran an empire by refusing to fight what he could not move.',
  quote: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
  author: 'Marcus Aurelius',
  source: 'Meditations, Book VIII',
  apply: 'Next time you spiral, name one thing in the scene you actually control. Act only on that.',
  rehook: 'Peace is a skill, not a mood.', // 스크린샷 슬라이드
  cta: 'If this resonated,\nfollow for a daily reflection.',
  quoteLayout: 'center',
};

const RECIPE: Recipe = { layout: 'cover', palette: 'ink-paper', type: 'mixed', background: 'grain' };

async function main() {
  mkdirSync(outDir, { recursive: true });
  const slides = await renderDeck(PIECE, RECIPE, '@your_handle');
  slides.forEach((buf, i) => writeFileSync(resolve(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`), buf));
  writeFileSync(resolve(outDir, '_strip.png'), await renderStrip(slides));
  console.log(`✓ ${slides.length}슬라이드 → out/deck-demo/  (_strip.png 미리보기)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
