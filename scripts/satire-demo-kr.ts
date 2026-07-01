// 한국어 풍자(ironic) 데모 — bathos 구조 + 한글 세리프(나눔명조 폴백).
// 오귀속("…, 아마도" / "추정")으로 농담임을 명확히.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderDeck, renderStrip } from '../src/carousel/deck.js';
import type { Piece } from '../src/carousel/types.js';
import type { Recipe } from '../src/design/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out/satire-demo-kr');

const PIECE: Piece = {
  id: 'satire-kr',
  tone: 'ironic',
  eyebrow: '동양 고전',
  hook: '2500년 전 지혜로 오늘의 당신을 위로합니다.', // 셋업(데드팬)
  tension: '공자는 천하를 떠돌며 도를 구했고, 당신은 와이파이를 찾아 카페를 떠돕니다.', // 빌드
  quote: '아는 것을 안다 하고 모르는 것을 모른다 하라. 단, 단톡방에서는 그냥 읽씹하라.',
  author: '공자, 아마도', // 오귀속 = 농담 신호
  source: '논어, 추정',
  rehook: '그래서, 잔디는 좀 밟아 보셨습니까?', // 반전(deflation)
  cta: '이 글은 캡처하지 마세요.', // 반전 CTA
  quoteLayout: 'center',
};

const RECIPE: Recipe = { layout: 'cover', palette: 'ink-paper', type: 'mixed', background: 'grain' };

async function main() {
  mkdirSync(outDir, { recursive: true });
  const slides = await renderDeck(PIECE, RECIPE, '@your_handle');
  slides.forEach((buf, i) => writeFileSync(resolve(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`), buf));
  writeFileSync(resolve(outDir, '_strip.png'), await renderStrip(slides));
  console.log(`✓ ${slides.length}슬라이드(한국어 풍자) → out/satire-demo-kr/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
