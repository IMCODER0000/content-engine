// 컨택트 시트 — 레이아웃 × 팔레트 조합을 한 장으로 모아 눈으로 고르게 한다.
// 사용법: npm run matrix
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { renderCard } from '../src/design/render.js';
import { PALETTES } from '../src/design/palettes.js';
import type { CardContent, Recipe } from '../src/design/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');

const CONTENT: CardContent = {
  text: 'We suffer more often in imagination than in reality.',
  author: 'Seneca', source: 'Letters · XIII', handle: '@your_handle',
};

const LAYOUTS = ['editorial', 'modern', 'swiss', 'center']; // 행
const PALS = ['ink-paper', 'noir', 'sand', 'midnight']; // 열

const TILE = 460, LABEL = 40, MARGIN = 48, GAPX = 24, GAPY = 40;
const COLS = PALS.length, ROWS = LAYOUTS.length;
const W = MARGIN * 2 + COLS * TILE + (COLS - 1) * GAPX;
const H = MARGIN * 2 + ROWS * (TILE + LABEL) + (ROWS - 1) * GAPY;

function recipeFor(layout: string, palette: string): Recipe {
  const mode = PALETTES[palette].mode;
  return {
    layout, palette,
    type: layout === 'modern' ? 'sans' : 'mixed',
    background: mode === 'dark' ? 'gradient' : 'grain',
  };
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const tiles: sharp.OverlayOptions[] = [];
  const labels: string[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const layout = LAYOUTS[r], palette = PALS[c];
      const left = MARGIN + c * (TILE + GAPX);
      const top = MARGIN + r * (TILE + LABEL + GAPY);
      const card = await renderCard(CONTENT, recipeFor(layout, palette));
      const small = await sharp(card).resize(TILE, TILE).png().toBuffer();
      tiles.push({ input: small, left, top });
      labels.push(
        `<text x="${left}" y="${top + TILE + 27}" font-family="sans-serif" font-size="23" fill="#2a2a2a">${layout} · ${palette}</text>`,
      );
      console.log(`  ✓ ${layout} · ${palette}`);
    }
  }

  const labelSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`,
  );
  const sheet = await sharp({ create: { width: W, height: H, channels: 4, background: '#f3f2ee' } })
    .composite([...tiles, { input: labelSvg, left: 0, top: 0 }])
    .png().toBuffer();

  writeFileSync(resolve(outDir, 'matrix.png'), sheet);
  console.log(`완료 → out/matrix.png  (${ROWS}×${COLS} = ${ROWS * COLS}조합)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
