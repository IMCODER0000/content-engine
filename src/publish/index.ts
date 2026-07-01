// 발행기 선택 — 현재 Threads(1순위). 인스타/틱톡은 추후 추가.
import 'dotenv/config';
import type { Publisher } from './types.js';
import { ThreadsPublisher } from './threads.js';

export function getPublisher(platform: string): Publisher {
  if (platform === 'threads') {
    const userId = process.env.THREADS_USER_ID;
    const token = process.env.THREADS_ACCESS_TOKEN;
    if (!userId || !token) {
      throw new Error('THREADS_USER_ID / THREADS_ACCESS_TOKEN 미설정 (.env) — 라이브 발행에 필요');
    }
    return new ThreadsPublisher(userId, token);
  }
  throw new Error(`미지원 플랫폼: ${platform} (현재: threads)`);
}

export type { Publisher } from './types.js';
