// Inter 폰트 다운로드 (최초 1회). Satori는 폰트 데이터를 직접 받아야 한다.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, '../assets/fonts');

const FONTS: Record<string, string> = {
  'Inter-Regular.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff',
  'Inter-SemiBold.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-600-normal.woff',
  'Inter-Bold.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff',
  // 한국어 글리프(Satori는 누락 글자를 제공된 폰트들에서 폴백)
  'NotoSansKR-Regular.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.19/files/noto-sans-kr-korean-400-normal.woff',
  'NotoSansKR-Bold.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.19/files/noto-sans-kr-korean-700-normal.woff',
  // 쇼케이스용 — 개성 있는 디스플레이 서체
  'Inter-Black.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-900-normal.woff',
  'Newsreader-Regular.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/newsreader/files/newsreader-latin-400-normal.woff',
  'Newsreader-SemiBold.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/newsreader/files/newsreader-latin-600-normal.woff',
  'Newsreader-Italic.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/newsreader/files/newsreader-latin-400-italic.woff',
  // 한국어 세리프(에디토리얼 테마용 한글 폴백) — 나눔명조
  'NanumMyeongjo-Regular.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/nanum-myeongjo/files/nanum-myeongjo-korean-400-normal.woff',
  'NanumMyeongjo-Bold.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/nanum-myeongjo/files/nanum-myeongjo-korean-700-normal.woff',
  // 임팩트 디스플레이(밈/헤드라인 펀치) — Black Han Sans
  'BlackHanSans-KR.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/black-han-sans/files/black-han-sans-korean-400-normal.woff',
  'BlackHanSans-Latin.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/black-han-sans/files/black-han-sans-latin-400-normal.woff',
  // 라운드 친근체("이건 농담이야") — Jua
  'Jua-KR.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/jua/files/jua-korean-400-normal.woff',
  'Jua-Latin.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/jua/files/jua-latin-400-normal.woff',
  // 돋움 레트로(날것/아이러니) — 고운돋움(굴림/돋움 시스템폰트 느낌의 오픈 대체)
  'GowunDodum-KR.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/gowun-dodum/files/gowun-dodum-korean-400-normal.woff',
  'GowunDodum-Latin.woff':
    'https://cdn.jsdelivr.net/npm/@fontsource/gowun-dodum/files/gowun-dodum-latin-400-normal.woff',
};

async function main() {
  mkdirSync(dir, { recursive: true });
  for (const [name, url] of Object.entries(FONTS)) {
    const path = resolve(dir, name);
    if (existsSync(path)) {
      console.log(`  · ${name} (이미 있음)`);
      continue;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`다운로드 실패 ${name}: ${res.status}`);
    const data = Buffer.from(await res.arrayBuffer());
    if (data.length < 1024) throw new Error(`빈/손상 파일 ${name}: ${data.length} bytes — URL 확인`);
    writeFileSync(path, data);
    console.log(`  ✓ ${name} (${(data.length / 1024).toFixed(0)}KB)`);
  }
  console.log('폰트 준비 완료.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
