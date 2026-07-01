// 캡션 빌더 — 리서치 스켈레톤: 훅 줄 → 본문(40~120단어, 한 생각) → 답글 유도 → 해시태그.
// 한국어는 원문 반복 + CTA 압박 낮춤 + 세로 줄바꿈 성향.
import { buildHashtags } from './hashtags.js';
import type { Market } from './hashtags.js';

export const REPLY_TRIGGERS = {
  en: ['Which line hit hardest?', 'Tag someone who needs this.', 'Finish the sentence: peace is ___.'],
  kr: ['어떤 문장이 가장 와닿았나요?', '이 글이 필요한 사람을 태그하세요.', '오늘 당신의 한 줄은?'],
};

export interface CaptionInput {
  market: Market;
  hook: string; // 표지와 다른 표현으로
  body?: string; // 한 생각, 짧은 줄들
  quote: string;
  author: string;
  niche?: 'quote' | 'meme'; // 콘텐츠 성격(태그 세트)
  replyTriggerIdx?: number;
  hashtagOffset?: number;
}

export function buildCaption(i: CaptionInput): string {
  const trig = REPLY_TRIGGERS[i.market][(i.replyTriggerIdx ?? 0) % REPLY_TRIGGERS[i.market].length];
  const tags = buildHashtags(i.market, i.niche ?? 'quote', i.hashtagOffset ?? 0).join(' ');
  const parts: string[] = [i.hook, ''];
  if (i.market === 'kr') {
    // 한국어: 원문을 캡션에 다시 (카드는 비주얼, 캡션은 읽는 텍스트)
    parts.push(`"${i.quote}"`, `— ${i.author}`, '');
    if (i.body) parts.push(i.body, '');
    parts.push(trig, '', tags);
  } else {
    if (i.body) parts.push(i.body, '');
    parts.push(`"${i.quote}" — ${i.author}`, '', trig, '', tags);
  }
  return parts.join('\n');
}
