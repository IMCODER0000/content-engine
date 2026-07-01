# content-engine

Anti-slop 타이포그래피 콘텐츠 엔진 (철학·풍자 SNS). 전략: `docs/STRATEGY.md`, 빌드 스펙: `docs/BUILD_SPEC.md`.

핵심: **글자를 확산모델에 맡기지 않고** Satori로 텍스트 레이어를 픽셀 퍼펙트하게 렌더 → Sharp로 배경과 합성.

## 웹 에디터 (내용·설정을 직접 넣어 생성하는 인터랙티브 툴)
```bash
./run.sh                 # 기본 포트 8080
PORT=9000 ./run.sh       # 포트 변경
```
→ 브라우저에서 **http://localhost:8080**. 좌측에서 포맷·내용·팔레트·서체·배경·비율을 고르고 **생성** → 우측 미리보기 → 다운로드. 종료: Ctrl+C.
- **실시간 미리보기**(기본 ON, 디바운스) · **🎲 랜덤**(스타일 셔플) · **커스텀 색상**(강조/배경/글자) · **글자 크기 슬라이더**(70~140%).
- **형광펜 강조**: 본문에 `**단어**` → 노랑 마커 칩. (모든 인용/밈 레이아웃)
- **서체 6종**: sans(Inter) · serif(Newsreader) · mixed · **impact**(Black Han Sans 초굵은 임팩트) · **round**(Jua 친근) · **dotum**(고운돋움 레트로/날것). 한글 폴백 포함.
- **✨ AI 카피 어시스트**: 주제 입력 → Claude가 포맷/톤에 맞는 카피 자동 생성(`/api/assist`, `ANTHROPIC_API_KEY` 필요).
- **캡션 복사**: 카드/캐러셀에 맞는 포스팅 캡션 + 해시태그 자동 생성·클립보드 복사(`/api/caption`).

## 테스트
```bash
npm test          # 경량 회귀(엔진·콘텐츠규칙·저장소, 28+ 케이스)
npm run typecheck
```
- **단일 카드** 탭: editorial/modern/swiss/center/versus/headline/greentext, 필드 자동 변경. **배경 이미지 업로드** 지원(가독성 scrim 자동).
- **캐러셀** 탭: 톤(earnest/ironic/gap) 선택, 뱅크 예시 편집, 슬라이드별 다운로드.
- **프로젝트 저장/불러오기**: 작업 설정+내용을 `data/projects/`에 저장, 드롭다운에서 복원/삭제.
- **발행 버튼**(옵트인): dry-run 미리보기(실제 발행은 토큰+공개URL). 발행 시 카드/덱이 `out/`에 기록.
- API: `/api/options` · `/api/render`(단일→PNG) · `/api/deck`(캐러셀) · `/api/projects`(CRUD) · `/api/publish` · `/api/examples`. 서버 `src/server.ts`(Node 내장 http, 의존성 0), UI `public/index.html`, 저장소 `src/store.ts`.
- 멀티계정/인증은 배포 시점 과제(현재 로컬 단일 사용자 — 핸들 편집+프로젝트 저장으로 다중 아이덴티티 커버). 정적 갤러리는 `npm run gallery`.

## 빠른 시작 (수동, API 키 0개로 동작)
```bash
npm install
npm run fonts        # Inter 폰트 다운로드(최초 1회)
npm run generate         # 기본(stoic) 코퍼스로 카드 생성
npm run generate korean  # 한국어(동양 고전) 코퍼스
npm run generate korean 3  # 코퍼스 + 개수 지정
```

## 디자인 시스템 (고정 아님 — 자유 조합)
디자인을 4개 독립 축으로 분해. 조합 = **레시피**.
- **layout**: editorial · modern · swiss · center
- **palette**: ink-paper · noir · fog · midnight · sand · bone · forest · oxblood
- **type**: serif(Newsreader+나눔명조) · sans(Inter) · mixed
- **background**: solid · gradient · grain

```bash
npm run matrix                  # 레이아웃×팔레트 16조합을 한 장(out/matrix.png)으로 미리보기
npm run generate korean editorial          # 프리셋으로
npm run generate -- --layout=swiss --palette=noir --type=sans --bg=gradient   # 축 직접 조합
npm run generate noir -- --palette=forest  # 프리셋 위에 한 축만 교체
```
프리셋: editorial · noir · swiss · midnight · sand · forest · oxblood · bone (`src/design/presets.ts`).
새 축은 `src/design/{layouts,palettes,typefaces}.ts` 에 추가만 하면 즉시 조합 대상이 됨.

**비율(ratio)**: 단일 카드 기본 1:1(square), 캐러셀 기본 4:5(portrait, 1080×1350 — 피드 점유 최대). `--ratio=portrait|square` 로 변경. `src/design/canvas.ts`.

## 캐러셀 (다중 슬라이드 — 인스타 핵심 포맷)
한 인용을 표지(훅) → 전개(01·02·03) → 원문 → CTA 슬라이드로 자동 전개. 페이지 점 인디케이터 + 가로 스트립 미리보기.
```bash
npm run deck-demo                  # earnest 7슬라이드 데모 (out/deck-demo/_strip.png)
npm run satire-demo                # ironic(풍자) 5슬라이드 데모 (out/satire-demo/_strip.png)
npm run satire-demo-kr             # 한국어 풍자 데모 (나눔명조 + bathos)
npm run deck korean editorial      # 코퍼스에서 덱 생성 (out/deck-<corpus>-<id>/)
npm run deck stoic -- --tone=ironic --palette=bone   # 풍자 톤
```
**톤**: `--tone=earnest`(기본, 긴장 해소) / `--tone=ironic`(풍자, bathos: 진지하게 쌓고 시시하게 착지 + 오귀속 + 반전 CTA).

**콘텐츠 뱅크** (완성형 Piece — API 키 불필요, 바로 발행 가능):
```bash
npm run deck -- --bank=satire-kr --palette=ink-paper --type=mixed       # 고전 명언 데드팬(bathos) 6편
npm run deck -- --bank=satire-gap-kr --palette=signal --type=sans       # 이상 vs 현실 사회 풍자(밈/포스터) 3편
```
뱅크는 `src/content/banks.ts` 에 등록. 캡션도 자동 생성(caption.txt) → publish 자동 사용.

**톤 4종**: earnest(진지) · ironic(고전 명언 bathos) · gap(이상 vs 현실 사회 풍자) · **steps(단계별 짤 — 제목→1·2·3 에스컬레이션→펀치→랭킹 CTA)**.

**밈 단일 카드** (리서치 기반 포맷 — `docs/REFERENCE-MEME.md`):
```bash
npm run meme versus      # 기대 vs 현실 / 회사 말 vs 진짜 (2단 비교)
npm run meme headline    # 가짜 속보(The Onion식 대놓고 풍자)
npm run meme greentext   # 음슴체 >나임 썰 + 반전 (트렌디 밈)
npm run meme all -- --palette=signal
```
포맷·뱅크: `src/content/meme-kr.ts`, 레이아웃: `src/design/layouts.ts`(versus/headline/greentext). 로드맵 포맷(드레이크/트친소/단계별/가짜통계/카톡 등)은 REFERENCE-MEME.md.
전개 포인트 슬라이드는 `ANTHROPIC_API_KEY` 있을 때 Claude Sonnet으로 생성(반슬롭 톤). 없으면 표지+원문+CTA로 폴백.
슬라이드 레이아웃: cover · point · outro (`src/design/layouts.ts`), 덱 조립/오버레이/스트립은 `src/carousel/`.

## 발행 (옵트인 — 기본 dry-run, 자동 아님)
승인된 카드/덱만 발행. 기본은 미리보기(dry-run), `--live` 일 때만 실제 게시.
```bash
npm run publish                         # 승인 카드 발행 계획 미리보기
npm run publish deck deck-stoic-seneca-1   # 덱(캐러셀) 미리보기
npm run publish card -- --live --base-url=https://cdn.you/out   # 실제 발행
```
- 스레드는 직접 업로드 불가 → 이미지를 공개 URL(S3/R2/CDN)에 올린 뒤 `--base-url` 로 매핑.
- 라이브는 `.env` 의 `THREADS_USER_ID`/`THREADS_ACCESS_TOKEN` 필요. 미디어 1장=단일, 2~20장=캐러셀 자동 판별.
- 발행 성공 시 매니페스트 상태가 `published` 로 갱신. 인스타/틱톡 발행기는 추후 추가(`src/publish/`).

## 승인 큐 (발행 전 사람 게이트 = 슬롭 회피 핵심)
```bash
npm run review                  # 상태 목록(⏳pending/✅approved/🗑️rejected)
npm run review approve <id...>  # 승인 → out/approved/ 로 복사
npm run review approve pending  # 대기 전체 승인
npm run review reject <id...>   # 탈락
```

## 카피 생성 켜기(선택)
`.env`에 `ANTHROPIC_API_KEY` 채우면 Claude Haiku로 캡션·해시태그 생성. 없으면 코퍼스 원문 사용.

## 다음 단계
- 배경을 이미지 생성 API(Ideogram/GPT Image)로 교체 (`compose()` 에 background 전달)
- 승인 큐 → 스레드 자동발행(`src/publish/threads.ts`, 공개 URL 호스팅 필요)
- 새 니치는 `src/corpus/*.ts` + 브랜드 키트 복제로 확장
