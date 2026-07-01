// 프로젝트 저장소 — 에디터에서 만든 카드/캐러셀 설정을 디스크에 보관(JSON).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../data');
const dir = resolve(dataDir, 'projects');
const defaultsFile = resolve(dataDir, 'defaults.json');

// 내 기본값(핸들·기본 스타일) — 재시작에도 유지.
export function getDefaults(): Record<string, unknown> {
  try { return existsSync(defaultsFile) ? JSON.parse(readFileSync(defaultsFile, 'utf8')) : {}; } catch { return {}; }
}
export function saveDefaults(d: Record<string, unknown>): void {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(defaultsFile, JSON.stringify(d, null, 2));
}

export interface Project {
  id: string;
  name: string;
  kind: 'single' | 'deck';
  status?: string; // 초안 | 완성 | 발행 (백로그)
  payload: Record<string, unknown>; // 렌더 요청(설정+내용) 그대로
  updatedAt: number;
}

function ensure() { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }
const valid = (id: string) => /^[a-z0-9-]{4,40}$/.test(id);

export function newId(): string {
  return `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export function listProjects(): Array<Pick<Project, 'id' | 'name' | 'kind' | 'status' | 'updatedAt'>> {
  ensure();
  return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => {
    const p = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Project;
    return { id: p.id, name: p.name, kind: p.kind, status: p.status ?? '초안', updatedAt: p.updatedAt };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): Project | null {
  ensure();
  if (!valid(id)) return null;
  const f = resolve(dir, `${id}.json`);
  return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as Project) : null;
}

export function saveProject(p: Omit<Project, 'updatedAt'>): Project {
  ensure();
  if (!valid(p.id)) throw new Error('잘못된 id');
  const full: Project = { ...p, updatedAt: Date.now() };
  writeFileSync(resolve(dir, `${p.id}.json`), JSON.stringify(full, null, 2));
  return full;
}

export function deleteProject(id: string): boolean {
  ensure();
  if (!valid(id)) return false;
  const f = resolve(dir, `${id}.json`);
  if (!existsSync(f)) return false;
  rmSync(f);
  return true;
}
