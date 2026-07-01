// 승인 매니페스트 — 생성된 카드의 상태를 추적. 발행은 approved 만 대상으로 한다.
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const MANIFEST = '_manifest.json';

export type CardStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface CardEntry {
  id: string;
  corpus: string;
  png: string;
  caption: string;
  hashtags: string[];
  author: string;
  source: string;
  status: CardStatus;
  publishedId?: string;
}

export type Manifest = Record<string, CardEntry>;

export function loadManifest(outDir: string): Manifest {
  const path = resolve(outDir, MANIFEST);
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

export function saveManifest(outDir: string, m: Manifest): void {
  writeFileSync(resolve(outDir, MANIFEST), JSON.stringify(m, null, 2));
}
