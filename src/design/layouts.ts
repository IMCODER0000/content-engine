// 레이아웃 레지스트리 — 구성 축. 각 함수는 토큰(팔레트/서체/캔버스)을 받아 Satori 트리를 만든다.
// 팔레트·서체·비율과 독립이므로 자유 조합 가능. 인용문은 광학적 줄 균형(줄별 div) 적용.
import type { LayoutFn, CardContent } from './types.js';
import { h, fitSize, balanceLines, mix, parseMarks } from './util.js';

// 형광펜 칩 스타일(노랑 마커 + 어두운 글자)
const MARK = { background: '#ffe600', color: '#1a1a1a', borderRadius: 8, paddingLeft: 10, paddingRight: 10, marginLeft: 2, marginRight: 2 };

// 균형 잡힌 줄들을 줄별 div 로 렌더(결정적 — Satori \n 처리에 의존하지 않음).
// quoted=true 면 첫 줄 앞 “ , 마지막 줄 뒤 ” 부착. center=true 면 가운데 정렬.
function quoteBlock(
  lines: string[],
  line: Record<string, unknown>,
  opts: { quoted?: boolean; center?: boolean } = {},
) {
  const arr = opts.quoted
    ? lines.map((l, i) => (i === 0 ? '“' : '') + l + (i === lines.length - 1 ? '”' : ''))
    : lines;
  const renderLine = (l: string) => {
    const segs = parseMarks(l);
    if (segs.length === 1 && segs[0].t === 't') return h('div', { style: { ...line, wordBreak: 'keep-all' } }, l);
    // 형광펜 포함 줄: 세그먼트를 인라인(flex row)으로
    return h('div', { style: { ...line, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: opts.center ? 'center' : 'flex-start' } },
      ...segs.map((sg) => h('div', { style: { ...line, ...(sg.t === 'm' ? MARK : {}) } }, sg.s)));
  };
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: opts.center ? 'center' : 'flex-start' } },
    ...arr.map(renderLine),
  );
}

const handle = (c: CardContent, cw: number, color: string, align: 'left' | 'center' | 'right' = 'left') =>
  h('div', {
    style: {
      position: 'absolute', bottom: 110,
      ...(align === 'right' ? { right: 110 } : { left: 110 }),
      ...(align === 'center' ? { width: cw - 220, textAlign: 'center', left: 110 } : {}),
      fontSize: 21, color, letterSpacing: 1, fontFamily: 'Inter',
    },
  }, c.handle ?? '@your_handle');

// 1) Editorial — 키커 + 세리프 인용 + 헤어라인 + 메타 (좌측)
const editorial: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 78, 44);
  const lines = balanceLines(c.text, size, 816);
  return h('div', {
    style: { width: w, height: ht, padding: 132, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    c.kicker ? h('div', { style: { fontSize: 22, letterSpacing: 5, fontWeight: 600, color: p.accent, marginBottom: 38, fontFamily: t.type.body } }, c.kicker.toUpperCase()) : '',
    quoteBlock(lines, { fontSize: size, lineHeight: 1.3, letterSpacing: -0.5, fontWeight: 400 }, { quoted: true }),
    h('div', { style: { width: 64, height: 3, background: p.accent, marginTop: 46, marginBottom: 32 } }, ''),
    h('div', { style: { fontSize: 31, fontWeight: 600, fontFamily: t.type.body } }, c.author),
    h('div', { style: { fontSize: 23, color: p.muted, marginTop: 6, fontFamily: t.type.body } }, c.source),
    handle(c, w, p.muted),
  );
};

// 2) Modern — 악센트 바 + 초대형 인용 (좌측)
const modern: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 92, 50);
  const lines = balanceLines(c.text, size, 780);
  return h('div', {
    style: { width: w, height: ht, padding: 110, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    h('div', { style: { display: 'flex', alignItems: 'stretch' } },
      h('div', { style: { width: 12, minWidth: 12, background: p.accent, borderRadius: 6, marginRight: 46 } }, ''),
      h('div', { style: { display: 'flex', flexDirection: 'column' } },
        quoteBlock(lines, { fontSize: size, fontWeight: 900, lineHeight: 1.06, letterSpacing: -2 }),
        h('div', { style: { fontSize: 30, fontWeight: 700, color: p.accent, marginTop: 44, fontFamily: t.type.body } }, c.author),
        h('div', { style: { fontSize: 22, color: p.muted, marginTop: 8, fontFamily: t.type.body } }, c.source),
      ),
    ),
    handle(c, w, p.muted, 'right'),
  );
};

// 3) Swiss — 마커 + 상단 인용 + 하단 메타 라인 (구조적)
const swiss: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 66, 40);
  const lines = balanceLines(c.text, size, 820);
  return h('div', {
    style: { width: w, height: ht, padding: 130, paddingTop: 150, display: 'flex', flexDirection: 'column',
      background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    h('div', { style: { width: 18, height: 18, background: p.accent, marginBottom: 48 } }, ''),
    quoteBlock(lines, { fontSize: size, fontWeight: 600, lineHeight: 1.28, letterSpacing: -0.6 }),
    h('div', { style: { display: 'flex', flexGrow: 1 } }, ''),
    h('div', { style: { width: '100%', height: 2, background: p.ink, marginBottom: 22 } }, ''),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: t.type.body } },
      h('div', { style: { fontSize: 20, fontWeight: 600, letterSpacing: 2 } }, (c.author ?? '').toUpperCase()),
      h('div', { style: { fontSize: 20, fontWeight: 400, letterSpacing: 2, color: p.muted } }, (c.source ?? '').toUpperCase()),
    ),
  );
};

// 4) Center — 가운데 정렬 + 큰 따옴표 마크
const center: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 70, 42);
  const lines = balanceLines(c.text, size, 760);
  return h('div', {
    style: { width: w, height: ht, padding: 130, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    h('div', { style: { fontSize: 150, lineHeight: 0.7, color: p.accent, fontWeight: 700, marginBottom: 30 } }, '“'),
    quoteBlock(lines, { fontSize: size, lineHeight: 1.3, letterSpacing: -0.5, fontWeight: 400, textAlign: 'center' }, { center: true }),
    h('div', { style: { width: 48, height: 3, background: p.accent, marginTop: 44, marginBottom: 28 } }, ''),
    h('div', { style: { fontSize: 28, fontWeight: 600, fontFamily: t.type.body } }, c.author),
    h('div', { style: { fontSize: 21, color: p.muted, marginTop: 6, fontFamily: t.type.body } }, c.source),
    handle(c, w, p.muted, 'center'),
  );
};

// ───────── 캐러셀 슬라이드 레이아웃 ─────────

// COVER — 표지(훅). eyebrow 라벨 + 큰 훅 + 스와이프 힌트.
const cover: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 88, 52);
  const lines = balanceLines(c.text, size, 800);
  return h('div', {
    style: { width: w, height: ht, padding: 120, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    c.kicker ? h('div', { style: { fontSize: 24, letterSpacing: 6, fontWeight: 600, color: p.accent, marginBottom: 40, fontFamily: t.type.body } }, c.kicker.toUpperCase()) : '',
    quoteBlock(lines, { fontSize: size, lineHeight: 1.1, letterSpacing: -1, fontWeight: 700 }),
    h('div', { style: { position: 'absolute', bottom: 110, left: 120, fontSize: 24, color: p.muted, fontFamily: t.type.body, letterSpacing: 1 } },
      (/[가-힣]/.test(c.text) ? '밀어서 더 보기' : 'Swipe to read') + '  »'),
  );
};

// POINT — 전개. 큰 인덱스 번호 + 본문.
const point: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 60, 38);
  const lines = balanceLines(c.text, size, 820);
  return h('div', {
    style: { width: w, height: ht, padding: 120, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    c.label ? h('div', { style: { fontSize: 132, lineHeight: 0.9, fontWeight: 700, color: p.accent, marginBottom: 36, fontFamily: t.type.display } }, c.label) : '',
    quoteBlock(lines, { fontSize: size, lineHeight: 1.34, letterSpacing: -0.3, fontWeight: 500 }),
  );
};

// OUTRO — 마무리/CTA. 메시지 + 핸들 강조.
const outro: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 58, 40);
  const lines = balanceLines(c.text, size, 800);
  return h('div', {
    style: { width: w, height: ht, padding: 120, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    quoteBlock(lines, { fontSize: size, lineHeight: 1.28, letterSpacing: -0.4, fontWeight: 500 }),
    h('div', { style: { width: 64, height: 3, background: p.accent, marginTop: 44, marginBottom: 30 } }, ''),
    h('div', { style: { fontSize: 40, fontWeight: 700, color: p.accent, fontFamily: t.type.body } }, c.author),
  );
};

// STATEMENT — 스크린샷 슬라이드. 가장 인용하고픈 한 줄을 크게, 가운데.
const statement: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 76, 46);
  const lines = balanceLines(c.text, size, 800);
  return h('div', {
    style: { width: w, height: ht, padding: 130, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink },
  },
    h('div', { style: { width: 40, height: 4, background: p.accent, marginBottom: 40 } }, ''),
    quoteBlock(lines, { fontSize: size, lineHeight: 1.22, letterSpacing: -0.6, fontWeight: 600, textAlign: 'center' }, { center: true }),
    handle(c, w, p.muted, 'center'),
  );
};

// ───────── 밈/풍자 단일 카드 레이아웃 ─────────

// VERSUS — 기대 vs 현실 2단 비교(트렌디 밈 + 회사/제도 풍자). 상단 패널 / 하단 패널(틴트).
const versus: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const aText = c.aText ?? '', bText = c.bText ?? '';
  const sA = fitSize(aText.length, 58, 34), sB = fitSize(bText.length, 58, 34);
  const tintB = mix(p.bg, p.accent, 0.12);
  const panel = (label: string, lines: string[], size: number, labelColor: string, bg?: string) =>
    h('div', { style: { display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 90, ...(bg ? { background: bg } : {}) } },
      h('div', { style: { fontSize: 26, letterSpacing: 3, fontWeight: 700, color: labelColor, marginBottom: 22, fontFamily: t.type.body } }, label),
      quoteBlock(lines, { fontSize: size, lineHeight: 1.24, letterSpacing: -0.5, fontWeight: 600, textAlign: 'center' }, { center: true }),
    );
  return h('div', { style: { width: w, height: ht, display: 'flex', flexDirection: 'column', background: 'transparent', fontFamily: t.type.display, color: p.ink } },
    c.kicker ? h('div', { style: { position: 'absolute', top: 70, left: 0, width: w, textAlign: 'center', fontSize: 24, letterSpacing: 3, fontWeight: 700, color: p.muted, fontFamily: t.type.body } }, c.kicker) : '',
    panel(c.aLabel ?? '기대', balanceLines(aText, sA, w - 200), sA, p.muted),
    h('div', { style: { width: w, height: 4, background: p.accent } }, ''),
    panel(c.bLabel ?? '현실', balanceLines(bText, sB, w - 200), sB, p.accent, tintB),
    c.handle ? h('div', { style: { position: 'absolute', bottom: 44, left: 0, width: w, textAlign: 'center', fontSize: 18, color: p.muted, fontFamily: 'Inter' } }, c.handle) : '',
  );
};

// HEADLINE — 가짜 뉴스(The Onion/속보). 진지한 보도체 + 절제된 한 줄 본문 = 대놓고 풍자.
const headline: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const size = fitSize(c.text.length, 80, 44);
  const lines = balanceLines(c.text, size, w - 240);
  return h('div', { style: { width: w, height: ht, padding: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent', fontFamily: t.type.display, color: p.ink } },
    h('div', { style: { display: 'flex', marginBottom: 36 } },
      h('div', { style: { background: p.accent, color: p.bg, fontSize: 26, fontWeight: 700, letterSpacing: 2, paddingTop: 10, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, fontFamily: t.type.body } }, c.kicker ?? '속보'),
    ),
    quoteBlock(lines, { fontSize: size, lineHeight: 1.14, letterSpacing: -1, fontWeight: 700 }),
    c.source ? h('div', { style: { fontSize: 28, lineHeight: 1.45, color: p.muted, marginTop: 34, fontFamily: t.type.body } }, c.source) : '',
    h('div', { style: { position: 'absolute', bottom: 110, left: 120, fontSize: 21, color: p.muted, letterSpacing: 1, fontFamily: 'Inter' } }, c.handle ?? '@your_handle'),
  );
};

// GREENTEXT — 음슴체 `>나임` 줄 스토리 + 반전. 다크 배경(noir 팔레트) 권장. > 줄은 초록.
const greentext: LayoutFn = (c, t) => {
  const p = t.palette;
  const { w, h: ht } = t.canvas;
  const GREEN = '#8cc152';
  const raw = c.text.split('\n').map((s) => s.trimEnd()).filter((s) => s.length);
  const size = raw.length > 9 ? 32 : 38;
  return h('div', { style: { width: w, height: ht, padding: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent', fontFamily: t.type.body } },
    c.kicker ? h('div', { style: { fontSize: 24, letterSpacing: 2, fontWeight: 700, color: p.muted, marginBottom: 28, fontFamily: t.type.body } }, c.kicker) : '',
    ...raw.map((line) => h('div', { style: { fontSize: size, lineHeight: 1.45, fontWeight: 500, color: line.startsWith('>') ? GREEN : p.accent } }, line)),
    c.handle ? h('div', { style: { position: 'absolute', bottom: 56, left: 110, fontSize: 18, color: p.muted, fontFamily: 'Inter' } }, c.handle) : '',
  );
};

export const LAYOUTS: Record<string, LayoutFn> = { editorial, modern, swiss, center, cover, point, outro, statement, versus, headline, greentext };
