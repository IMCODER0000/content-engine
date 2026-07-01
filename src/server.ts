// content-engine 웹 에디터 서버 — 엔진을 HTTP API로 노출 + 에디터 UI 정적 서빙.
// 의존성 0(Node 내장 http). 렌더/캐러셀/저장·불러오기/발행/배경업로드.
import 'dotenv/config';
import http from 'node:http';
import sharp from 'sharp';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname, normalize } from 'node:path';
import { renderCard } from './design/render.js';
import { PALETTES } from './design/palettes.js';
import { TYPEFACES } from './design/typefaces.js';
import { CANVAS } from './design/canvas.js';
import { PRESETS } from './design/presets.js';
import { renderDeck, renderStrip } from './carousel/deck.js';
import { BANKS } from './content/banks.js';
import { buildHashtags } from './content/hashtags.js';
import { REPLY_TRIGGERS } from './content/caption.js';
import { VERSUS_KR, HEADLINE_KR, GREENTEXT_KR } from './content/meme-kr.js';
import { BRAND } from './design/brand.js';
import { ThreadsPublisher } from './publish/threads.js';
import { getPublisher } from './publish/index.js';
import type { MediaItem } from './publish/types.js';
import * as store from './store.js';
import type { CardContent, Recipe, BackgroundKind } from './design/types.js';
import type { Piece } from './carousel/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '../public');
const outDir = resolve(__dirname, '../out');
const PORT = Number(process.env.PORT ?? 8080);
const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

const json = (res: http.ServerResponse, status: number, obj: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(obj));
};
const png = (res: http.ServerResponse, buf: Buffer) => {
  res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' });
  res.end(buf);
};

function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((res, rej) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > 2e7) req.destroy(); });
    req.on('end', () => { try { res(d ? JSON.parse(d) : {}); } catch (e) { rej(e); } });
    req.on('error', rej);
  });
}

const canvasOf = (r: unknown) => CANVAS[String(r)] ?? CANVAS.portrait;
const decodeImg = (s: unknown): Buffer | undefined => {
  if (typeof s !== 'string' || !s) return undefined;
  return Buffer.from(s.replace(/^data:[^,]*,/, ''), 'base64');
};
const hex = (v: unknown): string | undefined => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : undefined);
// 사용자 색 오버라이드(accent/bg/ink) 추출
function paletteOverride(b: Record<string, unknown>): Record<string, string> | undefined {
  const o: Record<string, string> = {};
  const a = hex(b.accent), g = hex(b.bg2), i = hex(b.ink);
  if (a) o.accent = a; if (g) o.bg = g; if (i) o.ink = i;
  return Object.keys(o).length ? o : undefined;
}
function scrimOf(b: Record<string, unknown>): { mode: 'even' | 'bottom' | 'top'; strength: number } {
  const mode = (['even', 'bottom', 'top'].includes(String(b.scrimMode)) ? b.scrimMode : 'even') as 'even' | 'bottom' | 'top';
  const strength = typeof b.scrimStrength === 'number' ? b.scrimStrength : 0.34;
  return { mode, strength };
}

const OPTIONS = {
  palettes: Object.keys(PALETTES), types: Object.keys(TYPEFACES),
  backgrounds: ['solid', 'gradient', 'grain'], ratios: ['portrait', 'square', 'story', 'wide', 'pin'],
  singleFormats: ['editorial', 'modern', 'swiss', 'center', 'versus', 'headline', 'greentext'],
  tones: ['earnest', 'ironic', 'gap', 'steps'], presets: Object.keys(PRESETS), presetDefs: PRESETS, deckBanks: Object.keys(BANKS),
};

// ── 페이로드 → 렌더 ─────────────────────────────────────
async function renderSingle(b: Record<string, unknown>): Promise<Buffer> {
  const bgImage = decodeImg(b.bgImage);
  const recipe: Recipe = {
    layout: String(b.layout ?? 'editorial'),
    palette: String(b.palette ?? 'ink-paper'),
    type: String(b.type ?? 'mixed'),
    background: (bgImage ? 'image' : (b.background ?? 'grain')) as BackgroundKind,
  };
  const c = (b.content ?? {}) as Partial<CardContent>;
  const content: CardContent = { text: '', ...c, handle: c.handle || BRAND.handle };
  return renderCard(content, recipe, canvasOf(b.ratio), { bgImage, palette: paletteOverride(b), scale: Number(b.scale) || 1, scrim: scrimOf(b) });
}
async function renderDeckPayload(b: Record<string, unknown>): Promise<{ slides: Buffer[]; strip: Buffer }> {
  const bgImage = decodeImg(b.bgImage);
  const recipe: Recipe = {
    layout: 'cover', palette: String(b.palette ?? 'ink-paper'),
    type: String(b.type ?? 'mixed'), background: (bgImage ? 'image' : (b.background ?? 'grain')) as BackgroundKind,
  };
  const piece = b.piece as Piece;
  if (!piece || !piece.hook) throw new Error('piece.hook 필요');
  const canvas = canvasOf(b.ratio);
  const slides = await renderDeck(piece, recipe, String(b.handle || BRAND.handle), canvas, { palette: paletteOverride(b), scale: Number(b.scale) || 1, bgImage, scrim: scrimOf(b) });
  return { slides, strip: await renderStrip(slides, canvas) };
}

// ── AI 카피 어시스트 ─────────────────────────────────
const DECK_FIELDS: Record<string, string> = {
  earnest: '{"eyebrow","hook","tension","turn","quote","author","source","apply","rehook","cta"}',
  ironic: '{"eyebrow","hook","tension","quote","author(…,probably 오귀속)","source","rehook","cta"}',
  gap: '{"eyebrow","hook","turn(\\"그런데 현실은?\\")","beats(현실 사례 문자열 배열)","rehook","cta"}',
  steps: '{"eyebrow","hook(제목)","beats(1→N 에스컬레이션 단계 문자열 배열)","rehook(펀치라인)","cta(\\"넌 몇 단계?\\" 랭킹)"}',
};
function assistPrompt(b: Record<string, unknown>): string {
  const topic = String(b.topic ?? '').slice(0, 200);
  if (b.kind === 'deck') {
    const tone = String(b.tone ?? 'earnest');
    return `주제 "${topic}"로 ${tone} 톤 인스타 캐러셀 카피를 한국어로 써줘. 표지 훅 ≤10단어, 각 항목 ≤20단어. JSON 키: ${DECK_FIELDS[tone] ?? DECK_FIELDS.earnest}`;
  }
  const fmt = String(b.format ?? 'versus');
  if (fmt === 'versus') return `주제 "${topic}"의 '기대 vs 현실' 밈 카드(한국어, 짧고 웃기게). JSON: {"kicker":"주제 라벨","aLabel":"기대","aText":"이상","bLabel":"현실","bText":"웃긴 현실"}`;
  if (fmt === 'headline') return `주제 "${topic}"를 사소하게 비트는 가짜 속보(한국어, 진지한 보도체 데드팬). JSON: {"kicker":"속보","text":"헤드라인","source":"한 줄 본문"}`;
  if (fmt === 'greentext') return `주제 "${topic}"로 음슴체 그린텍스트 썰. 6~8줄, 각 줄 ">"로 시작 ~함/~음 종결, 반전 1줄은 ">" 없이. JSON: {"kicker":"○○썰","text":"여러 줄을 \\n으로 구분한 한 문자열"}`;
  return `주제/인용 "${topic}"로 명언 카드 문구. JSON: {"text":"인용/문장","author":"저자","source":"출처"}`;
}
async function aiAssist(b: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY 미설정 — .env에 키를 넣으면 AI 카피가 켜집니다');
  if (!String(b.topic ?? '').trim()) throw new Error('주제를 입력하세요');
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6', max_tokens: 800,
    messages: [{ role: 'user', content: assistPrompt(b) + '\nJSON만 출력. 과장·클리셰·이모지 금지.' }],
  });
  const t = msg.content.find((x) => x.type === 'text') as { text: string } | undefined;
  let j: Record<string, unknown>;
  try { j = JSON.parse(t?.text ?? '{}'); } catch { throw new Error('AI 응답 파싱 실패'); }
  if (Array.isArray(j.beats)) j.beats = j.beats.join('\n');
  return j;
}

// ── 캡션 생성(포스팅용 본문 + 해시태그) ──────────────
const isKo = (s: string) => /[가-힣]/.test(s);
const MEME_TONES = new Set(['gap', 'steps']);
const MEME_FORMATS = new Set(['versus', 'headline', 'greentext']);
const MEME_TRIG = { kr: '이거 완전 내 얘기 아니야? 태그ㄱ', en: 'Tag someone who needs this.' };
function editorCaption(b: Record<string, unknown>): string {
  if (b.kind === 'deck') {
    const p = (b.piece ?? {}) as Record<string, string>;
    const m = isKo(`${p.hook}${p.rehook}`) ? 'kr' : 'en';
    const meme = MEME_TONES.has(String(p.tone));
    const tr = meme ? MEME_TRIG[m] : REPLY_TRIGGERS[m][0];
    return [p.hook, '', p.rehook ?? '', '', tr, '', buildHashtags(m, meme ? 'meme' : 'quote').join(' ')].filter((x) => x !== undefined).join('\n');
  }
  const c = (b.content ?? {}) as Record<string, string>;
  const fmt = String(b.format ?? b.layout ?? '');
  const m = isKo(JSON.stringify(c)) ? 'kr' : 'en';
  const meme = MEME_FORMATS.has(fmt);
  let main: string;
  if (fmt === 'versus') main = `${c.aLabel ?? '기대'}: ${c.aText ?? ''}\n${c.bLabel ?? '현실'}: ${c.bText ?? ''}`;
  else if (fmt === 'headline') main = `${c.text ?? ''}\n${c.source ?? ''}`;
  else if (fmt === 'greentext') main = c.text ?? '';
  else main = `"${c.text ?? ''}"${c.author ? ' — ' + c.author : ''}`;
  const tr = meme ? MEME_TRIG[m] : REPLY_TRIGGERS[m][0];
  return [main, '', tr, '', buildHashtags(m, meme ? 'meme' : 'quote').join(' ')].join('\n');
}

// ── 썸네일(S1) · 스타일 변형(S2) ────────────────────
const FMT_SAMPLE: Record<string, Partial<CardContent>> = {
  editorial: { text: '평온은 준비된 마음에서 온다.', author: '아우렐리우스', source: '명상록' },
  modern: { text: '평온은 준비된 마음에서.', author: '아우렐리우스', source: '명상록' },
  swiss: { text: '평온은 준비된 마음에서.', author: '아우렐리우스', source: '명상록' },
  center: { text: '평온은 준비된 마음에서.', author: '아우렐리우스', source: '명상록' },
  versus: { kicker: '월급날', aLabel: '기대', aText: '모은다', bLabel: '현실', bText: '스칠 뿐' },
  headline: { kicker: '속보', text: '또 새벽 3시 라면', source: '본인 "마지막"이랬음' },
  greentext: { kicker: '썰', text: '>퇴근함\n>치킨 시킴\n>내일의 나 원망함' },
};
async function thumb(recipe: Recipe, content: Partial<CardContent>, w = 300): Promise<string> {
  const full = await renderCard({ text: '', ...content, handle: ' ' }, recipe, CANVAS.portrait);
  const small = await sharp(full).resize(w).png().toBuffer();
  return small.toString('base64');
}
let thumbCache: { formats: Record<string, string>; presets: Record<string, string> } | null = null;
async function getThumbs() {
  if (thumbCache) return thumbCache;
  const formats: Record<string, string> = {};
  for (const f of OPTIONS.singleFormats) {
    formats[f] = await thumb({ layout: f, palette: 'ink-paper', type: f === 'versus' || f === 'headline' ? 'impact' : 'mixed', background: 'grain' }, FMT_SAMPLE[f] ?? {});
  }
  const presets: Record<string, string> = {};
  for (const [name, r] of Object.entries(PRESETS)) {
    presets[name] = await thumb({ ...r, layout: 'center' }, { text: '가나다 Aa', author: '서체·색' });
  }
  thumbCache = { formats, presets };
  return thumbCache;
}

const VARIATION_PRESETS = ['editorial', 'noir', 'swiss', 'midnight', 'sand', 'forest'];
async function variations(b: Record<string, unknown>) {
  const c = (b.content ?? {}) as Partial<CardContent>;
  const layout = String(b.layout ?? 'editorial');
  const canvas = canvasOf(b.ratio);
  const out: Array<{ preset: string; palette: string; type: string; background: string; img: string }> = [];
  for (const name of VARIATION_PRESETS.slice(0, 4)) {
    const r = PRESETS[name];
    const recipe: Recipe = { layout, palette: r.palette, type: r.type, background: r.background };
    const full = await renderCard({ text: '', ...c, handle: c.handle || BRAND.handle }, recipe, canvas, { scale: Number(b.scale) || 1 });
    out.push({ preset: name, palette: r.palette, type: r.type, background: r.background, img: (await sharp(full).resize(360).png().toBuffer()).toString('base64') });
  }
  return out;
}

function serveStatic(res: http.ServerResponse, urlPath: string) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const file = normalize(resolve(pub, '.' + rel));
  if (!file.startsWith(pub) || !existsSync(file) || !statSync(file).isFile()) return json(res, 404, { error: 'not found' });
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const path = url.pathname;
    const m = req.method ?? 'GET';

    if (m === 'GET' && path === '/api/options') return json(res, 200, OPTIONS);
    if (m === 'GET' && path === '/api/examples')
      return json(res, 200, { deck: { ...BANKS }, meme: { versus: VERSUS_KR, headline: HEADLINE_KR, greentext: GREENTEXT_KR } });

    if (m === 'GET' && path === '/api/thumbs') return json(res, 200, await getThumbs());
    if (m === 'POST' && path === '/api/variations') return json(res, 200, await variations(await readBody(req)));
    if (m === 'POST' && path === '/api/assist') return json(res, 200, await aiAssist(await readBody(req)));
    if (m === 'POST' && path === '/api/caption') return json(res, 200, { caption: editorCaption(await readBody(req)) });
    if (m === 'POST' && path === '/api/render') return png(res, await renderSingle(await readBody(req)));
    if (m === 'POST' && path === '/api/deck') {
      const { slides, strip } = await renderDeckPayload(await readBody(req));
      return json(res, 200, { slides: slides.map((s) => s.toString('base64')), strip: strip.toString('base64') });
    }

    // ── 프로젝트 저장/불러오기 ──
    if (path === '/api/defaults' && m === 'GET') return json(res, 200, store.getDefaults());
    if (path === '/api/defaults' && m === 'POST') { store.saveDefaults(await readBody(req)); return json(res, 200, { ok: true }); }

    if (path === '/api/projects' && m === 'GET') return json(res, 200, store.listProjects());
    if (path === '/api/projects' && m === 'POST') {
      const b = await readBody(req);
      const id = (typeof b.id === 'string' && b.id) ? b.id : store.newId();
      const saved = store.saveProject({ id, name: String(b.name || '제목 없음'), kind: (b.kind === 'deck' ? 'deck' : 'single'), status: b.status ? String(b.status) : '초안', payload: (b.payload ?? {}) as Record<string, unknown> });
      return json(res, 200, { id: saved.id, name: saved.name });
    }
    if (path.startsWith('/api/projects/') && m === 'GET') {
      const p = store.getProject(path.slice('/api/projects/'.length));
      return p ? json(res, 200, p) : json(res, 404, { error: 'not found' });
    }
    if (path.startsWith('/api/projects/') && m === 'DELETE')
      return json(res, 200, { ok: store.deleteProject(path.slice('/api/projects/'.length)) });

    // ── 발행(옵트인: 기본 dry-run) ──
    if (m === 'POST' && path === '/api/publish') {
      const b = await readBody(req);
      const live = b.live === true;
      const baseUrl = typeof b.baseUrl === 'string' ? b.baseUrl : undefined;
      const url2 = (file: string) => (baseUrl ? `${baseUrl.replace(/\/$/, '')}/${file}` : undefined);
      const id = store.newId();
      let media: MediaItem[]; let caption: string;
      if (b.kind === 'deck') {
        const { slides } = await renderDeckPayload(b);
        const dir = resolve(outDir, `deck-editor-${id}`);
        mkdirSync(dir, { recursive: true });
        media = slides.map((s, i) => {
          const f = `slide-${String(i + 1).padStart(2, '0')}.png`;
          writeFileSync(resolve(dir, f), s);
          return { path: resolve(dir, f), url: url2(`deck-editor-${id}/${f}`) };
        });
        caption = String(b.caption || (b.piece as Piece)?.hook || '');
      } else {
        const buf = await renderSingle(b);
        const dir = resolve(outDir, 'editor'); mkdirSync(dir, { recursive: true });
        const f = `${id}.png`; writeFileSync(resolve(dir, f), buf);
        media = [{ path: resolve(dir, f), url: url2(`editor/${f}`) }];
        const c = (b.content ?? {}) as Partial<CardContent>;
        caption = String(b.caption || c.text || c.kicker || '');
      }
      const publisher = live ? getPublisher('threads') : new ThreadsPublisher('DRYRUN', 'DRYRUN');
      const result = await publisher.publish({ caption, media }, { dryRun: !live });
      return json(res, 200, result);
    }

    if (m === 'GET') return serveStatic(res, path);
    json(res, 405, { error: 'method not allowed' });
  } catch (e) {
    json(res, 400, { error: (e as Error).message });
  }
});

// 0.0.0.0 바인딩 → 같은 네트워크/Tailscale의 다른 기기에서 접근 가능.
const HOST = process.env.HOST ?? '0.0.0.0';
server.listen(PORT, HOST, () => console.log(`\n  content-engine 에디터\n  · 로컬:      http://localhost:${PORT}\n  · 네트워크:  http://<이-맥의-IP>:${PORT}  (Tailscale/LAN)\n  (종료: Ctrl+C)\n`));
