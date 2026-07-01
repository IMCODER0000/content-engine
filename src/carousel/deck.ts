// 덱 렌더러 — Piece → 슬라이드 PNG 배열 + 가로 스트립 미리보기.
// 기존 디자인 시스템(renderCard)을 그대로 재사용. 페이지 인디케이터는 오버레이로 합성(레이아웃 비침투).
// 캐러셀 기본 캔버스 = 포트레이트 4:5.
import sharp from 'sharp';
import { renderCard } from '../design/render.js';
import { PALETTES } from '../design/palettes.js';
import { CANVAS } from '../design/canvas.js';
import type { Recipe, Canvas, Palette } from '../design/types.js';
import type { RenderOpts } from '../design/render.js';
import type { Piece, Slide } from './types.js';

// Piece 를 톤별 시퀀스로 전개(빈 필드는 건너뜀).
// earnest: 표지 → 긴장 → 전환 → 원문(히어로) → 적용 → 재훅 → CTA  (긴장을 해소)
// ironic : 표지(셋업) → 빌드 → 원문(가짜 진지함/오귀속) → 반전(deflation) → 반전 CTA  (해소 거부)
export function buildSlides(piece: Piece, handle: string): Slide[] {
  const slides: Slide[] = [];
  const pt = (text: string, label?: string): Slide => ({ layout: 'point', content: { text, label, author: '', source: '', handle } });
  const cover: Slide = { layout: 'cover', content: { text: piece.hook, kicker: piece.eyebrow, author: '', source: '', handle } };
  const quote: Slide = { layout: piece.quoteLayout ?? 'center', content: { text: piece.quote ?? '', author: piece.author ?? '', source: piece.source ?? '', handle } };
  const outroCta: Slide = { layout: 'outro', content: { text: piece.cta, author: handle, source: '', handle } };

  const statement = (text: string): Slide => ({ layout: 'statement', content: { text, author: '', source: '', handle } });

  if (piece.tone === 'ironic') {
    slides.push(cover);
    if (piece.tension) slides.push(pt(piece.tension)); // 빌드
    slides.push(quote); // 가짜 진지함(오귀속은 author/source 에)
    if (piece.rehook) slides.push(statement(piece.rehook)); // 반전
    slides.push(outroCta); // 반전 CTA
    return slides;
  }

  if (piece.tone === 'gap') {
    // 이상(표지) → "그런데, 현실은?" → 모순 사례(번호) → 펀치라인 → CTA
    slides.push(cover);
    if (piece.turn) slides.push(statement(piece.turn));
    (piece.beats ?? []).forEach((b, i) => slides.push(pt(b, String(i + 1))));
    if (piece.rehook) slides.push(statement(piece.rehook));
    slides.push(outroCta);
    return slides;
  }

  if (piece.tone === 'steps') {
    // 표지(제목+훅) → 단계(번호, 에스컬레이션) → 펀치라인 → 랭킹 CTA
    slides.push(cover);
    (piece.beats ?? []).forEach((b, i) => slides.push(pt(b, String(i + 1))));
    if (piece.rehook) slides.push(statement(piece.rehook));
    slides.push(outroCta);
    return slides;
  }

  slides.push(cover);
  if (piece.tension) slides.push(pt(piece.tension));
  if (piece.turn) slides.push(pt(piece.turn));
  slides.push(quote);
  if (piece.apply) slides.push(pt(piece.apply));
  if (piece.rehook) slides.push({ layout: 'statement', content: { text: piece.rehook, author: '', source: '', handle } });
  slides.push(outroCta);
  return slides;
}

// 하단 페이지 점 인디케이터(투명 배경). 활성=accent, 비활성=muted.
function dotsOverlay(paletteName: string, index: number, total: number, c: Canvas, override?: Partial<Palette>): Buffer {
  const p = { ...PALETTES[paletteName], ...override };
  const r = 7, gap = 28, y = c.h - 70;
  const w = total * (r * 2) + (total - 1) * gap;
  let x = c.w / 2 - w / 2 + r;
  const dots: string[] = [];
  for (let i = 0; i < total; i++) {
    const active = i === index;
    dots.push(`<circle cx="${x}" cy="${y}" r="${active ? r : r - 1.5}" fill="${active ? p.accent : p.muted}" opacity="${active ? 1 : 0.5}"/>`);
    x += r * 2 + gap;
  }
  return Buffer.from(`<svg width="${c.w}" height="${c.h}" xmlns="http://www.w3.org/2000/svg">${dots.join('')}</svg>`);
}

export async function renderDeck(piece: Piece, recipe: Recipe, handle: string, canvas: Canvas = CANVAS.portrait, opts: RenderOpts = {}): Promise<Buffer[]> {
  const slides = buildSlides(piece, handle);
  const out: Buffer[] = [];
  for (let i = 0; i < slides.length; i++) {
    const card = await renderCard(slides[i].content, { ...recipe, layout: slides[i].layout }, canvas, opts);
    const withDots = await sharp(card)
      .composite([{ input: dotsOverlay(recipe.palette, i, slides.length, canvas, opts.palette) }])
      .png().toBuffer();
    out.push(withDots);
  }
  return out;
}

// 가로 스트립 미리보기 — 전체 캐러셀을 한눈에(비율 유지).
export async function renderStrip(slides: Buffer[], canvas: Canvas = CANVAS.portrait): Promise<Buffer> {
  const tileW = 340, gap = 20, margin = 28;
  const tileH = Math.round(tileW * (canvas.h / canvas.w));
  const W = margin * 2 + slides.length * tileW + (slides.length - 1) * gap;
  const H = margin * 2 + tileH;
  const layers: sharp.OverlayOptions[] = [];
  for (let i = 0; i < slides.length; i++) {
    const small = await sharp(slides[i]).resize(tileW, tileH).png().toBuffer();
    layers.push({ input: small, left: margin + i * (tileW + gap), top: margin });
  }
  return sharp({ create: { width: W, height: H, channels: 4, background: '#e9e8e3' } })
    .composite(layers).png().toBuffer();
}
