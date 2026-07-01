// 한국어 풍자 콘텐츠 뱅크 — 완성형 Piece(키 없이 바로 발행 가능).
// 동양 고전 × 현대 한국 생활. bathos 구조 + 오귀속("…, 아마도" / "…, 추정")으로 농담 신호.
import type { Piece } from '../carousel/types.js';

export const SATIRE_KR: Piece[] = [
  {
    id: 'kr-ilkssip', tone: 'ironic', eyebrow: '동양 고전',
    hook: '2500년 전 지혜로 오늘의 당신을 위로합니다.',
    tension: '공자는 천하를 떠돌며 도를 구했고, 당신은 와이파이를 찾아 카페를 떠돕니다.',
    quote: '아는 것을 안다 하고 모르는 것을 모른다 하라. 단, 단톡방에서는 그냥 읽씹하라.',
    author: '공자, 아마도', source: '논어, 추정',
    rehook: '그래서, 잔디는 좀 밟아 보셨습니까?', cta: '이 글은 캡처하지 마세요.', quoteLayout: 'center',
  },
  {
    id: 'kr-muwi', tone: 'ironic', eyebrow: '도덕경',
    hook: '노자가 알려주는 완벽한 게으름의 철학.',
    tension: '노자는 억지로 하지 않는 무위(無爲)야말로 도에 가깝다 했습니다.',
    quote: '억지로 하지 마라. 단, 마감은 지켜라.',
    author: '노자, 아마도', source: '도덕경, 추정',
    rehook: '그래서 오늘도 아무것도 안 했습니다. 무위입니다.', cta: '이 글도 무위로 넘기세요.', quoteLayout: 'center',
  },
  {
    id: 'kr-nabi', tone: 'ironic', eyebrow: '장자',
    hook: '장자도 끝내 몰랐던 진짜 나는 누구인가.',
    tension: '장자는 나비 꿈에서 깨어 내가 나비인지 나비가 나인지 물었습니다.',
    quote: '회의 중인 내가 진짜인가, 퇴근 후의 내가 진짜인가.',
    author: '장자, 아마도', source: '장자, 추정',
    rehook: '결론: 둘 다 피곤합니다.', cta: '꿈에서도 야근하지 마세요.', quoteLayout: 'center',
  },
  {
    id: 'kr-cheugeun', tone: 'ironic', eyebrow: '맹자',
    hook: '맹자가 본 인간 본성의 마지막 보루.',
    tension: '맹자는 누구나 우물에 빠진 아이를 보면 측은지심을 느낀다 했습니다.',
    quote: '사람은 본디 선하다. 별점 테러를 받기 전까지는.',
    author: '맹자, 아마도', source: '맹자, 추정',
    rehook: '그래서 사장님이 서비스를 주셨습니다.', cta: '리뷰는 별 다섯 개로 부탁드립니다.', quoteLayout: 'center',
  },
  {
    id: 'kr-geukgi', tone: 'ironic', eyebrow: '논어',
    hook: '2500년 전에 완성된 자기관리의 정수.',
    tension: '공자는 자신을 이기고 예로 돌아가는 극기복례(克己復禮)를 말했습니다.',
    quote: '나를 이겨라. 단, 야식 앞에서는 예외로 한다.',
    author: '공자, 아마도', source: '논어, 추정',
    rehook: '그래서 다이어트는 내일부터 합니다.', cta: '이 글을 보고도 치킨을 시키세요.', quoteLayout: 'center',
  },
  {
    id: 'kr-beop', tone: 'ironic', eyebrow: '한비자',
    hook: '한비자가 예언한 현대 직장의 풍경.',
    tension: '한비자는 사람은 이익으로 움직이니 법으로 다스리라 했습니다.',
    quote: '규정을 만들어라. 단, 사장님은 예외로 둔다.',
    author: '한비자, 아마도', source: '한비자, 추정',
    rehook: '그래서 워라밸은 사규에만 존재합니다.', cta: '이 글은 사내망에서 열지 마세요.', quoteLayout: 'center',
  },
];
