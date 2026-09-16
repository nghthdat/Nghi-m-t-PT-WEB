import React from 'react';
import { ChefHat, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-white border-t border-[#EAE0D5] mt-12 pb-20 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Intro */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('home')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a33e07] to-[#d9530a] flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-[#2B2118]">
                Ăn Gì<span className="text-[#a33e07]">HômNay</span>
              </h1>
            </div>
            <p className="text-sm text-[#6B5D4F] leading-relaxed">
              Cộng đồng chia sẻ công thức nấu ăn lớn nhất Việt Nam. Khám phá hàng ngàn công thức mỗi ngày.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF5F0] flex items-center justify-center text-[#a33e07] hover:bg-[#a33e07] hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF5F0] flex items-center justify-center text-[#a33e07] hover:bg-[#a33e07] hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#FAF5F0] flex items-center justify-center text-[#a33e07] hover:bg-[#a33e07] hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Khám phá */}
          <div className="col-span-1">
            <h3 className="font-bold text-[#2B2118] mb-4">Khám phá</h3>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentTab('home')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Trang chủ</button></li>
              <li><button onClick={() => setCurrentTab('suggestions')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Gợi ý món ăn AI</button></li>
              <li><button onClick={() => setCurrentTab('shop')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Cửa hàng dụng cụ</button></li>
              <li><button onClick={() => setCurrentTab('submit')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Đăng công thức</button></li>
            </ul>
          </div>

          {/* Về chúng tôi */}
          <div className="col-span-1">
            <h3 className="font-bold text-[#2B2118] mb-4">Thông tin</h3>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentTab('about')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Về chúng tôi</button></li>
              <li><button onClick={() => setCurrentTab('contact')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Liên hệ</button></li>
              <li><button onClick={() => setCurrentTab('faq')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Giải đáp (FAQ)</button></li>
            </ul>
          </div>

          {/* Chính sách */}
          <div className="col-span-1">
            <h3 className="font-bold text-[#2B2118] mb-4">Chính sách & Hỗ trợ</h3>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentTab('privacy')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Chính sách bảo mật</button></li>
              <li><button onClick={() => setCurrentTab('terms')} className="text-sm text-[#6B5D4F] hover:text-[#a33e07] transition-colors">Điều khoản sử dụng</button></li>
              <li className="flex items-center gap-2 mt-4 text-sm text-[#6B5D4F]">
                <Mail className="w-4 h-4 text-[#a33e07]" /> hotro@angihomnay.vn
              </li>
              <li className="flex items-center gap-2 text-sm text-[#6B5D4F]">
                <Phone className="w-4 h-4 text-[#a33e07]" /> 1900 1234
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#F7F2EE] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8C7D6F] text-center md:text-left">
            © 2026 Ăn Gì Hôm Nay. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-[#8C7D6F]">
            Phát triển với <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1" /> bởi Đội ngũ Ăn Gì Hôm Nay
          </div>
        </div>
      </div>
    </footer>
  );
};
