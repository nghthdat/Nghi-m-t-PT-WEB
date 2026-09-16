import React, { useState } from 'react';
import { ChefHat, Sparkles, PlusCircle, ShieldCheck, Heart, User, Search, Flame, LogIn, LogOut, ChevronDown, ShoppingBag, Store, Package, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount?: number;
  onOpenSearch?: () => void;
  onNavigateToProfileTab?: (tab: 'posted' | 'saved' | 'cart' | 'orders' | 'badges' | 'moderation') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount = 0,
  onOpenSearch,
  onNavigateToProfileTab
}) => {
  const { user, profile, isAdmin, openAuthModal, handleSignOut } = useAuth();
  const { totalItems, orders, setIsCartOpen } = useCart();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE0D5] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#a33e07] to-[#e8703a] flex items-center justify-center text-white shadow-sm shadow-[#a33e07]/20 group-hover:scale-105 transition-all shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-[#2B2118] tracking-tight whitespace-nowrap">
                Hôm Nay Ăn Gì
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#a33e07] border border-[#FFE0CC] shrink-0">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#6B5D4F] leading-none hidden sm:block whitespace-nowrap">
              Gợi ý & chia sẻ công thức thông minh
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'home'
                ? 'bg-[#FFF0E6] text-[#a33e07]'
                : 'text-[#6B5D4F] hover:bg-[#F7F2EE] hover:text-[#2B2118]'
            }`}
          >
            Trang chủ
          </button>
          
          <button
            onClick={() => setCurrentTab('suggestions')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'suggestions'
                ? 'bg-[#FFF0E6] text-[#a33e07]'
                : 'text-[#6B5D4F] hover:bg-[#F7F2EE] hover:text-[#2B2118]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#a33e07]" />
            Gợi ý AI
          </button>

          <button
            onClick={() => setCurrentTab('shop')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'shop'
                ? 'bg-[#FFF0E6] text-[#a33e07]'
                : 'text-[#6B5D4F] hover:bg-[#F7F2EE] hover:text-[#2B2118]'
            }`}
          >
            <Store className="w-4 h-4 text-[#a33e07]" />
            Dụng cụ bếp
          </button>

          <button
            onClick={() => setCurrentTab('submit')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'submit'
                ? 'bg-[#FFF0E6] text-[#a33e07]'
                : 'text-[#6B5D4F] hover:bg-[#F7F2EE] hover:text-[#2B2118]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Đăng công thức
          </button>
        </nav>

        {/* Right CTA / User Profile, Cart & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative">
          {/* Shopping Cart Button */}
          <button
            id="btn-open-cart-navbar"
            onClick={() => setIsCartOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#EAE0D5] hover:border-[#a33e07] bg-white hover:bg-[#FFF8F0] text-[#2B2118] flex items-center gap-1.5 shadow-xs transition-all relative group active:scale-95"
            title="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5 text-[#a33e07] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#a33e07] text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                id="btn-user-dropdown-toggle"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-full border transition-all ${
                  currentTab === 'profile' || currentTab === 'admin'
                    ? 'border-[#a33e07] bg-[#FFF0E6]'
                    : 'border-[#EAE0D5] bg-white hover:border-[#D1C2B4]'
                }`}
              >
                <div className="relative">
                  <img
                    src={profile?.avatar_url || user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face"}
                    alt={profile?.display_name || user.displayName || 'Tài khoản'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-[#EAE0D5]"
                  />
                  {isAdmin && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#a33e07] ring-2 ring-white" />
                  )}
                </div>
                <span className="text-xs font-bold text-[#2B2118] hidden sm:inline max-w-[120px] truncate">
                  {profile?.display_name || user.displayName || user.email?.split('@')[0] || 'Tài khoản'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C7D6F] hidden sm:inline" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#EAE0D5] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#F7F2EE]">
                    <div className="font-bold text-xs text-[#2B2118] flex items-center justify-between gap-1">
                      <span className="truncate">{profile?.display_name || user.displayName || user.email?.split('@')[0] || 'Tài khoản'}</span>
                      {isAdmin && (
                        <span className="text-[9px] bg-[#FFE0CC] text-[#a33e07] px-1.5 py-0.2 rounded font-bold shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8C7D6F] truncate">{profile?.email || user.email || ''}</div>
                  </div>

                  {/* 1. Trang cá nhân */}
                  <button
                    id="btn-dropdown-profile"
                    onClick={() => {
                      if (onNavigateToProfileTab) {
                        onNavigateToProfileTab('posted');
                      } else {
                        setCurrentTab('profile');
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#8C7D6F]" />
                    <span>Trang cá nhân</span>
                  </button>

                  {/* 2. Cài đặt */}
                  <button
                    id="btn-dropdown-settings"
                    onClick={() => {
                      if (onNavigateToProfileTab) {
                        onNavigateToProfileTab('posted');
                      } else {
                        setCurrentTab('profile');
                      }
                      window.dispatchEvent(new CustomEvent('openProfileEditModal'));
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#8C7D6F]" />
                    <span>Cài đặt</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateToProfileTab) {
                        onNavigateToProfileTab('cart');
                      } else {
                        setCurrentTab('profile');
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#a33e07]" />
                      Giỏ hàng của tôi
                    </span>
                    {totalItems > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#a33e07] text-white text-[10px] flex items-center justify-center font-bold">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateToProfileTab) {
                        onNavigateToProfileTab('orders');
                      } else {
                        setCurrentTab('profile');
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#8C7D6F]" />
                      Lịch sử đơn mua
                    </span>
                    {orders.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-md bg-[#FAF5F0] text-[#6B5D4F] text-[10px] font-semibold">
                        {orders.length}
                      </span>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setCurrentTab('admin')}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-[#a33e07] hover:bg-[#FFF0E6] flex items-center justify-between gap-2 border-y border-[#FFF0E6] bg-[#FFF8F0]"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#a33e07]" />
                        Kiểm duyệt công thức
                      </span>
                      {pendingCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#a33e07] text-white text-[10px] flex items-center justify-center font-bold">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentTab('shop')}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center gap-2.5"
                  >
                    <Store className="w-4 h-4 text-[#8C7D6F]" />
                    Cửa hàng dụng cụ bếp
                  </button>

                  <button
                    onClick={() => setCurrentTab('submit')}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#2B2118] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center gap-2.5"
                  >
                    <PlusCircle className="w-4 h-4 text-[#8C7D6F]" />
                    Đăng công thức mới
                  </button>

                  <button
                    onClick={() => openAuthModal({ mode: 'login' })}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#6B5D4F] hover:bg-[#FFF0E6] hover:text-[#a33e07] flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-[#8C7D6F]" />
                    Đổi tài khoản khác
                  </button>

                  {/* 3. Đăng xuất */}
                  <div className="border-t border-[#F7F2EE] mt-1 pt-1">
                    <button
                      id="btn-dropdown-logout"
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Nút Đăng nhập */}
              <button
                id="btn-header-login"
                onClick={() => openAuthModal({ mode: 'login' })}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#EAE0D5] hover:border-[#a33e07] bg-white hover:bg-[#FFF8F0] text-[#2B2118] text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#a33e07]" />
                <span>Đăng nhập</span>
              </button>

              {/* Nút Đăng ký */}
              <button
                id="btn-header-register"
                onClick={() => openAuthModal({ mode: 'register' })}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white text-xs font-bold shadow-sm shadow-[#a33e07]/20 transition-all active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


