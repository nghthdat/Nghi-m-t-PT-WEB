import React, { useState } from 'react';
import { Lightbulb, ChevronRight, ChevronLeft, ThumbsUp, Bookmark, Sparkles, Check, Copy, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface KitchenTip {
  id: string;
  title: string;
  category: string;
  badge: string;
  content: string;
  author: string;
  likes: number;
  relatedRecipes?: string[];
}

interface KitchenTipsCardProps {
  onSelectRecipeTitle?: (dishTitle: string) => void;
}

const KITCHEN_TIPS: KitchenTip[] = [
  {
    id: 'tip-ca-khong-tanh',
    title: 'Khử tanh cá đồng & cá biển trong 3 phút',
    category: 'Sơ chế thủy hải sản',
    badge: 'Mẹo vàng mẹ dạy',
    content: 'Dùng nước vo gạo pha thêm chút muối loãng ngâm cá 10 phút, hoặc chà xát gừng đập dập trộn chút rượu trắng. Máu tanh ở mang và màng đen bụng cá sẽ trôi sạch 100%, thịt cá săn chắc không vỡ khi kho hay chiên.',
    author: 'Cô Ba Chợ Bến Thành',
    likes: 1420,
    relatedRecipes: ['Cá kho tộ', 'Canh chua cá']
  },
  {
    id: 'tip-chien-khong-dinh',
    title: 'Bí quyết chiên đậu phụ & cá giòn rụm không dính chảo',
    category: 'Kỹ thuật chiên rán',
    badge: 'Đầu bếp khuyên dùng',
    content: 'Trước khi đổ dầu vào chảo, bật lửa làm khô chảo rồi dùng 1 lát gừng tươi chà xát khắp lòng chảo. Tinh dầu gừng tạo một lớp màng chống dính tự nhiên. Chờ dầu sôi già mới thả thực phẩm vào, không lật mặt quá sớm.',
    author: 'Bếp Trưởng Tuấn',
    likes: 980,
    relatedRecipes: ['Đậu hũ chiên', 'Bò bít tết']
  },
  {
    id: 'tip-nuoc-dung-trong',
    title: 'Ninh nước dùng phở & canh trong vắt, ngọt thanh',
    category: 'Nước dùng & Hầm canh',
    badge: 'Bí quyết gia truyền',
    content: 'Luôn chần xương với nước sôi và muối hạt ở lượt đầu, rửa sạch cặn máu. Khi ninh lượt 2, không đậy nắp vung, hạ lửa thật nhỏ liu riu và hớt bọt thường xuyên. Nướng xém hành tây và gừng thả vào để nước dùng có màu hổ phách tuyệt đẹp.',
    author: 'Nghệ Nhân Ẩm Thực Hà Thành',
    likes: 2150,
    relatedRecipes: ['Phở bò Hà Nội', 'Canh sườn hầm']
  },
  {
    id: 'tip-rau-xanh-muot',
    title: 'Luộc rau muống & cải xanh mướt, để nguội không thâm',
    category: 'Rau xanh & Vitamin',
    badge: '100% thành công',
    content: 'Đun nước thật sôi bùng cùng 1 thìa cà phê muối và nửa thìa dầu ăn hoặc vài giọt chanh. Thả rau ngập nước, luộc nhanh lửa to. Vớt rau ra thả ngay vào bát nước đá lạnh 2 phút rồi vớt ráo. Rau sẽ giòn sần sật và giữ màu xanh bóng suốt cả bữa ăn.',
    author: 'Chị Mai Lan',
    likes: 875,
    relatedRecipes: ['Rau muống luộc', 'Thịt luộc chấm mắm']
  },
  {
    id: 'tip-bao-quan-hanh-ngo',
    title: 'Bảo quản hành lá, ngò rí tươi non suốt 2-3 tuần',
    category: 'Mẹo bảo quản',
    badge: 'Tiết kiệm thời gian',
    content: 'Hành ngò mua về nhặt sạch gốc sâu nhưng TUYỆT ĐỐI KHÔNG RỬA NƯỚC nếu chưa ăn. Để thật khô ráo, lót 1 lớp khăn giấy ăn dưới đáy hộp nhựa kín, xếp hành vào rồi phủ thêm 1 lớp khăn giấy lên trên, đậy nắp để ngăn mát. Khăn giấy sẽ hút hết hơi ẩm đọng, hành tươi rói.',
    author: 'Mẹo Nhà Bếp Việt',
    likes: 1630,
    relatedRecipes: ['Gỏi cuốn tôm thịt', 'Phở bò Hà Nội']
  }
];

export const KitchenTipsCard: React.FC<KitchenTipsCardProps> = ({
  onSelectRecipeTitle
}) => {
  const { showToast } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTips, setLikedTips] = useState<string[]>([]);
  const [savedTips, setSavedTips] = useState<string[]>([]);
  const [copiedTip, setCopiedTip] = useState(false);

  const tip = KITCHEN_TIPS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % KITCHEN_TIPS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + KITCHEN_TIPS.length) % KITCHEN_TIPS.length);
  };

  const handleToggleLike = (id: string) => {
    if (likedTips.includes(id)) {
      setLikedTips(likedTips.filter(t => t !== id));
    } else {
      setLikedTips([...likedTips, id]);
      showToast('Cảm ơn bạn đã ủng hộ mẹo hay! 👍', 'success');
    }
  };

  const handleToggleSave = (id: string) => {
    if (savedTips.includes(id)) {
      setSavedTips(savedTips.filter(t => t !== id));
      showToast('Đã bỏ lưu mẹo', 'info');
    } else {
      setSavedTips([...savedTips, id]);
      showToast(`Đã lưu mẹo "${tip.title}" vào sổ tay! 📌`, 'success');
    }
  };

  const handleCopyTip = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`💡 MẸO BẾP HAY: ${tip.title}\n"${tip.content}"\n— Chia sẻ bởi: ${tip.author} (Ăn Gì Hôm Nay)`);
      setCopiedTip(true);
      setTimeout(() => setCopiedTip(false), 2000);
      showToast('Đã sao chép mẹo vào bộ nhớ tạm! 📋', 'success');
    }
  };

  const isLiked = likedTips.includes(tip.id);
  const isSaved = savedTips.includes(tip.id);

  return (
    <div className="rounded-3xl bg-[#FFFDF9] border border-[#EAE0D5] p-5 sm:p-6 shadow-sm space-y-3.5 relative overflow-hidden">
      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#F2DFD0]">
        {KITCHEN_TIPS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setCurrentIndex(idx)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              idx === currentIndex
                ? 'bg-[#a33e07] text-white shadow-xs'
                : 'bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5]'
            }`}
          >
            {t.category}
          </button>
        ))}
      </div>

      {/* Top indicator & category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#a33e07] tracking-wider">
                {tip.category}
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {tip.badge}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#2B2118]">
              {tip.title}
            </h3>
          </div>
        </div>

        {/* Counter */}
        <span className="text-xs font-bold text-[#8C7D6F] bg-[#F7F2EE] px-2.5 py-1 rounded-xl shrink-0">
          {currentIndex + 1} / {KITCHEN_TIPS.length}
        </span>
      </div>

      {/* Content box */}
      <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#EAE0D5]/80 text-xs sm:text-sm text-[#4A3B2C] leading-relaxed relative">
        <p className="font-medium">"{tip.content}"</p>
        <span className="block text-[11px] text-[#8C7D6F] mt-2 font-semibold text-right">
          — Chia sẻ bởi: {tip.author}
        </span>
      </div>

      {/* Related Recipes Pill tags */}
      {tip.relatedRecipes && tip.relatedRecipes.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#8C7D6F] flex items-center gap-1">
            <Utensils className="w-3 h-3 text-[#a33e07]" />
            Áp dụng cho món:
          </span>
          {tip.relatedRecipes.map((dish, dIdx) => (
            <button
              key={dIdx}
              onClick={() => onSelectRecipeTitle && onSelectRecipeTitle(dish)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#a33e07] border border-[#FFE0CC] transition-colors cursor-pointer"
              title={`Xem công thức món ${dish}`}
            >
              🍲 {dish}
            </button>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleLike(tip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLiked
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5]'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{tip.likes + (isLiked ? 1 : 0)} Hữu ích</span>
          </button>

          <button
            onClick={() => handleToggleSave(tip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5]'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Đã lưu sổ tay' : 'Lưu mẹo'}</span>
          </button>

          <button
            onClick={handleCopyTip}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedTip
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5]'
            }`}
            title="Sao chép nội dung mẹo này"
          >
            {copiedTip ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTip ? 'Đã chép' : 'Chép mẹo'}</span>
          </button>
        </div>

        {/* Next / Prev buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-white hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Mẹo trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Mẹo kế tiếp"
          >
            <span>Mẹo tiếp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
