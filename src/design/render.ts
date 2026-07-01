// 카드 렌더 — 레시피(레이아웃×팔레트×서체×배경)를 받아 1080² PNG 생성.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import type { CardContent, Recipe, Canvas, Palette } from './types.js';
import { PALETTES } from './palettes.js';
import { TYPEFACES } from './typefaces.js';
import { LAYOUTS } from './layouts.js';
import { satoriFonts } from './fonts.js';
import { renderBackground } from './backgrounds.js';
import { CANVAS } from './canvas.js';
import { setScale } from './util.js';

function pick<T>(reg: Record<string, T>, key: string, axis: string): T {
  const v = reg[key];
  if (!v) throw new Error(`${axis} 없음: "${key}" (가능: ${Object.keys(reg).join(', ')})`);
  return v;
}

export interface RenderOpts {
  bgImage?: Buffer;
  palette?: Partial<Palette>; // accent/bg/ink 등 사용자 색 오버라이드
  scale?: number; // 폰트 크기 배율(0.6~1.6)
  scrim?: { mode: 'even' | 'bottom' | 'top'; strength: number }; // 배경 이미지 가독성 막
}

export async function renderCard(content: CardContent, recipe: Recipe, canvas: Canvas = CANVAS.square, opts: RenderOpts = {}): Promise<Buffer> {
  const base = pick(PALETTES, recipe.palette, 'palette');
  const palette: Palette = opts.palette ? { ...base, ...opts.palette } : base;
  const type = pick(TYPEFACES, recipe.type, 'type');
  const layout = pick(LAYOUTS, recipe.layout, 'layout');

  setScale(opts.scale); // layout()은 동기 — 배율을 잡고 트리 생성
  const tree = layout(content, { palette, type, canvas });
  setScale(1);
  const svg = await satori(tree as never, { width: canvas.w, height: canvas.h, fonts: satoriFonts(type) as never });
  const textPng = new Resvg(svg, { fitTo: { mode: 'width', value: canvas.w }, background: 'rgba(0,0,0,0)' })
    .render().asPng();
  const bg = await renderBackground(palette, recipe.background, canvas, opts.bgImage, opts.scrim);
  return sharp(bg).composite([{ input: Buffer.from(textPng) }]).png().toBuffer();
}
