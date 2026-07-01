// 경량 회귀 테스트 — 엔진/콘텐츠규칙/저장소. 실행: npm test
import assert from 'node:assert/strict';
import { renderCard } from '../src/design/render.js';
import { LAYOUTS } from '../src/design/layouts.js';
import { PALETTES } from '../src/design/palettes.js';
import { TYPEFACES } from '../src/design/typefaces.js';
import { CANVAS } from '../src/design/canvas.js';
import { balanceLines, parseMarks, fitSize, setScale, mix } from '../src/design/util.js';
import { resolveRecipe } from '../src/design/presets.js';
import { buildHashtags } from '../src/content/hashtags.js';
import { buildCaption } from '../src/content/caption.js';
import { renderDeck, buildSlides } from '../src/carousel/deck.js';
import { BANKS } from '../src/content/banks.js';
import * as store from '../src/store.js';
import type { CardContent } from '../src/design/types.js';

let pass = 0, fail = 0;
async function t(name: string, fn: () => unknown | Promise<unknown>) {
  try { await fn(); pass++; console.log('  ✓', name); }
  catch (e) { fail++; console.log('  ✗', name, '—', (e as Error).message); }
}
const isPng = (b: Buffer) => b.length > 1000 && b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG';
const C: CardContent = { text: '테스트 문장 한 줄입니다', author: '저자', source: '출처', kicker: '라벨', label: '1', aLabel: '기대', aText: '이상', bLabel: '현실', bText: '현실임', handle: '@x' };

console.log('\nrender —');
for (const layout of Object.keys(LAYOUTS)) {
  await t(`layout ${layout} → PNG`, async () => {
    const buf = await renderCard(C, { layout, palette: 'ink-paper', type: 'mixed', background: 'solid' }, CANVAS.square);
    assert.ok(isPng(buf));
  });
}
for (const type of Object.keys(TYPEFACES)) {
  await t(`typeface ${type} → PNG`, async () => {
    const buf = await renderCard(C, { layout: 'center', palette: 'noir', type, background: 'solid' }, CANVAS.square);
    assert.ok(isPng(buf));
  });
}
await t('background image override', async () => {
  const buf = await renderCard(C, { layout: 'center', palette: 'noir', type: 'sans', background: 'gradient' }, CANVAS.portrait, { palette: { accent: '#22d3ee' }, scale: 1.2 });
  assert.ok(isPng(buf));
});

console.log('\nutil —');
await t('balanceLines → 배열, 단어 보존', () => {
  const lines = balanceLines('We suffer more often in imagination than in reality.', 70, 800);
  assert.ok(Array.isArray(lines) && lines.length >= 1);
  assert.equal(lines.join(' ').replace(/\s+/g, ' ').trim(), 'We suffer more often in imagination than in reality.');
});
await t('parseMarks → 형광펜 세그먼트', () => {
  const segs = parseMarks('오늘 **갓생** 산다');
  assert.ok(segs.some((s) => s.t === 'm' && s.s === '갓생'));
});
await t('fitSize 전역 배율', () => {
  setScale(1); const a = fitSize(10, 80, 40);
  setScale(1.5); const b = fitSize(10, 80, 40); setScale(1);
  assert.equal(a, 80); assert.equal(b, 120);
});
await t('mix 중간색', () => {
  const m = mix('#000000', '#ffffff', 0.5);
  assert.match(m, /^#[78][0-9a-f]/);
});

console.log('\ncontent rules —');
await t('resolveRecipe 기본/프리셋/검증', () => {
  const r = resolveRecipe();
  assert.ok(r.layout && r.palette && r.type && r.background);
  assert.equal(resolveRecipe({ preset: 'noir' }).palette, 'noir');
  assert.throws(() => resolveRecipe({ palette: '없는팔레트' }));
});
await t('buildHashtags EN/KR', () => {
  assert.ok(buildHashtags('en').length >= 8);
  assert.ok(buildHashtags('kr').some((h) => h.includes('스타그램')));
});
await t('buildCaption 원문 포함', () => {
  const cap = buildCaption({ market: 'en', hook: 'hook', quote: 'the quote', author: 'X' });
  assert.ok(cap.includes('the quote') && cap.includes('#'));
});

console.log('\ncarousel —');
await t('buildSlides steps 시퀀스 길이', () => {
  const piece = BANKS['steps-kr'][0];
  const slides = buildSlides(piece, '@x');
  // cover + beats(n) + rehook + outro
  assert.equal(slides.length, 1 + (piece.beats?.length ?? 0) + (piece.rehook ? 1 : 0) + 1);
});
await t('renderDeck → 슬라이드 PNG 배열', async () => {
  const slides = await renderDeck(BANKS['satire-gap-kr'][0], { layout: 'cover', palette: 'signal', type: 'sans', background: 'solid' }, '@x', CANVAS.portrait);
  assert.ok(slides.length >= 3 && slides.every(isPng));
});

console.log('\nstore —');
await t('프로젝트 저장/조회/삭제 라운드트립', () => {
  const id = store.newId();
  store.saveProject({ id, name: '테스트', kind: 'single', payload: { a: 1 } });
  assert.equal(store.getProject(id)?.name, '테스트');
  assert.equal(store.deleteProject(id), true);
  assert.equal(store.getProject(id), null);
});

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail) process.exit(1);
