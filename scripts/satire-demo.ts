// 풍자(ironic) 캐러셀 데모 — bathos 구조(진지하게 쌓고 시시하게 착지).
// 오귀속("…, probably")과 현대 레퍼런스로 농담임을 명확히(Poe's law 회피).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderDeck, renderStrip } from '../src/carousel/deck.js';
import type { Piece } from '../src/carousel/types.js';
import type { Recipe } from '../src/design/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out/satire-demo');

const PIECE: Piece = {
  id: 'satire-demo',
  tone: 'ironic',
  eyebrow: 'Ancient Wisdom',
  hook: 'Timeless advice for your very modern problems.', // 셋업(데드팬)
  tension: 'The Stoics endured plague, exile, and war. You endured being left on read.', // 빌드
  quote: 'You have power over your notifications — not the people who ignore them.',
  author: 'Marcus Aurelius, probably', // 오귀속 = 농담 신호
  source: 'Meditations, allegedly',
  rehook: 'Anyway. Have you tried touching grass?', // 반전(deflation)
  cta: 'Please do not screenshot this.', // 반전 CTA
  quoteLayout: 'center',
};

const RECIPE: Recipe = { layout: 'cover', palette: 'bone', type: 'mixed', background: 'solid' };

async function main() {
  mkdirSync(outDir, { recursive: true });
  const slides = await renderDeck(PIECE, RECIPE, '@your_handle');
  slides.forEach((buf, i) => writeFileSync(resolve(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`), buf));
  writeFileSync(resolve(outDir, '_strip.png'), await renderStrip(slides));
  console.log(`✓ ${slides.length}슬라이드(ironic) → out/satire-demo/  (_strip.png 미리보기)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
