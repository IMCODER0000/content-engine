// 발행 CLI — 옵트인. 기본 dry-run(미리보기), --live 일 때만 실제 게시.
// 사용법:
//   npm run publish                       승인된 카드 발행 계획 미리보기(dry-run)
//   npm run publish card --limit=3        승인 카드 3개 미리보기
//   npm run publish deck deck-stoic-seneca-1   덱(캐러셀) 미리보기
//   npm run publish card --live --base-url=https://cdn.me/out   실제 발행(호스팅 필요)
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { loadManifest, saveManifest } from './manifest.js';
import { getPublisher } from './publish/index.js';
import { ThreadsPublisher } from './publish/threads.js';
import type { Publisher, MediaItem } from './publish/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');

interface Args { mode: string; live: boolean; baseUrl?: string; platform: string; limit: number; deck?: string; caption?: string; }
function parseArgs(argv: string[]): Args {
  const a: Args = { mode: 'card', live: false, platform: 'threads', limit: Infinity };
  for (const arg of argv) {
    if (arg === '--live') a.live = true;
    else if (arg.startsWith('--base-url=')) a.baseUrl = arg.slice(11);
    else if (arg.startsWith('--platform=')) a.platform = arg.slice(11);
    else if (arg.startsWith('--limit=')) a.limit = Number(arg.slice(8));
    else if (arg.startsWith('--deck=')) a.deck = arg.slice(7);
    else if (arg.startsWith('--caption=')) a.caption = arg.slice(10);
    else if (arg === 'card' || arg === 'deck') a.mode = arg;
    else if (!arg.startsWith('--') && a.mode === 'deck' && !a.deck) a.deck = arg;
  }
  return a;
}

const urlFor = (file: string, baseUrl?: string): string | undefined =>
  baseUrl ? `${baseUrl.replace(/\/$/, '')}/${file}` : undefined;

function printResult(label: string, r: { dryRun: boolean; id?: string; plan?: string[] }) {
  if (r.dryRun) {
    console.log(`\n[DRY-RUN] ${label}`);
    r.plan?.forEach((s) => console.log(`   ${s}`));
  } else {
    console.log(`\n[LIVE ✓] ${label} → 게시 id ${r.id}`);
  }
}

async function publishCards(pub: Publisher, a: Args) {
  const m = loadManifest(outDir);
  const approved = Object.values(m).filter((e) => e.status === 'approved').slice(0, a.limit);
  if (!approved.length) { console.log('승인된 카드 없음 — npm run review approve <id>'); return; }
  console.log(`승인 카드 ${approved.length}건 · ${a.live ? 'LIVE' : 'DRY-RUN'} · ${pub.platform}`);
  for (const e of approved) {
    const caption = `${e.caption}\n\n${e.hashtags.join(' ')}`;
    const media: MediaItem[] = [{ path: resolve(outDir, e.png), url: urlFor(e.png, a.baseUrl) }];
    const r = await pub.publish({ caption, media }, { dryRun: !a.live });
    printResult(`${e.id} (${e.png})`, r);
    if (!r.dryRun && r.id) { e.status = 'published'; e.publishedId = r.id; }
  }
  if (a.live) saveManifest(outDir, m);
}

async function publishDeck(pub: Publisher, a: Args) {
  if (!a.deck) throw new Error('덱 폴더 지정 필요: npm run publish deck <dir>');
  const dir = existsSync(a.deck) ? a.deck : resolve(outDir, a.deck);
  if (!existsSync(dir)) throw new Error(`덱 폴더 없음: ${dir}`);
  const slides = readdirSync(dir).filter((f) => /^slide-\d+\.png$/.test(f)).sort();
  if (!slides.length) throw new Error(`슬라이드 없음: ${dir}`);
  const media: MediaItem[] = slides.map((f) => ({ path: resolve(dir, f), url: urlFor(`${basename(dir)}/${f}`, a.baseUrl) }));
  // 캡션 우선순위: --caption > 덱의 caption.txt(생성 시 자동) > 기본
  const capFile = resolve(dir, 'caption.txt');
  const caption = a.caption ?? (existsSync(capFile) ? readFileSync(capFile, 'utf8') : '한 줄의 철학.');
  console.log(`덱 ${slides.length}슬라이드 · ${a.live ? 'LIVE' : 'DRY-RUN'} · ${pub.platform}`);
  printResult(basename(dir), await pub.publish({ caption, media }, { dryRun: !a.live }));
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  // dry-run 은 토큰 없이 동작(미리보기). 라이브만 실제 자격증명 검증.
  const pub: Publisher = a.live ? getPublisher(a.platform) : new ThreadsPublisher('DRYRUN', 'DRYRUN');
  if (a.mode === 'deck') await publishDeck(pub, a);
  else await publishCards(pub, a);
  if (!a.live) console.log('\n실제 발행: --live (THREADS_* 토큰 + 이미지 공개 URL 필요). 캐러셀/단일 자동 판별.');
}

main().catch((e) => { console.error(e); process.exit(1); });
