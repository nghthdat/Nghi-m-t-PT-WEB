import React, { useState } from 'react';
import { ProductItem, ProductCategory } from '../types';
import { 
  X, Plus, Image as ImageIcon, Link as LinkIcon, 
  Tag, Store, DollarSign, Sparkles, Check, Trash2, Layers 
} from 'lucide-react';

interface PostAffiliateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: ProductItem) => void;
}

const SAMPLE_KITCHEN_IMAGES = [
  { label: 'Nồi đất Bát Tràng', url: 'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chảo gang đúc', url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dao bếp Nhật', url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cối chày đá', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hạt dổi Mắc khén', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Thớt gỗ nghiến', url: 'https://images.unsplash.com/photo-1588644525273-f37b60d78512?auto=format&fit=crop&w=800&q=80' },
];

export const PostAffiliateProductModal: React.FC<PostAffiliateProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [platform, setPlatform] = useState<'shopee' | 'lazada' | 'tiki' | 'tiktok' | 'sendo' | 'other'>('shopee');
  const [category, setCategory] = useState<ProductCategory>('tools');
  const [price, setPrice] = useState<string>('150000');
  const [priceMax, setPriceMax] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('200000');
  const [brand, setBrand] = useState('Chính hãng');
  const [origin, setOrigin] = useState('Việt Nam');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [badge, setBadge] = useState('Khuyên Dùng');
  
  // Multiple images state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-detect platform from affiliate URL
  const handleUrlChange = (url: string) => {
    setAffiliateUrl(url);
    const lower = url.toLowerCase();
    if (lower.includes('shopee.vn') || lower.includes('shp.ee')) {
      setPlatform('shopee');
    } else if (lower.includes('lazada.vn') || lower.includes('lzd.co')) {
      setPlatform('lazada');
    } else if (lower.includes('tiki.vn')) {
      setPlatform('tiki');
    } else if (lower.includes('tiktok.com') || lower.includes('vt.tiktok.com')) {
      setPlatform('tiktok');
    }
  };

  // Add photo
  const handleAddImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!images.includes(trimmed)) {
      setImages(prev => [...prev, trimmed]);
    }
    setNewImageUrl('');
  };

  // Remove photo
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAutoGenerateCode = () => {
    const prefix = category === 'tools' ? 'DC' : category === 'appliances' ? 'TB' : category === 'spices' ? 'GV' : 'SP';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setProductCode(`${prefix}-${random}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }

    if (!affiliateUrl.trim()) {
      setError('Vui lòng nhập link tiếp thị liên kết (Affiliate link sang Shopee, Lazada, Tiki...).');
      return;
    }

    if (images.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh sản phẩm.');
      return;
    }

    setIsSubmitting(true);

    try {
      const code = productCode.trim() || `SP-${Date.now().toString(36).toUpperCase()}`;
      const payload = {
        name: name.trim(),
        productCode: code,
        affiliateUrl: affiliateUrl.trim(),
        platform,
        platformName: platform === 'shopee' ? 'Shopee' : platform === 'lazada' ? 'Lazada' : platform === 'tiki' ? 'Tiki' : platform === 'tiktok' ? 'TikTok Shop' : 'Sàn TMĐT',
        category,
        price: Number(price) || 0,
        priceMax: priceMax ? Number(priceMax) : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        image: images[0],
        images,
        brand: brand.trim() || 'Chính hãng',
        origin: origin.trim() || 'Việt Nam',
        description: description.trim() || `Dụng cụ nhà bếp chuẩn ${brand}, hỗ trợ nấu các món ngon gia đình.`,
        shortDescription: shortDescription.trim() || description.substring(0, 100),
        badge: badge.trim() || undefined,
        specifications: {
          'Mã sản phẩm': code,
          'Thương hiệu': brand.trim() || 'Chính hãng',
          'Xuất xứ': origin.trim() || 'Việt Nam',
          'Sàn bán': platform.toUpperCase()
        },
        features: [
          'Chất liệu cao cấp, độ bền vượt trội',
          'Dễ dàng vệ sinh sau khi sử dụng',
          'Mua trực tiếp từ gian hàng chính hãng uy tín'
        ]
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi đăng sản phẩm');
      }

      onProductCreated(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EAE0D5] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#EAE0D5] flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-[#2B2118] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#a33e07]" />
              <span>Đăng Sản Phẩm Dụng Cụ Bếp (Affiliate)</span>
            </h2>
            <p className="text-xs text-[#8C7D6F]">
              Đăng ảnh, mã sản phẩm và link dẫn sang sàn TMĐT (Shopee, Lazada, Tiki, TikTok...)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF5F0] hover:bg-[#EAE0D5] text-[#6B5D4F] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-[#2B2118] mb-1">
              Tên dụng cụ / thiết bị bếp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nồi Đất Kho Cá Bát Tràng Tráng Men Cao Cấp 2L"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE0D5] text-xs font-semibold focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
            />
          </div>

          {/* Product Code & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2B2118]">
                  Mã sản phẩm (Product Code) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  className="text-[10px] font-bold text-[#a33e07] hover:underline"
                >
                  + Tạo tự động
                </button>
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                  placeholder="VD: SP-ND-BATTRANG-01"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE0D5] text-xs font-mono font-bold focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Sàn thương mại điện tử <span className="text-red-500">*</span>
              </label>
              <select
                value={platform}
                onChange={(e: any) => setPlatform(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EAE0D5] text-xs font-bold text-[#2B2118] bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07] cursor-pointer"
              >
                <option value="shopee">Shopee</option>
                <option value="lazada">Lazada</option>
                <option value="tiki">Tiki</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="other">Sàn khác</option>
              </select>
            </div>
          </div>

          {/* Affiliate URL */}
          <div>
            <label className="block text-xs font-bold text-[#2B2118] mb-1">
              Link dẫn sang sàn TMĐT (Affiliate URL) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={affiliateUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="VD: https://shopee.vn/product/123456/789012 hoặc link tiếp thị..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE0D5] text-xs font-medium focus:outline-hidden focus:border-[#a33e07] bg-[#FAF5F0]"
              />
            </div>
            <p className="text-[11px] text-[#8C7D6F] mt-1">
              Hệ thống sẽ tự động nhận diện sàn TMĐT khi bạn dán link Shopee, Lazada, Tiki hoặc TikTok Shop.
            </p>
          </div>

          {/* Product Images (Đăng các ảnh sản phẩm) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF5F0] border border-[#EAE0D5]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#a33e07]" />
                <span>Các ảnh sản phẩm ({images.length} ảnh) <span className="text-red-500">*</span></span>
              </label>
              <span className="text-[10px] text-[#8C7D6F]">Ảnh đầu tiên sẽ làm ảnh bìa chính</span>
            </div>

            {/* List of current images */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-xs group bg-white">
                  <img src={img} alt={`Ảnh ${idx + 1} của sản phẩm ${name || ""}`.trim()} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#a33e07] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Bìa chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Xoá ảnh này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image by URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Dán link ảnh sản phẩm (https://...)"
                className="flex-1 px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs bg-white focus:outline-hidden focus:border-[#a33e07]"
              />
              <button
                type="button"
                onClick={() => handleAddImage(newImageUrl)}
                className="px-3 py-2 rounded-xl bg-[#2B2118] text-white text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer shrink-0"
              >
                + Thêm ảnh
              </button>
            </div>

            {/* Quick sample image picker */}
            <div className="pt-2 border-t border-[#EAE0D5]/70">
              <span className="text-[10px] font-semibold text-[#8C7D6F] block mb-1.5">
                Hoặc chọn ảnh mẫu dụng cụ chất lượng cao:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_KITCHEN_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddImage(sample.url)}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white hover:bg-[#FFE0CC] text-[#2B2118] border border-[#EAE0D5] transition-colors cursor-pointer"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category, Price, Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs font-bold bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
              >
                <option value="tools">Dụng cụ làm bếp</option>
                <option value="appliances">Thiết bị & Nồi chảo</option>
                <option value="spices">Gia vị chuẩn vị</option>
                <option value="meal_kits">Set Meal-Kit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Giá trên sàn (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 185000"
                className="w-full px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs font-bold text-[#a33e07] bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
              />
              <span className="text-[10px] text-[#8C7D6F] mt-0.5 block">Giá hoặc mức giá khởi điểm</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Đến giá (VNĐ - tuỳ chọn)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="VD: 240000"
                className="w-full px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs font-bold text-[#a33e07] bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
              />
              <span className="text-[10px] text-[#8C7D6F] mt-0.5 block">Nếu có khoảng giá theo phân loại</span>
            </div>
          </div>

          <div className="text-[11px] text-[#6B5D4F] bg-[#FAF5F0] border border-[#EAE0D5] p-2.5 rounded-xl flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span>
              <strong>Khớp đúng giá trị sàn:</strong> Nhập mức giá hoặc khoảng giá niêm yết thực tế trên {platform === 'shopee' ? 'Shopee' : platform === 'lazada' ? 'Lazada' : platform === 'tiki' ? 'Tiki' : platform === 'tiktok' ? 'TikTok Shop' : 'sàn'} khi gắn link để khách hàng nắm rõ giá chính xác.
            </span>
          </div>

          {/* Brand & Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Thương hiệu
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: Gốm Bát Tràng, Lodge, Kai..."
                className="w-full px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2118] mb-1">
                Xuất xứ
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="VD: Bát Tràng, Việt Nam, Nhật Bản..."
                className="w-full px-3 py-2 rounded-xl border border-[#EAE0D5] text-xs bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2B2118] mb-1">
              Mô tả chi tiết & Điểm nổi bật
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu công dụng, chất liệu, dung tích và lý do khuyên dùng cho món ăn..."
              className="w-full p-3 rounded-xl border border-[#EAE0D5] text-xs bg-[#FAF5F0] focus:outline-hidden focus:border-[#a33e07]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#EAE0D5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#EAE0D5] hover:bg-[#FAF5F0] text-xs font-bold text-[#6B5D4F] transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đăng Sản Phẩm Affiliate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
