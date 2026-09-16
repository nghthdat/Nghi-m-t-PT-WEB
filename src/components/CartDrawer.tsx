import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, 
  ExternalLink, ShieldCheck, Tag 
} from 'lucide-react';

interface CartDrawerProps {
  onNavigateToShop?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToShop }) => {
  const {
    cart,
    totalItems,
    subtotal,
    finalTotal,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#EAE0D5] relative animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE0D5] flex items-center justify-between bg-[#FFFDFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B2118]">Danh sách dụng cụ đã lưu</h2>
              <p className="text-xs text-[#8C7D6F]">{totalItems} sản phẩm đã chọn</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-[#8C7D6F] hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="Xoá tất cả sản phẩm"
              >
                Xoá hết
              </button>
            )}
            <button
              id="btn-close-cart-drawer"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-xl hover:bg-[#F7F2EE] text-[#6B5D4F] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-10 h-10 opacity-70" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2B2118]">Chưa có sản phẩm nào</h3>
                <p className="text-xs text-[#8C7D6F] max-w-xs mt-1">
                  Khám phá các dụng cụ nấu nướng chính hãng và liên kết mua hàng trên Shopee, Lazada, Tiki...
                </p>
              </div>
              {onNavigateToShop && (
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToShop();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold transition-all shadow-md shadow-[#a33e07]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Xem gian hàng dụng cụ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            cart.map((item) => {
              const productCode = item.product.productCode || `SP-${item.productId.replace('prod-', '').substring(0, 8).toUpperCase()}`;
              const platformName = item.product.platformName || (item.product.platform === 'lazada' ? 'Lazada' : item.product.platform === 'tiki' ? 'Tiki' : item.product.platform === 'tiktok' ? 'TikTok' : 'Shopee');
              const affiliateUrl = item.product.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(item.product.name)}`;

              return (
                <div
                  key={`${item.productId}-${item.selectedOption || 'default'}`}
                  className="p-3 rounded-2xl border border-[#EAE0D5] bg-[#FFFDFB] flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF5F0] border border-[#EAE0D5] shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#2B2118] line-clamp-1 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedOption)}
                          className="text-[#8C7D6F] hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                          title="Xoá sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Product Code */}
                      <div className="flex items-center gap-1 text-[10px] text-[#8C7D6F] mt-0.5">
                        <Tag className="w-2.5 h-2.5 text-[#a33e07]" />
                        <span className="font-mono font-semibold">{productCode}</span>
                      </div>
                    </div>

                    {/* Affiliate Link & Price */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F7F2EE] gap-2">
                      <span className="text-xs font-black text-[#a33e07]">
                        {item.product.priceMax && item.product.priceMax > item.product.price
                          ? `${(item.product.price * item.quantity).toLocaleString('vi-VN')}₫ - ${(item.product.priceMax * item.quantity).toLocaleString('vi-VN')}₫`
                          : `${(item.product.price * item.quantity).toLocaleString('vi-VN')}₫`}
                      </span>

                      {/* Direct Affiliate link */}
                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#a33e07] text-[11px] font-bold flex items-center gap-1 transition-all shrink-0"
                        title={`Mua trực tiếp trên ${platformName}`}
                      >
                        <span>Mua trên {platformName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAE0D5] bg-[#FFFDFB] space-y-3">
            <div className="flex justify-between items-baseline text-sm font-black text-[#2B2118]">
              <span>Tổng giá trị trên sàn:</span>
              <span className="text-lg text-[#a33e07]">
                {subtotal.toLocaleString('vi-VN')}₫
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C7D6F] text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Giá khớp chính xác với giá niêm yết trên sàn TMĐT khi bạn click mua</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
