// 캐러셀 카피 생성 — 리서치 시퀀스(훅/긴장/전환/적용/재훅/CTA) + 캡션.
// ANTHROPIC_API_KEY 있으면 Claude Sonnet, 없으면 최소 덱(표지+원문+CTA)으로 폴백.
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import type { Quote } from '../corpus/index.js';
import type { Piece, Tone } from '../carousel/types.js';
import { buildCaption } from '../content/caption.js';
import { auditPiece } from '../content/slop.js';

const isKorean = (s: string) => /[가-힣]/.test(s);

export async function makeDeckCopy(q: Quote, tone: Tone = 'earnest'): Promise<Piece> {
  const ko = isKorean(q.text);
  const market = ko ? 'kr' : 'en';
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    // 폴백: 전개 없이 표지+원문+CTA (오프라인 동작)
    const caption = buildCaption({ market, hook: q.text, quote: q.text, author: q.author });
    return {
      id: q.id, tone, eyebrow: q.author, hook: q.text, quote: q.text, author: q.author, source: q.source,
      cta: tone === 'ironic'
        ? (ko ? '이 글은 캡처하지 마세요.' : 'Please do not screenshot this.')
        : (ko ? '매일 한 줄의 철학.\n팔로우하세요.' : 'A line of philosophy,\nevery day.'),
      caption,
    };
  }

  const client = new Anthropic({ apiKey: key });
  const lang = ko ? '한국어' : 'English';
  const prompt = tone === 'ironic'
    ? `지적 풍자 인스타 캐러셀을 ${lang}로 써줘. 톤: 데드팬·반전(bathos) — 진지하게 쌓고 시시하게 착지.\n` +
      `씨앗 인용: "${q.text}" — ${q.author}.\n` +
      `규칙: 표지는 진지한 척 셋업 ≤10단어. quote 슬라이드는 현대적으로 비튼 가짜 명언 + 오귀속(예: "${q.author}, probably"). 농담임이 분명하게(현대 레퍼런스). 각 ≤20단어.\n` +
      `JSON만: {"eyebrow":"라벨","hook":"진지한 셋업","tension":"빌드(진지하게)","quote":"현대적으로 비튼 가짜 명언","author":"${q.author}, probably","rehook":"시시한 반전 펀치라인","cta":"반전 CTA(예: 스크린샷 금지)"}`
    : `철학 인스타 캐러셀을 ${lang}로 써줘. 톤: 사색적·절제, 과장/클리셰/이모지 금지.\n` +
      `인용: "${q.text}" — ${q.author} (${q.source}).\n` +
      `규칙: 표지 훅은 교훈이 아니라 "긴장"을 만들고 ≤10단어. 각 슬라이드 ≤20단어, 한 생각.\n` +
      `JSON만 출력:\n` +
      `{"eyebrow":"한 단어 라벨","hook":"표지 훅(긴장)","tension":"독자의 문제를 그의 언어로",` +
      `"turn":"전환 — 이 철학자가 본 것","apply":"오늘 할 수 있는 한 가지","rehook":"가장 인용하고픈 한 줄","cta":"부드러운 마무리"}`;
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });
  const txt = msg.content.find((b) => b.type === 'text') as { text: string } | undefined;
  let j: Record<string, string> = {};
  try { j = JSON.parse(txt?.text ?? '{}'); } catch { /* 폴백 아래 */ }

  const hook = j.hook ?? q.text;
  const ironic = tone === 'ironic';
  const piece: Piece = {
    id: q.id,
    tone,
    eyebrow: j.eyebrow ?? q.author,
    hook,
    tension: j.tension,
    turn: ironic ? undefined : j.turn,
    // 풍자: 비튼 가짜 명언 + 오귀속. earnest: 검증된 원문 그대로.
    quote: ironic ? (j.quote ?? q.text) : q.text,
    author: ironic ? (j.author ?? `${q.author}, probably`) : q.author,
    source: ironic ? '' : q.source,
    apply: ironic ? undefined : j.apply,
    rehook: j.rehook,
    cta: j.cta ?? (ironic
      ? (ko ? '이 글은 캡처하지 마세요.' : 'Please do not screenshot this.')
      : (ko ? '팔로우하세요.' : 'Follow for more.')),
  };
  piece.caption = buildCaption({ market, hook, body: piece.apply, quote: piece.quote ?? q.text, author: piece.author ?? q.author });

  // 슬롭 감사(차단 아닌 경고 — 사람 승인과 결합)
  const warns = auditPiece(hook, [piece.tension, piece.turn, piece.apply, piece.rehook].filter(Boolean) as string[]);
  if (warns.length) console.warn(`  ⚠ 슬롭 경고 (${q.id}):\n   - ${warns.join('\n   - ')}`);
  return piece;
}
