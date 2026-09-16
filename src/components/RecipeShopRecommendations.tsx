import React, { useState } from 'react';
import { Recipe, ProductItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/seedProducts';
import { Star, Sparkles, ExternalLink, ChevronRight, Store, Tag } from 'lucide-react';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface RecipeShopRecommendationsProps {
  recipe: Recipe;
  onNavigateToShop?: () => void;
  products?: ProductItem[];
}

export const RecipeShopRecommendations: React.FC<RecipeShopRecommendationsProps> = ({
  recipe,
  onNavigateToShop,
  products = INITIAL_PRODUCTS
}) => {
  const [selectedQuickView, setSelectedQuickView] = useState<ProductItem | null>(null);

  // Filter products relevant to this recipe
  const matchedProducts = products.filter(prod => {
    if (prod.relatedRecipeIds?.includes(recipe.id)) return true;
    if (prod.relatedTags && recipe.categories?.some(c => prod.relatedTags?.includes(c))) return true;
    return false;
  });

  // If no direct tag matches, pick top 3 popular tools
  const displayProducts = matchedProducts.length > 0 ? matchedProducts.slice(0, 3) : products.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2B2118]">
              Dụng cụ & Gia vị khuyên dùng cho món này
            </h2>
            <p className="text-xs text-[#6B5D4F]">
              Được tuyển chọn trên các sàn TMĐT giúp món "{recipe.title}" chuẩn vị nhất
            </p>
          </div>
        </div>

        {onNavigateToShop && (
          <button
            onClick={onNavigateToShop}
            className="text-xs font-bold text-[#a33e07] hover:text-[#8c3405] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xem toàn bộ dụng cụ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayProducts.map((prod) => {
          const productCode = prod.productCode || `SP-${prod.id.replace('prod-', '').substring(0, 8).toUpperCase()}`;
          const platformName = prod.platformName || (prod.platform === 'lazada' ? 'Lazada' : prod.platform === 'tiki' ? 'Tiki' : prod.platform === 'tiktok' ? 'TikTok' : 'Shopee');
          const affiliateUrl = prod.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(prod.name)}`;

          return (
            <div
              key={prod.id}
              onClick={() => setSelectedQuickView(prod)}
              className="group p-3 rounded-2xl border border-[#EAE0D5] hover:border-[#a33e07]/40 bg-[#FFFDFB] hover:bg-white flex flex-col justify-between cursor-pointer transition-all hover:shadow-sm"
            >
              <div>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5F0] border border-[#EAE0D5] shrink-0 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold text-[#a33e07] uppercase truncate">
                        {prod.brand}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-semibold shrink-0">
                        {platformName}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#2B2118] line-clamp-2 leading-snug group-hover:text-[#a33e07] transition-colors">
                      {prod.name}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-[#8C7D6F] mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{prod.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Product Code Badge */}
                <div className="mt-2 text-[10px] text-[#8C7D6F] flex items-center gap-1 bg-[#FAF5F0] px-2 py-0.5 rounded-md w-fit">
                  <Tag className="w-2.5 h-2.5 text-[#a33e07]" />
                  <span>Mã: <strong className="font-mono text-[#2B2118]">{productCode}</strong></span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#F7F2EE] flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#a33e07]">
                    {prod.price.toLocaleString('vi-VN')}₫
                  </span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-[10px] text-[#A89A8D] line-through ml-1.5">
                      {prod.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>

                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-[#FFF0E6] hover:bg-[#a33e07] text-[#a33e07] hover:text-white border border-[#FFE0CC] flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  title={`Mua trên ${platformName}`}
                >
                  <span>Mua trên {platformName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
      />
    </div>
  );
};
