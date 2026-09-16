export interface Ingredient {
  name: string;
  amount: string;
}

export interface InstructionStep {
  step: number;
  title?: string;
  description: string;
  image?: string;
}

export interface NutritionInfo {
  calories: number; // in kcal
  protein: number; // in grams
  fat: number; // in grams
  carbs: number; // in grams
}

export interface CommentItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface RecipeReview {
  id: string;
  recipe_id: string;
  author_uid: string;
  author_name: string;
  author_avatar?: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at?: string;
  edited?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string; // e.g. "45'" or "45 Phút"
  cookTime?: string;
  servings: string; // e.g. "4 Người"
  difficulty: 'Dễ' | 'Rất dễ' | 'Trung bình' | 'Khó';
  calories: number; // kcal
  nutrition?: NutritionInfo;
  categories: string[]; // e.g. ['man', 'mien-bac', 'quick']
  ingredients: Ingredient[];
  spiceIngredients?: Ingredient[];
  steps: InstructionStep[];
  rating: number;
  reviewCount: number;
  average_rating?: number;
  review_count?: number;
  author: {
    uid?: string;
    name: string;
    avatar?: string;
    badge?: string;
  };
  author_uid?: string;
  author_name?: string;
  author_avatar?: string;
  isSaved?: boolean;
  isCustom?: boolean;
  posted_by_admin?: boolean;
  admin_email?: string;
  approved_at?: string;
  approved_by?: string;
  createdAt: string;
}

export interface PendingRecipe extends Recipe {
  status: 'pending' | 'rejected' | 'approved';
  isValid: boolean;
  needsManualReview: boolean;
  aiReviewReason?: string;
  aiConfidenceScore?: number;
  aiSuggestedTags?: string[];
  submittedAt: string;
  isDuplicate?: boolean;
  duplicateDishName?: string;
  duplicateSimilarity?: number;
  duplicateExplanation?: string;
}

export interface RejectedRecipe {
  id: string;
  title: string;
  rejectReason: string;
  rejectedBy: string;
  rejectedAt: string;
  recipeData: PendingRecipe | Recipe;
  submittedAt?: string;
}

export interface ArchivedRecipe extends Recipe {
  archivedAt: string;
  archivedBy: string;
  archiveReason?: string;
}

export interface AdminUser {
  email: string;
  role: string;
  createdAt: string;
  displayName?: string;
}

export interface AdminDashboardStats {
  pendingCount: number;
  recipesCount: number;
  totalUsersCount: number;
  rejectedLast7DaysCount: number;
}

export interface SuggestedRecipeMatch {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
}

export interface AiReviewResponse {
  is_valid: boolean;
  needs_manual_review: boolean;
  review_reason?: string;
  is_duplicate?: boolean;
  duplicate_dish_name?: string;
  duplicate_similarity?: number;
  duplicate_explanation?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  difficulty: 'Dễ' | 'Rất dễ' | 'Trung bình' | 'Khó';
  prep_time: string;
  servings: string;
  suggested_tags: string[];
  improvement_tips?: string;
}

export interface UserProfile {
  uid: string;
  display_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  badge: string[];
  saved_recipes: string[];
  bio?: string;
  recipes_count?: number;
  phone?: string;
  address?: string;
  city?: string;
  chef_title?: string;
  experience_points?: number;
  level?: number;
  cooking_style?: string[];
  member_tier?: 'Thành viên mới' | 'Bếp Trưởng Thân Thiết' | 'Chuyên Gia Ẩm Thực' | 'Quản Trị Viên VIP';
}

export type PendingUserAction = 
  | { type: 'save_recipe'; recipeId: string; recipeTitle?: string }
  | { type: 'navigate_submit' }
  | { type: 'navigate_profile' }
  | { type: 'navigate_shop' }
  | { type: 'comment_recipe'; recipeId: string };

// ================= E-COMMERCE / KITCHEN STORE & CART =================
export type ProductCategory = 
  | 'all'
  | 'tools'          // Dụng cụ làm bếp (dao, thớt, chảo, nồi, phới, muôi...)
  | 'appliances'     // Thiết bị nhà bếp (nồi chiên, nồi áp suất, máy xay, bếp từ...)
  | 'spices'         // Gia vị & Nguyên liệu chuẩn vị (nước mắm truyền thống, hạt dổi, mắc khén, hồi quế...)
  | 'meal_kits'      // Combo & Set nguyên liệu nấu sẵn
  | 'tableware';     // Bát đĩa gốm sứ & Dụng cụ bàn ăn

export interface ProductItem {
  id: string;
  name: string;
  productCode?: string; // Mã sản phẩm (SKU)
  affiliateUrl?: string; // Link tiếp thị liên kết dẫn sang sàn TMĐT
  platform?: 'shopee' | 'lazada' | 'tiki' | 'tiktok' | 'sendo' | 'other'; // Sàn TMĐT
  platformName?: string; // Tên hiển thị sàn (Shopee, Lazada, Tiki, TikTok Shop...)
  category: 'tools' | 'appliances' | 'spices' | 'meal_kits' | 'tableware';
  price: number; // in VND (Giá niêm yết trên sàn hoặc mức giá bắt đầu nếu có khoảng giá)
  priceMax?: number; // in VND (Mức giá trần nếu có khoảng giá / nhiều phân loại trên sàn)
  originalPrice?: number; // for comparison
  discountPercent?: number;
  image: string; // Ảnh đại diện chính
  images?: string[]; // Danh sách các ảnh sản phẩm
  gallery?: string[]; // Ảnh bổ sung / gallery
  rating: number; // 1-5
  reviewCount: number;
  salesCount: number;
  badge?: string; // 'Bán chạy', 'Khuyên dùng', 'Chính hãng', 'Ưu đãi sàn'
  brand: string;
  origin?: string; // e.g. 'Việt Nam', 'Nhật Bản', 'Đức'
  inStock: boolean;
  stockCount: number;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>; // e.g. { 'Chất liệu': 'Inox 304', 'Dung tích': '3.5L' }
  features: string[];
  options?: string[]; // e.g. ['Size 24cm', 'Size 28cm'] or ['Màu Gỗ Tự Nhiên', 'Màu Óc Chó']
  relatedRecipeIds?: string[]; // Recommended for these recipes
  relatedTags?: string[]; // e.g. ['kho', 'canh', 'nuong', 'pho']
}

export interface CartItem {
  productId: string;
  product: ProductItem;
  quantity: number;
  selectedOption?: string;
}

export interface CouponDiscount {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 30000 for 30k VND
  minOrderValue: number;
  maxDiscount?: number;
}

export interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  district?: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerInfo: OrderCustomerInfo;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    selectedOption?: string;
  }[];
  subtotal: number;
  discountAmount: number;
  appliedCoupon?: string;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'vietqr' | 'momo';
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
}

