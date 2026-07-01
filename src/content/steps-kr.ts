// 한국어 단계별 짤 뱅크 (steps 톤) — 상황을 1→N 단계로 에스컬레이션, 마지막에 펀치 + 랭킹 CTA.
import type { Piece } from '../carousel/types.js';

export const STEPS_KR: Piece[] = [
  {
    id: 'step-lunch', tone: 'steps', eyebrow: '직장인',
    hook: '점심 메뉴 고르는 4단계',
    beats: [
      '"아무거나 괜찮아요" — 진심 평화로운 부처 단계',
      '"음… 김치찌개?" — 슬슬 본심이 나옴',
      '"전 다 좋은데 면은 좀…" — 조건이 붙기 시작',
      '"그냥 제가 정할게요" — 아까 아무거나라며',
    ],
    rehook: '시계는 12시 38분.\n우리는 아직 로비에 있다.',
    cta: '넌 몇 단계? 댓글로 ㄱ',
  },
  {
    id: 'step-weekend', tone: 'steps', eyebrow: '주말',
    hook: '주말이 사라지는 3단계',
    beats: [
      '금요일 밤 — "내일부터 갓생" 굳은 다짐',
      '토요일 — 눈 뜨니 이미 오후 3시',
      '일요일 — 벌써 월요일이 걱정됨',
    ],
    rehook: '주말은 원래 이틀이 아니라\n반나절이었다.',
    cta: '공감하면 저장 ㄱ',
  },
];
