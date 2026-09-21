import React, { useState } from 'react';
import { 
  User as UserIcon, Award, Flame, Bookmark, ChefHat, Plus, 
  Grid, Heart, Settings, Edit3, Sparkles, LogIn, LogOut, Check, X,
  ShoppingBag, Package, Truck, Clock, Store, MapPin, Phone, Mail,
  ShieldCheck, Zap, Star, Utensils, Compass, ChevronRight, CheckCircle2,
  Trash2, Minus, Tag, ArrowRight, Camera, UploadCloud
} from 'lucide-react';
import { Recipe, UserProfile } from '../types';
import { RecipeCard } from './RecipeCard';
import { AdminScreen } from './AdminScreen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { REALISTIC_USERS } from '../lib/firebase';
import { optimizeImageFile } from '../lib/imageOptimization';
import { ChangeDishImageModal } from './ChangeDishImageModal';

interface ProfileScreenProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigateToSubmit: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAdmin?: () => void;
  onRecipeApproved?: (recipe: Recipe) => void;
  initialTab?: 'posted' | 'saved' | 'cart' | 'orders' | 'badges' | 'moderation';
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face'
];

const STYLE_OPTIONS = ['Món Bắc', 'Món Trung', 'Món Nam', 'Món Canh', 'Món Kho', 'Healthy', 'Món Chay', 'Nấu Nhanh', 'Bữa Cơm Gia Đình'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  onNavigateToSubmit,
  onNavigateToShop,
  onNavigateToAdmin,
  onRecipeApproved,
  initialTab = 'posted'
}) => {
  const { 
    user, 
    profile, 
    isAdmin,
    savedRecipeIds, 
    openAuthModal, 
    handleSignOut, 
    handleQuickLogin,
    updateProfileData,
    showToast
  } = useAuth();
  
  const { 
    cart, 
    totalItems, 
    subtotal, 
    shippingFee, 
    discountAmount, 
    finalTotal, 
    appliedCoupon, 
    setIsCheckoutOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    applyCoupon, 
    removeCoupon,
    orders 
  } = useCart();

  const [activeTab, setActiveTab] = useState<'posted' | 'saved' | 'cart' | 'orders' | 'badges' | 'moderation'>(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const [recipeToChangeImage, setRecipeToChangeImage] = useState<Recipe | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('Hà Nội');
  const [editAvatar, setEditAvatar] = useState('');
  const [editStyles, setEditStyles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload handler from device
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Đang tối ưu ảnh đại diện...', 'info');
      const optimizedResult = await optimizeImageFile(file, { maxDimension: 500, quality: 0.8 });
      setEditAvatar(optimizedResult.dataUrl);
      showToast('Tải ảnh đại diện thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể tải ảnh lên.', 'error');
    }
  };

  // Guest view if no user
  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#a33e07] to-[#e8703a] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#a33e07]/20">
          <ChefHat className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#2B2118]">Tài khoản & Hồ sơ Bếp</h2>
          <p className="text-xs sm:text-sm text-[#6B5D4F] max-w-md mx-auto">
            Chọn một tài khoản thực tế để trải nghiệm ngay đầy đủ tính năng: lưu công thức, quản lý đơn mua dụng cụ bếp và quyền quản trị.
          </p>
        </div>

        {/* 1-Click Realistic Accounts Box */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE0D5] shadow-xs space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#F7F2EE]">
            <span className="text-xs font-bold text-[#a33e07] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current" />
              Đăng nhập nhanh tài khoản thực tế
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.values(REALISTIC_USERS).map(({ user: u, profile: p, role }) => (
              <button
                key={u.email}
                onClick={() => handleQuickLogin(u.email)}
                className="w-full p-3 rounded-2xl bg-[#FFF8F0] hover:bg-[#FFF0E6] border border-[#EAE0D5] hover:border-[#a33e07]/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar_url}
                    alt={p.display_name}
                    className="w-10 h-10 rounded-full object-cover border border-[#a33e07]/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                      <span>{p.display_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        role === 'admin'
                          ? 'bg-[#FFE0CC] text-[#a33e07]'
                          : role === 'chef'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#E0F2FE] text-[#0284C7]'
                      }`}>
                        {p.chef_title || (role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8C7D6F]">{u.email}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C7D6F] group-hover:text-[#a33e07] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#F7F2EE] space-y-2">
            <button
              onClick={() => openAuthModal({ mode: 'login' })}
              className="w-full py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập Email hoặc Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter posted recipes
  const postedRecipes = recipes.filter(r => 
    (user && r.author_uid === user.uid) || 
    (profile && r.author?.name === profile.display_name) ||
    (profile && r.author_name === profile.display_name) ||
    (user?.email === 'datnhatquang@gmail.com' && (r.isCustom || r.author?.name === 'Minh Châu' || r.author_name === 'Minh Châu'))
  );

  // Filter saved recipes
  const savedRecipes = recipes.filter(r => 
    savedRecipeIds.includes(r.id) || r.isSaved
  );

  const openEditModal = () => {
    if (!profile) return;
    setEditDisplayName(profile.display_name || '');
    setEditBio(profile.bio || '');
    setEditPhone(profile.phone || '0912 345 678');
    setEditAddress(profile.address || '28 Tràng Thi, Hoàn Kiếm');
    setEditCity(profile.city || 'Hà Nội');
    setEditAvatar(profile.avatar_url || AVATAR_OPTIONS[0]);
    setEditStyles(profile.cooking_style || ['Món Bắc', 'Món Kho', 'Nấu Nhanh']);
    setIsEditModalOpen(true);
  };

  React.useEffect(() => {
    const handleOpenEdit = () => {
      openEditModal();
    };
    window.addEventListener('openProfileEditModal', handleOpenEdit);
    return () => window.removeEventListener('openProfileEditModal', handleOpenEdit);
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDisplayName.trim()) {
      showToast('Vui lòng nhập tên hiển thị.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfileData({
        display_name: editDisplayName.trim(),
        bio: editBio.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        city: editCity,
        avatar_url: editAvatar,
        cooking_style: editStyles
      });
      setIsEditModalOpen(false);
      showToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể cập nhật hồ sơ.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCookingStyle = (style: string) => {
    setEditStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const formattedDate = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Tháng 1/2024';

  const userLevel = profile.level || 5;
  const userXP = profile.experience_points || 450;
  const nextLevelXP = userLevel * 120;
  const xpPercentage = Math.min(Math.round((userXP / nextLevelXP) * 100), 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D5] shadow-xs space-y-6 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FFF5EB] pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Badges */}
          <div className="relative shrink-0">
            <img
              src={profile.avatar_url || AVATAR_OPTIONS[0]}
              alt={profile.display_name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#FFF0E6] shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#a33e07] text-white shadow-md">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#2B2118]">{profile.display_name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFE0CC] text-[#a33e07] text-xs font-bold flex items-center gap-1 border border-[#FFD0B3]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile.chef_title || 'Bếp Trưởng Thân Thiết'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#8C7D6F] font-medium mt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
                  {profile.phone && <span className="flex items-center gap-1">• <Phone className="w-3.5 h-3.5" /> {profile.phone}</span>}
                  {profile.city && <span className="flex items-center gap-1">• <MapPin className="w-3.5 h-3.5" /> {profile.city}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-center shrink-0">
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'moderation'
                        ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
                        : 'bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#a33e07] border border-[#FFD0B3]'
                    }`}
                    title="Khu vực kiểm duyệt & quản trị công thức"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Kiểm duyệt công thức
                  </button>
                )}

                <button
                  onClick={openEditModal}
                  className="px-3.5 py-2 rounded-xl border border-[#EAE0D5] hover:bg-[#FFF8F0] text-xs font-bold text-[#6B5D4F] flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa hồ sơ
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
                    className="px-3.5 py-2 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF0E6] border border-[#EAE0D5] text-xs font-bold text-[#a33e07] flex items-center gap-1.5 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Đổi tài khoản
                  </button>

                  {/* Switch Account Dropdown */}
                  {isSwitchMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#EAE0D5] shadow-xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setIsSwitchMenuOpen(false)}
                    >
                      <div className="px-2.5 py-1 text-[11px] font-bold text-[#8C7D6F] uppercase">Chuyển sang tài khoản khác</div>
                      {Object.values(REALISTIC_USERS).map(({ user: u, profile: p, role }) => (
                        <button
                          key={u.email}
                          onClick={() => handleQuickLogin(u.email)}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all ${
                            user.email === u.email ? 'bg-[#FFF0E6] text-[#a33e07] font-bold' : 'hover:bg-[#FFF8F0] text-[#2B2118]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={p.avatar_url} alt={p.display_name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <div className="truncate text-xs">
                              <div>{p.display_name}</div>
                              <div className="text-[10px] text-[#8C7D6F] truncate">{u.email}</div>
                            </div>
                          </div>
                          {user.email === u.email && <Check className="w-4 h-4 text-[#a33e07] shrink-0" />}
                        </button>
                      ))}

                      <div className="pt-1.5 border-t border-[#F7F2EE]">
                        <button
                          onClick={handleSignOut}
                          className="w-full p-2 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Đăng xuất tài khoản
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-[#524436] max-w-xl leading-relaxed">
              {profile.bio || 'Yêu bếp, đam mê ẩm thực và chia sẻ những món ngon gia đình. 🍳✨'}
            </p>

            {/* Chef Level & XP Bar */}
            <div className="bg-[#FFF8F0] border border-[#F0DFD1] rounded-2xl p-3 max-w-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#2B2118]">
                  <Award className="w-4 h-4 text-[#a33e07]" />
                  <span>Cấp độ {userLevel} - {profile.member_tier || 'Bếp Trưởng Thân Thiết'}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#8C7D6F]">{userXP} / {nextLevelXP} XP</span>
              </div>
              <div className="w-full bg-[#EAE0D5] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#a33e07] to-[#e8703a] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Cooking Styles Tags */}
            {profile.cooking_style && profile.cooking_style.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#8C7D6F]">Sở thích:</span>
                {profile.cooking_style.map((style) => (
                  <span key={style} className="px-2.5 py-0.5 rounded-full bg-white border border-[#EAE0D5] text-[11px] font-medium text-[#524436]">
                    {style}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-6 border-t border-[#F7F2EE] text-center">
          <button
            onClick={() => setActiveTab('posted')}
            className={`p-3 rounded-2xl border transition-all text-center ${
              activeTab === 'posted' ? 'bg-[#FFF0E6] border-[#a33e07]' : 'bg-[#FFF8F0] border-[#EAE0D5] hover:border-[#D1C2B4]'
            }`}
          >
            <div className="text-lg font-black text-[#a33e07]">{postedRecipes.length}</div>
            <div className="text-[11px] font-semibold text-[#8C7D6F]">Công thức đã đăng</div>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`p-3 rounded-2xl border transition-all text-center ${
              activeTab === 'saved' ? 'bg-[#FFF0E6] border-[#a33e07]' : 'bg-[#FFF8F0] border-[#EAE0D5] hover:border-[#D1C2B4]'
            }`}
          >
            <div className="text-lg font-black text-[#a33e07]">{savedRecipes.length}</div>
            <div className="text-[11px] font-semibold text-[#8C7D6F]">Món ăn đã lưu</div>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`p-3 rounded-2xl border transition-all text-center ${
              activeTab === 'cart' ? 'bg-[#FFF0E6] border-[#a33e07]' : 'bg-[#FFF8F0] border-[#EAE0D5] hover:border-[#D1C2B4]'
            }`}
          >
            <div className="text-lg font-black text-[#a33e07]">{totalItems}</div>
            <div className="text-[11px] font-semibold text-[#8C7D6F]">Giỏ hàng (món)</div>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`p-3 rounded-2xl border transition-all text-center ${
              activeTab === 'orders' ? 'bg-[#FFF0E6] border-[#a33e07]' : 'bg-[#FFF8F0] border-[#EAE0D5] hover:border-[#D1C2B4]'
            }`}
          >
            <div className="text-lg font-black text-[#a33e07]">{orders.length}</div>
            <div className="text-[11px] font-semibold text-[#8C7D6F]">Đơn mua dụng cụ</div>
          </button>

          {isAdmin ? (
            <button
              onClick={() => setActiveTab('moderation')}
              className={`p-3 rounded-2xl border transition-all text-left group col-span-2 sm:col-span-4 lg:col-span-1 ${
                activeTab === 'moderation'
                  ? 'bg-[#a33e07] text-white border-[#a33e07] shadow-sm'
                  : 'bg-[#FFF0E6] text-[#a33e07] border-[#FFD0B3] hover:bg-[#FFE6D5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">Kiểm duyệt</span>
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-[11px] font-semibold opacity-90 truncate">Phê duyệt công thức</div>
            </button>
          ) : (
            <div className="bg-[#FFF8F0] p-3 rounded-2xl border border-[#EAE0D5] hidden lg:block">
              <div className="text-lg font-black text-[#a33e07]">5.0 ★</div>
              <div className="text-[11px] font-semibold text-[#8C7D6F]">Đánh giá uy tín</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#EAE0D5] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('posted')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'posted'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Grid className="w-4 h-4" />
          Công thức đã đăng ({postedRecipes.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'saved'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Món đã lưu ({savedRecipes.length})
        </button>

        <button
          onClick={() => setActiveTab('cart')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'cart'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Giỏ hàng ({totalItems})
          {totalItems > 0 && (
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              activeTab === 'cart' ? 'bg-white text-[#a33e07]' : 'bg-[#a33e07] text-white'
            }`}>
              {totalItems}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'orders'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Package className="w-4 h-4" />
          Đơn mua ({orders.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeTab === 'moderation'
                ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
                : 'bg-[#FFF0E6] text-[#a33e07] border border-[#FFD0B3] hover:bg-[#FFE6D5]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Kiểm duyệt công thức
            <span className="px-1.5 py-0.2 rounded-md bg-[#a33e07] text-white text-[9px] font-bold">
              Admin
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'badges'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Award className="w-4 h-4" />
          Huy hiệu & Danh hiệu
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Tab: Posted Recipes */}
        {activeTab === 'posted' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Recipe Card */}
              <div
                onClick={onNavigateToSubmit}
                className="bg-white rounded-2xl border-2 border-dashed border-[#D1C2B4] hover:border-[#a33e07] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#FFF8F0] min-h-[260px] group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#2B2118]">Đăng công thức mới</h3>
                <p className="text-xs text-[#8C7D6F] mt-1 max-w-[200px]">
                  Chia sẻ bí quyết nấu ăn cùng cộng đồng Ăn Gì Hôm Nay
                </p>
              </div>

              {postedRecipes.map((recipe) => (
                <div key={recipe.id} className="relative group/recipe-card">
                  <RecipeCard
                    recipe={{ ...recipe, isSaved: savedRecipeIds.includes(recipe.id) }}
                    onSelect={onSelectRecipe}
                    onToggleFavorite={onToggleFavorite}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecipeToChangeImage(recipe);
                    }}
                    className="absolute top-2.5 right-12 z-20 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[#a33e07] shadow-md border border-[#EAE0D5] hover:scale-105 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Thay đổi ảnh món ăn từ máy tính"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Đổi ảnh</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Saved Recipes */}
        {activeTab === 'saved' && (
          <div>
            {savedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE0D5] space-y-3">
                <Bookmark className="w-10 h-10 text-[#8C7D6F] mx-auto stroke-1" />
                <h3 className="font-bold text-[#2B2118]">Bạn chưa lưu công thức nào</h3>
                <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
                  Hãy bấm vào icon trái tim trên các món ăn ở trang chủ để lưu vào sổ tay ẩm thực cá nhân!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={{ ...recipe, isSaved: true }}
                    onSelect={onSelectRecipe}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Cart (Integrated Shopping Cart into Account Center) */}
        {activeTab === 'cart' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE0D5] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2B2118]">Giỏ hàng của bạn đang trống</h3>
                  <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto mt-1">
                    Hãy khám phá nồi đất kho quẹt, chảo gang đúc, gói gia vị chuẩn vị và dụng cụ nhà bếp cao cấp tại Cửa hàng.
                  </p>
                </div>
                {onNavigateToShop && (
                  <button
                    onClick={onNavigateToShop}
                    className="px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 transition-all inline-flex items-center gap-2"
                  >
                    <Store className="w-4 h-4" />
                    Khám phá Cửa hàng bếp
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left: Cart Items List */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F7F2EE]">
                    <span className="text-xs font-bold text-[#6B5D4F]">
                      Danh sách sản phẩm ({totalItems})
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa tất cả
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={`${item.productId}-${item.selectedOption || ''}`}
                        className="bg-white rounded-2xl border border-[#EAE0D5] p-4 flex items-center gap-4 hover:border-[#D1C2B4] transition-all shadow-2xs"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-[#FAF5F0] border border-[#EAE0D5] shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#2B2118] truncate">
                            {item.product.name}
                          </h4>
                          {item.selectedOption && (
                            <p className="text-[11px] text-[#8C7D6F] mt-0.5">
                              Phân loại: <span className="font-semibold text-[#524436]">{item.selectedOption}</span>
                            </p>
                          )}
                          <div className="text-xs font-bold text-[#a33e07] mt-1">
                            {item.product.priceMax && item.product.priceMax > item.product.price
                              ? `${item.product.price.toLocaleString('vi-VN')}₫ - ${item.product.priceMax.toLocaleString('vi-VN')}₫`
                              : `${item.product.price.toLocaleString('vi-VN')}₫`}
                            <span className="text-[10px] text-[#8C7D6F] font-normal ml-1.5">
                              (trên {item.product.platformName || 'sàn'})
                            </span>
                          </div>
                        </div>

                        {/* Quantity and Subtotal */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                          <div className="flex items-center border border-[#EAE0D5] rounded-xl overflow-hidden bg-[#FAF5F0]">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedOption)}
                              className="p-1.5 hover:bg-[#EAE0D5] text-[#6B5D4F] transition-colors"
                              title="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#2B2118]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedOption)}
                              className="p-1.5 hover:bg-[#EAE0D5] text-[#6B5D4F] transition-colors"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <div className="text-xs font-bold text-[#2B2118]">
                              {item.product.priceMax && item.product.priceMax > item.product.price
                                ? `${(item.product.price * item.quantity).toLocaleString('vi-VN')}₫ - ${(item.product.priceMax * item.quantity).toLocaleString('vi-VN')}₫`
                                : `${(item.product.price * item.quantity).toLocaleString('vi-VN')}₫`}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId, item.selectedOption)}
                              className="text-[11px] text-red-500 hover:text-red-700 hover:underline mt-0.5"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {onNavigateToShop && (
                    <div className="pt-2 flex justify-start">
                      <button
                        onClick={onNavigateToShop}
                        className="text-xs font-bold text-[#a33e07] hover:underline inline-flex items-center gap-1.5"
                      >
                        <Store className="w-4 h-4" />
                        Tiếp tục chọn thêm dụng cụ tại Cửa hàng
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Summary & Checkout Box */}
                <div className="space-y-4">
                  {/* Summary & Checkout Card */}
                  <div className="bg-white rounded-2xl border border-[#EAE0D5] p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-[#2B2118]">Tóm tắt đơn hàng</h4>

                    <div className="space-y-2 text-xs pb-3 border-b border-[#F7F2EE]">
                      <div className="flex justify-between text-[#6B5D4F]">
                        <span>Tạm tính ({totalItems} món):</span>
                        <span className="font-semibold text-[#2B2118]">{subtotal.toLocaleString('vi-VN')}₫</span>
                      </div>

                      <div className="flex justify-between text-[#6B5D4F]">
                        <span>Hình thức đặt mua:</span>
                        <span className="font-semibold text-emerald-700">Link Affiliate sàn TMĐT</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-[#2B2118]">Tổng giá trị trên sàn:</span>
                      <span className="text-lg text-[#a33e07] font-black">{subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>

                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#d65209] hover:from-[#8c3405] hover:to-[#be4206] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#a33e07]/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <span>Tiến hành thanh toán</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="pt-2 text-[11px] text-[#8C7D6F] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Hỗ trợ thanh toán VietQR, MoMo & COD tận nhà</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Kiểm tra hàng trước khi nhận & thanh toán</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE0D5] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8 opacity-70" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2B2118]">Bạn chưa có đơn đặt hàng nào</h3>
                  <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto mt-1">
                    Khám phá dụng cụ nấu ăn, nồi đất, chảo gang đúc và các gói gia vị chuẩn vị tại Cửa hàng bếp.
                  </p>
                </div>
                {onNavigateToShop && (
                  <button
                    onClick={onNavigateToShop}
                    className="px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 transition-all inline-flex items-center gap-1.5"
                  >
                    <Store className="w-4 h-4" />
                    Đến Cửa hàng bếp
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#EAE0D5] p-5 space-y-4 shadow-xs"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F7F2EE]">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#a33e07]" />
                        <span className="font-mono font-bold text-xs text-[#2B2118]">
                          Đơn #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-[#8C7D6F]">
                          • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          order.orderStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'shipping'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus === 'completed' ? 'Đã giao hàng' : order.orderStatus === 'shipping' ? 'Đang vận chuyển' : 'Đang xử lý đóng gói'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div key={`${item.productId}-${item.selectedOption || ''}`} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-[#FAF5F0] border border-[#EAE0D5] shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#2B2118] truncate max-w-xs">{item.productName}</h4>
                              <p className="text-[11px] text-[#8C7D6F]">
                                {item.selectedOption ? `Phân loại: ${item.selectedOption} | ` : ''}SL: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[#2B2118] shrink-0">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="pt-3 border-t border-[#F7F2EE] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-[11px] text-[#6B5D4F]">
                        <span>Người nhận: <strong>{order.customerInfo.fullName}</strong> ({order.customerInfo.phone}) • {order.customerInfo.address}, {order.customerInfo.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8C7D6F]">Tổng thanh toán:</span>
                        <span className="font-black text-sm text-[#a33e07]">
                          {order.total.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Badges & Achievements */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE0D5] flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                  <span>Bếp Trưởng Tiên Phong</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">Đã đạt</span>
                </div>
                <p className="text-[11px] text-[#6B5D4F]">Thành viên sáng lập & đóng góp những công thức chuẩn vị truyền thống đầu tiên.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE0D5] flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#a33e07] to-[#e8703a] text-white flex items-center justify-center shadow-md shrink-0">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                  <span>Đầu Bếp Được Yêu Thích</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">5.0 ★</span>
                </div>
                <p className="text-[11px] text-[#6B5D4F]">Đạt đánh giá trung bình 5 sao từ người nấu trong cộng đồng ẩm thực.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE0D5] flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                  <span>Chuyên Gia Ẩm Thực Việt</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">Đã mở khóa</span>
                </div>
                <p className="text-[11px] text-[#6B5D4F]">Thành thạo các món kho, món canh và đặc sản 3 miền Bắc - Trung - Nam.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE0D5] flex items-start gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                  <span>Khách Hàng Thân Thiết Bếp</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-full">VIP Member</span>
                </div>
                <p className="text-[11px] text-[#6B5D4F]">Được hưởng chính sách miễn phí vận chuyển đơn từ 299k và quà tặng gia vị.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Moderation & Admin Panel (Integrated directly into Customer/Chef Profile) */}
        {activeTab === 'moderation' && isAdmin && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-[#FFF0E6] to-[#FFF8F0] rounded-2xl p-4 border border-[#FFE0CC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#a33e07] text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B2118]">Trung tâm Kiểm duyệt & Quản trị Bếp</h3>
                  <p className="text-xs text-[#6B5D4F]">
                    Phê duyệt bài đăng thành viên, kiểm tra an toàn dinh dưỡng AI và quản lý danh mục món ăn.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('posted')}
                className="px-3 py-1.5 rounded-xl border border-[#EAE0D5] bg-white hover:bg-[#F7F2EE] text-xs font-bold text-[#6B5D4F] transition-all"
              >
                Quay lại hồ sơ
              </button>
            </div>

            <AdminScreen
              onRecipeApproved={(newRec) => {
                if (onRecipeApproved) onRecipeApproved(newRec);
                showToast(`Đã duyệt và xuất bản món "${newRec.title}" thành công!`, 'success');
              }}
              onSelectRecipe={onSelectRecipe}
              onBackToHome={() => setActiveTab('posted')}
            />
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#EAE0D5] shadow-2xl space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7F2EE]">
              <h3 className="text-base font-bold text-[#2B2118] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#a33e07]" />
                Chỉnh sửa Hồ sơ & Địa chỉ giao hàng
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F2EE] hover:bg-[#EAE0D5] text-[#6B5D4F] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Picker */}
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-2">Chọn ảnh đại diện</label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                  {/* Upload Avatar from Device */}
                  <label className="w-12 h-12 rounded-full border-2 border-dashed border-[#a33e07] hover:bg-[#FFF0E6] flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all text-[#a33e07]" title="Tải ảnh đại diện từ máy tính">
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] font-bold mt-0.5">Từ máy</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,image/heic"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await optimizeImageFile(file, { maxDimension: 400, quality: 0.85 });
                            setEditAvatar(res.dataUrl);
                            showToast('Đã tải ảnh đại diện từ máy tính! Nhớ bấm Lưu thay đổi.', 'success');
                          } catch (err: any) {
                            showToast(err.message || 'Lỗi xử lý ảnh đại diện', 'error');
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Custom uploaded avatar preview if not in presets */}
                  {editAvatar && !AVATAR_OPTIONS.includes(editAvatar) && (
                    <div className="relative shrink-0">
                      <img
                        src={editAvatar}
                        alt="Ảnh đại diện tùy chỉnh"
                        className="w-12 h-12 rounded-full object-cover ring-3 ring-[#a33e07] scale-105 shadow-md"
                      />
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  )}

                  {AVATAR_OPTIONS.map((imgUrl) => (
                    <img
                      key={imgUrl}
                      src={imgUrl}
                      alt="Tùy chọn ảnh đại diện"
                      onClick={() => setEditAvatar(imgUrl)}
                      className={`w-12 h-12 rounded-full object-cover cursor-pointer transition-all shrink-0 ${
                        editAvatar === imgUrl
                          ? 'ring-3 ring-[#a33e07] scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100 border border-[#EAE0D5]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1">Tên hiển thị / Danh xưng</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1">Tiểu sử ẩm thực</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                />
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#2B2118] block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#2B2118] block mb-1">Tỉnh / Thành phố</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1">Địa chỉ nhận hàng mặc định</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                />
              </div>

              {/* Cooking Styles */}
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1.5">Sở thích nấu nướng</label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleCookingStyle(style)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        editStyles.includes(style)
                          ? 'bg-[#a33e07] text-white shadow-2xs'
                          : 'bg-[#FFF8F0] text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#FFF0E6]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F7F2EE]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Thay Đổi Ảnh Món Ăn Cho Thành Viên */}
      <ChangeDishImageModal
        isOpen={!!recipeToChangeImage}
        onClose={() => setRecipeToChangeImage(null)}
        recipe={recipeToChangeImage}
        onImageUpdated={(newUrl, updated) => {
          if (recipeToChangeImage) {
            recipeToChangeImage.image = newUrl;
          }
          window.dispatchEvent(new Event('profileUpdated'));
        }}
      />
    </div>
  );
};
