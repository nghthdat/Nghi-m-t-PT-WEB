import React, { useState } from 'react';
import { Search, Sparkles, X, Plus, Flame, Filter, ChefHat, ArrowRight, Utensils, Store, ShoppingBag, ShieldCheck, Truck, Compass, BookOpen } from 'lucide-react';
import { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { MealDecisionWheel } from './MealDecisionWheel';
import { DailyCookingStreak } from './DailyCookingStreak';
import { KitchenTipsCard } from './KitchenTipsCard';

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

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'chay', label: 'Ăn chay' },
  { id: 'man', label: 'Đồ mặn' },
  { id: 'quick', label: 'Dưới 15 phút' },
  { id: 'low-cal', label: 'Ít calo' },
  { id: 'mien-bac', label: 'Miền Bắc' },
  { id: 'mien-nam', label: 'Miền Nam' }
];

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

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

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.categories.some(cat => {
      const c = cat.toLowerCase();
      if (selectedCategory === 'chay') return c.includes('chay') || c.includes('ăn chay');
      if (selectedCategory === 'man') return c.includes('mặn') || c.includes('đồ mặn');
      if (selectedCategory === 'quick') return c.includes('15') || c.includes('quick');
      if (selectedCategory === 'low-cal') return c.includes('calo') || recipe.calories <= 300;
      if (selectedCategory === 'mien-bac') return c.includes('bắc');
      if (selectedCategory === 'mien-nam') return c.includes('nam');
      return true;
    });

    const matchesSearch = !searchFilter.trim() || 
      recipe.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      recipe.ingredients.some(i => i.name.toLowerCase().includes(searchFilter.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

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

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Hôm nay ăn gì đây cả nhà ơi? (Test OK)
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/80 max-w-lg mx-auto leading-relaxed">
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
                className="w-full text-sm bg-transparent outline-none placeholder:text-[#8C7D6F] font-medium"
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

            {/* Quick Select Tags */}
            <div className="mt-3 pt-2.5 border-t border-[#F7F2EE] flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#8C7D6F] shrink-0">Gợi ý nhanh:</span>
              {POPULAR_INGREDIENTS.map((item) => {
                const isSelected = selectedIngredients.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveIngredient(item) : handleAddIngredient(item))}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[#FFE0CC] text-[#a33e07] font-bold'
                        : 'bg-[#F7F2EE] hover:bg-[#EAE0D5] text-[#6B5D4F]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {item}
                  </button>
                );
              })}
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

      {/* Category Pills Filter */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2B2118] flex items-center gap-2">
            <span className="w-2 h-5 bg-[#a33e07] rounded-full" />
            Khám phá theo danh mục
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D6F]" />
            <input
              type="text"
              placeholder="Tìm theo tên món..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#EAE0D5] focus:outline-[#a33e07] w-40 sm:w-56"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20 scale-105'
                  : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:border-[#D1C2B4] hover:bg-[#FDFBF7]'
              }`}
            >
              {cat.label}
            </button>
          ))}
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
            <h3 className="font-bold text-[#2B2118]">Không tìm thấy món ăn phù hợp</h3>
            <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
              Hãy thử chọn danh mục khác hoặc sử dụng tính năng "Gợi ý món AI" để tìm món ăn từ nguyên liệu tủ lạnh của bạn!
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchFilter(''); }}
              className="px-4 py-2 bg-[#FFF0E6] text-[#a33e07] text-xs font-bold rounded-xl"
            >
              Xem tất cả công thức
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onNavigateToShop={onNavigateToShop}
              />
            ))}
          </div>
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
