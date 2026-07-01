// 슬롭 필터 — 도달을 죽이는 신호를 생성 단계에서 차단/경고.
const THROAT_CLEARING = [
  /here'?s a thought/i, /in today'?s (fast|busy)/i, /let'?s dive in/i,
  /excited to share/i, /without further ado/i, /in this post/i, /buckle up/i,
];

export const wordCount = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

// 표지 훅 검사: ≤10단어, 목 가다듬기 금지.
export function checkHook(s: string): string[] {
  const issues: string[] = [];
  if (wordCount(s) > 10) issues.push(`훅 ${wordCount(s)}단어(>10) — 더 짧게`);
  if (THROAT_CLEARING.some((re) => re.test(s))) issues.push('목 가다듬기 도입부 — 즉시 본론으로');
  return issues;
}

// 슬라이드 본문 검사: ≤20단어, 1아이디어.
export function checkSlide(s: string): string[] {
  const issues: string[] = [];
  if (wordCount(s) > 20) issues.push(`슬라이드 ${wordCount(s)}단어(>20) — 한 슬라이드 한 생각`);
  return issues;
}

// 생성 결과를 검사해 경고 목록 반환(차단이 아니라 가시화 — 사람 승인 큐와 결합).
export function auditPiece(hook: string, slides: string[]): string[] {
  const w: string[] = checkHook(hook).map((m) => `[cover] ${m}`);
  slides.forEach((s, i) => checkSlide(s).forEach((m) => w.push(`[slide ${i + 1}] ${m}`)));
  return w;
}
