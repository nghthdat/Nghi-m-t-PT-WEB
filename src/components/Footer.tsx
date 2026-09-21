import React, { useState } from 'react';
import {
  ChefHat,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  ArrowUp,
  Sparkles,
  Store,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput('');
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-[#EAE0D5] mt-16 pb-24 sm:pb-10 transition-colors">
      {/* 1. Value Highlights Bar */}
      <div className="border-b border-[#F5EDE4] bg-[#FAF5F0]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0 shadow-xs">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2B2118]">1,000+ Công Thức</h4>
                <p className="text-xs text-[#6B5D4F] mt-0.5 leading-relaxed">
                  Công thức chi tiết, nguyên liệu dễ tìm và được kiểm duyệt kỹ càng.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2B2118]">Gợi Ý Thông Minh AI</h4>
                <p className="text-xs text-[#6B5D4F] mt-0.5 leading-relaxed">
                  Tìm món ăn tức thì theo nguyên liệu sẵn có trong tủ lạnh của bạn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0 shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2B2118]">Dụng Cụ Bếp Chọn Lọc</h4>
                <p className="text-xs text-[#6B5D4F] mt-0.5 leading-relaxed">
                  Mua sắm thiết bị nấu nướng chính hãng với ưu đãi tốt nhất.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2B2118]">Cộng Đồng Tin Cậy</h4>
                <p className="text-xs text-[#6B5D4F] mt-0.5 leading-relaxed">
                  Môi trường văn minh, chia sẻ kinh nghiệm và đam mê ẩm thực Việt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        {/* 2. Newsletter Signup Box */}
        <div className="bg-gradient-to-r from-[#FAF5F0] via-[#FFF3EA] to-[#FAF5F0] border border-[#EAE0D5] rounded-3xl p-6 sm:p-8 mb-12 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#a33e07] text-xs font-bold mb-1">
                <Mail className="w-3.5 h-3.5" /> Bản tin ẩm thực hàng tuần
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#2B2118]">
                Đăng ký nhận thực đơn & mẹo bếp mới nhất
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5D4F]">
                Mỗi tuần một gợi ý món ngon bổ dưỡng cho cả gia đình, hoàn toàn miễn phí.
              </p>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[380px]">
              {isSubscribed ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cảm ơn bạn! Đã đăng ký nhận thực đơn thành công.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    required
                    className="flex-1 px-4 py-2.5 bg-white border border-[#EAE0D5] rounded-2xl text-xs sm:text-sm text-[#2B2118] placeholder-[#8C7D6F] focus:outline-none focus:border-[#a33e07] focus:ring-1 focus:ring-[#a33e07] shadow-xs"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#a33e07] to-[#d9530a] hover:from-[#8c3405] hover:to-[#be4607] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md shadow-[#a33e07]/20 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                  >
                    <span>Đăng ký</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
              <p className="text-[11px] text-[#8C7D6F] text-center lg:text-left mt-2">
                🔒 Cam kết không spam • Hủy đăng ký bất cứ lúc nào
              </p>
            </div>
          </div>
        </div>

        {/* 3. Main Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1 & 2: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer inline-flex"
              onClick={() => setCurrentTab('home')}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#a33e07] to-[#d9530a] flex items-center justify-center shrink-0 shadow-md shadow-[#a33e07]/20">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#2B2118]">
                Ăn Gì<span className="text-[#a33e07]">HômNay</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#6B5D4F] leading-relaxed max-w-sm">
              Cộng đồng chia sẻ công thức nấu ăn lớn nhất Việt Nam. Cùng nhau nấu ngon, sống khỏe và gìn giữ tinh hoa ẩm thực truyền thống lẫn hiện đại.
            </p>

            <div className="space-y-2 pt-1 text-xs text-[#6B5D4F]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#a33e07] shrink-0 mt-0.5" />
                <span>Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#a33e07] shrink-0" />
                <a href="tel:19001234" className="hover:text-[#a33e07] transition-colors font-medium">1900 1234 (8:00 - 18:00)</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#a33e07] shrink-0" />
                <a href="mailto:hotro@angihomnay.vn" className="hover:text-[#a33e07] transition-colors font-medium">hotro@angihomnay.vn</a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-xl bg-[#FAF5F0] border border-[#EAE0D5] flex items-center justify-center text-[#6B5D4F] hover:bg-[#a33e07] hover:text-white hover:border-[#a33e07] transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-xl bg-[#FAF5F0] border border-[#EAE0D5] flex items-center justify-center text-[#6B5D4F] hover:bg-[#a33e07] hover:text-white hover:border-[#a33e07] transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Youtube"
                className="w-8 h-8 rounded-xl bg-[#FAF5F0] border border-[#EAE0D5] flex items-center justify-center text-[#6B5D4F] hover:bg-[#a33e07] hover:text-white hover:border-[#a33e07] transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Khám phá */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#2B2118] uppercase tracking-wider">Khám phá</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('suggestions')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a33e07]" />
                  Gợi ý món ăn AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('shop')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Cửa hàng dụng cụ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('submit')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Đăng công thức mới
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Về chúng tôi */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#2B2118] uppercase tracking-wider">Thông tin</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                >
                  Về chúng tôi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                >
                  Liên hệ & Góp ý
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('faq')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                >
                  Giải đáp thắc mắc (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Chính sách */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#2B2118] uppercase tracking-wider">Chính sách</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setCurrentTab('privacy')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('terms')}
                  className="text-xs sm:text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                >
                  Điều khoản dịch vụ
                </button>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-[#8C7D6F]">
                  <Clock className="w-3.5 h-3.5 text-[#a33e07]" />
                  <span>Hỗ trợ 24/7 qua email</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Bottom Copyright & Back to Top Bar */}
        <div className="pt-8 border-t border-[#F0E6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-xs text-[#8C7D6F]">
              © 2026 Ăn Gì Hôm Nay. All rights reserved.
            </p>
            <span className="hidden sm:inline text-[#D6C7B8]">•</span>
            <div className="flex items-center gap-1 text-xs text-[#8C7D6F]">
              Phát triển với <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> bởi Đội ngũ Ăn Gì Hôm Nay
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF5F0] hover:bg-[#FFF0E6] text-[#6B5D4F] hover:text-[#a33e07] border border-[#EAE0D5] text-xs font-semibold transition-all shadow-2xs group active:scale-95 cursor-pointer"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

