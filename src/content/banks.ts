// 콘텐츠 뱅크 레지스트리 — 완성형 Piece 묶음(키 없이 발행 가능). 새 뱅크는 여기에 등록.
import type { Piece } from '../carousel/types.js';
import { SATIRE_KR } from './satire-kr.js';
import { SATIRE_GAP_KR } from './satire-gap-kr.js';
import { STEPS_KR } from './steps-kr.js';

export const BANKS: Record<string, Piece[]> = {
  'satire-kr': SATIRE_KR, // 고전 명언 데드팬(bathos)
  'satire-gap-kr': SATIRE_GAP_KR, // 이상 vs 현실 사회 풍자(밈/포스터)
  'steps-kr': STEPS_KR, // 단계별 짤(에스컬레이션)
};
