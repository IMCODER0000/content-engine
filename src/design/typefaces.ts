// 서체 레지스트리 — 폰트 조합 축. 각 세트는 라틴 + 한글 폴백을 함께 등록한다.
// (Satori는 패밀리 매칭 후, 누락 글리프를 목록의 다른 폰트로 폴백한다.)
import type { Typeface, FontSpec } from './types.js';

const KR_SANS: FontSpec[] = [
  { file: 'NotoSansKR-Regular.woff', family: 'Noto Sans KR', weight: 400, style: 'normal' },
  { file: 'NotoSansKR-Bold.woff', family: 'Noto Sans KR', weight: 700, style: 'normal' },
];
const KR_SERIF: FontSpec[] = [
  { file: 'NanumMyeongjo-Regular.woff', family: 'Nanum Myeongjo', weight: 400, style: 'normal' },
  { file: 'NanumMyeongjo-Bold.woff', family: 'Nanum Myeongjo', weight: 700, style: 'normal' },
];

export const TYPEFACES: Record<string, Typeface> = {
  // 산세리프(모던/스위스)
  sans: {
    name: 'sans', display: 'Inter', body: 'Inter',
    fonts: [
      { file: 'Inter-Regular.woff', family: 'Inter', weight: 400, style: 'normal' },
      { file: 'Inter-SemiBold.woff', family: 'Inter', weight: 600, style: 'normal' },
      { file: 'Inter-Bold.woff', family: 'Inter', weight: 700, style: 'normal' },
      { file: 'Inter-Black.woff', family: 'Inter', weight: 900, style: 'normal' },
      ...KR_SANS,
    ],
  },
  // 세리프(에디토리얼) — 라틴 Newsreader + 한글 Noto Serif KR
  serif: {
    name: 'serif', display: 'Newsreader', body: 'Newsreader',
    fonts: [
      { file: 'Newsreader-Regular.woff', family: 'Newsreader', weight: 400, style: 'normal' },
      { file: 'Newsreader-SemiBold.woff', family: 'Newsreader', weight: 600, style: 'normal' },
      { file: 'Newsreader-Italic.woff', family: 'Newsreader', weight: 400, style: 'italic' },
      ...KR_SERIF,
    ],
  },
  // 혼합 — 세리프 헤드라인 + 산세리프 메타
  mixed: {
    name: 'mixed', display: 'Newsreader', body: 'Inter',
    fonts: [
      { file: 'Newsreader-Regular.woff', family: 'Newsreader', weight: 400, style: 'normal' },
      { file: 'Newsreader-SemiBold.woff', family: 'Newsreader', weight: 600, style: 'normal' },
      { file: 'Newsreader-Italic.woff', family: 'Newsreader', weight: 400, style: 'italic' },
      { file: 'Inter-Regular.woff', family: 'Inter', weight: 400, style: 'normal' },
      { file: 'Inter-SemiBold.woff', family: 'Inter', weight: 600, style: 'normal' },
      ...KR_SERIF, ...KR_SANS,
    ],
  },
  // 임팩트 — 초굵은 디스플레이(밈/속보/펀치). 본문은 Inter+Noto.
  impact: {
    name: 'impact', display: 'Black Han Sans', body: 'Inter',
    fonts: [
      { file: 'BlackHanSans-Latin.woff', family: 'Black Han Sans', weight: 400, style: 'normal' },
      { file: 'BlackHanSans-KR.woff', family: 'Black Han Sans', weight: 400, style: 'normal' },
      { file: 'Inter-SemiBold.woff', family: 'Inter', weight: 600, style: 'normal' },
      { file: 'Inter-Bold.woff', family: 'Inter', weight: 700, style: 'normal' },
      ...KR_SANS,
    ],
  },
  // 라운드 — 친근/장난 톤(주아). 디스플레이·본문 모두 Jua.
  round: {
    name: 'round', display: 'Jua', body: 'Jua',
    fonts: [
      { file: 'Jua-Latin.woff', family: 'Jua', weight: 400, style: 'normal' },
      { file: 'Jua-KR.woff', family: 'Jua', weight: 400, style: 'normal' },
      ...KR_SANS,
    ],
  },
  // 돋움 레트로 — 고운돋움(날것/아이러니 밈 톤).
  dotum: {
    name: 'dotum', display: 'Gowun Dodum', body: 'Gowun Dodum',
    fonts: [
      { file: 'GowunDodum-Latin.woff', family: 'Gowun Dodum', weight: 400, style: 'normal' },
      { file: 'GowunDodum-KR.woff', family: 'Gowun Dodum', weight: 400, style: 'normal' },
      ...KR_SANS,
    ],
  },
};
