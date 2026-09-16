import React, { useState } from 'react';
import { ProductItem } from '../types';
import { 
  Star, Eye, ExternalLink, Copy, Check, 
  Layers, ChevronLeft, ChevronRight, Tag
} from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  onOpenQuickView?: (product: ProductItem) => void;
  onSelectRecipe?: (recipeTitleOrId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onSelectRecipe
}) => {
  // Collect all available images for this product
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      list.push(...product.images);
    } else {
      if (product.image) list.push(product.image);
      if (product.gallery && product.gallery.length > 0) {
        list.push(...product.gallery);
      }
    }
    return list.filter(Boolean);
  }, [product.image, product.images, product.gallery]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = allImages[activeImageIdx] || product.image;
  const productCode = product.productCode || `SP-${product.id.replace('prod-', '').substring(0, 8).toUpperCase()}`;

  // Calculate discount percentage
  const discountPercent = React.useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product.price, product.originalPrice]);

  // Dishes cooked with this product
  const relatedDishes = React.useMemo(() => {
    const pName = (product.name + ' ' + product.category + ' ' + (product.relatedTags?.join(' ') || '')).toLowerCase();
    if (pName.includes('nồi đất') || pName.includes('kho')) {
      return ['Cá kho tộ', 'Thịt kho tàu'];
    }
    if (pName.includes('chảo gang') || pName.includes('chảo')) {
      return ['Bò áp chảo', 'Đậu hũ chiên giòn'];
    }
    if (pName.includes('nồi chiên') || pName.includes('air fryer')) {
      return ['Gà nướng mật ong', 'Sườn rim'];
    }
    if (pName.includes('nồi hầm') || pName.includes('inox') || pName.includes('phở')) {
      return ['Phở bò Hà Nội', 'Canh sườn hầm'];
    }
    if (pName.includes('dao') || pName.includes('thớt')) {
      return ['Gỏi cuốn tôm thịt', 'Phở bò'];
    }
    if (pName.includes('nước mắm') || pName.includes('gia vị') || pName.includes('muối') || pName.includes('tiêu')) {
      return ['Thịt luộc chấm mắm', 'Canh chua cá'];
    }
    return ['Món gia đình', 'Bữa tối'];
  }, [product.name, product.category, product.relatedTags]);

  // Platform info & styling
  const platform = product.platform || 'shopee';
  const getPlatformMeta = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'shopee':
        return {
          name: product.platformName || 'Shopee',
          badgeClass: 'bg-[#EE4D2D] text-white',
          buttonClass: 'bg-[#EE4D2D] hover:bg-[#d73f20] text-white shadow-sm shadow-[#EE4D2D]/30',
          textColor: 'text-[#EE4D2D]'
        };
      case 'lazada':
        return {
          name: product.platformName || 'Lazada',
          badgeClass: 'bg-[#0F146D] text-white',
          buttonClass: 'bg-[#0F146D] hover:bg-[#0b0f55] text-white shadow-sm shadow-[#0F146D]/30',
          textColor: 'text-[#0F146D]'
        };
      case 'tiki':
        return {
          name: product.platformName || 'Tiki',
          badgeClass: 'bg-[#1A94FF] text-white',
          buttonClass: 'bg-[#1A94FF] hover:bg-[#0d82eb] text-white shadow-sm shadow-[#1A94FF]/30',
          textColor: 'text-[#1A94FF]'
        };
      case 'tiktok':
        return {
          name: product.platformName || 'TikTok Shop',
          badgeClass: 'bg-black text-white',
          buttonClass: 'bg-black hover:bg-stone-800 text-white shadow-sm shadow-black/30',
          textColor: 'text-black'
        };
      default:
        return {
          name: product.platformName || 'Sàn TMĐT',
          badgeClass: 'bg-[#a33e07] text-white',
          buttonClass: 'bg-[#a33e07] hover:bg-[#8c3405] text-white shadow-sm shadow-[#a33e07]/30',
          textColor: 'text-[#a33e07]'
        };
    }
  };

  const platformMeta = getPlatformMeta(platform);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(productCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleDishClick = (dishName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectRecipe) {
      onSelectRecipe(dishName);
    } else if (onOpenQuickView) {
      onOpenQuickView(product);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenQuickView && onOpenQuickView(product)}
      className="group bg-white rounded-2xl border border-[#EAE0D5] hover:border-[#a33e07]/50 shadow-xs hover:shadow-xl hover:shadow-[#2B2118]/8 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-[#FAF5F0] overflow-hidden select-none">
        <img
          src={displayImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* E-Commerce Platform Badge & Discount Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold tracking-wide uppercase shadow-sm flex items-center gap-1 ${platformMeta.badgeClass}`}>
              <ExternalLink className="w-3 h-3" />
              {platformMeta.name}
            </span>

            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black bg-rose-600 text-white shadow-sm animate-pulse">
                -{discountPercent}%
              </span>
            )}
          </div>

          {product.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-md text-[#2B2118] border border-[#EAE0D5] shadow-xs w-fit">
              {product.badge}
            </span>
          )}
        </div>

        {/* Photo count indicator & multi-image navigation */}
        {allImages.length > 1 && (
          <>
            <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
              <Layers className="w-3 h-3" />
              <span>{activeImageIdx + 1}/{allImages.length} ảnh</span>
            </div>

            {/* Next/Prev buttons on hover */}
            <button
              onClick={handlePrevImage}
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-[#2B2118] shadow-md flex items-center justify-center transition-all z-10 hover:bg-white hover:scale-110 active:scale-95 ${
                isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
              }`}
              title="Ảnh trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextImage}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-[#2B2118] shadow-md flex items-center justify-center transition-all z-10 hover:bg-white hover:scale-110 active:scale-95 ${
                isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
              }`}
              title="Ảnh sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10 pointer-events-none">
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeImageIdx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Origin / Brand Tag */}
        {product.origin && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md z-10">
            {product.origin}
          </div>
        )}

        {/* Quick View Floating Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuickView && onOpenQuickView(product);
          }}
          className={`absolute top-10 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#2B2118] hover:text-[#a33e07] hover:bg-white shadow-md flex items-center justify-center transition-all z-10 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:opacity-0'
          }`}
          title="Xem chi tiết ảnh & thông số"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Brand & Rating row */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7D6F] mb-1.5">
            <span className="font-bold text-[#a33e07] truncate max-w-[120px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#2B2118]">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm text-[#2B2118] line-clamp-2 leading-snug group-hover:text-[#a33e07] transition-colors">
            {product.name}
          </h3>

          {/* Product Code (Mã sản phẩm) Box */}
          <div className="mt-2.5 p-1.5 px-2.5 rounded-xl bg-[#FAF5F0] border border-[#EAE0D5] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Tag className="w-3 h-3 text-[#a33e07] shrink-0" />
              <span className="text-[10px] text-[#8C7D6F] shrink-0 font-medium">Mã SP:</span>
              <span className="text-[11px] font-mono font-bold text-[#2B2118] truncate select-all">
                {productCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 ${
                copiedCode 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white hover:bg-[#FFE0CC] text-[#a33e07] border border-[#EAE0D5]'
              }`}
              title="Sao chép mã sản phẩm"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Chép mã</span>
                </>
              )}
            </button>
          </div>

          {/* Short description */}
          <p className="text-xs text-[#6B5D4F] line-clamp-1 mt-2">
            {product.shortDescription}
          </p>

          {/* Related Dishes tags (User flow linking Product -> Recipe) */}
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-[#8C7D6F] font-medium">Nấu ngon:</span>
            {relatedDishes.map((dish, dIdx) => (
              <button
                key={dIdx}
                type="button"
                onClick={(e) => handleDishClick(dish, e)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF5EB] hover:bg-[#FFE8D6] text-[#a33e07] border border-[#FFE0CC] transition-colors cursor-pointer"
                title={`Xem công thức nấu món ${dish}`}
              >
                🥘 {dish}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Affiliate CTA Button */}
        <div className="pt-2.5 border-t border-[#F7F2EE] flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#8C7D6F] block font-medium truncate">
              {product.priceMax && product.priceMax > product.price
                ? `Khoảng giá trên ${platformMeta.name}:`
                : `Giá trên ${platformMeta.name}:`}
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#a33e07] tracking-tight">
                {product.priceMax && product.priceMax > product.price
                  ? `${product.price.toLocaleString('vi-VN')}₫ - ${product.priceMax.toLocaleString('vi-VN')}₫`
                  : `${product.price.toLocaleString('vi-VN')}₫`}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (!product.priceMax || product.priceMax <= product.price) && (
                <span className="text-[11px] text-[#A89A8D] line-through font-medium">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
          </div>

          {/* Direct Affiliate Link Button to E-Commerce */}
          <a
            id={`btn-affiliate-link-${product.id}`}
            href={product.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 ${platformMeta.buttonClass}`}
            title={`Chuyển đến gian hàng trên ${platformMeta.name}`}
          >
            <span>Mua trên {platformMeta.name}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};
