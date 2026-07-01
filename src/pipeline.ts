// 배치 파이프라인 — 코퍼스 × 레시피(레이아웃/팔레트/서체/배경) → 카드 PNG + 승인 매니페스트.
// 사용법:
//   npm run generate                         기본 레시피로 stoic
//   npm run generate korean editorial        한국어 + editorial 프리셋
//   npm run generate korean 3                코퍼스 + 개수
//   npm run generate -- --layout=swiss --palette=noir --type=sans --bg=gradient
//   (프리셋 위에 개별 축만 바꾸기: npm run generate noir -- --palette=forest)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CORPORA } from './corpus/index.js';
import { makeCopy } from './generate/copy.js';
import { renderCard } from './design/render.js';
import { resolveRecipe, PRESETS } from './design/presets.js';
import type { RecipeOverrides } from './design/presets.js';
import type { BackgroundKind, CardContent } from './design/types.js';
import { CANVAS, resolveCanvas } from './design/canvas.js';
import { BRAND } from './design/brand.js';
import { MANIFEST, loadManifest, saveManifest } from './manifest.js';
import type { CardEntry } from './manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');

function parseArgs(argv: string[]) {
  let corpus = 'stoic';
  let limit = Infinity;
  let ratio: string | undefined;
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
    } else if (CORPORA[a]) corpus = a;
    else if (PRESETS[a]) o.preset = a;
    else throw new Error(`알 수 없는 인자: ${a}`);
  }
  // 단일 카드 기본 = 1:1
  return { corpus, limit, recipe: resolveRecipe(o), canvas: resolveCanvas(ratio, CANVAS.square) };
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const { corpus, limit, recipe, canvas } = parseArgs(process.argv.slice(2));
  const quotes = CORPORA[corpus];
  if (!quotes) throw new Error(`코퍼스 없음: ${corpus} (가능: ${Object.keys(CORPORA).join(', ')})`);
  const items = quotes.slice(0, limit);
  const tag = `${recipe.layout}-${recipe.palette}-${recipe.type}-${recipe.background}`;
  console.log(`배치: [${corpus}] ${items.length}장 · 레시피 ${tag} · ${canvas.w}×${canvas.h} → ${outDir}`);

  const manifest = loadManifest(outDir);
  for (const q of items) {
    const content: CardContent = { text: q.text, author: q.author, source: q.source, handle: BRAND.handle };
    const card = await renderCard(content, recipe, canvas);
    const copy = await makeCopy(q);
    const png = `${corpus}__${q.id}__${recipe.layout}-${recipe.palette}.png`;
    writeFileSync(resolve(outDir, png), card);

    const prev = manifest[q.id];
    const entry: CardEntry = {
      id: q.id, corpus, png,
      caption: copy.caption, hashtags: copy.hashtags,
      author: q.author, source: q.source,
      status: prev?.status ?? 'pending',
    };
    manifest[q.id] = entry;
    console.log(`  ✓ ${png}  [${entry.status}]`);
  }
  saveManifest(outDir, manifest);
  console.log(`완료. 매니페스트: out/${MANIFEST}. 다음: npm run review`);
}

main().catch((e) => { console.error(e); process.exit(1); });
