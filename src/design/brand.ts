// 브랜드 아이덴티티 — 한 곳에서 관리. 계정/브랜드 확정 시 여기만 수정.
// 환경변수로도 덮어쓸 수 있음(CI/멀티계정 운영 대비).
export const BRAND = {
  handle: process.env.CE_HANDLE ?? '@your_handle',
  wordmark: process.env.CE_WORDMARK ?? '', // 비우면 미표시
};
