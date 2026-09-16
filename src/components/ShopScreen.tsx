import React, { useState, useMemo, useEffect } from 'react';
import { ProductItem, ProductCategory, Recipe } from '../types';
import { INITIAL_PRODUCTS } from '../data/seedProducts';
import { ProductCard } from './ProductCard';
import { ProductQuickViewModal } from './ProductQuickViewModal';
import { PostAffiliateProductModal } from './PostAffiliateProductModal';
import { 
  Search, Sparkles, ExternalLink, ShieldCheck, 
  ChefHat, Tag, Store, CheckCircle2, Plus 
} from 'lucide-react';

interface ShopScreenProps {
  recipes?: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  products?: ProductItem[];
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  recipes = [],
  onSelectRecipe,
  products = INITIAL_PRODUCTS
}) => {
  const [productList, setProductList] = useState<ProductItem[]>(products);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc'>('popular');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [postSuccessNotice, setPostSuccessNotice] = useState<string | null>(null);

  // Fetch dynamic products from backend API if available
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProductList(data.data);
      }
    } catch (err) {
      console.warn('Using seeded products catalog:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất cả loại', icon: '✨' },
    { id: 'tools', label: 'Dụng cụ làm bếp', icon: '🔪' },
    { id: 'appliances', label: 'Thiết bị & Nồi chảo', icon: '🍳' },
    { id: 'spices', label: 'Gia vị chuẩn vị', icon: '🧂' },
    { id: 'meal_kits', label: 'Set nấu Meal-Kit', icon: '🥘' }
  ];

  const platforms = [
    { id: 'all', label: 'Tất cả sàn' },
    { id: 'shopee', label: 'Shopee' },
    { id: 'lazada', label: 'Lazada' },
    { id: 'tiki', label: 'Tiki' },
    { id: 'tiktok', label: 'TikTok Shop' }
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return productList.filter(prod => {
      // Category filter
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }
      // Platform filter
      if (selectedPlatform !== 'all' && (prod.platform || 'shopee').toLowerCase() !== selectedPlatform) {
        return false;
      }
      // Search query (matches name, brand, productCode, description, origin, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = prod.productCode?.toLowerCase().includes(q);
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesOrigin = prod.origin?.toLowerCase().includes(q);
        const matchesTags = prod.relatedTags?.some(t => t.toLowerCase().includes(q));
        if (!matchesCode && !matchesName && !matchesBrand && !matchesDesc && !matchesOrigin && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [productList, selectedCategory, selectedPlatform, searchQuery, sortBy]);

  const handleProductCreated = (newProduct: ProductItem) => {
    setProductList(prev => [newProduct, ...prev]);
    setPostSuccessNotice(`Đã đăng thành công sản phẩm: "${newProduct.name}" (Mã: ${newProduct.productCode})!`);
    setTimeout(() => setPostSuccessNotice(null), 5000);
  };

  const handleSelectDish = (dishTitleOrId: string) => {
    if (!onSelectRecipe) return;
    const q = dishTitleOrId.toLowerCase();
    const matched = recipes.find(r => 
      r.id === dishTitleOrId || 
      r.title.toLowerCase().includes(q) || 
      q.includes(r.title.toLowerCase())
    );
    if (matched) {
      onSelectRecipe(matched);
    } else if (recipes.length > 0) {
      onSelectRecipe(recipes[0]);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-12">
      {/* Success notification for posting product */}
      {postSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{postSuccessNotice}</span>
          </div>
          <button 
            onClick={() => setPostSuccessNotice(null)}
            className="text-white/70 hover:text-white text-xs font-bold px-2 py-1"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Hero Banner for Kitchen Affiliate Store */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2B2118] via-[#4A3828] to-[#2B2118] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a33e07] text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiếp Thị Liên Kết Dụng Cụ Bếp Chính Hãng</span>
            </div>

            {/* Post Affiliate Product Trigger Button */}
            <button
              id="btn-post-affiliate-product"
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Đăng Sản Phẩm Affiliate</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Dụng Cụ & Gia Vị Tuyển Chọn Trên Các Sàn TMĐT
          </h1>

          <p className="text-xs sm:text-sm text-[#D1C2B4] leading-relaxed max-w-xl">
            Tổng hợp các dụng cụ nấu nướng chất lượng cao (nồi đất Bát Tràng, chảo gang đúc, dao Nhật, gia vị Tây Bắc...) với ảnh thực tế, mã sản phẩm và link mua trực tiếp từ gian hàng chính hãng trên Shopee, Lazada, Tiki và TikTok Shop.
          </p>

          {/* Value highlights for Affiliate Model */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#FAF5F0]">
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Link mua trực tiếp sàn TMĐT uy tín</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Mã sản phẩm & ảnh thực tế rõ ràng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>100% Gian hàng chính hãng & đánh giá cao</span>
            </div>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <ChefHat className="w-full h-full text-white -rotate-12 translate-x-12 translate-y-6" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE0D5] shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-[#8C7D6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc mã SP (ví dụ: SP-ND, chảo gang, dao bếp...)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EAE0D5] text-xs font-medium focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7D6F] hover:text-[#2B2118]"
              >
                Xoá
              </button>
            )}
          </div>

          {/* Action Row: Post Product & Sort */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
              title="Đăng sản phẩm dụng cụ tiếp thị liên kết mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng sản phẩm</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#8C7D6F] font-semibold shrink-0 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs font-bold text-[#2B2118] bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07] cursor-pointer"
              >
                <option value="popular">Bán chạy nhất 🔥</option>
                <option value="rating">Đánh giá cao nhất ⭐</option>
                <option value="price-asc">Giá: Thấp đến Cao ⬆</option>
                <option value="price-desc">Giá: Cao đến Thấp ⬇</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Rows: Categories & Platforms */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#F7F2EE]">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-[#8C7D6F] shrink-0 mr-1">Danh mục:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#a33e07] text-white shadow-xs'
                      : 'bg-[#FAF5F0] hover:bg-[#EAE0D5] text-[#6B5D4F] border border-[#EAE0D5]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* E-Commerce Platform Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-[#8C7D6F] shrink-0 mr-1">Sàn TMĐT:</span>
            {platforms.map((plat) => {
              const isSelected = selectedPlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2B2118] text-white shadow-xs'
                      : 'bg-white hover:bg-[#FAF5F0] text-[#6B5D4F] border border-[#EAE0D5]'
                  }`}
                >
                  {plat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[#EAE0D5] text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="text-base font-bold text-[#2B2118]">Không tìm thấy sản phẩm phù hợp</h3>
          <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
            Vui lòng thử tìm kiếm với tên hoặc mã sản phẩm khác hoặc đổi bộ lọc sàn TMĐT.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPlatform('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#FAF5F0] hover:bg-[#EAE0D5] text-xs font-bold text-[#2B2118] transition-colors cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#a33e07] text-white text-xs font-bold hover:bg-[#8c3405] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng sản phẩm mới</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={(prod) => setQuickViewProduct(prod)}
              onSelectRecipe={handleSelectDish}
            />
          ))}
        </div>
      )}

      {/* Affiliate Transparency Notice */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EAE0D5] flex items-start gap-2.5 text-[11px] text-[#8C7D6F]">
        <CheckCircle2 className="w-4 h-4 text-[#a33e07] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#2B2118]">Thông báo tiếp thị liên kết:</strong> Khi bạn nhấp vào liên kết sàn TMĐT và mua sản phẩm, chúng tôi có thể nhận được một khoản hoa hồng nhỏ mà không phát sinh thêm bất kỳ chi phí nào cho bạn. Giá bán và khuyến mãi do sàn TMĐT quy định tại thời điểm mua hàng.
        </p>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        recipes={recipes}
        onSelectRecipe={onSelectRecipe}
      />

      {/* Post Affiliate Product Modal */}
      <PostAffiliateProductModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};
