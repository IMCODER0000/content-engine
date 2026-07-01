// 코퍼스 레지스트리 — 새 니치는 파일 추가 후 여기에 등록만 하면 확장 끝.
import type { Quote } from './stoic.js';
import { STOIC } from './stoic.js';
import { KOREAN } from './korean.js';

export const CORPORA: Record<string, Quote[]> = {
  stoic: STOIC,
  korean: KOREAN,
};

export type { Quote };
