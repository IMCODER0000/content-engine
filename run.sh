#!/usr/bin/env bash
# content-engine 원샷 실행 — 설치 → 폰트 → 웹 에디터 서버.
# 사용: ./run.sh           (기본 포트 8080)
#       PORT=9000 ./run.sh (포트 변경)
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8080}"

echo "▶ [1/3] 의존성 설치"
[ -d node_modules ] || npm install

echo "▶ [2/3] 폰트 다운로드(최초 1회)"
npm run fonts

echo "▶ [3/3] 웹 에디터 서버 시작"
echo ""
echo "  ┌──────────────────────────────────────────────┐"
echo "  │  content-engine 에디터                        │"
echo "  │  → http://localhost:${PORT}                       │"
echo "  │  내용·설정을 직접 넣어 카드/캐러셀 생성       │"
echo "  │  (종료: Ctrl+C)                               │"
echo "  └──────────────────────────────────────────────┘"
echo ""
PORT="$PORT" exec npm run serve
