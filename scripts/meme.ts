// 밈 단일 카드 렌더러 — 포맷별 뱅크를 카드 PNG + 컨택트 스트립으로.
// 사용법: npm run meme [versus|headline|greentext|all] [-- --palette=signal]
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderCard } from '../src/design/render.js';
import { renderStrip } from '../src/carousel/deck.js';
import { CANVAS } from '../src/design/canvas.js';
import { BRAND } from '../src/design/brand.js';
import type { Recipe } from '../src/design/types.js';
import { VERSUS_KR, HEADLINE_KR, GREENTEXT_KR } from '../src/content/meme-kr.js';
import type { MemeCard } from '../src/content/meme-kr.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outRoot = resolve(__dirname, '../out');

const FORMATS: Record<string, { bank: MemeCard[]; recipe: Recipe }> = {
  versus: { bank: VERSUS_KR, recipe: { layout: 'versus', palette: 'fog', type: 'sans', background: 'solid' } },
  headline: { bank: HEADLINE_KR, recipe: { layout: 'headline', palette: 'ink-paper', type: 'mixed', background: 'grain' } },
  greentext: { bank: GREENTEXT_KR, recipe: { layout: 'greentext', palette: 'noir', type: 'sans', background: 'solid' } },
};

function paletteOverride(argv: string[]): string | undefined {
  const a = argv.find((x) => x.startsWith('--palette='));
  return a?.slice('--palette='.length);
}

async function renderFormat(name: string, palette?: string) {
  const f = FORMATS[name];
  if (!f) throw new Error(`포맷 없음: ${name} (가능: ${Object.keys(FORMATS).join(', ')}, all)`);
  const recipe = palette ? { ...f.recipe, palette } : f.recipe;
  const dir = resolve(outRoot, `meme-${name}`);
  mkdirSync(dir, { recursive: true });
  const buffers: Buffer[] = [];
  for (const card of f.bank) {
    const buf = await renderCard({ ...card.content, handle: card.content.handle ?? BRAND.handle }, recipe, CANVAS.portrait);
    writeFileSync(resolve(dir, `${card.id}.png`), buf);
    buffers.push(buf);
  }
  writeFileSync(resolve(dir, '_sheet.png'), await renderStrip(buffers, CANVAS.portrait));
  console.log(`  ✓ ${name}: ${f.bank.length}장 → out/meme-${name}/ (_sheet.png)`);
}

async function main() {
  const argv = process.argv.slice(2);
  const name = argv.find((a) => !a.startsWith('--')) ?? 'all';
  const palette = paletteOverride(argv);
  const names = name === 'all' ? Object.keys(FORMATS) : [name];
  for (const n of names) await renderFormat(n, palette);
  console.log('완료.');
}

main().catch((e) => { console.error(e); process.exit(1); });
