# BUILD SPEC — content-engine MVP

> 목표: 4~6주 내 "본인이 매일 쓸 수 있는" 반자동 카드 생성 + 스레드 발행 파이프라인.
> 첫 사용자 = 당신(도그푸딩). 코드보다 콘텐츠 반응 검증이 우선.

## 아키텍처 (텍스트 레이어 분리 = 해자)

```
주제/각도 입력(사람)
   │
   ├─► [copy]  Claude Sonnet/Haiku → 헤드라인·캡션·해시태그   (선택, API키 없으면 코퍼스 직접)
   │
   ├─► [background] 이미지 생성 API or 절차적 그라데이션(Sharp)   (MVP는 그라데이션, 오프라인 동작)
   │
   └─► [text layer] Satori(JSX→SVG) ──► resvg(SVG→PNG)
                                            │
                            [compose] Sharp: 배경 + 텍스트 합성 → 1080×1080 JPEG/PNG
                                            │
                                   [approve] 승인 큐(사람) ── 슬롭 회피 핵심
                                            │
                                   [publish] 스레드 API (1순위) → 인스타 예약(2순위)
```

## 기술 스택
- 런타임: Node 22 + TypeScript (tsx로 직접 실행)
- 텍스트 렌더: `satori` + `@resvg/resvg-js`
- 합성/출력: `sharp`
- 카피(선택): `@anthropic-ai/sdk` (Haiku 4.5 / Sonnet 4.6)
- 설정: `dotenv`
- 발행(추후): 스레드 Graph API 직접 or `Ayrshare`

## 모듈 구조 (확장성)
콘텐츠 = `{ corpus + voice + brand }` 모듈. 새 니치는 파일 추가만.
```
src/
  config/brand.ts        # 브랜드 키트(컬러/폰트/그리드/패딩) — 잠금
  corpus/stoic.ts        # 검증된 인용 + 출처(퍼블릭도메인)
  generate/copy.ts       # LLM 카피(선택)
  generate/render.ts     # Satori 텍스트 레이어 → SVG → PNG
  generate/compose.ts    # Sharp 배경 그라데이션 + 합성
  publish/threads.ts     # 스레드 발행(스텁)
  pipeline.ts            # 배치 생성 → ./out
```

## MVP 범위 (구현 순서)
1. [x] 브랜드 키트 + 스토아 코퍼스(출처 포함)
2. [x] Satori 텍스트 레이어 렌더 + Sharp 그라데이션 합성 → `./out`에 1080² 카드 (API키 0개로 동작)
3. [x] Claude 카피 생성 연동(.env에 ANTHROPIC_API_KEY 있으면 활성, 없으면 폴백)
4. [x] 니치 모듈 확장 구조 + 한국어 코퍼스(동양 고전, 한글 폰트 폴백) — `npm run generate korean`
5. [x] 승인 큐(CLI) — `npm run review` / `approve` / `reject`, approved/ 분리
6. [ ] 이미지 생성 API 배경(Ideogram/GPT Image) 옵션 — `compose(textLayer, background)` 자리 준비됨
7. [ ] 스레드 자동발행(공개 URL 호스팅 → 컨테이너→발행, approved 만 대상)
8. [ ] 인스타 예약, 플랫폼별 리포맷(정사각/캐러셀/슬라이드)

## 실행
```
npm install
npm run fonts        # 폰트 다운로드(최초 1회)
npm run generate     # ./out 에 카드 PNG 생성 (API키 불필요)
```

## 비용 메모 (배치 기준)
- 텍스트 레이어: 무료(로컬 렌더)
- 배경 이미지: Ideogram Turbo ~$0.03/장, GPT Image 2 ~$0.005~
- 카피: Haiku $1/$5·Sonnet $3/$15 per M tok, 캐싱·배치로 절감
→ 월 30~60장 운영 시 이미지/카피 합쳐 수 달러 수준 (그라데이션 배경은 $0)

## 결정 락인
- 텍스트는 절대 확산모델에 안 맡김(품질/브랜드 통제). 항상 Satori 레이어.
- 인용은 퍼블릭도메인 + 출처 필수. 미검증 인용 발행 금지.
- 발행 1순위 스레드, 틱톡 공개 자동발행은 심사 통과 전 보류.
