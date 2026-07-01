// 한국어 밈 단일 카드 뱅크 — 리서치 기반 3포맷. (트렌디 밈 + 대놓고 풍자)
// versus(기대vs현실/비교) · headline(가짜 속보) · greentext(음슴체 >나임 썰)
import type { CardContent } from '../design/types.js';

export interface MemeCard { id: string; content: CardContent }

// 1) VERSUS — 기대 vs 현실 / 회사가 말하는 X vs 진짜 X
export const VERSUS_KR: MemeCard[] = [
  { id: 'v-jayul', content: { text: '', kicker: '직장인 현실', aLabel: '회사', aText: '자율 출퇴근', bLabel: '진짜', bText: '자율적으로 일찍 옴' } },
  { id: 'v-wolgeup', content: { text: '', kicker: '월급날', aLabel: '기대', aText: '이번 달은 모은다', bLabel: '현실', bText: '월급은 통장을 스칠 뿐' } },
  { id: 'v-undong', content: { text: '', kicker: '헬스장 등록', aLabel: '기대', aText: '주 5회 갓생', bLabel: '현실', bText: '사물함만 3개월 결제' } },
  { id: 'v-sinnyeon', content: { text: '', kicker: '신년 계획', aLabel: '기대', aText: '올해는 다르다', bLabel: '현실', bText: '작년 계획 복붙' } },
];

// 2) HEADLINE — 가짜 속보(The Onion/속보 자막). 사소한 일을 진지한 보도체로.
export const HEADLINE_KR: MemeCard[] = [
  { id: 'h-ramyeon', content: { text: '또 새벽 3시에 라면 끓인 사람 발견', kicker: '속보', source: '본인 "이번이 마지막"… 어제도 같은 발언' } },
  { id: 'h-5min', content: { text: '"5분만 더" 외친 직장인, 결국 지각', kicker: '속보', source: '전문가 "5분의 상대성 이론, 사실상 입증"' } },
  { id: 'h-weekend', content: { text: '주말 이틀, 눈 뜨니 일요일 저녁', kicker: '속보', source: '피해자 다수 "분명 토요일 아침이었다"' } },
  { id: 'h-cart', content: { text: '장바구니에 3개월째 잠든 상품 12건', kicker: '단독', source: '"내일 산다" 진술 반복… 수사 난항' } },
];

// 3) GREENTEXT — 음슴체 `>나임` 줄 스토리 + 반전. (turn 줄은 > 없이 → 강조색)
export const GREENTEXT_KR: MemeCard[] = [
  {
    id: 'g-jachwi',
    content: {
      text: [
        '>자취 3년차 직장인이라고 치자',
        '>이번 달은 아껴보기로 다짐함',
        '>마트에서 밀키트 1+1 발견',
        '>"이건 사는 게 이득" 하고 다섯 개 집음',
        '>집 와서 냉동실 엶',
        '>지난달 산 1+1 다섯 개가 이미 있음',
        '난 분명 아끼고 있었음',
        '>그때 내 표정',
      ].join('\n'),
      kicker: '자취썰',
    },
  },
  {
    id: 'g-jumal',
    content: {
      text: [
        '>금요일 밤이라고 치자',
        '>"오늘은 일찍 잠" 다짐함',
        '>딱 릴스 하나만 보기로 함',
        '>알고리즘이 날 너무 잘 앎',
        '>정신 차리니 새벽 4시임',
        '해는 이미 뜨고 있었음',
        '>그때 내 표정',
      ].join('\n'),
      kicker: '주말썰',
    },
  },
];
