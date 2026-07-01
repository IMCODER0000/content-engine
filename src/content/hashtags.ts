// 해시태그 세트 — 리서치 기반. 영어: 광범위 2 + 중간 4 + 니치 6. 한국어: "~스타그램" 커뮤니티 앵커 포함.
export type Market = 'en' | 'kr';

const EN = {
  broad: ['#philosophy', '#motivation', '#mindset', '#wisdom', '#quotes'],
  mid: ['#stoicism', '#stoicquotes', '#philosophyquotes', '#quoteoftheday'],
  niche: ['#marcusaurelius', '#seneca', '#epictetus', '#stoicmindset', '#dailystoic', '#stoicphilosophy'],
};

const KR = {
  // 스타그램 앵커(커뮤니티) 우선
  anchor: ['#명언스타그램', '#인생명언스타그램'],
  broad: ['#명언', '#좋은글', '#철학', '#동기부여', '#자기계발'],
  niche: ['#명언글귀', '#명언글귀모음', '#인생명언', '#성공명언', '#성공명언모음', '#글귀스타그램'],
};
// 밈·공감·풍자용 (직장인/일상 상황 콘텐츠)
const KR_MEME = {
  anchor: ['#공감', '#직장인공감'],
  broad: ['#밈', '#유머', '#짤', '#일상', '#직장인'],
  niche: ['#웃긴짤', '#공감짤', '#짤스타그램', '#일상스타그램', '#현실', '#드립'],
};
const EN_MEME = {
  broad: ['#relatable', '#meme', '#humor', '#everydaylife', '#mood'],
  mid: ['#worklife', '#adulting', '#currentmood', '#reallife'],
  niche: ['#memes', '#funny', '#relatablememes', '#officehumor', '#sarcasm', '#same'],
};

export type Niche = 'quote' | 'meme';

// 결정적 선택(랜덤 없이 슬라이스) — 계정별 로테이션은 offset 으로.
function take<T>(arr: T[], n: number, offset = 0): T[] {
  const out: T[] = [];
  for (let i = 0; i < n && i < arr.length; i++) out.push(arr[(offset + i) % arr.length]);
  return out;
}

// niche: quote(명언·철학) | meme(공감·풍자·밈). 콘텐츠 성격에 맞는 태그를 낸다.
export function buildHashtags(market: Market, niche: Niche = 'quote', offset = 0): string[] {
  if (market === 'kr') {
    const s = niche === 'meme' ? KR_MEME : KR;
    return [...s.anchor, ...take(s.broad, 3, offset), ...take(s.niche, 5, offset)];
  }
  const s = niche === 'meme' ? EN_MEME : { broad: EN.broad, mid: EN.mid, niche: EN.niche };
  return [...take(s.broad, 2, offset), ...take(s.mid, 4, offset), ...take(s.niche, 6, offset)];
}
