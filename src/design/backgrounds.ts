// 배경 렌더 — 배경 축. solid / gradient / grain. (추후 image API 배경도 여기에 추가)
import sharp from 'sharp';
import type { Palette, BackgroundKind, Canvas } from './types.js';
import { mix } from './util.js';

function grainOverlay(c: Canvas): Promise<Buffer> {
  const svg = `<svg width="${c.w}" height="${c.h}" xmlns="http://www.w3.org/2000/svg">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return sharp(Buffer.from(svg)).grayscale().linear(0.09, 116).png().toBuffer();
}

function gradientSvg(p: Palette, c: Canvas): Buffer {
  const to = p.bgTo ?? mix(p.bg, p.mode === 'dark' ? '#000000' : '#ffffff', 0.14);
  return Buffer.from(
    `<svg width="${c.w}" height="${c.h}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="72%" y2="100%">
        <stop offset="0%" stop-color="${p.bg}"/><stop offset="100%" stop-color="${to}"/>
      </linearGradient></defs>
      <rect width="${c.w}" height="${c.h}" fill="url(#g)"/></svg>`,
  );
}

export interface Scrim { mode: 'even' | 'bottom' | 'top'; strength: number }

// 사진 위 가독성 막(스크림) — even(전체) / bottom(아래로 짙게) / top(위로 짙게).
function scrimSvg(p: Palette, c: Canvas, s: Scrim): Buffer {
  const a = Math.max(0, Math.min(0.85, s.strength));
  if (s.mode === 'even') {
    return Buffer.from(`<svg width="${c.w}" height="${c.h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${p.bg}" fill-opacity="${a}"/></svg>`);
  }
  const stops = s.mode === 'bottom'
    ? `<stop offset="0%" stop-color="${p.bg}" stop-opacity="0"/><stop offset="55%" stop-color="${p.bg}" stop-opacity="${a * 0.5}"/><stop offset="100%" stop-color="${p.bg}" stop-opacity="${Math.min(0.96, a + 0.2)}"/>`
    : `<stop offset="0%" stop-color="${p.bg}" stop-opacity="${Math.min(0.96, a + 0.2)}"/><stop offset="45%" stop-color="${p.bg}" stop-opacity="${a * 0.5}"/><stop offset="100%" stop-color="${p.bg}" stop-opacity="0"/>`;
  return Buffer.from(`<svg width="${c.w}" height="${c.h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs><rect width="100%" height="100%" fill="url(#s)"/></svg>`);
}

// 배경 버퍼(캔버스 크기) 생성. 텍스트 레이어는 호출측에서 위에 합성.
// bgImage 제공 시(kind 'image'): 업로드/생성 이미지를 cover로 채우고 스크림으로 가독성 확보.
export async function renderBackground(p: Palette, kind: BackgroundKind, c: Canvas, bgImage?: Buffer, scrim?: Scrim): Promise<Buffer> {
  if (kind === 'image' && bgImage) {
    const img = await sharp(bgImage).resize(c.w, c.h, { fit: 'cover' }).toBuffer();
    const s = scrim ?? { mode: 'even', strength: 0.34 };
    return sharp(img).composite([{ input: scrimSvg(p, c, s) }]).png().toBuffer();
  }
  if (kind === 'gradient') {
    return sharp(gradientSvg(p, c)).png().toBuffer();
  }
  const base = sharp({ create: { width: c.w, height: c.h, channels: 4, background: p.bg } });
  if (kind === 'grain') {
    return base.composite([{ input: await grainOverlay(c), blend: 'overlay' }]).png().toBuffer();
  }
  return base.png().toBuffer(); // solid
}
