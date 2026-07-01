// 카피 생성(선택) — ANTHROPIC_API_KEY 있으면 캡션·해시태그를 생성, 없으면 코퍼스 원문 기반 폴백.
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import type { Quote } from '../corpus/stoic.js';

export interface PostCopy {
  caption: string;
  hashtags: string[];
}

export async function makeCopy(q: Quote): Promise<PostCopy> {
  const key = process.env.ANTHROPIC_API_KEY;
  // 폴백: API 없이도 파이프라인이 끝까지 돈다 (오프라인 동작 원칙)
  if (!key) {
    return {
      caption: `"${q.text}" — ${q.author}`,
      hashtags: ['#stoicism', '#philosophy', '#mindset'],
    };
  }
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content:
        `철학 SNS 게시물 캡션을 써줘. 인용: "${q.text}" — ${q.author} (${q.source}).\n` +
        `2~3문장, 현대적·사색적 톤, 과장 금지. 마지막 줄에 해시태그 5개.\n` +
        `JSON으로만 답해: {"caption": "...", "hashtags": ["#..."]}`,
    }],
  });
  const txt = msg.content.find((b) => b.type === 'text');
  try {
    const parsed = JSON.parse((txt as { text: string }).text);
    return { caption: parsed.caption, hashtags: parsed.hashtags };
  } catch {
    return { caption: `"${q.text}" — ${q.author}`, hashtags: ['#stoicism', '#philosophy'] };
  }
}
