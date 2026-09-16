import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Heart, Share2, Clock, Users, Flame, ChefHat, 
  Check, CheckSquare, Square, Play, Sparkles, MessageCircle, 
  Star, Send, X, ChevronRight, ChevronLeft, Volume2, Timer, LogIn, User as UserIcon,
  Loader2, Camera
} from 'lucide-react';
import { Recipe, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { submitRecipeReview, fetchRecipeReviews } from '../lib/firebase';
import { RecipeShopRecommendations } from './RecipeShopRecommendations';
import { OptimizedImage } from './OptimizedImage';
import { ChangeDishImageModal } from './ChangeDishImageModal';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigateToShop?: () => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  onBack,
  onToggleFavorite,
  onNavigateToShop
}) => {
  const { user, profile, savedRecipeIds, toggleFavorite, openAuthModal, showToast } = useAuth();

  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isCookMode, setIsCookMode] = useState(false);
  const [currentCookStep, setCurrentCookStep] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [currentRating, setCurrentRating] = useState<number>(Number(recipe.rating) || 5.0);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(Number(recipe.reviewCount) || 0);
  const [activeImage, setActiveImage] = useState<string>(recipe.image);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);

  useEffect(() => {
    setActiveImage(recipe.image);
  }, [recipe.image]);

  const isSaved = savedRecipeIds.includes(recipe.id) || recipe.isSaved;

  // Helper to format review time
  const formatReviewTime = (dateStr?: string) => {
    if (!dateStr) return 'Vừa xong';
    if (dateStr.includes('trước') || dateStr.includes('ngày') || dateStr.includes('giờ') || dateStr.includes('phút') || dateStr === 'Vừa xong' || dateStr === 'Gần đây') {
      return dateStr;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Fetch comments and reviews for recipe
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const { reviews, stats } = await fetchRecipeReviews(recipe.id);
        if (!isMounted) return;

        if (reviews && reviews.length > 0) {
          const normalized: CommentItem[] = reviews.map((r: any) => ({
            id: r.id,
            userName: r.author_name || r.userName || 'Thành viên Ăn Gì',
            userAvatar: r.author_avatar || r.userAvatar,
            rating: Number(r.rating) || 5,
            content: r.comment || r.content || '',
            createdAt: r.created_at || r.createdAt || 'Gần đây',
            author_uid: r.author_uid,
            edited: r.edited
          } as any));
          setComments(normalized);
        } else {
          // Fallback to /api/recipes/${recipe.id}
          const res = await fetch(`/api/recipes/${recipe.id}`);
          const data = await res.json();
          if (isMounted && data.success) {
            if (Array.isArray(data.comments) && data.comments.length > 0) {
              setComments(data.comments);
            }
          }
        }

        if (stats && isMounted) {
          if (typeof stats.average_rating === 'number' && stats.average_rating > 0) {
            setCurrentRating(stats.average_rating);
          }
          if (typeof stats.review_count === 'number') {
            setCurrentReviewCount(stats.review_count);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhận xét:', err);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [recipe.id]);

  // Timer countdown in Cook Mode
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepCheck = (idx: number) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const shareUrl = new URL(window.location.origin + window.location.pathname);
      shareUrl.searchParams.set('recipeId', recipe.id);
      navigator.clipboard.writeText(shareUrl.toString());
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id, recipe.title);
    onToggleFavorite(recipe.id, e);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra trạng thái đăng nhập
    if (!user) {
      showToast('Vui lòng đăng nhập để gửi nhận xét và đánh giá cho món ăn này.', 'info');
      openAuthModal({
        reason: 'Đăng nhập để gửi bình luận và đánh giá công thức này.',
        mode: 'login'
      });
      return;
    }

    // 2. Kiểm tra nội dung đánh giá trống
    const trimmed = newComment.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập nội dung nhận xét của bạn.', 'error');
      return;
    }

    // 3. Kiểm tra độ dài nội dung
    if (trimmed.length > 500) {
      showToast('Nội dung đánh giá không được vượt quá 500 ký tự.', 'error');
      return;
    }

    // 4. Kiểm tra rating
    if (ratingInput < 1 || ratingInput > 5) {
      showToast('Vui lòng chọn số sao đánh giá từ 1 đến 5.', 'error');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const authorName = profile?.display_name || user.displayName || user.email?.split('@')[0] || 'Thành viên Ăn Gì';
      const authorAvatar = profile?.avatar_url || user.photoURL || undefined;

      const result = await submitRecipeReview(
        recipe.id,
        ratingInput,
        trimmed,
        user,
        profile
      );

      if (result.success && (result.review || (result as any).data)) {
        const rev = result.review || (result as any).data;
        const normalizedItem: CommentItem = {
          id: rev.id || `rev_${user.uid}`,
          userName: rev.author_name || authorName,
          userAvatar: rev.author_avatar || authorAvatar,
          rating: Number(rev.rating) || ratingInput,
          content: rev.comment || trimmed,
          createdAt: 'Vừa xong'
        };

        // Cập nhật danh sách bình luận ngay lập tức trên giao diện
        setComments(prev => {
          const filtered = prev.filter(c => c.id !== normalizedItem.id && (c as any).author_uid !== user.uid);
          return [normalizedItem, ...filtered];
        });

        // Cập nhật số sao và lượt đánh giá hiển thị
        if (result.stats) {
          if (typeof result.stats.average_rating === 'number' && result.stats.average_rating > 0) {
            setCurrentRating(result.stats.average_rating);
          }
          if (typeof result.stats.review_count === 'number') {
            setCurrentReviewCount(result.stats.review_count);
          }
        } else {
          setCurrentReviewCount(prev => prev + 1);
        }

        setNewComment('');
        showToast('Gửi đánh giá thành công! Cảm ơn bạn đã chia sẻ.', 'success');
      } else {
        showToast(result.error || 'Không thể gửi đánh giá. Vui lòng thử lại.', 'error');
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi đánh giá:', err);
      showToast(err.message || 'Lỗi khi gửi đánh giá.', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Nutrition percentages estimation (based on standard daily value 2000 kcal)
  const nutrition = recipe.nutrition || {
    protein: Math.round(recipe.calories * 0.05),
    fat: Math.round(recipe.calories * 0.03),
    carbs: Math.round(recipe.calories * 0.08),
    calories: recipe.calories
  };

  const authorDisplayName = recipe.author_name || recipe.author?.name || 'Đầu bếp cộng đồng';
  const authorAvatarUrl = recipe.author_avatar || recipe.author?.avatar;
  const authorBadge = recipe.author?.badge || 'Tác giả công thức';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Floating Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE0D5] text-xs font-bold text-[#6B5D4F] hover:text-[#a33e07] hover:border-[#a33e07] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangeImageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE0D5] text-xs font-bold text-[#a33e07] hover:bg-[#FFF0E6] hover:border-[#a33e07] transition-all shadow-xs cursor-pointer"
            title="Đổi ảnh món ăn từ thư viện máy"
          >
            <Camera className="w-4 h-4" />
            <span>Thay đổi ảnh</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE0D5] text-xs font-bold text-[#6B5D4F] hover:bg-[#F7F2EE] transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            {copyFeedback ? 'Đã sao chép link!' : 'Chia sẻ'}
          </button>

          <button
            onClick={handleHeartClick}
            className={`p-2 rounded-xl border transition-all shadow-xs ${
              isSaved
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-[#6B5D4F] border-[#EAE0D5] hover:border-red-300'
            }`}
            title={isSaved ? 'Đã lưu' : 'Lưu công thức'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Image Section with Overlay */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-[#2B2118] shadow-lg border border-[#EAE0D5]">
        <OptimizedImage
          src={activeImage}
          alt={recipe.title}
          aspectRatio="auto"
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
          allowZoom
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

        {/* Overlay Title & Badges */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white"
              >
                {cat}
              </span>
            ))}
          </div>

          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            {recipe.title}
          </h1>

          <div className="flex items-center gap-2.5 text-xs text-white/90">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={authorDisplayName}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <ChefHat className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Tác giả: <strong>{authorDisplayName}</strong></span>
              <span className="text-[10px] text-amber-300">({authorBadge})</span>
            </div>

            <div className="flex items-center gap-1 text-amber-300 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{currentRating > 0 ? currentRating.toFixed(1) : '5.0'} ({currentReviewCount} đánh giá)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Gallery Strip if available */}
      {recipe.gallery && recipe.gallery.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#6B5D4F]">Góc chụp khác của món ăn:</span>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveImage(recipe.image)}
              className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                activeImage === recipe.image ? 'border-[#a33e07] scale-105 shadow-md ring-2 ring-orange-200' : 'border-[#EAE0D5] opacity-75 hover:opacity-100'
              }`}
            >
              <img src={recipe.image} alt="Ảnh chính" className="w-full h-full object-cover" />
            </button>
            {recipe.gallery.map((gUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(gUrl)}
                className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeImage === gUrl ? 'border-[#a33e07] scale-105 shadow-md ring-2 ring-orange-200' : 'border-[#EAE0D5] opacity-75 hover:opacity-100'
                }`}
              >
                <img src={gUrl} alt={`Ảnh góc ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-[#EAE0D5] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8C7D6F] font-semibold">Thời gian</div>
            <div className="text-sm font-bold text-[#2B2118]">{recipe.prepTime}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#EAE0D5] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8C7D6F] font-semibold">Khẩu phần</div>
            <div className="text-sm font-bold text-[#2B2118]">{recipe.servings}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#EAE0D5] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8C7D6F] font-semibold">Độ khó</div>
            <div className="text-sm font-bold text-[#2B2118]">{recipe.difficulty}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#EAE0D5] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-[11px] text-[#8C7D6F] font-semibold">Năng lượng</div>
            <div className="text-sm font-bold text-[#2B2118]">{recipe.calories} kcal</div>
          </div>
        </div>
      </div>

      {/* Nutrition Breakdown Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#2B2118] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#a33e07]" />
            Dinh dưỡng ước tính (Mỗi khẩu phần)
          </h2>
          <span className="text-[11px] text-[#8C7D6F] font-medium">Tính toán bởi AI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Protein */}
          <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#EAE0D5] space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#2B2118]">
              <span>Chất đạm (Protein)</span>
              <span className="text-[#a33e07]">{nutrition.protein}g</span>
            </div>
            <div className="w-full h-2 bg-[#EAE0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a33e07] rounded-full"
                style={{ width: `${Math.min(100, (nutrition.protein / 50) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#EAE0D5] space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#2B2118]">
              <span>Chất béo (Fat)</span>
              <span className="text-amber-700">{nutrition.fat}g</span>
            </div>
            <div className="w-full h-2 bg-[#EAE0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (nutrition.fat / 40) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#EAE0D5] space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#2B2118]">
              <span>Tinh bột (Carbs)</span>
              <span className="text-emerald-700">{nutrition.carbs}g</span>
            </div>
            <div className="w-full h-2 bg-[#EAE0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (nutrition.carbs / 80) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Checklist */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2B2118]">Nguyên liệu cần chuẩn bị</h2>
            <p className="text-xs text-[#6B5D4F]">Tích chọn nguyên liệu bạn đã có sẵn</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#FFF0E6] text-[#a33e07]">
            {Object.values(checkedIngredients).filter(Boolean).length} / {recipe.ingredients.length} món đã có
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {recipe.ingredients.map((ing, idx) => {
            const isChecked = !!checkedIngredients[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleIngredientCheck(idx)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-[#F7F2EE] border-[#D1C2B4] text-[#8C7D6F] line-through'
                    : 'bg-white border-[#EAE0D5] hover:border-[#a33e07]/40 text-[#2B2118]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C7D6F] shrink-0" />
                  )}
                  <span className="text-xs font-semibold">{ing.name}</span>
                </div>
                <span className="text-xs font-bold text-[#a33e07] shrink-0">{ing.amount}</span>
              </div>
            );
          })}
        </div>

        {/* Spices / Seasoning if available */}
        {recipe.spiceIngredients && recipe.spiceIngredients.length > 0 && (
          <div className="pt-3 border-t border-[#F7F2EE] space-y-2">
            <h3 className="text-xs font-bold text-[#6B5D4F]">Gia vị nêm nếm:</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.spiceIngredients.map((sp, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-[#FFF8F0] border border-[#EAE0D5] text-[#524436]">
                  {sp.name} ({sp.amount})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step by Step Cooking Instructions */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2B2118]">Các bước thực hiện</h2>
            <p className="text-xs text-[#6B5D4F]">Làm theo trình tự các bước để món ăn ngon chuẩn vị</p>
          </div>

          <button
            onClick={() => {
              setCurrentCookStep(0);
              setIsCookMode(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 flex items-center gap-1.5 hover:opacity-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Bắt đầu nấu (Cook Mode)
          </button>
        </div>

        <div className="space-y-4">
          {recipe.steps.map((st, idx) => {
            const isCompleted = !!checkedSteps[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#F7F2EE] border-[#D1C2B4] opacity-75'
                    : 'bg-white border-[#EAE0D5]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#FFF0E6] text-[#a33e07] font-bold text-xs flex items-center justify-center shrink-0">
                      {st.step || idx + 1}
                    </div>
                    <div>
                      {st.title && (
                        <h3 className="text-sm font-bold text-[#2B2118]">{st.title}</h3>
                      )}
                      <p className="text-xs text-[#524436] mt-1 leading-relaxed whitespace-pre-line">
                        {st.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStepCheck(idx)}
                    className="p-1 text-[#8C7D6F] hover:text-emerald-600 transition-colors shrink-0"
                    title={isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {st.image && (
                  <div className="mt-3 rounded-xl overflow-hidden aspect-[16/9] max-h-56 bg-[#F7F2EE]">
                    <OptimizedImage
                      src={st.image}
                      alt={`Bước ${idx + 1}: ${st.description ? st.description.substring(0, 50) : 'Thực hiện'}`}
                      aspectRatio="16/9"
                      className="w-full h-full object-cover"
                      allowZoom
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Kitchenware & Spices */}
      <RecipeShopRecommendations
        recipe={recipe}
        onNavigateToShop={onNavigateToShop}
      />

      {/* Community Reviews & Comments */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#a33e07]" />
            <h2 className="text-base font-bold text-[#2B2118]">
              Bình luận & Đánh giá ({comments.length})
            </h2>
          </div>
          {currentReviewCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B5D4F] bg-[#FFF8F0] px-3 py-1 rounded-full border border-[#EAE0D5]">
              <span className="font-bold text-[#a33e07]">{currentRating > 0 ? currentRating.toFixed(1) : '5.0'}</span>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.round(currentRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-[11px] text-[#8C7D6F]">({currentReviewCount} lượt)</span>
            </div>
          )}
        </div>

        {/* Comment input form */}
        <form onSubmit={handleSubmitComment} className="bg-[#FFF8F0] p-4 rounded-xl border border-[#EAE0D5] space-y-3">
          {/* User state indicator */}
          {!user ? (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <div className="flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-[#a33e07] shrink-0" />
                <span>Bạn cần đăng nhập để gửi đánh giá và nhận xét món ăn này.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal({
                  reason: 'Đăng nhập để gửi bình luận và đánh giá công thức này.',
                  mode: 'login'
                })}
                className="px-3 py-1 bg-[#a33e07] text-white rounded-lg font-semibold hover:bg-[#8c3405] transition-colors shrink-0"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-[#6B5D4F] pb-1 border-b border-[#EAE0D5]/60">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#a33e07] text-white text-[10px] font-bold flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url || user.photoURL ? (
                    <img 
                      src={profile?.avatar_url || user.photoURL || ''} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    (profile?.display_name || user.displayName || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <span>
                  Đang đánh giá với tên: <strong className="text-[#2B2118]">{profile?.display_name || user.displayName || user.email?.split('@')[0]}</strong>
                </span>
              </div>
              <span className="text-[11px] text-[#8C7D6F]">{newComment.length}/500</span>
            </div>
          )}

          {/* Star selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2B2118]">Mức độ hài lòng:</span>
              <span className="text-xs font-semibold text-[#a33e07]">
                {ratingInput === 5 && '5 sao - Tuyệt vời'}
                {ratingInput === 4 && '4 sao - Rất ngon'}
                {ratingInput === 3 && '3 sao - Bình thường'}
                {ratingInput === 2 && '2 sao - Tạm được'}
                {ratingInput === 1 && '1 sao - Cần cải thiện'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingInput(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  title={`${star} sao`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={2}
              placeholder={user ? "Chia sẻ trải nghiệm nấu nướng, mẹo hay hoặc hương vị món này..." : "Vui lòng đăng nhập trước khi viết đánh giá..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              className="w-full text-xs bg-white p-2.5 rounded-xl border border-[#EAE0D5] focus:outline-[#a33e07] resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8C7D6F]">
                Đánh giá có ích giúp cộng đồng nấu ăn ngon hơn
              </span>
              <button
                type="submit"
                disabled={isSubmittingComment || (!user && !newComment.trim())}
                className="px-4 py-2 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-xs"
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi đánh giá</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="py-8 text-center bg-[#F7F2EE]/30 rounded-xl border border-dashed border-[#EAE0D5] space-y-2">
            <MessageCircle className="w-8 h-8 text-[#8C7D6F]/40 mx-auto" />
            <p className="text-xs text-[#6B5D4F] font-medium">Chưa có đánh giá nào cho món này.</p>
            <p className="text-[11px] text-[#8C7D6F]">Hãy là người đầu tiên nấu thử và chia sẻ cảm nhận nhé!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((cmt) => {
              const isOwn = user && (cmt as any).author_uid === user.uid;
              return (
                <div key={cmt.id} className="p-3.5 rounded-xl bg-[#F7F2EE]/50 border border-[#EAE0D5] space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#a33e07] text-white text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
                        {cmt.userAvatar ? (
                          <img src={cmt.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (cmt.userName || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2B2118]">{cmt.userName}</span>
                        {isOwn && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Của bạn
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < cmt.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                        />
                      ))}
                      <span className="text-[10px] text-[#8C7D6F] ml-1">
                        {formatReviewTime(cmt.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#524436] pl-9 whitespace-pre-line leading-relaxed">
                    {cmt.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL SCREEN INTERACTIVE COOK MODE MODAL */}
      {isCookMode && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between text-white p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Top Bar in Cook Mode */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#a33e07] flex items-center justify-center text-white font-bold text-xs">
                {currentCookStep + 1}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{recipe.title}</h2>
                <p className="text-[11px] text-white/60">
                  Bước {currentCookStep + 1} / {recipe.steps.length}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCookMode(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Main Focus Area */}
          <div className="max-w-2xl mx-auto w-full my-auto space-y-6 text-center">
            {recipe.steps[currentCookStep]?.image && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] max-h-64 mx-auto border border-white/20 shadow-2xl">
                <OptimizedImage
                  src={recipe.steps[currentCookStep].image}
                  alt={`Bước ${currentCookStep + 1}: ${recipe.steps[currentCookStep].description ? recipe.steps[currentCookStep].description.substring(0, 50) : 'Thực hiện'}`}
                  aspectRatio="16/9"
                  className="w-full h-full object-cover"
                  allowZoom
                />
              </div>
            )}

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-[#a33e07] text-white text-xs font-bold tracking-wide">
                {recipe.steps[currentCookStep]?.title || `Bước ${currentCookStep + 1}`}
              </span>

              <p className="text-base sm:text-xl font-medium text-white leading-relaxed max-w-xl mx-auto">
                {recipe.steps[currentCookStep]?.description}
              </p>
            </div>

            {/* Quick Cooking Timer */}
            <div className="bg-white/10 rounded-2xl p-4 max-w-xs mx-auto border border-white/15 flex items-center justify-around">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-400" />
                <span className="text-base font-mono font-bold">
                  {timerSeconds !== null
                    ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`
                    : 'Hẹn giờ'}
                </span>
              </div>

              {timerSeconds === null ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setTimerSeconds(180); setTimerActive(true); }}
                    className="px-2 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
                  >
                    3p
                  </button>
                  <button
                    onClick={() => { setTimerSeconds(300); setTimerActive(true); }}
                    className="px-2 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
                  >
                    5p
                  </button>
                  <button
                    onClick={() => { setTimerSeconds(600); setTimerActive(true); }}
                    className="px-2 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
                  >
                    10p
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setTimerActive(!timerActive); }}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold"
                >
                  {timerActive ? 'Tạm dừng' : 'Tiếp tục'}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Step Navigation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 max-w-2xl mx-auto w-full">
            <button
              onClick={() => setCurrentCookStep(prev => Math.max(0, prev - 1))}
              disabled={currentCookStep === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Bước trước
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {recipe.steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentCookStep
                      ? 'bg-[#e8703a] scale-125'
                      : i < currentCookStep
                      ? 'bg-emerald-500'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {currentCookStep < recipe.steps.length - 1 ? (
              <button
                onClick={() => setCurrentCookStep(prev => Math.min(recipe.steps.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-lg transition-all"
              >
                Bước tiếp
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsCookMode(false)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Hoàn thành món ăn!
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Thay Đổi Ảnh Món Ăn */}
      <ChangeDishImageModal
        isOpen={isChangeImageModalOpen}
        onClose={() => setIsChangeImageModalOpen(false)}
        recipe={recipe}
        onImageUpdated={(newUrl) => {
          setActiveImage(newUrl);
          recipe.image = newUrl;
        }}
      />
    </div>
  );
};
