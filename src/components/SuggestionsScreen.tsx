import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Plus, X, Clock, Flame, CheckCircle2, AlertCircle, ChefHat, Filter, RefreshCw } from 'lucide-react';
import { Recipe, SuggestedRecipeMatch } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface SuggestionsScreenProps {
  currentIngredients: string[];
  suggestions: SuggestedRecipeMatch[];
  isLoading: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onSearchWithIngredients: (ingredients: string[]) => void;
  onBackToHome: () => void;
}

export const SuggestionsScreen: React.FC<SuggestionsScreenProps> = ({
  currentIngredients,
  suggestions,
  isLoading,
  onSelectRecipe,
  onSearchWithIngredients,
  onBackToHome
}) => {
  const [ingredients, setIngredients] = useState<string[]>(currentIngredients);
  const [newIngredient, setNewIngredient] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'time' | 'calories'>('match');

  const handleAdd = (name?: string) => {
    const val = name || newIngredient.trim();
    if (val && !ingredients.includes(val)) {
      const updated = [...ingredients, val];
      setIngredients(updated);
      setNewIngredient('');
      onSearchWithIngredients(updated);
    }
  };

  const handleRemove = (name: string) => {
    const updated = ingredients.filter(i => i !== name);
    setIngredients(updated);
    onSearchWithIngredients(updated);
  };

  // Sort suggestions
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    if (sortBy === 'match') return b.matchPercentage - a.matchPercentage;
    if (sortBy === 'calories') return a.recipe.calories - b.recipe.calories;
    return (parseInt(a.recipe.prepTime) || 0) - (parseInt(b.recipe.prepTime) || 0);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6B5D4F] hover:text-[#a33e07] transition-colors p-2 -ml-2 rounded-xl hover:bg-[#F7F2EE]"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#a33e07] border border-[#FFE0CC] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Gemini Ranking
        </div>
      </div>

      {/* Ingredient Selection Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#2B2118] flex items-center gap-2">
            <span>🍳 Nguyên liệu bạn đang có ({ingredients.length})</span>
          </h2>
          <span className="text-[11px] text-[#6B5D4F]">Nhấn dấu × để bỏ bớt</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ingredients.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#a33e07] text-white text-xs font-bold shadow-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="hover:bg-black/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Quick inline adder */}
          <div className="inline-flex items-center gap-1 bg-[#F7F2EE] rounded-xl px-2 py-1 border border-[#EAE0D5]">
            <input
              type="text"
              placeholder="+ Thêm nguyên liệu khác..."
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="text-xs bg-transparent outline-none w-36 placeholder:text-[#8C7D6F] font-medium"
            />
            <button
              onClick={() => handleAdd()}
              className="w-5 h-5 rounded-lg bg-[#a33e07] text-white flex items-center justify-center text-xs hover:bg-[#8c3405]"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick add popular */}
        <div className="pt-2 border-t border-[#F7F2EE] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[#8C7D6F] font-semibold shrink-0">Thêm nhanh:</span>
          {['Hành lá', 'Tỏi', 'Nước mắm', 'Tiêu', 'Ớt', 'Dầu ăn', 'Đường'].map((ing) => {
            if (ingredients.includes(ing)) return null;
            return (
              <button
                key={ing}
                onClick={() => handleAdd(ing)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#F7F2EE] hover:bg-[#FFE0CC] hover:text-[#a33e07] text-[#6B5D4F] transition-all whitespace-nowrap"
              >
                + {ing}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort / Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold text-[#2B2118]">
          Gợi ý món ăn phù hợp ({sortedSuggestions.length} kết quả)
        </h1>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B5D4F] font-medium">Sắp xếp theo:</span>
          <button
            onClick={() => setSortBy('match')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              sortBy === 'match'
                ? 'bg-[#a33e07] text-white shadow-xs'
                : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
            }`}
          >
            % Khớp cao nhất
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              sortBy === 'time'
                ? 'bg-[#a33e07] text-white shadow-xs'
                : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
            }`}
          >
            Thời gian nấu
          </button>
          <button
            onClick={() => setSortBy('calories')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              sortBy === 'calories'
                ? 'bg-[#a33e07] text-white shadow-xs'
                : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
            }`}
          >
            Ít calo nhất
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-[#2B2118]">AI Gemini đang xếp hạng món ăn...</h3>
          <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
            Hệ thống đang đối chiếu nguyên liệu của bạn với kho công thức để đưa ra độ khớp và món ngon tối ưu nhất.
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && (
        <div className="space-y-4">
          {sortedSuggestions.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#EAE0D5] space-y-3">
              <ChefHat className="w-12 h-12 text-[#8C7D6F] mx-auto stroke-1" />
              <h3 className="font-bold text-[#2B2118]">Không tìm thấy món ăn khớp hoàn toàn</h3>
              <p className="text-xs text-[#6B5D4F] max-w-md mx-auto">
                Hãy thử nhập thêm nguyên liệu phổ biến như: trứng, thịt, cà chua, đậu hũ, hành lá...
              </p>
            </div>
          ) : (
            sortedSuggestions.map((item, index) => {
              const { recipe, matchPercentage, matchedIngredients, missingIngredients, reason } = item;
              const isHighMatch = matchPercentage >= 80;

              return (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE0D5] hover:border-[#a33e07]/50 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                >
                  {/* Recipe Image with Badge */}
                  <div className="relative aspect-[4/3] w-full sm:w-52 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-[#F7F2EE]">
                    <OptimizedImage
                      src={recipe.image}
                      alt={recipe.title}
                      aspectRatio="4/3"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Match Score Badge */}
                    <div className={`absolute top-2.5 left-2.5 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-md flex items-center gap-1 ${
                      isHighMatch ? 'bg-emerald-600' : matchPercentage >= 50 ? 'bg-[#a33e07]' : 'bg-amber-600'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      Khớp {matchPercentage}%
                    </div>
                  </div>

                  {/* Recipe Details & Reason */}
                  <div className="flex-1 flex flex-col justify-between w-full space-y-2.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-[#2B2118] group-hover:text-[#a33e07] transition-colors">
                          {recipe.title}
                        </h3>
                        <span className="text-xs font-bold text-[#a33e07] shrink-0 group-hover:translate-x-1 transition-transform hidden sm:inline">
                          Xem công thức →
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6B5D4F] mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#a33e07]" />
                          {recipe.prepTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {recipe.calories} kcal
                        </span>
                        <span>•</span>
                        <span className="bg-[#FFF8F0] px-2 py-0.5 rounded-md border border-[#EAE0D5] text-[11px]">
                          {recipe.difficulty}
                        </span>
                      </div>

                      {/* AI Explanation Pill */}
                      <p className="text-xs text-[#524436] bg-[#FFF8F0] p-2.5 rounded-xl border border-[#EAE0D5]/70 mt-2 leading-relaxed">
                        💡 <strong className="text-[#a33e07]">Đánh giá AI:</strong> {reason}
                      </p>
                    </div>

                    {/* Matched vs Missing breakdown */}
                    <div className="pt-2 border-t border-[#F7F2EE] flex flex-wrap items-center gap-y-1 gap-x-4 text-xs">
                      {matchedIngredients.length > 0 && (
                        <div className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-medium">Đã có:</span>
                          <span className="font-semibold">{matchedIngredients.slice(0, 3).join(', ')}</span>
                        </div>
                      )}

                      {missingIngredients.length > 0 && (
                        <div className="flex items-center gap-1 text-[#8C7D6F]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span>Cần thêm:</span>
                          <span className="font-medium text-[#2B2118]">{missingIngredients.slice(0, 2).join(', ')}</span>
                          {missingIngredients.length > 2 && (
                            <span className="text-[11px] text-[#8C7D6F]">+{missingIngredients.length - 2} khác</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
