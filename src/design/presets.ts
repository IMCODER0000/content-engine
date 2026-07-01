// 프리셋 = 자주 쓰는 레시피 조합에 이름 붙인 것. 축은 언제든 개별 오버라이드 가능.
import type { Recipe, BackgroundKind } from './types.js';
import { PALETTES } from './palettes.js';
import { TYPEFACES } from './typefaces.js';
import { LAYOUTS } from './layouts.js';

export const PRESETS: Record<string, Recipe> = {
  editorial: { layout: 'editorial', palette: 'ink-paper', type: 'serif', background: 'grain' },
  noir:      { layout: 'modern',    palette: 'noir',      type: 'sans',  background: 'solid' },
  swiss:     { layout: 'swiss',     palette: 'fog',       type: 'sans',  background: 'solid' },
  midnight:  { layout: 'center',    palette: 'midnight',  type: 'serif', background: 'gradient' },
  sand:      { layout: 'editorial', palette: 'sand',      type: 'mixed', background: 'grain' },
  forest:    { layout: 'center',    palette: 'forest',    type: 'serif', background: 'gradient' },
  oxblood:   { layout: 'modern',    palette: 'oxblood',   type: 'mixed', background: 'gradient' },
  bone:      { layout: 'swiss',     palette: 'bone',      type: 'sans',  background: 'solid' },
};

export const DEFAULT_RECIPE: Recipe = PRESETS.editorial;

export interface RecipeOverrides {
  preset?: string;
  layout?: string;
  palette?: string;
  type?: string;
  background?: BackgroundKind;
}

// 프리셋(또는 기본) 위에 개별 축 오버라이드를 얹어 최종 레시피 확정 + 검증.
export function resolveRecipe(o: RecipeOverrides = {}): Recipe {
  const base = o.preset ? PRESETS[o.preset] : DEFAULT_RECIPE;
  if (o.preset && !base) throw new Error(`프리셋 없음: "${o.preset}" (가능: ${Object.keys(PRESETS).join(', ')})`);
  const r: Recipe = {
    layout: o.layout ?? base.layout,
    palette: o.palette ?? base.palette,
    type: o.type ?? base.type,
    background: o.background ?? base.background,
  };
  if (!LAYOUTS[r.layout]) throw new Error(`layout 없음: "${r.layout}" (가능: ${Object.keys(LAYOUTS).join(', ')})`);
  if (!PALETTES[r.palette]) throw new Error(`palette 없음: "${r.palette}" (가능: ${Object.keys(PALETTES).join(', ')})`);
  if (!TYPEFACES[r.type]) throw new Error(`type 없음: "${r.type}" (가능: ${Object.keys(TYPEFACES).join(', ')})`);
  return r;
}
