import React, { useState } from 'react';
import { Clock, Flame, Heart, Star, Sparkles, Eye, X, BookOpen, ChefHat, Check, CalendarPlus, UtensilsCrossed, Share2, ShoppingCart, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  onNavigateToShop?: () => void;
  matchBadge?: {
    percentage: number;
    reason?: string;
  };
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleFavorite,
  onNavigateToShop,
  matchBadge
}) => {
  const { savedRecipeIds, toggleFavorite, showToast } = useAuth();
  const isSaved = savedRecipeIds.includes(recipe.id) || recipe.isSaved;

  const [isQuickPeekOpen, setIsQuickPeekOpen] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [copiedIngredients, setCopiedIngredients] = useState(false);

  // Check if planned in localStorage
  React.useEffect(() => {
    try {
      const plannedList = JSON.parse(localStorage.getItem('user_weekly_meal_plan') || '[]');
      if (plannedList.includes(recipe.id)) {
        setIsPlanned(true);
      }
    } catch (e) {
      // ignore
    }
  }, [recipe.id]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartPulsing(true);
    setTimeout(() => setHeartPulsing(false), 400);
    toggleFavorite(recipe.id, recipe.title);
    onToggleFavorite?.(recipe.id, e);
  };

  const handleToggleQuickPeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickPeekOpen(prev => !prev);
  };

  const handlePlanMeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const plannedList: string[] = JSON.parse(localStorage.getItem('user_weekly_meal_plan') || '[]');
      if (isPlanned) {
        const next = plannedList.filter(id => id !== recipe.id);
        localStorage.setItem('user_weekly_meal_plan', JSON.stringify(next));
        setIsPlanned(false);
        showToast(`Đã gỡ "${recipe.title}" khỏi thực đơn tuần`, 'info');
      } else {
        const next = [...plannedList, recipe.id];
        localStorage.setItem('user_weekly_meal_plan', JSON.stringify(next));
        setIsPlanned(true);
        showToast(`Đã ghim "${recipe.title}" vào thực đơn tuần này! 📅`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyIngredients = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🛒 DANH SÁCH NGUYÊN LIỆU CHO MÓN: ${recipe.title.toUpperCase()} (${recipe.servings || '3-4 người'})\n` +
      recipe.ingredients.map(ing => `• ${ing.name}: ${ing.amount}`).join('\n') +
      `\n\n📌 Công thức từ Bếp "Ăn Gì Hôm Nay"`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIngredients(true);
      setTimeout(() => setCopiedIngredients(false), 2000);
      showToast(`Đã chép danh sách nguyên liệu món "${recipe.title}"! 📋`, 'success');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      const shareUrl = new URL(window.location.origin + window.location.pathname);
      shareUrl.searchParams.set('recipeId', recipe.id);
      navigator.clipboard.writeText(shareUrl.toString());
      showToast(`Đã sao chép link món "${recipe.title}" để chia sẻ! 🔗`, 'success');
    } else {
      showToast(`Đã sẵn sàng chia sẻ món "${recipe.title}"!`, 'info');
    }
  };

  const handleCookwareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToShop) {
      onNavigateToShop();
      showToast(`Đang chuyển đến Cửa hàng dụng cụ cho món "${recipe.title}" 🍳`, 'info');
    }
  };

  // Detect recommended cookware
  const recommendedTool = React.useMemo(() => {
    const text = (recipe.title + ' ' + recipe.description + ' ' + (recipe.steps?.map(s => s.description).join(' ') || '')).toLowerCase();
    if (text.includes('nồi đất') || text.includes('kho cá') || text.includes('kho tộ') || text.includes('thịt kho')) {
      return { name: 'Nồi đất Bát Tràng', icon: '🥘' };
    }
    if (text.includes('chảo gang') || text.includes('áp chảo') || text.includes('bít tết') || text.includes('chiên giòn')) {
      return { name: 'Chảo gang đúc', icon: '🍳' };
    }
    if (text.includes('phở') || text.includes('ninh xương') || text.includes('nước dùng') || text.includes('bún bò')) {
      return { name: 'Nồi hầm inox', icon: '🍲' };
    }
    if (text.includes('dao') || text.includes('phi lê') || text.includes('thái mỏng')) {
      return { name: 'Dao Santoku Nhật', icon: '🔪' };
    }
    if (text.includes('chiên không dầu') || text.includes('nướng vàng')) {
      return { name: 'Nồi chiên không dầu', icon: '♨️' };
    }
    return null;
  }, [recipe]);

  // Difficulty badge colors
  const difficultyMeta = React.useMemo(() => {
    const diff = recipe.difficulty || 'Dễ';
    if (diff === 'Khó') {
      return { text: 'Cầu kỳ', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (diff === 'Trung bình') {
      return { text: 'Trung bình', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { text: 'Dễ làm', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }, [recipe.difficulty]);

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#EAE0D5] hover:border-[#a33e07]/50 hover:shadow-xl hover:shadow-orange-950/10 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* 4:3 Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F2EE]">
        <img
          src={recipe.image}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />

        {/* Top-left: Match Percentage Badge or Prep Time */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {matchBadge ? (
            <div className="bg-[#a33e07] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-200" />
              Khớp {matchBadge.percentage}%
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3 text-orange-300" />
              {recipe.prepTime}
            </div>
          )}

          {/* Servings badge */}
          {recipe.servings && (
            <div className="bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        {/* Center Hover Peek Callout (User Flow booster) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>Xem công thức chi tiết</span>
          </span>
        </div>

        {/* Top-right action controls */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Quick Peek button */}
          <button
            onClick={handleToggleQuickPeek}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90"
            title="Xem nhanh 3 bước không cần rời trang"
          >
            <Eye className="w-4 h-4 text-orange-200" />
          </button>

          {/* Meal Planner Button */}
          <button
            onClick={handlePlanMeal}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
              isPlanned
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-black/50 hover:bg-black/80 text-white'
            }`}
            title={isPlanned ? 'Đã ghim trong thực đơn tuần' : 'Ghim vào thực đơn tuần này'}
          >
            <CalendarPlus className="w-4 h-4" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleHeartClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
              heartPulsing ? 'scale-125' : ''
            } ${
              isSaved
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/85 hover:bg-white text-gray-700'
            }`}
            title={isSaved ? 'Đã lưu món này' : 'Lưu vào sổ tay ẩm thực'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-white' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* Quick Peek Overlay Drawer */}
        {isQuickPeekOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-stone-950/95 text-white p-4 flex flex-col justify-between z-20 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                XEM NHANH 3 BƯỚC NẤU
              </span>
              <button
                onClick={handleToggleQuickPeek}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Steps (Up to 3) */}
            <div className="space-y-2 my-2 overflow-y-auto max-h-[110px] pr-1">
              {recipe.steps && recipe.steps.length > 0 ? (
                recipe.steps.slice(0, 3).map((st, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#a33e07] text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-stone-300 line-clamp-2">
                      <strong className="text-white">{st.title ? `${st.title}: ` : ''}</strong>
                      {st.description}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic">Mở chi tiết để xem công thức đầy đủ.</p>
              )}
            </div>

            {/* Tool hint inside quick peek */}
            {recommendedTool && (
              <div 
                onClick={handleCookwareClick}
                className="text-[10px] text-amber-200 bg-amber-950/50 hover:bg-amber-950/80 border border-amber-700/40 px-2.5 py-1 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                title="Bấm để xem sản phẩm dụng cụ chuẩn vị này trong cửa hàng"
              >
                <div className="flex items-center gap-1.5">
                  <span>{recommendedTool.icon}</span>
                  <span>Dụng cụ chuẩn: <strong>{recommendedTool.name}</strong></span>
                </div>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </div>
            )}

            {/* CTAs inside quick peek */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
              <button
                onClick={() => onSelect(recipe)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <span>Vào Bếp Ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopyIngredients}
                className={`p-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  copiedIngredients 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
                title="Sao chép danh sách nguyên liệu đi chợ"
              >
                {copiedIngredients ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Đi chợ</span>
              </button>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300"
                title="Sao chép link chia sẻ"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom meta row over image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <div className="flex items-center gap-1 font-semibold drop-shadow-sm">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{recipe.calories} kcal</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 font-semibold bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{recipe.rating}</span>
              <span className="text-white/70 text-[10px]">({recipe.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Tag row: Difficulty & Cookware */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${difficultyMeta.bg}`}>
              {difficultyMeta.text}
            </span>

            {recommendedTool && (
              <button
                type="button"
                onClick={handleCookwareClick}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FFF8F0] hover:bg-[#FFEAE0] text-[#8C7D6F] hover:text-[#a33e07] border border-[#EAE0D5] hover:border-[#a33e07]/40 flex items-center gap-1 transition-colors cursor-pointer"
                title="Bấm để xem sản phẩm trong Cửa Hàng"
              >
                <span>{recommendedTool.icon}</span>
                <span className="truncate max-w-[120px]">{recommendedTool.name}</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#a33e07]" />
              </button>
            )}
          </div>

          <h3 className="font-bold text-[#2B2118] text-base leading-snug group-hover:text-[#a33e07] transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          <p className="text-xs text-[#6B5D4F] mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Ingredient Pills Summary */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF8F0] text-[#6B5D4F] border border-[#EAE0D5]"
              >
                {ing.name}
              </span>
            ))}
            {recipe.ingredients.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F7F2EE] text-[#8C7D6F]">
                +{recipe.ingredients.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Author & Action Footer */}
        <div className="pt-3 border-t border-[#F7F2EE] flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center text-[10px] font-bold shrink-0">
              {(recipe.author_name || recipe.author?.name || 'A').charAt(0)}
            </div>
            <span className="text-[11px] text-[#6B5D4F] font-medium truncate max-w-[110px]">
              {recipe.author_name || recipe.author?.name || 'Bếp Việt'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(recipe);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAF5F0] group-hover:bg-[#a33e07] text-[#a33e07] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Vào bếp</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


