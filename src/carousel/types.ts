// 캐러셀 콘텐츠 모델 — 리서치 검증 시퀀스:
// 표지(훅) → 긴장 → 전환 → 원문(중간, 히어로) → 적용 → 재훅(스크린샷 슬라이드) → CTA
export type Tone = 'earnest' | 'ironic' | 'gap' | 'steps';

export interface Piece {
  id: string;
  tone?: Tone; // earnest(기본) | ironic(bathos 풍자) | gap(이상 vs 현실 사회 풍자)
  eyebrow: string; // 표지 상단 라벨(gap: 명분의 출처 — 헌법/교과서/채용공고 등)
  hook: string; // 표지 훅(gap: 선언된 이상/명분)
  tension?: string; // 독자의 문제를 그의 언어로
  turn?: string; // earnest: 전환 / gap: "그런데, 현실은?" 피벗
  beats?: string[]; // gap: 모순되는 현실 사례들(슬라이드 1장씩, 번호 매김)
  quote?: string; // 원문(히어로, 슬라이드 4~5) — gap 톤에는 없음
  author?: string;
  source?: string;
  apply?: string; // 오늘 할 수 있는 한 가지
  rehook?: string; // 가장 인용하고픈 한 줄(스크린샷/DM 유발)
  cta: string; // 마무리(부드럽게)
  caption?: string; // 발행 캡션(리서치 스켈레톤)
  quoteLayout?: string; // 원문 슬라이드 레이아웃(기본 center)
}

export interface Slide {
  layout: string;
  content: import('../design/types.js').CardContent;
}
