// 스레드 발행기 — 1순위 채널. 단일 이미지 + 캐러셀(2~20장) 지원.
// 주의: 스레드는 직접 업로드 불가 → 각 이미지는 공개 URL 필요(S3/R2/CDN). url 은 호스팅 후 주입.
// 한도(2026 기준, 재확인 필요): 250포스트/24h, 캐러셀 2~20장.
import type { Publisher, PublishRequest, PublishOptions, PublishResult } from './types.js';

const API = 'https://graph.threads.net/v1.0';

export class ThreadsPublisher implements Publisher {
  platform = 'threads';
  constructor(private userId: string, private token: string) {}

  private async post(path: string, params: Record<string, string>): Promise<string> {
    const qs = new URLSearchParams({ ...params, access_token: this.token });
    const res = await fetch(`${API}/${path}?${qs}`, { method: 'POST' });
    const body = (await res.json()) as { id?: string; error?: { message: string } };
    if (!res.ok || !body.id) throw new Error(`Threads API ${res.status}: ${body.error?.message ?? 'no id'}`);
    return body.id;
  }

  async publish(req: PublishRequest, opts: PublishOptions): Promise<PublishResult> {
    const n = req.media.length;
    if (n < 1) throw new Error('media 비어있음');
    if (n > 20) throw new Error('캐러셀 최대 20장');
    const isCarousel = n > 1;

    if (opts.dryRun) {
      const plan = isCarousel
        ? [
            ...req.media.map((m, i) => `① item 컨테이너 #${i + 1} 생성 (IMAGE, is_carousel_item=true, url=${m.url ?? '⚠️ 공개 URL 필요'})`),
            `② CAROUSEL 컨테이너 생성 (children=${n}개, text=캡션 ${req.caption.length}자)`,
            `③ threads_publish 로 게시`,
          ]
        : [
            `① IMAGE 컨테이너 생성 (url=${req.media[0].url ?? '⚠️ 공개 URL 필요'}, text=캡션 ${req.caption.length}자)`,
            `② threads_publish 로 게시`,
          ];
      return { platform: this.platform, dryRun: true, plan };
    }

    // 라이브: 모든 미디어에 공개 URL 필요
    const missing = req.media.filter((m) => !m.url);
    if (missing.length) throw new Error(`공개 URL 누락 ${missing.length}건 — 이미지를 호스팅 후 --base-url 지정`);

    let creationId: string;
    if (isCarousel) {
      const childIds: string[] = [];
      for (const m of req.media) {
        childIds.push(await this.post(`${this.userId}/threads`, { media_type: 'IMAGE', image_url: m.url!, is_carousel_item: 'true' }));
      }
      creationId = await this.post(`${this.userId}/threads`, { media_type: 'CAROUSEL', children: childIds.join(','), text: req.caption });
    } else {
      creationId = await this.post(`${this.userId}/threads`, { media_type: 'IMAGE', image_url: req.media[0].url!, text: req.caption });
    }
    const id = await this.post(`${this.userId}/threads_publish`, { creation_id: creationId });
    return { platform: this.platform, dryRun: false, id };
  }
}
