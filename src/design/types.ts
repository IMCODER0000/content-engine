// 디자인 시스템 타입 — 디자인을 독립 축으로 분해해 자유 조합한다.
export interface Palette {
  name: string;
  mode: 'light' | 'dark';
  bg: string;
  bgTo?: string; // gradient 배경의 두 번째 정지색(없으면 자동 파생)
  ink: string; // 본문
  accent: string; // 강조
  muted: string; // 보조/출처
}

export interface FontSpec {
  file: string;
  family: string;
  weight: number;
  style: 'normal' | 'italic';
}

export interface Typeface {
  name: string;
  display: string; // 인용문 패밀리
  body: string; // 메타(저자/출처) 패밀리
  fonts: FontSpec[]; // 등록할 폰트 파일(한글 폴백 포함)
}

export type BackgroundKind = 'solid' | 'gradient' | 'grain' | 'image';

export interface Canvas {
  w: number;
  h: number;
}

export interface Tokens {
  palette: Palette;
  type: Typeface;
  canvas: Canvas;
}

export interface CardContent {
  text: string;
  author?: string; // 인용 레이아웃 전용(밈 레이아웃엔 없음)
  source?: string;
  kicker?: string; // 상단 라벨(옵션) — 캐러셀 표지의 eyebrow / versus 주제
  label?: string; // 슬라이드 인덱스 번호 등(예: "01")
  handle?: string;
  // versus(기대 vs 현실) 2단 비교 레이아웃용
  aLabel?: string;
  aText?: string;
  bLabel?: string;
  bText?: string;
}

// 레이아웃은 토큰을 받아 Satori 트리를 만든다.
export type LayoutFn = (c: CardContent, t: Tokens) => unknown;

export interface Recipe {
  layout: string;
  palette: string;
  type: string;
  background: BackgroundKind;
}
