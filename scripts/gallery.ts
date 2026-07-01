// 갤러리 생성 — out/ 의 모든 PNG를 한 페이지(out/index.html)로 모은다.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');

const pngsIn = (dir: string): string[] =>
  readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
    .map((f) => relative(outDir, resolve(dir, f)));

interface Group { title: string; wide: string[]; cards: string[] }

function collect(): Group[] {
  const groups: Group[] = [];
  const entries = readdirSync(outDir).sort();

  // 최상위 단일 카드(generate 산출물)
  const topCards = readdirSync(outDir).filter((f) => f.endsWith('.png')).sort().map((f) => f);
  const topWide = topCards.filter((f) => f === 'matrix.png');
  const topSingle = topCards.filter((f) => f !== 'matrix.png');
  if (topCards.length) groups.push({ title: '단일 카드 / 매트릭스', wide: topWide, cards: topSingle });

  // 하위 폴더(덱·밈)
  for (const e of entries) {
    const p = resolve(outDir, e);
    if (!statSync(p).isDirectory() || e === 'approved') continue;
    const files = pngsIn(p);
    if (!files.length) continue;
    const wide = files.filter((f) => /_(strip|sheet)\.png$/.test(f));
    const cards = files.filter((f) => !/_(strip|sheet)\.png$/.test(f));
    groups.push({ title: e, wide, cards });
  }
  return groups;
}

function html(groups: Group[]): string {
  const sections = groups.map((g) => {
    const wide = g.wide.map((f) => `<a href="${f}" target="_blank"><img class="wide" src="${f}" loading="lazy"></a>`).join('');
    const cards = g.cards.map((f) => `<a href="${f}" target="_blank"><img class="card" src="${f}" loading="lazy" title="${f}"></a>`).join('');
    return `<section><h2>${g.title} <span>${g.cards.length || g.wide.length}</span></h2>${wide}<div class="grid">${cards}</div></section>`;
  }).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>content-engine 갤러리</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0e0e10;color:#e8e6df;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif}
header{padding:28px 32px;border-bottom:1px solid #26262b;position:sticky;top:0;background:#0e0e10ee;backdrop-filter:blur(6px)}
header h1{margin:0;font-size:20px;letter-spacing:.5px}
header p{margin:6px 0 0;color:#8a8a92;font-size:13px}
section{padding:24px 32px;border-bottom:1px solid #1c1c20}
h2{font-size:15px;letter-spacing:1px;color:#c9a96a;margin:0 0 16px;text-transform:uppercase}
h2 span{color:#6f6f78;margin-left:8px}
.grid{display:flex;flex-wrap:wrap;gap:14px}
img{border-radius:8px;display:block;background:#1a1a1e}
img.card{width:240px;border:1px solid #26262b}
img.wide{width:100%;max-width:1100px;margin-bottom:14px;border:1px solid #26262b}
a{line-height:0}
</style></head><body>
<header><h1>content-engine — 결과물 갤러리</h1><p>이미지를 클릭하면 원본. 다시 생성하려면 ./run.sh</p></header>
${sections}
</body></html>`;
}

const groups = collect();
const total = groups.reduce((n, g) => n + g.cards.length + g.wide.length, 0);
writeFileSync(resolve(outDir, 'index.html'), html(groups));
console.log(`갤러리: out/index.html (${groups.length}섹션, 이미지 ${total}개)`);
