// 승인 큐 CLI — 발행 전 사람이 통과/탈락 결정. (AI 슬롭 회피의 핵심 게이트)
// 사용법:
//   npm run review                  상태 목록
//   npm run review approve <id...>   승인 (approved/ 로 복사)
//   npm run review approve pending   대기 중 전체 승인
//   npm run review reject  <id...>   탈락
import { mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadManifest, saveManifest } from './manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');
const approvedDir = resolve(outDir, 'approved');

const ICON: Record<string, string> = {
  pending: '⏳', approved: '✅', rejected: '🗑️', published: '📤',
};

function list() {
  const m = loadManifest(outDir);
  const entries = Object.values(m);
  if (!entries.length) {
    console.log('카드 없음 — 먼저 npm run generate');
    return;
  }
  const by: Record<string, number> = {};
  for (const e of entries) {
    by[e.status] = (by[e.status] ?? 0) + 1;
    console.log(`${ICON[e.status]} ${e.id.padEnd(16)} [${e.corpus}] ${e.caption.slice(0, 48)}…`);
  }
  console.log('\n요약: ' + Object.entries(by).map(([k, v]) => `${ICON[k]}${k} ${v}`).join('  '));
}

function setStatus(action: 'approve' | 'reject', ids: string[]) {
  const m = loadManifest(outDir);
  let targets = ids;
  if (ids.includes('pending')) {
    targets = Object.values(m).filter((e) => e.status === 'pending').map((e) => e.id);
  }
  if (action === 'approve') mkdirSync(approvedDir, { recursive: true });
  let n = 0;
  for (const id of targets) {
    const e = m[id];
    if (!e) { console.warn(`  ? 없음: ${id}`); continue; }
    if (action === 'approve') {
      e.status = 'approved';
      copyFileSync(resolve(outDir, e.png), resolve(approvedDir, e.png));
    } else {
      e.status = 'rejected';
    }
    n++;
  }
  saveManifest(outDir, m);
  console.log(`${action === 'approve' ? '승인' : '탈락'} ${n}건` + (action === 'approve' ? ` → out/approved/` : ''));
}

const [cmd, ...ids] = process.argv.slice(2);
if (!cmd) list();
else if (cmd === 'approve' || cmd === 'reject') {
  if (!ids.length) { console.error('대상 id 필요 (또는 pending)'); process.exit(1); }
  setStatus(cmd, ids);
} else {
  console.error(`알 수 없는 명령: ${cmd} (list|approve|reject)`);
  process.exit(1);
}
