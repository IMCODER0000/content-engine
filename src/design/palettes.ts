// 팔레트 레지스트리 — 색 조합 축. 새 색감은 여기에 추가만.
import type { Palette } from './types.js';

export const PALETTES: Record<string, Palette> = {
  'ink-paper': { name: 'ink-paper', mode: 'light', bg: '#f4efe3', ink: '#1c1a17', accent: '#b5462f', muted: '#8a8275' },
  noir:        { name: 'noir',      mode: 'dark',  bg: '#0c0c0d', ink: '#f4f2ec', accent: '#ff4326', muted: '#6f7076' },
  fog:         { name: 'fog',       mode: 'light', bg: '#e7e7e2', ink: '#161618', accent: '#d6452f', muted: '#6b6b66' },
  midnight:    { name: 'midnight',  mode: 'dark',  bg: '#11131a', bgTo: '#1d2230', ink: '#f4f1ea', accent: '#c9a96a', muted: '#7d8290' },
  sand:        { name: 'sand',      mode: 'light', bg: '#e8dcc6', ink: '#2a2118', accent: '#5d6440', muted: '#9a8e76' },
  bone:        { name: 'bone',      mode: 'light', bg: '#f1f0ec', ink: '#1a1c22', accent: '#2f55d6', muted: '#7c7e86' },
  forest:      { name: 'forest',    mode: 'dark',  bg: '#10241c', bgTo: '#0a1813', ink: '#eef3ec', accent: '#d8a657', muted: '#7c9183' },
  oxblood:     { name: 'oxblood',   mode: 'dark',  bg: '#2a1416', bgTo: '#1a0c0e', ink: '#f3e9e4', accent: '#e0a96d', muted: '#9c7b76' },
  // 밈/포스터 톤 — 강렬한 노랑 바탕(사회 풍자용)
  signal:      { name: 'signal',    mode: 'light', bg: '#ffd83d', ink: '#16140e', accent: '#e23b2e', muted: '#8a7a2e' },
};
