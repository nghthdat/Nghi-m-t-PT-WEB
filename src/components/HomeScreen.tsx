import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, X, Plus, Flame, Filter, ChefHat, ArrowRight, Utensils, Store, ShoppingBag, ShieldCheck, Truck, Compass, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { MealDecisionWheel } from './MealDecisionWheel';
import { DailyCookingStreak } from './DailyCookingStreak';
import { KitchenTipsCard } from './KitchenTipsCard';
import {
  DISH_TYPES,
  TIME_BUCKETS,
  SORT_OPTIONS,
  RecipeFilterState,
  DEFAULT_FILTER_STATE,
  filterRecipes,
  sortRecipes,
  getIngredientOptions,
  readFilterStateFromURL,
  writeFilterStateToURL
} from '../lib/recipeFilters';

interface HomeScreenProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSearchWithIngredients: (ingredients: string[]) => void;
  onNavigateToSubmit: () => void;
  onNavigateToShop?: () => void;
}

const POPULAR_INGREDIENTS = [
  'Trứng gà',
  'Cà chua',
  'Thịt ba chỉ',
  'Thịt bò',
  'Đậu hũ',
  'Hành lá',
  'Bánh phở',
  'Tôm sú',
  'Cá diêu hồng'
];

const PAGE_SIZE = 9;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  onSearchWithIngredients,
  onNavigateToSubmit,
  onNavigateToShop
}) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['Trứng gà', 'Cà chua']);

  // Recipe listing filter/sort/pagination state — initialized from the URL
  // so it survives a remount (e.g. viewing a recipe detail then going back).
  const [filters, setFilters] = useState<RecipeFilterState>(() => readFilterStateFromURL());

  // Keep the URL search params mirrored to the current filter state.
  useEffect(() => {
    writeFilterStateToURL(filters);
  }, [filters]);

  const updateFilters = (updates: Partial<Omit<RecipeFilterState, 'page'>>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  const hasActiveFilters =
    filters.dishType !== DEFAULT_FILTER_STATE.dishType ||
    filters.time !== DEFAULT_FILTER_STATE.time ||
    filters.ingredient !== DEFAULT_FILTER_STATE.ingredient ||
    filters.sort !== DEFAULT_FILTER_STATE.sort ||
    filters.search.trim() !== '';

  const ingredientOptions = useMemo(() => getIngredientOptions(recipes), [recipes]);

  const handleAddIngredient = (item?: string) => {
    const target = item || ingredientInput.trim();
    if (target && !selectedIngredients.includes(target)) {
      setSelectedIngredients([...selectedIngredients, target]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (item: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleSearchSubmit = () => {
    onSearchWithIngredients(selectedIngredients);
  };

  // Filter + sort recipes (accurate, deterministic — recomputed only when
  // the source data or the active filters actually change).
  const filteredRecipes = useMemo(
    () => sortRecipes(filterRecipes(recipes, filters), filters.sort),
    [recipes, filters]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);

  // If the active page becomes out of range (e.g. a filter just shrank the
  // result set), snap it back so the URL and UI stay in sync.
  useEffect(() => {
    if (filters.page > totalPages) {
      setFilters((prev) => ({ ...prev, page: totalPages }));
    }
  }, [filters.page, totalPages]);

  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setFilters((prev) => ({ ...prev, page: clamped }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B2118] via-[#3D2E22] to-[#2B2118] text-white p-6 sm:p-10 shadow-xl border border-[#4A3B2C]">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[#e8703a]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-[#a33e07]/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            AI Tìm Món Theo Nguyên Liệu Sẵn Có
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-100 bg-clip-text text-transparent drop-shadow-md">
            Hôm Nay Ăn Gì? Để Bếp Lo!
          </h1>

          <p className="text-xs sm:text-sm text-amber-50 max-w-lg mx-auto leading-relaxed">
            Bạn có nguyên liệu gì trong tủ lạnh? Nhập vào đây, AI sẽ gợi ý và xếp hạng món ăn phù hợp nhất!
          </p>

          {/* Ingredient Input Box */}
          <div className="mt-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-left shadow-2xl border border-white/30 text-[#2B2118]">
            <div className="flex items-center gap-2 border-b border-[#EAE0D5] pb-2.5">
              <Utensils className="w-5 h-5 text-[#a33e07] shrink-0" />
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên nguyên liệu (vd: trứng, thịt ba chỉ, cà chua...)"
                className="w-full text-sm bg-transparent outline-none placeholder:text-gray-500 placeholder:font-medium font-medium"
              />
              <button
                type="button"
                onClick={() => handleAddIngredient()}
                className="shrink-0 px-3 py-1.5 bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#a33e07] text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {/* Selected Ingredient Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2 min-h-[32px]">
              {selectedIngredients.length === 0 && (
                <span className="text-xs text-[#8C7D6F] italic">
                  Chưa chọn nguyên liệu nào. Hãy nhập hoặc chọn từ danh sách bên dưới.
                </span>
              )}
              {selectedIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#a33e07] text-white text-xs font-bold shadow-xs animate-in fade-in zoom-in-95 duration-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(item)}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Select Tags (only ingredients not yet selected, to avoid duplicate display) */}
            <div className="mt-3 pt-2.5 border-t border-[#F7F2EE] flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#8C7D6F] shrink-0">Gợi ý nhanh:</span>
              {POPULAR_INGREDIENTS.filter((item) => !selectedIngredients.includes(item)).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddIngredient(item)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#F7F2EE] hover:bg-[#EAE0D5] text-[#6B5D4F] transition-all"
                >
                  + {item}
                </button>
              ))}
            </div>

            {/* Action Search Button */}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white text-sm font-bold shadow-md shadow-[#a33e07]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-orange-200" />
              GỢI Ý MÓN ĂN VỚI NGUYÊN LIỆU ĐÃ CHỌN
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Meal Decision Wheel (Retention Booster #1) */}
      <section>
        <MealDecisionWheel
          recipes={recipes}
          onSelectRecipe={onSelectRecipe}
        />
      </section>

      {/* Daily Cooking Streak & Habit Tracker (Retention Booster #2) */}
      <section>
        <DailyCookingStreak />
      </section>

      {/* Filter & Sort Toolbar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-[#2B2118] flex items-center gap-2">
            <span className="w-2 h-5 bg-[#a33e07] rounded-full" />
            Bộ lọc & sắp xếp công thức
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D6F]" />
            <input
              type="text"
              placeholder="Tìm theo tên món..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#EAE0D5] focus:outline-[#a33e07] w-40 sm:w-56"
            />
          </div>
        </div>

        <div className="flex items-end gap-2.5 flex-wrap bg-white p-3 rounded-2xl border border-[#EAE0D5]">
          {/* Loại món */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wide block mb-1">
              Loại món
            </label>
            <select
              value={filters.dishType}
              onChange={(e) => updateFilters({ dishType: e.target.value as RecipeFilterState['dishType'] })}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118] cursor-pointer"
            >
              {DISH_TYPES.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Thời gian chế biến */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wide block mb-1">
              Thời gian chế biến
            </label>
            <select
              value={filters.time}
              onChange={(e) => updateFilters({ time: e.target.value as RecipeFilterState['time'] })}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118] cursor-pointer"
            >
              {TIME_BUCKETS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Nguyên liệu chính */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wide block mb-1">
              Nguyên liệu chính
            </label>
            <select
              value={filters.ingredient}
              onChange={(e) => updateFilters({ ingredient: e.target.value })}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118] cursor-pointer"
            >
              <option value="">Mọi nguyên liệu</option>
              {ingredientOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wide block mb-1">
              Sắp xếp theo
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as RecipeFilterState['sort'] })}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Xóa tất cả bộ lọc */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#EAE0D5] text-[#a33e07] hover:bg-[#FFF0E6] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Xóa tất cả bộ lọc
          </button>
        </div>
      </section>

      {/* Recipe Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2B2118]">Món ngon mỗi ngày</h2>
            <p className="text-xs text-[#6B5D4F]">
              Được cộng đồng nấu nướng yêu thích nhất ({filteredRecipes.length} công thức)
            </p>
          </div>

          <button
            onClick={onNavigateToSubmit}
            className="text-xs font-bold text-[#a33e07] hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Đăng món mới
          </button>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#EAE0D5] space-y-3">
            <ChefHat className="w-12 h-12 text-[#8C7D6F] mx-auto stroke-1" />
            <h3 className="font-bold text-[#2B2118]">Không tìm thấy món ăn phù hợp với bộ lọc đã chọn</h3>
            <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
              Hãy thử đổi loại món, thời gian chế biến, nguyên liệu hoặc từ khóa tìm kiếm — hoặc dùng tính năng "Gợi ý món AI" để tìm món ăn từ nguyên liệu tủ lạnh của bạn!
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#FFF0E6] text-[#a33e07] text-xs font-bold rounded-xl"
            >
              Xóa bộ lọc & xem tất cả công thức
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={onSelectRecipe}
                  onToggleFavorite={onToggleFavorite}
                  onNavigateToShop={onNavigateToShop}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 rounded-xl border border-[#EAE0D5] bg-white text-[#6B5D4F] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#a33e07]/40 cursor-pointer"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      page === currentPage
                        ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
                        : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:border-[#D1C2B4]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 rounded-xl border border-[#EAE0D5] bg-white text-[#6B5D4F] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#a33e07]/40 cursor-pointer"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Culinary Secrets & Kitchen Hacks (Retention Booster #3) */}
      <section>
        <KitchenTipsCard 
          onSelectRecipeTitle={(dishTitle) => {
            const q = dishTitle.toLowerCase();
            const matched = recipes.find(r => r.title.toLowerCase().includes(q) || q.includes(r.title.toLowerCase()));
            if (matched) onSelectRecipe(matched);
          }}
        />
      </section>

      {/* Kitchenware & Spices Store Discovery Banner */}
      {onNavigateToShop && (
        <section className="bg-gradient-to-r from-[#2B2118] via-[#403023] to-[#2B2118] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a33e07] text-xs font-bold text-white shadow-xs">
              <Store className="w-3.5 h-3.5" />
              <span>Gian Hàng Bếp Việt</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sắm Nồi Đất, Chảo Gang & Gia Vị Chuẩn Vị
            </h3>
            <p className="text-xs sm:text-sm text-[#D1C2B4] leading-relaxed">
              Trang bị cho căn bếp những dụng cụ nấu nướng chất lượng cao, nồi đất Bát Tràng tráng men, hạt dổi mắc khén với link mua trực tiếp trên các sàn TMĐT uy tín (Shopee, Lazada, Tiki, TikTok Shop).
            </p>
          </div>

          <button
            onClick={onNavigateToShop}
            className="py-3 px-6 rounded-2xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#a33e07]/30 flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ghé Thăm Cửa Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}
    </div>
  );
};
