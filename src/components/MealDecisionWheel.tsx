import React, { useState, useMemo } from 'react';
import { Sparkles, Dices, Clock, Flame, Users, ArrowRight, BookmarkCheck, ChefHat, Check, ShoppingBag, X, Copy, RefreshCw } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { useAuth } from '../context/AuthContext';

interface MealDecisionWheelProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

interface MealCombo {
  mainDish: Recipe;
  soupDish: Recipe;
  sideDish: Recipe;
  totalTime: string;
  totalCalories: number;
  theme: string;
}

const COMBO_THEMES = [
  'Mâm Cơm Đậm Vị Miền Bắc',
  'Bữa Cơm Thanh Mát Mùa Hè',
  'Cơm Gia Đình Chuẩn Vị Mẹ Nấu',
  'Mâm Cơm Đậm Đà Hương Vị Quê',
  'Bữa Tối Nhanh Gọn Dưới 30 Phút'
];

export const MealDecisionWheel: React.FC<MealDecisionWheelProps> = ({
  recipes,
  onSelectRecipe
}) => {
  const { showToast } = useAuth();
  const [spinCount, setSpinCount] = useState(0);
  const [mainOffset, setMainOffset] = useState(0);
  const [soupOffset, setSoupOffset] = useState(0);
  const [sideOffset, setSideOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [copiedGrocery, setCopiedGrocery] = useState(false);

  // Group recipes
  const { mainDishes, soupDishes, sideDishes } = useMemo(() => {
    const mains = recipes.filter(r => 
      r.categories.some(c => c.toLowerCase().includes('mặn') || c.toLowerCase().includes('man')) ||
      r.title.toLowerCase().includes('thịt') || 
      r.title.toLowerCase().includes('cá') || 
      r.title.toLowerCase().includes('sườn') || 
      r.title.toLowerCase().includes('gà')
    );

    const soups = recipes.filter(r => 
      r.title.toLowerCase().includes('canh') || 
      r.title.toLowerCase().includes('phở') || 
      r.title.toLowerCase().includes('bún') || 
      r.title.toLowerCase().includes('súp')
    );

    const sides = recipes.filter(r => 
      r.categories.some(c => c.toLowerCase().includes('chay') || c.toLowerCase().includes('rau')) ||
      r.title.toLowerCase().includes('rau') || 
      r.title.toLowerCase().includes('đậu') || 
      r.title.toLowerCase().includes('nộm') || 
      r.title.toLowerCase().includes('xào')
    );

    return {
      mainDishes: mains.length > 0 ? mains : recipes.slice(0, 3),
      soupDishes: soups.length > 0 ? soups : recipes.slice(1, 4),
      sideDishes: sides.length > 0 ? sides : recipes.slice(2, 5),
    };
  }, [recipes]);

  // Current combo based on spinCount & offsets
  const currentCombo: MealCombo = useMemo(() => {
    const main = mainDishes[(spinCount * 3 + 1 + mainOffset) % mainDishes.length] || recipes[0];
    const soup = soupDishes[(spinCount * 2 + 2 + soupOffset) % soupDishes.length] || recipes[1 % recipes.length];
    const side = sideDishes[(spinCount * 5 + 3 + sideOffset) % sideDishes.length] || recipes[2 % recipes.length];

    const totalCals = (main?.calories || 350) + (soup?.calories || 150) + (side?.calories || 120);
    const theme = COMBO_THEMES[(spinCount + mainOffset + soupOffset + sideOffset) % COMBO_THEMES.length];

    return {
      mainDish: main,
      soupDish: soup,
      sideDish: side,
      totalTime: '35-45 Phút',
      totalCalories: totalCals,
      theme
    };
  }, [spinCount, mainOffset, soupOffset, sideOffset, mainDishes, soupDishes, sideDishes, recipes]);

  const handleSpin = () => {
    setIsSpinning(true);
    setIsPlanned(false);
    setTimeout(() => {
      setSpinCount(prev => prev + 1);
      setIsSpinning(false);
      showToast('Đã đổi sang mâm cơm gia đình mới! 🍱', 'info');
    }, 450);
  };

  const handleSwapMain = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainOffset(prev => prev + 1);
    setIsPlanned(false);
    showToast('Đã đổi món mặn! 🥩', 'info');
  };

  const handleSwapSoup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSoupOffset(prev => prev + 1);
    setIsPlanned(false);
    showToast('Đã đổi món canh! 🍲', 'info');
  };

  const handleSwapSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSideOffset(prev => prev + 1);
    setIsPlanned(false);
    showToast('Đã đổi món rau! 🥬', 'info');
  };

  const handlePlanMeal = () => {
    setIsPlanned(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const planItem = {
        date: today,
        theme: currentCombo.theme,
        dishIds: [currentCombo.mainDish.id, currentCombo.soupDish.id, currentCombo.sideDish.id],
        dishTitles: [currentCombo.mainDish.title, currentCombo.soupDish.title, currentCombo.sideDish.title]
      };
      localStorage.setItem(`meal_plan_${today}`, JSON.stringify(planItem));
    } catch (e) {
      console.error(e);
    }
    showToast(`Đã ghim mâm cơm "${currentCombo.theme}" vào thực đơn hôm nay! 🎉`, 'success');
  };

  // Group all ingredients for grocery list
  const aggregatedIngredients = useMemo(() => {
    const list: { name: string; amount: string; dishTitle: string; category: 'protein' | 'veggie' | 'spice' }[] = [];
    const dishes = [
      { dish: currentCombo.mainDish, prefix: 'Món mặn' },
      { dish: currentCombo.soupDish, prefix: 'Món canh' },
      { dish: currentCombo.sideDish, prefix: 'Món rau' },
    ];

    dishes.forEach(({ dish }) => {
      if (dish && dish.ingredients) {
        dish.ingredients.forEach(ing => {
          const nameLower = ing.name.toLowerCase();
          let cat: 'protein' | 'veggie' | 'spice' = 'spice';
          if (nameLower.includes('thịt') || nameLower.includes('cá') || nameLower.includes('tôm') || nameLower.includes('sườn') || nameLower.includes('gà') || nameLower.includes('bò') || nameLower.includes('trứng') || nameLower.includes('mực') || nameLower.includes('đậu hũ')) {
            cat = 'protein';
          } else if (nameLower.includes('rau') || nameLower.includes('cà') || nameLower.includes('hành') || nameLower.includes('ngò') || nameLower.includes('ớt') || nameLower.includes('tỏi') || nameLower.includes('nấm') || nameLower.includes('giá') || nameLower.includes('khoai')) {
            cat = 'veggie';
          }
          list.push({
            name: ing.name,
            amount: ing.amount,
            dishTitle: dish.title,
            category: cat
          });
        });
      }
    });

    return list;
  }, [currentCombo]);

  const toggleCheckIngredient = (itemKey: string) => {
    setCheckedIngredients(prev => 
      prev.includes(itemKey) ? prev.filter(k => k !== itemKey) : [...prev, itemKey]
    );
  };

  const handleCopyGroceryList = () => {
    const text = `🛒 DANH SÁCH ĐI CHỢ CHO MÂM CƠM: ${currentCombo.theme.toUpperCase()}\n` +
      `Gồm 3 món: ${currentCombo.mainDish.title} + ${currentCombo.soupDish.title} + ${currentCombo.sideDish.title}\n\n` +
      `🥩 THỊT / THỦY HẢI SẢN:\n` +
      aggregatedIngredients.filter(i => i.category === 'protein').map(i => ` [ ] ${i.name} (${i.amount}) - dùng cho: ${i.dishTitle}`).join('\n') +
      `\n\n🥬 RAU CỦ QUẢ:\n` +
      aggregatedIngredients.filter(i => i.category === 'veggie').map(i => ` [ ] ${i.name} (${i.amount}) - dùng cho: ${i.dishTitle}`).join('\n') +
      `\n\n🧂 GIA VỊ & NGUYÊN LIỆU KHÁC:\n` +
      aggregatedIngredients.filter(i => i.category === 'spice').map(i => ` [ ] ${i.name} (${i.amount})`).join('\n') +
      `\n\n✨ Tạo nhanh từ Bếp "Ăn Gì Hôm Nay"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedGrocery(true);
      setTimeout(() => setCopiedGrocery(false), 2500);
      showToast('Đã sao chép danh sách đi chợ! Dán vào Zalo/Tin nhắn để gửi người nhà 🛒', 'success');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FFF1E6] border-2 border-[#FFE0CC] p-5 sm:p-7 shadow-lg shadow-orange-950/5">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2DFD0] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFEAE0] text-[#a33e07] text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#e8703a]" />
            <span>Vòng Xoay Quyết Định 1 Chạm</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2B2118] tracking-tight mt-1">
            Hôm Nay Ăn Gì? Mâm Cơm Chuẩn 3 Món
          </h2>
          <p className="text-xs text-[#6B5D4F] mt-0.5">
            Không còn đau đầu nghĩ món. Tự động gợi ý 1 Món Mặn + 1 Món Canh + 1 Món Rau thanh đạm.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsGroceryOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#FAF5F0] text-[#a33e07] border border-[#FFE0CC] text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Gom tất cả nguyên liệu của 3 món thành danh sách đi chợ"
          >
            <ShoppingBag className="w-4 h-4 text-[#a33e07]" />
            <span>Gom DS Đi Chợ</span>
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#a33e07]/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 ${
              isSpinning ? 'opacity-70 animate-pulse' : ''
            }`}
          >
            <Dices className={`w-4 h-4 text-orange-200 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Đổi Mâm Khác 🎲</span>
          </button>
        </div>
      </div>

      {/* Theme & Stats bar */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-[#FFE7D6]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-[#a33e07]">
            {currentCombo.theme}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-[#6B5D4F]">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#a33e07]" />
            Mâm 3-4 người
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {currentCombo.totalTime}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            ~{currentCombo.totalCalories} kcal
          </span>
        </div>
      </div>

      {/* 3 Dishes Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* 1. Món Mặn */}
        <div
          onClick={() => onSelectRecipe(currentCombo.mainDish)}
          className="group bg-white rounded-2xl p-3 border border-[#EAE0D5] hover:border-[#a33e07] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center relative overflow-hidden"
        >
          <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
            1. Món Mặn
          </span>

          <button
            onClick={handleSwapMain}
            className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/40 hover:bg-black/70 text-white transition-all active:scale-90"
            title="Đổi riêng món mặn khác"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F7F2EE] relative mt-1 sm:mt-0">
            <img
              src={currentCombo.mainDish.image}
              alt={currentCombo.mainDish.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="min-w-0 flex-1 pt-3 sm:pt-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#2B2118] group-hover:text-[#a33e07] transition-colors line-clamp-1">
              {currentCombo.mainDish.title}
            </h4>
            <p className="text-[11px] text-[#8C7D6F] line-clamp-1 mt-0.5">
              {currentCombo.mainDish.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F] mt-1.5 font-medium">
              <span>⏱ {currentCombo.mainDish.prepTime}</span>
              <span>•</span>
              <span className="text-[#a33e07] font-bold">{currentCombo.mainDish.calories} kcal</span>
            </div>
          </div>
        </div>

        {/* 2. Món Canh */}
        <div
          onClick={() => onSelectRecipe(currentCombo.soupDish)}
          className="group bg-white rounded-2xl p-3 border border-[#EAE0D5] hover:border-[#a33e07] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center relative overflow-hidden"
        >
          <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
            2. Món Canh
          </span>

          <button
            onClick={handleSwapSoup}
            className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/40 hover:bg-black/70 text-white transition-all active:scale-90"
            title="Đổi riêng món canh khác"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F7F2EE] relative mt-1 sm:mt-0">
            <img
              src={currentCombo.soupDish.image}
              alt={currentCombo.soupDish.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="min-w-0 flex-1 pt-3 sm:pt-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#2B2118] group-hover:text-[#a33e07] transition-colors line-clamp-1">
              {currentCombo.soupDish.title}
            </h4>
            <p className="text-[11px] text-[#8C7D6F] line-clamp-1 mt-0.5">
              {currentCombo.soupDish.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F] mt-1.5 font-medium">
              <span>⏱ {currentCombo.soupDish.prepTime}</span>
              <span>•</span>
              <span className="text-[#a33e07] font-bold">{currentCombo.soupDish.calories} kcal</span>
            </div>
          </div>
        </div>

        {/* 3. Món Rau / Xào */}
        <div
          onClick={() => onSelectRecipe(currentCombo.sideDish)}
          className="group bg-white rounded-2xl p-3 border border-[#EAE0D5] hover:border-[#a33e07] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center relative overflow-hidden"
        >
          <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
            3. Món Rau / Phụ
          </span>

          <button
            onClick={handleSwapSide}
            className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/40 hover:bg-black/70 text-white transition-all active:scale-90"
            title="Đổi riêng món rau khác"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F7F2EE] relative mt-1 sm:mt-0">
            <img
              src={currentCombo.sideDish.image}
              alt={currentCombo.sideDish.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="min-w-0 flex-1 pt-3 sm:pt-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#2B2118] group-hover:text-[#a33e07] transition-colors line-clamp-1">
              {currentCombo.sideDish.title}
            </h4>
            <p className="text-[11px] text-[#8C7D6F] line-clamp-1 mt-0.5">
              {currentCombo.sideDish.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F] mt-1.5 font-medium">
              <span>⏱ {currentCombo.sideDish.prepTime}</span>
              <span>•</span>
              <span className="text-[#a33e07] font-bold">{currentCombo.sideDish.calories} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to plan or cook */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-[#F2DFD0] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-[#6B5D4F]">
          <ChefHat className="w-4 h-4 text-[#a33e07]" />
          <span>Gợi ý chuẩn vị: Bữa cơm cân bằng protein, vitamin từ rau xanh và canh mát.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePlanMeal}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isPlanned
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF5F0] text-[#a33e07] border border-[#FFE0CC]'
            }`}
          >
            {isPlanned ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã ghim vào thực đơn hôm nay</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Lên lịch mâm cơm này</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grocery Checklist Modal (Integrated User Flow) */}
      {isGroceryOpen && (
        <div 
          onClick={() => setIsGroceryOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#EAE0D5]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EAE0D5] flex items-center justify-between bg-[#FFF8F0]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFEAE0] text-[#a33e07] text-[10px] font-bold">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Danh Sách Đi Chợ Tự Động</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2B2118] mt-1">
                  Nguyên Liệu Mâm Cơm 3 Món
                </h3>
                <p className="text-xs text-[#6B5D4F]">
                  Tích chọn nguyên liệu đã có sẵn trong tủ lạnh nhà bạn
                </p>
              </div>

              <button
                onClick={() => setIsGroceryOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-[#6B5D4F] flex items-center justify-center border border-[#EAE0D5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Checklist */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* 1. Protein */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#a33e07] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🥩</span>
                  <span>Thịt, Cá & Protein ({aggregatedIngredients.filter(i => i.category === 'protein').length})</span>
                </h4>
                <div className="space-y-1.5">
                  {aggregatedIngredients.filter(i => i.category === 'protein').map((ing, idx) => {
                    const key = `prot-${idx}-${ing.name}`;
                    const isChecked = checkedIngredients.includes(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleCheckIngredient(key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-stone-50 border-stone-200 opacity-50 line-through text-stone-400' : 'bg-white border-[#EAE0D5] text-[#2B2118]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#a33e07] focus:ring-0 cursor-pointer"
                          />
                          <span>{ing.name}</span>
                          <span className="text-[#8C7D6F] text-[11px]">({ing.dishTitle})</span>
                        </div>
                        <span className="text-xs font-bold text-[#a33e07]">{ing.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Veggies */}
              <div className="space-y-2 pt-2 border-t border-[#F2DFD0]">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🥬</span>
                  <span>Rau Củ & Quả ({aggregatedIngredients.filter(i => i.category === 'veggie').length})</span>
                </h4>
                <div className="space-y-1.5">
                  {aggregatedIngredients.filter(i => i.category === 'veggie').map((ing, idx) => {
                    const key = `veg-${idx}-${ing.name}`;
                    const isChecked = checkedIngredients.includes(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleCheckIngredient(key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-stone-50 border-stone-200 opacity-50 line-through text-stone-400' : 'bg-white border-[#EAE0D5] text-[#2B2118]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#a33e07] focus:ring-0 cursor-pointer"
                          />
                          <span>{ing.name}</span>
                          <span className="text-[#8C7D6F] text-[11px]">({ing.dishTitle})</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">{ing.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Spices */}
              <div className="space-y-2 pt-2 border-t border-[#F2DFD0]">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🧂</span>
                  <span>Gia vị & Nguyên liệu phụ ({aggregatedIngredients.filter(i => i.category === 'spice').length})</span>
                </h4>
                <div className="space-y-1.5">
                  {aggregatedIngredients.filter(i => i.category === 'spice').map((ing, idx) => {
                    const key = `spc-${idx}-${ing.name}`;
                    const isChecked = checkedIngredients.includes(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleCheckIngredient(key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-stone-50 border-stone-200 opacity-50 line-through text-stone-400' : 'bg-white border-[#EAE0D5] text-[#2B2118]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#a33e07] focus:ring-0 cursor-pointer"
                          />
                          <span>{ing.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-700">{ing.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAE0D5] bg-[#FAF5F0] flex items-center justify-between gap-3">
              <button
                onClick={() => setCheckedIngredients([])}
                className="text-xs font-bold text-[#8C7D6F] hover:text-[#2B2118] px-2 py-1"
              >
                Bỏ chọn tất cả
              </button>

              <button
                onClick={handleCopyGroceryList}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
                  copiedGrocery 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#a33e07] hover:bg-[#8c3405] text-white'
                }`}
              >
                {copiedGrocery ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedGrocery ? 'Đã chép danh sách!' : 'Sao chép gửi Zalo / Người nhà 📲'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
