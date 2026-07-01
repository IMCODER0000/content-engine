// 공용 유틸 — 하이퍼스크립트 + 색 보간 + 동적 폰트 크기.
export const h = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

function hexToRgb(hex: string): [number, number, number] {
  const x = hex.replace('#', '');
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
// a→b 를 t(0~1)만큼 섞음
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

// 전역 폰트 크기 배율 — renderCard가 layout() 직전에 설정(동기 구간이라 동시요청 안전).
let SCALE = 1;
export const setScale = (n: unknown) => { SCALE = typeof n === 'number' && n > 0 ? Math.max(0.6, Math.min(1.6, n)) : 1; };

// 글자 수에 따라 본문 크기를 보간 (긴 인용은 작게) × 전역 배율
export function fitSize(len: number, max: number, min: number, from = 60, to = 220): number {
  const base = len <= from ? max : len >= to ? min : max - ((len - from) / (to - from)) * (max - min);
  return Math.round(base * SCALE);
}

// 형광펜 마크업 파싱: "**강조**" → 세그먼트 배열
export interface Seg { t: 't' | 'm'; s: string }
export function parseMarks(line: string): Seg[] {
  const out: Seg[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > i) out.push({ t: 't', s: line.slice(i, m.index) });
    out.push({ t: 'm', s: m[1] });
    i = m.index + m[0].length;
  }
  if (i < line.length) out.push({ t: 't', s: line.slice(i) });
  return out.length ? out : [{ t: 't', s: line }];
}

// 전각(한중일) 글자 판정 — 줄폭 추정에 사용
function isWide(code: number): boolean {
  return (
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x2e80 && code <= 0x9fff) || // CJK 부수~통합한자
    (code >= 0xac00 && code <= 0xd7a3) || // 한글 음절
    (code >= 0x3000 && code <= 0x30ff) || // CJK 문장부호·가나
    (code >= 0xff00 && code <= 0xffef)    // 전각
  );
}

// 어절 너비 추정(폰트 메트릭 없이) — 라틴은 글자별 가중, 전각은 ~1em
function wordWidth(w: string, fontSize: number): number {
  let s = 0;
  for (const ch of w) {
    const code = ch.codePointAt(0) ?? 0;
    if (isWide(code)) s += fontSize * 0.98;
    else if ("iIl|.,'!:;ift()[]".includes(ch)) s += fontSize * 0.3;
    else if ('mwMW@'.includes(ch)) s += fontSize * 0.86;
    else s += fontSize * 0.53;
  }
  return s;
}

// 광학적 줄 균형 — 어절을 공백으로 끊되 줄 길이를 고르게 맞춰 고아 단어를 방지.
// 줄 배열을 반환. 호출측은 각 줄을 별도 div 로 렌더(= Satori \n 처리 의존 없음, 결정적).
export function balanceLines(text: string, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 3) return [text];
  const space = fontSize * 0.3;
  const widths = words.map((w) => wordWidth(w, fontSize));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  const lines = Math.max(1, Math.round(total / maxWidth + 0.34));
  if (lines <= 1) return [text];
  const target = total / lines;
  const out: string[] = [];
  let cur: string[] = [];
  let curW = 0;
  for (let i = 0; i < words.length; i++) {
    const add = widths[i] + (cur.length ? space : 0);
    if (cur.length && curW + add > target * 1.04 && out.length < lines - 1) {
      out.push(cur.join(' '));
      cur = [words[i]];
      curW = widths[i];
    } else {
      cur.push(words[i]);
      curW += add;
    }
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}
