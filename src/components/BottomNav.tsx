import React from 'react';
import { Home, Sparkles, PlusCircle, ShieldCheck, User, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount = 0
}) => {
  const { isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-[#EAE0D5] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'home' ? 'text-[#a33e07] font-bold' : 'text-[#6B5D4F]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Trang chủ</span>
        </button>

        <button
          onClick={() => setCurrentTab('suggestions')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'suggestions' ? 'text-[#a33e07] font-bold' : 'text-[#6B5D4F]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Gợi ý AI</span>
        </button>

        {/* Center Action Button */}
        <button
          onClick={() => setCurrentTab('submit')}
          className="flex flex-col items-center -mt-5 transition-transform active:scale-90"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#a33e07] to-[#e8703a] text-white flex items-center justify-center shadow-md shadow-[#a33e07]/30 border-2 border-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#a33e07] mt-0.5">Đăng món</span>
        </button>

        <button
          onClick={() => setCurrentTab('shop')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'shop' ? 'text-[#a33e07] font-bold' : 'text-[#6B5D4F]'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Cửa hàng</span>
          {totalItems > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-[#a33e07] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'profile' || currentTab === 'admin' ? 'text-[#a33e07] font-bold' : 'text-[#6B5D4F]'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" />
            {isAdmin && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#a33e07] ring-1.5 ring-white" />
            )}
          </div>
          <span className="text-[10px]">Tài khoản</span>
        </button>
      </div>
    </div>
  );
};

