// 발행 추상화 — 플랫폼 무관. 단일 이미지(media 1) / 캐러셀(media 2~20).
// 발행은 항상 옵트인: 기본 dry-run, --live 일 때만 실제 게시.
export interface MediaItem {
  path: string; // 로컬 PNG 경로
  url?: string; // 공개 URL(라이브 발행 필수 — 호스팅 후 주입)
}

export interface PublishRequest {
  caption: string;
  media: MediaItem[];
}

export interface PublishOptions {
  dryRun: boolean;
}

export interface PublishResult {
  platform: string;
  dryRun: boolean;
  id?: string; // 라이브 발행 성공 시 게시물 id
  plan?: string[]; // dry-run 시 수행될 API 단계 미리보기
}

export interface Publisher {
  platform: string;
  publish(req: PublishRequest, opts: PublishOptions): Promise<PublishResult>;
}
