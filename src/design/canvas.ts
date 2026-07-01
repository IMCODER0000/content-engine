// 캔버스 비율 프리셋 — 단일 카드 기본 1:1, 캐러셀 기본 4:5(리서치 권고).
import type { Canvas } from './types.js';

// SNS 규격 프리셋 — 유명 플랫폼 권장 크기.
export const CANVAS: Record<string, Canvas> = {
  square: { w: 1080, h: 1080 }, // 1:1 인스타 피드
  portrait: { w: 1080, h: 1350 }, // 4:5 인스타 피드(세로, 최대 점유)
  story: { w: 1080, h: 1920 }, // 9:16 인스타/틱톡 스토리·릴스
  wide: { w: 1200, h: 675 }, // 16:9 X(트위터)·링크드인·유튜브 썸네일
  pin: { w: 1000, h: 1500 }, // 2:3 핀터레스트
};

export function resolveCanvas(name: string | undefined, fallback: Canvas): Canvas {
  if (!name) return fallback;
  const c = CANVAS[name];
  if (!c) throw new Error(`비율 없음: "${name}" (가능: ${Object.keys(CANVAS).join(', ')})`);
  return c;
}
