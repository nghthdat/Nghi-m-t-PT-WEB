import { Recipe } from '../types';

export type DishTypeId = 'all' | 'mon-chinh' | 'mon-canh' | 'mon-xao' | 'an-vat';
export type TimeBucketId = 'all' | 'under-15' | '15-30' | 'over-30';
export type SortId = 'newest' | 'popular' | 'time_asc' | 'rating_desc';

export const DISH_TYPES: { id: DishTypeId; label: string }[] = [
  { id: 'all', label: 'Tất cả loại món' },
  { id: 'mon-chinh', label: 'Món chính' },
  { id: 'mon-canh', label: 'Món canh' },
  { id: 'mon-xao', label: 'Món xào' },
  { id: 'an-vat', label: 'Ăn vặt' }
];

export const TIME_BUCKETS: { id: TimeBucketId; label: string }[] = [
  { id: 'all', label: 'Mọi thời gian' },
  { id: 'under-15', label: 'Dưới 15 phút' },
  { id: '15-30', label: '15 - 30 phút' },
  { id: 'over-30', label: 'Trên 30 phút' }
];

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'popular', label: 'Phổ biến nhất' },
  { id: 'time_asc', label: 'Thời gian nấu nhanh nhất' },
  { id: 'rating_desc', label: 'Đánh giá cao nhất' }
];

// Parse a free-text Vietnamese duration string ("45 Phút", "3 Giờ", "10'")
// into total minutes. Falls back to a large number when it can't be parsed
// so unparsed recipes sink to the bottom of "fastest" sorts instead of
// falsely winning them.
export function parsePrepMinutes(prepTime?: string): number {
  if (!prepTime) return Number.MAX_SAFE_INTEGER;
  const text = prepTime.trim().toLowerCase();
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const value = parseFloat(match[1].replace(',', '.'));
  if (isNaN(value)) return Number.MAX_SAFE_INTEGER;
  if (text.includes('giờ') || text.includes('gio') || text.includes('h')) {
    return value * 60;
  }
  return value;
}

// Infer a dish type for recipes that don't have one explicitly tagged
// (e.g. older seed data or community submissions), by matching keywords
// in the title. Explicit `recipe.dishType` always takes priority so the
// filter stays accurate for curated content.
export function getDishType(recipe: Recipe): Exclude<DishTypeId, 'all'> {
  if (recipe.dishType) return recipe.dishType;

  const text = `${recipe.title} ${recipe.description || ''}`.toLowerCase();

  if (/(canh|súp|soup|lẩu)/.test(text)) return 'mon-canh';
  if (/(xào|lắc|rang|áp chảo|chiên)/.test(text)) return 'mon-xao';
  if (/(gỏi cuốn|chè|bánh|nem rán|nem cuốn|snack|ăn vặt)/.test(text)) return 'an-vat';
  return 'mon-chinh';
}

// Every distinct ingredient name found across the dataset, sorted
// alphabetically — used to populate the "Nguyên liệu chính" filter with
// options that are guaranteed to exist in the data.
export function getIngredientOptions(recipes: Recipe[]): string[] {
  const names = new Set<string>();
  recipes.forEach((recipe) => {
    recipe.ingredients?.forEach((ing) => {
      if (ing?.name) names.add(ing.name.trim());
    });
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'vi'));
}

export interface RecipeFilterState {
  dishType: DishTypeId;
  time: TimeBucketId;
  ingredient: string; // '' means no ingredient filter
  sort: SortId;
  search: string;
  page: number;
}

export const DEFAULT_FILTER_STATE: RecipeFilterState = {
  dishType: 'all',
  time: 'all',
  ingredient: '',
  sort: 'newest',
  search: '',
  page: 1
};

export function filterRecipes(recipes: Recipe[], filters: RecipeFilterState): Recipe[] {
  return recipes.filter((recipe) => {
    if (filters.dishType !== 'all' && getDishType(recipe) !== filters.dishType) {
      return false;
    }

    if (filters.time !== 'all') {
      const minutes = parsePrepMinutes(recipe.prepTime);
      if (filters.time === 'under-15' && !(minutes < 15)) return false;
      if (filters.time === '15-30' && !(minutes >= 15 && minutes <= 30)) return false;
      if (filters.time === 'over-30' && !(minutes > 30)) return false;
    }

    if (filters.ingredient) {
      const hasIngredient = recipe.ingredients?.some(
        (ing) => ing.name?.toLowerCase() === filters.ingredient.toLowerCase()
      );
      if (!hasIngredient) return false;
    }

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(q);
      const matchesIngredient = recipe.ingredients?.some((ing) =>
        ing.name.toLowerCase().includes(q)
      );
      if (!matchesTitle && !matchesIngredient) return false;
    }

    return true;
  });
}

export function sortRecipes(recipes: Recipe[], sort: SortId): Recipe[] {
  const list = [...recipes];
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => {
        const dateB = new Date(b.createdAt).getTime() || 0;
        const dateA = new Date(a.createdAt).getTime() || 0;
        return dateB - dateA;
      });
    case 'popular':
      return list.sort((a, b) => {
        const popB = (b.reviewCount || 0) * (b.rating || 0);
        const popA = (a.reviewCount || 0) * (a.rating || 0);
        return popB - popA;
      });
    case 'time_asc':
      return list.sort((a, b) => parsePrepMinutes(a.prepTime) - parsePrepMinutes(b.prepTime));
    case 'rating_desc':
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:
      return list;
  }
}

// Read filter/sort/page state from the current URL's search params, falling
// back to defaults for anything missing or invalid. Used to restore the
// listing state when the component remounts (e.g. after viewing a recipe
// detail and navigating back).
export function readFilterStateFromURL(): RecipeFilterState {
  const params = new URLSearchParams(window.location.search);
  const dishType = params.get('category') as DishTypeId | null;
  const time = params.get('time') as TimeBucketId | null;
  const sort = params.get('sort') as SortId | null;
  const page = parseInt(params.get('page') || '1', 10);

  return {
    dishType: DISH_TYPES.some((d) => d.id === dishType) ? (dishType as DishTypeId) : DEFAULT_FILTER_STATE.dishType,
    time: TIME_BUCKETS.some((t) => t.id === time) ? (time as TimeBucketId) : DEFAULT_FILTER_STATE.time,
    ingredient: params.get('ingredient') || DEFAULT_FILTER_STATE.ingredient,
    sort: SORT_OPTIONS.some((s) => s.id === sort) ? (sort as SortId) : DEFAULT_FILTER_STATE.sort,
    search: params.get('q') || DEFAULT_FILTER_STATE.search,
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FILTER_STATE.page
  };
}

// Mirror the current filter/sort/page state onto the URL search params
// (without touching unrelated params like `recipeId`) so state survives a
// remount without reloading the page or piling up browser history entries.
export function writeFilterStateToURL(filters: RecipeFilterState) {
  const url = new URL(window.location.href);
  const set = (key: string, value: string, defaultValue: string) => {
    if (value && value !== defaultValue) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  };

  set('category', filters.dishType, DEFAULT_FILTER_STATE.dishType);
  set('time', filters.time, DEFAULT_FILTER_STATE.time);
  set('ingredient', filters.ingredient, DEFAULT_FILTER_STATE.ingredient);
  set('sort', filters.sort, DEFAULT_FILTER_STATE.sort);
  set('q', filters.search, DEFAULT_FILTER_STATE.search);
  set('page', String(filters.page), String(DEFAULT_FILTER_STATE.page));

  window.history.replaceState({}, '', url.toString());
}
