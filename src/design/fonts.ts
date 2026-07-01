// 폰트 로더 — Typeface 의 FontSpec[] 을 Satori 폰트 디스크립터로 변환(버퍼 캐시).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Typeface } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = resolve(__dirname, '../../assets/fonts');
const cache = new Map<string, Buffer>();

function buf(file: string): Buffer {
  if (!cache.has(file)) {
    const p = resolve(fontsDir, file);
    if (!existsSync(p)) throw new Error(`폰트 없음: ${file} — 먼저 \`npm run fonts\``);
    cache.set(file, readFileSync(p));
  }
  return cache.get(file)!;
}

export function satoriFonts(t: Typeface) {
  return t.fonts.map((f) => ({ name: f.family, data: buf(f.file), weight: f.weight, style: f.style }));
}
