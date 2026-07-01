// 캐러셀 파이프라인 — 코퍼스 인용(LLM 전개) 또는 콘텐츠 뱅크(완성형 Piece) → 덱 + 스트립.
// 사용법:
//   npm run deck [corpus] [preset] [limit] [-- --tone=ironic --palette=noir ...]
//   npm run deck -- --bank=satire-kr        완성형 뱅크 전체 렌더(키 불필요)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CORPORA } from './corpus/index.js';
import { BANKS } from './content/banks.js';
import { buildCaption } from './content/caption.js';
import { resolveRecipe, PRESETS } from './design/presets.js';
import type { RecipeOverrides } from './design/presets.js';
import type { BackgroundKind, Canvas, Recipe } from './design/types.js';
import { CANVAS, resolveCanvas } from './design/canvas.js';
import { BRAND } from './design/brand.js';
import { makeDeckCopy } from './generate/deck-copy.js';
import { renderDeck, renderStrip } from './carousel/deck.js';
import type { Piece } from './carousel/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outRoot = resolve(__dirname, '../out');
const isKorean = (s: string) => /[가-힣]/.test(s);

function parseArgs(argv: string[]) {
  let corpus = 'stoic';
  let limit: number | undefined;
  let ratio: string | undefined;
  let bank: string | undefined;
  let tone: 'earnest' | 'ironic' = 'earnest';
  const o: RecipeOverrides = {};
  for (const a of argv) {
    if (/^\d+$/.test(a)) limit = Number(a);
    else if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (k === 'layout') o.layout = v;
      else if (k === 'palette') o.palette = v;
      else if (k === 'type') o.type = v;
      else if (k === 'bg' || k === 'background') o.background = v as BackgroundKind;
      else if (k === 'ratio') ratio = v;
      else if (k === 'tone') tone = v === 'ironic' ? 'ironic' : 'earnest';
      else if (k === 'bank') bank = v;
    } else if (CORPORA[a]) corpus = a;
    else if (PRESETS[a]) o.preset = a;
    else throw new Error(`알 수 없는 인자: ${a}`);
  }
  return { corpus, limit, tone, bank, recipe: resolveRecipe(o), canvas: resolveCanvas(ratio, CANVAS.portrait) };
}

const GAP_TAGS_KR = '#풍자 #밈 #공감 #현실 #사이다 #웃긴글 #직장인 #짤';

function captionFor(piece: Piece): string {
  const market = isKorean(piece.quote ?? piece.hook) ? 'kr' : 'en';
  if (piece.tone === 'gap' || piece.tone === 'steps') {
    const trig = market === 'kr' ? '당신이 겪은 가장 큰 괴리는?' : 'Biggest gap you have lived?';
    return [piece.hook, '', piece.rehook ?? '', '', trig, '', GAP_TAGS_KR].join('\n');
  }
  return buildCaption({ market, hook: piece.hook, quote: piece.quote ?? piece.hook, author: piece.author ?? piece.eyebrow });
}

// Piece 하나 → 슬라이드 렌더 + 디스크 기록(+caption.txt)
async function emit(piece: Piece, label: string, recipe: Recipe, canvas: Canvas) {
  if (!piece.caption) piece.caption = captionFor(piece);
  const slides = await renderDeck(piece, recipe, BRAND.handle, canvas);
  const dir = resolve(outRoot, `deck-${label}`);
  mkdirSync(dir, { recursive: true });
  slides.forEach((buf, i) => writeFileSync(resolve(dir, `slide-${String(i + 1).padStart(2, '0')}.png`), buf));
  writeFileSync(resolve(dir, '_strip.png'), await renderStrip(slides, canvas));
  writeFileSync(resolve(dir, 'caption.txt'), piece.caption);
  console.log(`  ✓ ${label}: ${slides.length}슬라이드 → out/deck-${label}/`);
}

async function main() {
  const { corpus, limit, tone, bank, recipe, canvas } = parseArgs(process.argv.slice(2));

  if (bank) {
    const pieces = BANKS[bank];
    if (!pieces) throw new Error(`뱅크 없음: ${bank} (가능: ${Object.keys(BANKS).join(', ')})`);
    const items = pieces.slice(0, limit ?? pieces.length);
    console.log(`뱅크 렌더: [${bank}] ${items.length}편 · ${recipe.palette}/${recipe.type}/${recipe.background} · ${canvas.w}×${canvas.h}`);
    for (const p of items) await emit(p, `${bank}-${p.id}`, recipe, canvas);
    console.log('완료. _strip.png 로 전체 미리보기.');
    return;
  }

  const quotes = CORPORA[corpus];
  if (!quotes) throw new Error(`코퍼스 없음: ${corpus}`);
  const items = quotes.slice(0, limit ?? 1);
  console.log(`덱 생성: [${corpus}] ${items.length}개 · ${tone} · ${recipe.palette}/${recipe.type}/${recipe.background} · ${canvas.w}×${canvas.h}`);
  for (const q of items) {
    const piece = await makeDeckCopy(q, tone);
    await emit(piece, `${corpus}-${q.id}`, recipe, canvas);
  }
  console.log('완료. _strip.png 로 전체 미리보기.');
}

main().catch((e) => { console.error(e); process.exit(1); });
