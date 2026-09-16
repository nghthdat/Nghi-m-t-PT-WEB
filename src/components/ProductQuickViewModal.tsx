import React, { useState } from 'react';
import { ProductItem, Recipe } from '../types';
import { 
  X, Star, ExternalLink, ShieldCheck, Tag, Copy, 
  Check, ChefHat, Layers, CheckCircle2, ChevronRight 
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
  recipes?: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  recipes = [],
  onSelectRecipe
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Collect all available images
  const allImages = React.useMemo(() => {
    if (!product) return [];
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
  }, [product]);

  // Set default image when product opens
  React.useEffect(() => {
    if (product) {
      setSelectedImage(allImages[0] || product.image);
      setCopiedCode(false);
    }
  }, [product, allImages]);

  if (!product) return null;

  const productCode = product.productCode || `SP-${product.id.replace('prod-', '').substring(0, 8).toUpperCase()}`;
  const platform = product.platform || 'shopee';

  const getPlatformMeta = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'shopee':
        return {
          name: product.platformName || 'Shopee',
          badgeClass: 'bg-[#EE4D2D] text-white',
          buttonClass: 'bg-gradient-to-r from-[#EE4D2D] to-[#FF6B4A] hover:opacity-95 text-white shadow-lg shadow-[#EE4D2D]/25',
          textColor: 'text-[#EE4D2D]'
        };
      case 'lazada':
        return {
          name: product.platformName || 'Lazada',
          badgeClass: 'bg-[#0F146D] text-white',
          buttonClass: 'bg-gradient-to-r from-[#0F146D] to-[#1E27A8] hover:opacity-95 text-white shadow-lg shadow-[#0F146D]/25',
          textColor: 'text-[#0F146D]'
        };
      case 'tiki':
        return {
          name: product.platformName || 'Tiki',
          badgeClass: 'bg-[#1A94FF] text-white',
          buttonClass: 'bg-gradient-to-r from-[#1A94FF] to-[#40A9FF] hover:opacity-95 text-white shadow-lg shadow-[#1A94FF]/25',
          textColor: 'text-[#1A94FF]'
        };
      case 'tiktok':
        return {
          name: product.platformName || 'TikTok Shop',
          badgeClass: 'bg-black text-white',
          buttonClass: 'bg-gradient-to-r from-black to-stone-800 hover:opacity-95 text-white shadow-lg shadow-black/25',
          textColor: 'text-black'
        };
      default:
        return {
          name: product.platformName || 'Sàn TMĐT',
          badgeClass: 'bg-[#a33e07] text-white',
          buttonClass: 'bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white shadow-lg shadow-[#a33e07]/25',
          textColor: 'text-[#a33e07]'
        };
    }
  };

  const platformMeta = getPlatformMeta(platform);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(productCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  // Find related recipes for this product
  const relatedRecipes = recipes.filter(r => {
    if (product.relatedRecipeIds?.includes(r.id)) return true;
    if (product.relatedTags && r.categories?.some(c => product.relatedTags?.includes(c))) return true;
    return false;
  }).slice(0, 3);

  const affiliateLink = product.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;

  return (
    <div 
      id="product-quickview-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="product-quickview-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#EAE0D5] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-quickview"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#6B5D4F] hover:text-[#2B2118] border border-[#EAE0D5] flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-7">
          {/* Left Column: Images & Photos */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF5F0] border border-[#EAE0D5] relative">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {/* Platform Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-1.5 ${platformMeta.badgeClass}`}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mua trên {platformMeta.name}</span>
                </span>
                {product.badge && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-white/95 backdrop-blur-md text-[#2B2118] border border-[#EAE0D5] shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Photo Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#8C7D6F]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-[#a33e07]" />
                    Ảnh sản phẩm ({allImages.length} ảnh):
                  </span>
                  <span>Nhấn để xem phóng to</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImage === img ? 'border-[#a33e07] ring-2 ring-[#a33e07]/20 scale-105' : 'border-[#EAE0D5] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Ảnh ${idx + 1} của ${product.name}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Affiliate Value Assurances (No Freeship claims) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F7F2EE] text-[11px] text-[#6B5D4F]">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-[#FAF5F0]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-[#2B2118]">100% Chính Hãng</span>
                <span className="text-[10px] text-[#8C7D6F]">Cửa hàng Mall uy tín</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-[#FAF5F0]">
                <ExternalLink className="w-4 h-4 text-blue-600 mb-1" />
                <span className="font-semibold text-[#2B2118]">Link Sàn Trực Tiếp</span>
                <span className="text-[10px] text-[#8C7D6F]">Bảo hộ bởi sàn TMĐT</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Affiliate Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Brand, Origin & Rating */}
              <div className="flex items-center justify-between text-xs text-[#8C7D6F] mb-1.5">
                <span className="font-bold text-[#a33e07] uppercase tracking-wider">{product.brand}</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#2B2118] ml-1">{product.rating.toFixed(1)}</span>
                  <span>({product.reviewCount} đánh giá)</span>
                </div>
              </div>

              {/* Product Title */}
              <h2 className="text-lg sm:text-xl font-bold text-[#2B2118] leading-snug">
                {product.name}
              </h2>

              {/* Product Code (Mã sản phẩm) Display & Copy */}
              <div className="mt-3 p-3 rounded-2xl bg-[#FAF5F0] border border-[#EAE0D5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE0D5] text-[#a33e07] flex items-center justify-center shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7D6F] block font-semibold">MÃ SẢN PHẨM:</span>
                    <span className="text-sm font-mono font-black text-[#2B2118] tracking-wider select-all">
                      {productCode}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copiedCode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-[#FFE0CC] text-[#a33e07] border border-[#EAE0D5]'
                  }`}
                  title="Sao chép mã sản phẩm để tìm trên sàn"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép mã!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép mã</span>
                    </>
                  )}
                </button>
              </div>

              {/* Price Row */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FFE0CC] flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-[#8C7D6F] font-bold uppercase tracking-wide">
                      {product.priceMax && product.priceMax > product.price
                        ? `KHOẢNG GIÁ TRÊN SÀN ${platformMeta.name.toUpperCase()}:`
                        : `GIÁ BÁN TRÊN SÀN ${platformMeta.name.toUpperCase()}:`}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold">
                      Khớp giá sàn
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-[#a33e07]">
                      {product.priceMax && product.priceMax > product.price
                        ? `${product.price.toLocaleString('vi-VN')}₫ - ${product.priceMax.toLocaleString('vi-VN')}₫`
                        : `${product.price.toLocaleString('vi-VN')}₫`}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (!product.priceMax || product.priceMax <= product.price) && (
                      <span className="text-xs text-[#A89A8D] line-through font-medium">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#8C7D6F]">
                  Đã bán: <strong className="text-[#2B2118]">{product.salesCount}</strong>
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#524436] mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-3.5 p-3 rounded-2xl bg-[#FAF5F0] border border-[#EAE0D5] space-y-1.5">
                  <h4 className="text-xs font-bold text-[#2B2118] mb-1">Thông số kỹ thuật:</h4>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[#8C7D6F]">{key}:</span>
                        <span className="font-semibold text-[#2B2118]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {product.features && product.features.length > 0 && (
                <div className="mt-3 space-y-1">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-[#524436]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Affiliate Link Actions */}
            <div className="pt-4 border-t border-[#F7F2EE] space-y-2.5">
              <a
                id="btn-quickview-affiliate-primary"
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer ${platformMeta.buttonClass}`}
              >
                <span>Xem và mua trên {platformMeta.name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center justify-between text-[11px] text-[#8C7D6F] px-1">
                <span>* Liên kết chuyển hướng an toàn sang ứng dụng/website {platformMeta.name}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="font-bold text-[#a33e07] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Sao chép mã {productCode}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Recipes recommendation footer if available */}
        {relatedRecipes.length > 0 && (
          <div className="p-5 bg-[#FAF5F0] border-t border-[#EAE0D5] rounded-b-3xl">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4 text-[#a33e07]" />
              <h3 className="text-xs font-bold text-[#2B2118]">
                Món ngon nấu chuẩn vị cùng dụng cụ này:
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {relatedRecipes.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    if (onSelectRecipe) {
                      onClose();
                      onSelectRecipe(r);
                    }
                  }}
                  className="bg-white p-2.5 rounded-xl border border-[#EAE0D5] hover:border-[#a33e07] flex items-center gap-2.5 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B2118] truncate group-hover:text-[#a33e07]">
                      {r.title}
                    </h4>
                    <span className="text-[10px] text-[#8C7D6F] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {r.rating.toFixed(1)} • {r.prepTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
