import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_RECIPES, INITIAL_PENDING_RECIPES, COMMENTS_MAP } from './src/data/seedRecipes';
import { INITIAL_PRODUCTS } from './src/data/seedProducts';
import { 
  Recipe, 
  PendingRecipe, 
  RejectedRecipe, 
  ArchivedRecipe, 
  AdminUser, 
  SuggestedRecipeMatch, 
  AiReviewResponse,
  RecipeReview,
  ProductItem
} from './src/types';

// In-memory state synchronized with database models
let recipesStore: Recipe[] = [...INITIAL_RECIPES];
let pendingStore: PendingRecipe[] = [...INITIAL_PENDING_RECIPES];
let productsStore: ProductItem[] = [...INITIAL_PRODUCTS];
let rejectedStore: RejectedRecipe[] = [
  {
    id: 'rej-sample-1',
    title: 'Nước xà phòng tráng miệng',
    rejectReason: 'Không phải thực phẩm an toàn, chứa hóa chất tẩy rửa độc hại.',
    rejectedBy: 'datnhatquang@gmail.com',
    rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipeData: {
      id: 'rej-sample-1',
      title: 'Nước xà phòng tráng miệng',
      description: 'Công thức spam',
      image: '',
      prepTime: '5 Phút',
      servings: '1 Người',
      difficulty: 'Rất dễ',
      calories: 0,
      categories: ['Spam'],
      ingredients: [{ name: 'Xà phòng', amount: '100ml' }],
      steps: [{ step: 1, description: 'Trộn xà phòng' }],
      rating: 0,
      reviewCount: 0,
      author: { name: 'Người dùng ẩn danh' },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
];
let archivedStore: ArchivedRecipe[] = [];
let adminUsersStore: (AdminUser & { passwordHash?: string })[] = [
  {
    email: 'datnhatquang@gmail.com',
    role: 'admin',
    createdAt: '2026-08-01T00:00:00.000Z',
    displayName: 'Quản trị viên Đạt',
    passwordHash: 'Thanhdat1708@'
  }
];
let commentsStore: Record<string, any[]> = { ...COMMENTS_MAP };

// Initialize reviewsStore from initial comments map so seeded reviews are preserved
function createInitialReviewsStore(): Record<string, RecipeReview[]> {
  const map: Record<string, RecipeReview[]> = {};
  for (const [recipeId, cList] of Object.entries(COMMENTS_MAP)) {
    map[recipeId] = (cList || []).map((c: any, index: number) => ({
      id: c.id || `seed_rev_${recipeId}_${index}`,
      recipe_id: recipeId,
      author_uid: `seed_user_${index}`,
      author_name: c.userName || 'Thành viên Ăn Gì',
      author_avatar: c.userAvatar || undefined,
      rating: Number(c.rating) || 5,
      comment: c.content || c.comment || '',
      created_at: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      edited: false
    }));
  }
  return map;
}

let reviewsStore: Record<string, RecipeReview[]> = createInitialReviewsStore();
const reviewRateLimits = new Map<string, number>(); // key: `${uid}_${recipeId}` -> timestamp

function syncReviewsToComments(recipeId: string) {
  const revs = reviewsStore[recipeId] || [];
  commentsStore[recipeId] = revs.map((r: RecipeReview) => ({
    id: r.id,
    recipe_id: r.recipe_id,
    author_uid: r.author_uid,
    author_name: r.author_name,
    userName: r.author_name,
    author_avatar: r.author_avatar,
    userAvatar: r.author_avatar,
    rating: r.rating,
    comment: r.comment,
    content: r.comment,
    created_at: r.created_at,
    createdAt: r.created_at ? 'Gần đây' : 'Vừa xong',
    edited: r.edited
  }));
}

// In-memory active admin sessions (valid for 2 hours)
const adminSessions = new Map<string, { email: string; role: string; expiresAt: number }>();

const FIREBASE_API_KEY = "AIzaSyA9TNy3kYStF3w2elOHxX03koqh7KcAuA4";

// Server-side Authentication & Admin Authorization Middleware
async function verifyAdminAuth(req: express.Request): Promise<{ authorized: boolean; email?: string; error?: string; status?: number }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Yêu cầu quyền Quản trị viên (Thiếu Authorization Bearer token)', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { authorized: false, error: 'Token xác thực không hợp lệ hoặc trống', status: 401 };
  }

  // 1. Check if token is an active server-issued Admin session
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return { authorized: false, error: 'Phiên đăng nhập đã hết hạn sau 2 giờ. Vui lòng đăng nhập lại.', status: 401 };
    }
    return { authorized: true, email: session.email };
  }

  try {
    // 2. Verify token with Google Identity Toolkit API using Firebase API Key
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });

    const data = await res.json();
    if (!res.ok || !data.users || data.users.length === 0) {
      return { authorized: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', status: 401 };
    }

    const user = data.users[0];
    const email = (user.email || '').toLowerCase().trim();

    // 3. Check if user email is in admin_users collection/store
    const isAdmin = adminUsersStore.some(u => u.email.toLowerCase() === email) || email === 'datnhatquang@gmail.com';

    if (!isAdmin) {
      return { authorized: false, error: `Tài khoản ${email} chưa được cấp quyền trong danh sách admin_users.`, status: 403 };
    }

    return { authorized: true, email };
  } catch (err: any) {
    console.error('Server auth verification failed:', err);
    return { authorized: false, error: 'Lỗi xác thực phía máy chủ: ' + (err.message || 'Unknown error'), status: 500 };
  }
}

// Initialize Gemini Client safely

// Helper to retry Gemini generateContent calls
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const is503 = error?.status === 503 || (error?.error && error?.error?.code === 503) || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
      const is429 = error?.status === 429 || (error?.error && error?.error?.code === 429) || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      
      // Do not retry 429 (quota exhausted) - throw immediately to trigger fallback and save user time
      if (is429) {
        console.warn(`Gemini API Quota Exceeded (429). Falling back immediately.`);
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }
      
      if (is503) {
        const delayMs = attempt * 1500;
        console.log(`Gemini API returned 503, retrying in ${delayMs}ms (Attempt ${attempt} of ${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after max retries");
}

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fallback intelligent recipe ranking algorithm in Vietnamese
function rankRecipesLocal(userIngredients: string[]): SuggestedRecipeMatch[] {
  const normalizedUser = userIngredients.map(i => i.toLowerCase().trim()).filter(Boolean);
  if (normalizedUser.length === 0) {
    return recipesStore.map(r => ({
      recipe: r,
      matchPercentage: 100,
      matchedIngredients: r.ingredients.map(ing => ing.name),
      missingIngredients: [],
      reason: 'Món ăn gợi ý phổ biến cho bạn.'
    }));
  }

  const results: SuggestedRecipeMatch[] = [];

  for (const recipe of recipesStore) {
    const matched: string[] = [];
    const missing: string[] = [];

    for (const rIng of recipe.ingredients) {
      const rName = rIng.name.toLowerCase();
      // Strict matching without weird hallucinated rules
      const isMatched = normalizedUser.some(uIng => rName.includes(uIng) || uIng.includes(rName));

      if (isMatched) {
        matched.push(rIng.name);
      } else {
        missing.push(rIng.name);
      }
    }

    if (matched.length > 0) {
      const matchRatio = recipe.ingredients.length > 0 ? (matched.length / recipe.ingredients.length) : 0;
      let matchPct = Math.round(matchRatio * 100);

      // Boost percentage if primary ingredient matches
      if (matchPct < 50) {
        matchPct = Math.min(85, Math.round(matchRatio * 100 + 40));
      }
      if (matched.length >= 2 && matchPct < 80) {
        matchPct = Math.min(95, matchPct + 30);
      }
      if (missing.length === 0) {
        matchPct = 100;
      }

      results.push({
        recipe,
        matchPercentage: Math.max(25, Math.min(100, matchPct)),
        matchedIngredients: matched,
        missingIngredients: missing,
        reason: missing.length === 0 
          ? 'Bạn có đủ 100% nguyên liệu cho món này!' 
          : `Khớp ${matched.length} nguyên liệu chính (${matched.join(', ')}). Chỉ cần chuẩn bị thêm ${missing.slice(0, 2).join(', ')}.`
      });
    }
  }

  // Sort descending by match percentage
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return results;
}

// ==========================================
// AI & ALGORITHMIC RECIPE DUPLICATE MODERATION
// ==========================================

function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRecipeTitle(title: string): string {
  const normalized = normalizeVietnamese(title);
  const stopWords = [
    'mon an', 'mon', 'cach lam', 'huong dan', 'cong thuc', 'nau', 'chuan vi',
    'sieu ngon', 'thom ngon', 'ngon nhat', 'gia truyen', 'dac san', 'kieu moi',
    'kieu', 'dam da', 'hao com', 'de lam', 'tai nha', 'don gian'
  ];
  let clean = normalized;
  for (const w of stopWords) {
    clean = clean.replace(new RegExp(`\\b${w}\\b`, 'g'), ' ');
  }
  return clean.replace(/\s+/g, ' ').trim();
}

function computeWordOverlapSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' ').filter(w => w.length > 1));
  const words2 = new Set(str2.split(' ').filter(w => w.length > 1));
  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateDishName?: string;
  duplicateSimilarity?: number; // 0 - 100
  duplicateExplanation?: string;
  matchedRecipe?: Recipe;
}

function algorithmicCheckDuplicate(title: string, existingList: Recipe[]): DuplicateCheckResult {
  const normTitle = normalizeVietnamese(title);
  const cleanTitle = cleanRecipeTitle(title);

  if (!cleanTitle || cleanTitle.length < 3) return { isDuplicate: false, duplicateSimilarity: 0 };

  for (const recipe of existingList) {
    const rNorm = normalizeVietnamese(recipe.title);
    const rClean = cleanRecipeTitle(recipe.title);

    // 1. Exact match (with or without accents)
    if (normTitle === rNorm || cleanTitle === rClean) {
      return {
        isDuplicate: true,
        duplicateDishName: recipe.title,
        duplicateSimilarity: 100,
        duplicateExplanation: `Món ăn có tên trùng khớp hoàn toàn với "${recipe.title}" đã có trong kho công thức.`,
        matchedRecipe: recipe
      };
    }

    // 2. Core dish word containment (e.g. "Phở bò Hà Nội" vs "Phở Bò Gia Truyền", "Thịt kho tộ đậm đà" vs "Thịt kho tộ")
    const wordsClean1 = cleanTitle.split(' ').filter(w => w.length > 1);
    const wordsClean2 = rClean.split(' ').filter(w => w.length > 1);
    if (wordsClean1.length >= 2 && wordsClean2.length >= 2) {
      const shorter = wordsClean1.length <= wordsClean2.length ? wordsClean1 : wordsClean2;
      const longerSet = new Set(wordsClean1.length <= wordsClean2.length ? wordsClean2 : wordsClean1);
      const allShorterInLonger = shorter.every(w => longerSet.has(w));
      if (allShorterInLonger) {
        const simRatio = Math.round((shorter.length / Math.max(wordsClean1.length, wordsClean2.length)) * 100);
        const score = Math.max(simRatio, 85);
        return {
          isDuplicate: true,
          duplicateDishName: recipe.title,
          duplicateSimilarity: score,
          duplicateExplanation: `Tên món "${title}" có chứa trọn vẹn cụm tên món ăn gốc "${recipe.title}" đã có trong hệ thống (${score}% tương đồng cốt lõi).`,
          matchedRecipe: recipe
        };
      }
    }

    // 3. Substring / containment match
    if (cleanTitle.length >= 4 && rClean.length >= 4) {
      if (cleanTitle.includes(rClean) || rClean.includes(cleanTitle)) {
        const ratio = Math.min(cleanTitle.length, rClean.length) / Math.max(cleanTitle.length, rClean.length);
        if (ratio >= 0.5) {
          const sim = Math.round(ratio * 100);
          return {
            isDuplicate: true,
            duplicateDishName: recipe.title,
            duplicateSimilarity: sim,
            duplicateExplanation: `Tên món "${title}" tương đương với món "${recipe.title}" đã có (${sim}% tương đồng).`,
            matchedRecipe: recipe
          };
        }
      }
    }

    // 4. Jaccard word token overlap
    const wordSim = computeWordOverlapSimilarity(cleanTitle, rClean);
    if (wordSim >= 0.5) {
      const sim = Math.round(wordSim * 100);
      return {
        isDuplicate: true,
        duplicateDishName: recipe.title,
        duplicateSimilarity: sim,
        duplicateExplanation: `Các từ khóa nguyên liệu và cách chế biến gần như trùng với "${recipe.title}" (${sim}% tương đồng từ khóa).`,
        matchedRecipe: recipe
      };
    }
  }

  return { isDuplicate: false, duplicateSimilarity: 0 };
}

async function checkRecipeDuplicateWithAI(
  title: string,
  ingredients: any[],
  steps: any[],
  existingList: Recipe[]
): Promise<DuplicateCheckResult> {
  // 1. Fast algorithmic check
  const algoResult = algorithmicCheckDuplicate(title, existingList);
  if (algoResult.isDuplicate && (algoResult.duplicateSimilarity || 0) >= 90) {
    return algoResult;
  }

  const ai = getAIClient();
  if (!ai) {
    return algoResult;
  }

  // 2. Semantic AI duplicate evaluation with Gemini
  try {
    const existingTitles = existingList.map(r => r.title);
    const prompt = `Bạn là chuyên gia kiểm duyệt nội dung ẩm thực cho ứng dụng "Ăn Gì Hôm Nay".
Nhiệm vụ hàng đầu: Kiểm tra xem món ăn mới gửi vào ĐÃ CÓ trong hệ thống hay chưa.

Món mới gửi vào:
- Tên món: "${title}"
- Nguyên liệu chính: ${JSON.stringify(ingredients.slice(0, 8))}

Danh sách các món HIỆN ĐÃ CÓ trong hệ thống:
${JSON.stringify(existingTitles)}

QUY TẮC BẮT BUỘC THEO QUY CHẾ:
"Những món đã có thì sẽ KHÔNG được duyệt."
- Nếu món mới là cùng một món ăn với món đã có trong danh sách trên (bao gồm các biến thể tên gọi thường gặp như "Phở bò" vs "Phở bò Hà Nội", "Thịt kho tàu" vs "Thịt kho trứng", "Canh chua cá lóc" vs "Canh chua cá", "Nem rán" vs "Chả giò truyền thống", "Gà luộc lá chanh" vs "Gà luộc", "Sườn xào chua ngọt" vs "Sườn chua ngọt"):
  -> "is_duplicate": true
  -> "duplicate_dish_name": "<Tên chính xác món trong danh sách bị trùng>"
  -> "duplicate_similarity": <số từ 70 đến 100>
  -> "duplicate_explanation": "<Giải thích ngắn gọn 1-2 câu vì sao đây là món đã có trong hệ thống>"
- Nếu là món ăn hoàn toàn mới chưa có trong danh sách, hoặc là một biến tấu thực sự độc đáo khác biệt rõ rệt:
  -> "is_duplicate": false
  -> "duplicate_dish_name": ""
  -> "duplicate_similarity": 0
  -> "duplicate_explanation": ""

Trả về CHỈ JSON theo format:
{
  "is_duplicate": true,
  "duplicate_dish_name": "Tên món bị trùng",
  "duplicate_similarity": 90,
  "duplicate_explanation": "Món này đã có trong danh sách với cùng nguyên liệu và cách làm truyền thống."
}`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.is_duplicate) {
        const matched = existingList.find(r => 
          r.title.toLowerCase() === (parsed.duplicate_dish_name || '').toLowerCase()
        );
        return {
          isDuplicate: true,
          duplicateDishName: parsed.duplicate_dish_name || algoResult.duplicateDishName || title,
          duplicateSimilarity: parsed.duplicate_similarity || 85,
          duplicateExplanation: parsed.duplicate_explanation || `Món ăn này trùng với "${parsed.duplicate_dish_name || algoResult.duplicateDishName}" đã có trên hệ thống.`,
          matchedRecipe: matched || algoResult.matchedRecipe
        };
      }
    }
  } catch (err) {
    
    const isQuota = err?.status === 429 || err?.status === 503 || err?.message?.includes('429') || err?.message?.includes('503');
    if (isQuota) {
      console.warn('Gemini API limit/unavailable (duplicate eval). Using fallback.');
    } else {
      console.error('Error during AI duplicate evaluation:', err?.message || err);
    }

  }

  return algoResult;
}

async function startServer() {
  const app = express();
  // In development, the dev server must bind to port 3000 for the AI Studio proxy.
  // In Cloud Run deployment, the container must listen on process.env.PORT (typically 8080).
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = isProduction ? (Number(process.env.PORT) || 8080) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Routes
  app.get(['/healthz', '/api/health'], (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // 1. Get all approved recipes
  app.get('/api/recipes', (req, res) => {
    const { category, search } = req.query;
    let list = [...recipesStore];

    if (category && category !== 'Tất cả' && category !== 'all') {
      const catStr = String(category).toLowerCase();
      list = list.filter(r => 
        r.categories.some(c => c.toLowerCase() === catStr) ||
        r.title.toLowerCase().includes(catStr)
      );
    }

    if (search) {
      const searchStr = String(search).toLowerCase().trim();
      list = list.filter(r => 
        r.title.toLowerCase().includes(searchStr) ||
        r.description.toLowerCase().includes(searchStr) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(searchStr))
      );
    }

    res.json({ success: true, data: list });
  });

  // 2. Get single recipe by id
  app.get('/api/recipes/:id', (req, res) => {
    const recipe = recipesStore.find(r => r.id === req.params.id) ||
                   pendingStore.find(r => r.id === req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    syncReviewsToComments(recipe.id);
    const comments = commentsStore[recipe.id] || [];
    res.json({ success: true, data: recipe, comments, reviews: reviewsStore[recipe.id] || [] });
  });

  // Get comments for recipe
  app.get('/api/recipes/:id/comments', (req, res) => {
    const recipeId = req.params.id;
    syncReviewsToComments(recipeId);
    const comments = commentsStore[recipeId] || [];
    res.json({ success: true, data: comments, comments });
  });

  // 3. AI Suggest recipes based on input ingredients list
  app.post('/api/suggest-recipes', async (req, res) => {
    try {
      const { ingredients, query } = req.body;
      let ingList: string[] = [];

      if (Array.isArray(ingredients)) {
        ingList = ingredients.map(i => String(i).trim()).filter(Boolean);
      } else if (typeof query === 'string' && query.trim()) {
        ingList = query.split(/[,;\n+]+/).map(s => s.trim()).filter(Boolean);
      }

      if (ingList.length === 0) {
        return res.json({
          success: true,
          data: rankRecipesLocal([]),
          note: 'Không có nguyên liệu đầu vào, hiển thị món phổ biến.'
        });
      }

      const ai = getAIClient();
      if (!ai) {
        // High quality heuristic fallback
        const fallbackRanked = rankRecipesLocal(ingList);
        return res.json({ success: true, data: fallbackRanked, source: 'heuristic' });
      }

      // Format current recipes database for Gemini prompt
      const recipeCatalog = recipesStore.map(r => ({
        id: r.id,
        name: r.title,
        ingredients: r.ingredients.map(i => i.name),
        calories: r.calories,
        tags: r.categories
      }));

      const prompt = `Bạn là hệ thống gợi ý món ăn cực kỳ khắt khe. Bạn nhận vào:
- Danh sách nguyên liệu/từ khóa người dùng đang có: ${JSON.stringify(ingList)}
- Danh sách công thức trong hệ thống:
${JSON.stringify(recipeCatalog, null, 2)}

Nhiệm vụ:
1. TUYỆT ĐỐI CHỈ TRẢ VỀ các công thức có chứa TRỰC TIẾP nguyên liệu/từ khóa mà người dùng đã nhập.
2. KHÔNG SUY DIỄN: Nếu người dùng nhập "thịt", chỉ khớp với công thức có chứa nguyên liệu có từ "thịt". Đừng tự động trả về "phở bò", "gà" trừ khi trong công thức đó có nguyên liệu tên "thịt".
3. Nếu người dùng nhập nhiều nguyên liệu, hãy ưu tiên công thức đáp ứng được nhiều nguyên liệu nhất.
4. KHÔNG BỊA RA công thức mới.
5. Nếu không có công thức nào khớp hợp lý với TỪ KHÓA, hãy trả về mảng suggestions rỗng [].

Trả về CHỈ JSON theo format sau (KHÔNG thêm markdown text):
{
  "suggestions": [
    { "recipe_id": "...", "recipe_name": "...", "match_percent": 85, "missing_ingredients": ["..."] }
  ]
}`;

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const text = response.text || '{"suggestions":[]}';
      let parsedResults: Array<{
        recipe_id?: string;
        recipeId?: string; recipe_name?: string; name?: string;
        match_percent?: number;
        matchPercentage?: number;
        missing_ingredients?: string[];
        missingIngredients?: string[];
        matched_ingredients?: string[];
        matchedIngredients?: string[];
      }> = [];

      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsedResults = parsed;
        } else if (parsed && Array.isArray(parsed.suggestions)) {
          parsedResults = parsed.suggestions;
        }
      } catch (err) {
        console.error('Failed to parse Gemini output, falling back:', err);
        return res.json({ success: true, data: rankRecipesLocal(ingList), source: 'fallback' });
      }

      // Map back to full recipe objects
      const fullResults: SuggestedRecipeMatch[] = [];
      for (const item of parsedResults) {
        const recipeId = item.recipe_id || item.recipeId || '';
        const recipeName = item.recipe_name || item.name || '';
        const matchPct = item.match_percent ?? item.matchPercentage ?? 0;
        const missing = item.missing_ingredients || item.missingIngredients || [];
        
        // Match by ID or Name to prevent AI hallucination
        const recipe = recipesStore.find(r => 
          r.id === recipeId || 
          r.title.toLowerCase() === recipeId.toLowerCase() || 
          (recipeName && r.title.toLowerCase() === recipeName.toLowerCase())
        );

        if (recipe && matchPct > 10) {
          // Determine matched ingredients
          const allIngNames = recipe.ingredients.map(i => i.name);
          const matched = allIngNames.filter(name => !missing.some(m => m.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(m.toLowerCase())));

          fullResults.push({
            recipe,
            matchPercentage: Math.min(100, Math.max(10, matchPct)),
            matchedIngredients: matched.length > 0 ? matched : ingList.filter(userIng => allIngNames.some(ai => ai.toLowerCase().includes(userIng.toLowerCase()))),
            missingIngredients: missing,
            reason: `Khớp ${matchPct}% dựa trên nguyên liệu bạn đang có.`
          });
        }
      }

      fullResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

      if (fullResults.length === 0) {
        return res.json({ success: true, data: rankRecipesLocal(ingList), source: 'heuristic-empty' });
      }

      res.json({ success: true, data: fullResults, source: 'gemini' });
    } catch (error: any) {
      
      const isQuotaOrUnavailable = error?.status === 429 || error?.status === 503 || error?.message?.includes('429') || error?.message?.includes('503');
      if (isQuotaOrUnavailable) {
        console.warn('Gemini API limit reached or unavailable. Seamlessly using local fallback.');
      } else {
        console.error('Gemini recipe suggestion error:', error?.message || error);
      }

      // Seamless fallback
      const { ingredients, query } = req.body;
      const ingList = Array.isArray(ingredients) ? ingredients : (query ? String(query).split(/[,;\n+]+/) : []);
      res.json({ success: true, data: rankRecipesLocal(ingList), source: 'fallback-error' });
    }
  });

  // 3.5 Generate Recipe Image using AI (Gemini or high-res culinary generator)
  app.post('/api/generate-recipe-image', async (req, res) => {
    try {
      const { prompt, dishName, ingredients, style, aspectRatio = '4:3' } = req.body;
      const name = (dishName || '').trim();
      const customPrompt = (prompt || '').trim();

      if (!name && !customPrompt) {
        return res.status(400).json({ success: false, error: 'Vui lòng cung cấp tên món ăn hoặc câu lệnh tạo ảnh.' });
      }

      const ingText = Array.isArray(ingredients) && ingredients.length > 0 
        ? ` with ingredients: ${ingredients.slice(0, 6).map((i: any) => typeof i === 'string' ? i : i.name).join(', ')}`
        : '';

      const styleKeyword = style === 'rustic' 
        ? 'plated on authentic rustic Vietnamese earthenware, warm natural home dining lighting'
        : style === 'modern'
        ? 'modern gourmet plating, fine dining Vietnamese culinary presentation'
        : 'appetizing home-cooked Vietnamese cuisine, freshly prepared, steaming hot';

      // Construct high-detail culinary photography prompt
      const enhancedPrompt = customPrompt
        ? `${customPrompt}, authentic Vietnamese cuisine, professional culinary food photography, 4k ultra high resolution, appetizing, shallow depth of field`
        : `Delicious authentic Vietnamese dish "${name}"${ingText}, ${styleKeyword}, garnished with fresh herbs, high-end food magazine photography, cinematic warm lighting, extremely detailed, mouthwatering`;

      // 1. Attempt Gemini image generation if key configured
      const ai = getAIClient();
      if (ai) {
        try {
          const geminiRes = await generateContentWithRetry(ai, {
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: enhancedPrompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : '4:3'
              }
            }
          });

          if (geminiRes.candidates?.[0]?.content?.parts) {
            for (const part of geminiRes.candidates[0].content.parts) {
              if (part.inlineData) {
                const mime = part.inlineData.mimeType || 'image/png';
                const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
                return res.json({
                  success: true,
                  imageUrl,
                  source: 'gemini',
                  promptUsed: enhancedPrompt
                });
              }
            }
          }
        } catch (geminiError: any) {
          console.log('Gemini image model unavailable or quota limited, switching to culinary AI engine:', geminiError?.message || geminiError);
        }
      }

      // 2. High-performance culinary image generation
      let width = 1024;
      let height = 768;
      if (aspectRatio === '1:1') {
        width = 800;
        height = 800;
      } else if (aspectRatio === '16:9') {
        width = 1024;
        height = 576;
      }

      const seed = Math.floor(Math.random() * 999999);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

      try {
        const fetchRes = await fetch(pollinationsUrl);
        if (fetchRes.ok) {
          const buffer = await fetchRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
          return res.json({
            success: true,
            imageUrl: `data:${mimeType};base64,${base64}`,
            source: 'pollinations-ai',
            promptUsed: enhancedPrompt
          });
        }
      } catch (fErr) {
        console.error('Fetch AI image error, falling back to direct URL:', fErr);
      }

      return res.json({
        success: true,
        imageUrl: pollinationsUrl,
        source: 'pollinations-ai-direct',
        promptUsed: enhancedPrompt
      });
    } catch (err: any) {
      console.error('Error in /api/generate-recipe-image:', err);
      res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý tạo ảnh AI' });
    }
  });

  // 3.5. AI Check Duplicate Recipe (Real-time Pre-check)
  app.post('/api/check-duplicate-recipe', async (req, res) => {
    try {
      const { title, ingredients, steps } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Vui lòng cung cấp tên món ăn cần kiểm tra.' });
      }

      const rawIngredients = Array.isArray(ingredients) ? ingredients : [];
      const rawSteps = Array.isArray(steps) ? steps : [];

      const result = await checkRecipeDuplicateWithAI(title.trim(), rawIngredients, rawSteps, recipesStore);

      return res.json({
        success: true,
        data: {
          isDuplicate: result.isDuplicate,
          duplicateDishName: result.duplicateDishName,
          duplicateSimilarity: result.duplicateSimilarity,
          duplicateExplanation: result.duplicateExplanation,
          matchedRecipe: result.matchedRecipe ? {
            id: result.matchedRecipe.id,
            title: result.matchedRecipe.title,
            image: result.matchedRecipe.image,
            categories: result.matchedRecipe.categories
          } : null
        }
      });
    } catch (err: any) {
      console.error('Error in /api/check-duplicate-recipe:', err);
      res.status(500).json({ success: false, error: err.message || 'Lỗi kiểm tra trùng lặp AI' });
    }
  });

  // 4. Submit Recipe with AI Content Moderation, Nutrition Calculation & Duplicate Detection
  app.post('/api/submit-recipe', async (req, res) => {
    try {
      const {
        title,
        description,
        image,
        ingredients,
        steps,
        categories,
        authorName,
        authorUid,
        authorAvatar,
        servings,
        prepTime
      } = req.body;

      if (!title || !ingredients || ingredients.length === 0) {
        return res.status(400).json({ success: false, error: 'Tiêu đề và nguyên liệu là bắt buộc.' });
      }

      const rawIngredients = Array.isArray(ingredients) ? ingredients : [];
      const rawSteps = Array.isArray(steps) ? steps : [];

      // STEP 1: DUPLICATE DETECTION CHECK
      const duplicateResult = await checkRecipeDuplicateWithAI(
        title.trim(),
        rawIngredients,
        rawSteps,
        recipesStore
      );

      let aiEvaluation: {
        is_valid: boolean;
        reject_reason?: string;
        estimated_calories?: number;
        nutrition?: { protein_g?: number; fat_g?: number; carb_g?: number };
        tags?: string[];
        needs_manual_review: boolean;
        review_reason?: string;
        is_duplicate?: boolean;
        duplicate_dish_name?: string;
        duplicate_similarity?: number;
        duplicate_explanation?: string;
      } = {
        is_valid: true,
        estimated_calories: 350,
        nutrition: { protein_g: 20, fat_g: 12, carb_g: 35 },
        tags: ['man', 'vua'],
        needs_manual_review: false,
        review_reason: 'Công thức đầy đủ và hợp lệ.',
        is_duplicate: false,
        duplicate_dish_name: '',
        duplicate_similarity: 0,
        duplicate_explanation: ''
      };

      // If duplicate detected by algorithm/semantic AI check:
      if (duplicateResult.isDuplicate) {
        aiEvaluation.is_valid = false;
        aiEvaluation.needs_manual_review = true;
        aiEvaluation.is_duplicate = true;
        aiEvaluation.duplicate_dish_name = duplicateResult.duplicateDishName;
        aiEvaluation.duplicate_similarity = duplicateResult.duplicateSimilarity || 90;
        aiEvaluation.duplicate_explanation = duplicateResult.duplicateExplanation || 'Món ăn đã có trong kho công thức.';
        aiEvaluation.reject_reason = `Món ăn này đã có trên hệ thống (Trùng với món "${duplicateResult.duplicateDishName}"). Quy định kiểm duyệt: Món đã có sẽ KHÔNG ĐƯỢC DUYỆT nhằm đảm bảo tính đa dạng của kho món ăn.`;
        aiEvaluation.review_reason = aiEvaluation.reject_reason;
      }

      // STEP 2: FULL GEMINI AI MODERATION & ENRICHMENT
      const ai = getAIClient();
      if (ai) {
        const existingTitles = recipesStore.map(r => r.title);
        const prompt = `Bạn là hệ thống kiểm duyệt và làm giàu dữ liệu cho công thức nấu ăn mới đăng trên "Ăn Gì Hôm Nay".
Bạn nhận vào:
- Tên món: "${title}"
- Danh sách nguyên liệu: ${JSON.stringify(rawIngredients)}
- Các bước nấu: ${JSON.stringify(rawSteps)}
- Danh sách món đã có trong hệ thống: ${JSON.stringify(existingTitles.slice(0, 50))}

Nhiệm vụ kiểm duyệt:
1. KIỂM DUYỆT TRÙNG LẶP (QUAN TRỌNG NHẤT):
   - "Những món đã có thì sẽ KHÔNG được duyệt."
   - Nếu món "${title}" trùng tên hoặc cùng bản chất với bất kỳ món nào đã có trong danh sách trên:
     -> "is_duplicate": true
     -> "is_valid": false
     -> "needs_manual_review": true
     -> "duplicate_dish_name": "<Tên món đã có bị trùng>"
     -> "duplicate_similarity": <Độ tương đồng 70-100>
     -> "duplicate_explanation": "<Lý do ngắn gọn món này đã có>"
     -> "reject_reason": "Món ăn này đã có trên hệ thống. Theo quy chế kiểm duyệt, món đã có không được duyệt."
2. Kiểm tra tính hợp lệ: có phải món ăn thực tế không, không có ngôn từ độc hại/spam/quảng cáo.
3. Ước tính calo và dinh dưỡng (đạm/béo/tinh bột) cho 1 khẩu phần dựa trên nguyên liệu đã liệt kê.
4. Gắn tag tự động: chay/mặn, thời gian nấu (nhanh <15p / vừa / lâu), vùng miền nếu nhận diện được từ tên món hoặc nguyên liệu.

Trả về CHỈ JSON theo format:
{
  "is_valid": true,
  "reject_reason": "",
  "is_duplicate": false,
  "duplicate_dish_name": "",
  "duplicate_similarity": 0,
  "duplicate_explanation": "",
  "estimated_calories": 350,
  "nutrition": { "protein_g": 20, "fat_g": 12, "carb_g": 35 },
  "tags": ["chay", "nhanh", "mien-bac"],
  "needs_manual_review": false,
  "review_reason": ""
}`;

        try {
          const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          });
          if (response.text) {
            const parsed = JSON.parse(response.text);
            // Preserve duplicate flag if either check flagged it
            const wasDuplicate = duplicateResult.isDuplicate || parsed.is_duplicate;
            aiEvaluation = {
              ...aiEvaluation,
              ...parsed,
              is_duplicate: wasDuplicate,
              duplicate_dish_name: parsed.duplicate_dish_name || duplicateResult.duplicateDishName || '',
              duplicate_similarity: parsed.duplicate_similarity || duplicateResult.duplicateSimilarity || 0,
              duplicate_explanation: parsed.duplicate_explanation || duplicateResult.duplicateExplanation || '',
              // ENFORCE RULE: Duplicate dishes are NEVER valid for auto-approval
              is_valid: wasDuplicate ? false : parsed.is_valid,
              needs_manual_review: wasDuplicate ? true : parsed.needs_manual_review,
              reject_reason: wasDuplicate 
                ? `Món ăn này đã có trên hệ thống (Trùng với món "${parsed.duplicate_dish_name || duplicateResult.duplicateDishName}"). Món đã có không được duyệt.`
                : (parsed.reject_reason || '')
            };
          }
        } catch (aiErr) {
          console.error('AI Moderation failed, using standard rule base:', aiErr);
        }
      }

      // Check auto-approval conditions
      const newRecipeId = 'recipe-' + Date.now();
      const defaultImage = image && image.trim() !== '' 
        ? image 
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYDEZNVg9f1p6UNel778csFr6JmmYdcT9zAn7KRsrOp9n6zBpaTHPs-QJqbh9YoPMOcdmklBZcX2_klodFoE6in56pxFWpNIQFvIHkjWMm_EI_CUtT_7L1s5AMf9BaNG3DzlW8c4VeNWbmCVrRDVJO0lGjeyQBfFxwSIwH4lYQCD-Eu5QydtG3OIHsUvqcj10HLgB16dOjqtZcU71_Gg7F3Jji_gwV6NQi3_-QwyEayAs7GlHUYG61MQ';

      const tagMap: Record<string, string> = {
        'chay': 'Ăn chay',
        'man': 'Đồ mặn',
        'nhanh': 'Dưới 15 phút',
        'mien-bac': 'Miền Bắc',
        'mien-trung': 'Miền Trung',
        'mien-nam': 'Miền Nam',
        'it-calo': 'Ít calo'
      };

      const mappedTags = (aiEvaluation.tags || []).map(t => tagMap[t.toLowerCase()] || t);

      const finalCategories = Array.from(new Set([
        ...(categories || []),
        ...mappedTags,
        'Tất cả'
      ]));

      const structuredIngredients = rawIngredients.map((item: any) => {
        if (typeof item === 'string') {
          return { name: item, amount: 'Vừa đủ' };
        }
        return { name: item.name || '', amount: item.amount || 'Vừa đủ' };
      });

      const structuredSteps = rawSteps.map((step: any, idx: number) => {
        if (typeof step === 'string') {
          return { step: idx + 1, title: `Bước ${idx + 1}`, description: step };
        }
        return {
          step: step.step || idx + 1,
          title: step.title || `Bước ${idx + 1}`,
          description: step.description || '',
          image: step.image
        };
      });

      const cal = aiEvaluation.estimated_calories || 320;
      const prot = aiEvaluation.nutrition?.protein_g || 20;
      const fat = aiEvaluation.nutrition?.fat_g || 12;
      const carb = aiEvaluation.nutrition?.carb_g || 30;

      const newRecipe: Recipe = {
        id: newRecipeId,
        title,
        description: description || 'Món ngon chia sẻ từ thành viên cộng đồng.',
        image: defaultImage,
        prepTime: prepTime || '25 Phút',
        servings: servings || '3-4 Người',
        difficulty: 'Dễ',
        calories: cal,
        nutrition: {
          calories: cal,
          protein: prot,
          fat: fat,
          carbs: carb
        },
        categories: finalCategories,
        ingredients: structuredIngredients,
        steps: structuredSteps,
        rating: 5.0,
        reviewCount: 0,
        author: {
          uid: authorUid,
          name: authorName || 'Bạn',
          avatar: authorAvatar,
          badge: 'Thành viên đóng góp'
        },
        author_uid: authorUid,
        author_name: authorName || 'Bạn',
        author_avatar: authorAvatar,
        isSaved: false,
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Flow 1: If duplicate -> STRICTLY NOT APPROVED! Keep in pending with clear duplicate reject flag.
      if (aiEvaluation.is_duplicate) {
        const pendingItem: PendingRecipe = {
          ...newRecipe,
          status: 'pending',
          isValid: false,
          needsManualReview: true,
          isDuplicate: true,
          duplicateDishName: aiEvaluation.duplicate_dish_name,
          duplicateSimilarity: aiEvaluation.duplicate_similarity,
          duplicateExplanation: aiEvaluation.duplicate_explanation,
          aiReviewReason: `[TRÙNG LẶP - KHÔNG ĐƯỢC DUYỆT] Món này đã có trên hệ thống (Trùng với món "${aiEvaluation.duplicate_dish_name}"). ${aiEvaluation.duplicate_explanation || ''}`,
          aiConfidenceScore: (aiEvaluation.duplicate_similarity || 85) / 100,
          aiSuggestedTags: mappedTags,
          submittedAt: new Date().toISOString()
        };
        pendingStore.unshift(pendingItem);

        return res.json({
          success: true,
          status: 'rejected_duplicate',
          message: `AI Kiểm duyệt: Món ăn này đã có trên hệ thống (Trùng với món "${aiEvaluation.duplicate_dish_name}"). Quy chế hệ thống không duyệt công thức trùng lặp!`,
          recipe: pendingItem,
          aiReview: aiEvaluation
        });
      }

      // Flow 2: Valid, unique, no manual review needed -> directly approved
      if (aiEvaluation.is_valid && !aiEvaluation.needs_manual_review) {
        recipesStore.unshift(newRecipe);
        return res.json({
          success: true,
          status: 'approved',
          message: 'Công thức đã được AI thẩm định đạt chuẩn, chưa từng có trên hệ thống và đăng tải thành công!',
          recipe: newRecipe,
          aiReview: aiEvaluation
        });
      } else {
        // Flow 3: Needs manual review (e.g. questionable content)
        const pendingItem: PendingRecipe = {
          ...newRecipe,
          status: 'pending',
          isValid: aiEvaluation.is_valid,
          needsManualReview: aiEvaluation.needs_manual_review,
          isDuplicate: false,
          aiReviewReason: aiEvaluation.review_reason || aiEvaluation.reject_reason || (aiEvaluation.is_valid ? 'Cần ban quản trị duyệt thêm về hình ảnh và hướng dẫn' : 'Nội dung chưa hợp lệ hoặc cần kiểm tra an toàn thực phẩm'),
          aiConfidenceScore: 0.85,
          aiSuggestedTags: mappedTags,
          submittedAt: new Date().toISOString()
        };
        pendingStore.unshift(pendingItem);
        return res.json({
          success: true,
          status: 'pending',
          message: 'Công thức đã được gửi vào hàng đợi phê duyệt của Ban Quản Trị.',
          recipe: pendingItem,
          aiReview: aiEvaluation
        });
      }
    } catch (error: any) {
      console.error('Error submitting recipe:', error?.message || error);
      res.status(500).json({ success: false, error: error.message || 'Lỗi xử lý bài đăng.' });
    }
  });


  // Sync profile update from client to in-memory recipe stores
  app.post('/api/users/sync-profile', (req, res) => {
    const { uid, name, avatar } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Missing uid' });
    }

    let updatedCount = 0;

    const updateAuthor = (recipe) => {
      let changed = false;
      if (recipe.author_uid === uid || (recipe.author && recipe.author.uid === uid)) {
        if (name && recipe.author_name !== name) {
          recipe.author_name = name;
          if (recipe.author) recipe.author.name = name;
          changed = true;
        }
        if (avatar !== undefined && recipe.author_avatar !== avatar) {
          recipe.author_avatar = avatar;
          if (recipe.author) recipe.author.avatar = avatar;
          changed = true;
        }
      }
      return changed;
    };

    recipesStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    pendingStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    archivedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });
    rejectedStore.forEach(r => { if (updateAuthor(r)) updatedCount++; });

    // Also update reviewsStore
    for (const recipeId in reviewsStore) {
      reviewsStore[recipeId].forEach(review => {
        if (review.author_uid === uid) {
          if (name && review.author_name !== name) {
            review.author_name = name;
            updatedCount++;
          }
          if (avatar !== undefined && review.author_avatar !== avatar) {
            review.author_avatar = avatar;
            updatedCount++;
          }
        }
      });
    }

    res.json({ success: true, updatedCount });
  });

  // User Auth Fallback Endpoints (Email + Password when Firebase Auth provider is restricted)
  const localUsersStore: Array<{
    uid: string;
    email: string;
    passwordHash: string;
    displayName: string;
    avatarUrl: string;
    createdAt: string;
    badge: string[];
    savedRecipes: string[];
    bio?: string;
  }> = [
    {
      uid: 'usr_datnhatquang',
      email: 'datnhatquang@gmail.com',
      passwordHash: 'admin123',
      displayName: 'Minh Châu',
      avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz',
      createdAt: '2025-01-10T08:00:00.000Z',
      badge: ['Quản trị viên', 'Bếp trưởng'],
      savedRecipes: ['recipe-1', 'recipe-2']
    }
  ];

  app.post('/api/auth/register', (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = localUsersStore.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email này đã được sử dụng.' });
    }

    const uid = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const name = displayName?.trim() || cleanEmail.split('@')[0] || 'Đầu bếp';
    const defaultAvatar = 'https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz';
    const createdAt = new Date().toISOString();

    const newUser = {
      uid,
      email: cleanEmail,
      passwordHash: password,
      displayName: name,
      avatarUrl: defaultAvatar,
      createdAt,
      badge: cleanEmail === 'datnhatquang@gmail.com' ? ['Quản trị viên', 'Bếp trưởng'] : ['Đầu bếp cộng đồng'],
      savedRecipes: []
    };
    localUsersStore.push(newUser);

    const token = 'usr_tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    return res.json({
      success: true,
      token,
      user: {
        uid,
        email: cleanEmail,
        displayName: name,
        photoURL: defaultAvatar
      },
      profile: {
        uid,
        email: cleanEmail,
        display_name: name,
        avatar_url: defaultAvatar,
        created_at: createdAt,
        badge: newUser.badge,
        saved_recipes: []
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = localUsersStore.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Create user if signing in for the first time
      const uid = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const name = cleanEmail.split('@')[0] || 'Đầu bếp';
      const defaultAvatar = 'https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz';
      user = {
        uid,
        email: cleanEmail,
        passwordHash: password,
        displayName: name,
        avatarUrl: defaultAvatar,
        createdAt: new Date().toISOString(),
        badge: cleanEmail === 'datnhatquang@gmail.com' ? ['Quản trị viên', 'Bếp trưởng'] : ['Đầu bếp cộng đồng'],
        savedRecipes: []
      };
      localUsersStore.push(user);
    } else if (user.passwordHash && user.passwordHash !== password) {
      return res.status(401).json({ success: false, error: 'Mật khẩu không chính xác.' });
    }

    const token = 'usr_tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    return res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.avatarUrl
      },
      profile: {
        uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt,
        badge: user.badge,
        saved_recipes: user.savedRecipes,
        bio: user.bio
      }
    });
  });

  // Admin Direct Login Endpoint (Email + Password)
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = adminUsersStore.find(u => u.email.toLowerCase() === cleanEmail);

    if (!admin) {
      return res.status(403).json({ success: false, error: `Tài khoản ${cleanEmail} không nằm trong danh sách Quản trị viên (admin_users).` });
    }

    // Check password
    if (admin.passwordHash && admin.passwordHash !== password) {
      return res.status(401).json({ success: false, error: 'Mật khẩu quản trị không chính xác.' });
    }

    // Create session token valid for 2 hours
    const token = 'adm_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000;
    adminSessions.set(token, { email: admin.email, role: admin.role, expiresAt });

    return res.json({
      success: true,
      message: 'Đăng nhập Quản trị viên thành công!',
      token,
      user: {
        email: admin.email,
        role: admin.role,
        displayName: admin.displayName || 'Quản trị viên',
        expiresAt
      }
    });
  });

  // 5. Admin: Dashboard real-time stats (Protected)
  app.get('/api/admin/stats', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const rejectedLast7DaysCount = rejectedStore.filter(r => {
      const time = new Date(r.rejectedAt).getTime();
      return !isNaN(time) && time >= sevenDaysAgo;
    }).length;

    res.json({
      success: true,
      data: {
        pendingCount: pendingStore.length,
        recipesCount: recipesStore.length,
        totalUsersCount: 158 + adminUsersStore.length, // Total active cooks in community + admins
        rejectedLast7DaysCount,
        archivedCount: archivedStore.length
      }
    });
  });

  // 6. Admin: List pending recipes (Protected)
  app.get('/api/pending-recipes', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }
    res.json({ success: true, data: pendingStore });
  });

  // 7. Admin: Approve pending recipe (Protected)
  app.post('/api/admin/approve/:id', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const { id } = req.params;
    const index = pendingStore.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức trong danh sách chờ duyệt' });
    }

    const pendingItem = pendingStore[index];

    // Enforce Rule: Duplicate items cannot be approved unless admin explicitly forces approval
    if (pendingItem.isDuplicate && !req.body?.forceApprove) {
      return res.status(400).json({
        success: false,
        isDuplicate: true,
        duplicateDishName: pendingItem.duplicateDishName,
        error: `Món ăn này đã bị AI kiểm duyệt đánh dấu TRÙNG LẶP với món "${pendingItem.duplicateDishName}". Theo quy chế: Những món đã có sẽ KHÔNG ĐƯỢC DUYỆT. Vui lòng từ chối bài viết hoặc gửi kèm forceApprove: true nếu muốn duyệt ngoại lệ.`
      });
    }

    pendingStore.splice(index, 1);

    const approvedRecipe: Recipe = {
      id: pendingItem.id,
      title: pendingItem.title,
      description: pendingItem.description,
      image: pendingItem.image,
      prepTime: pendingItem.prepTime,
      cookTime: pendingItem.cookTime,
      servings: pendingItem.servings,
      difficulty: pendingItem.difficulty,
      calories: pendingItem.calories,
      nutrition: pendingItem.nutrition,
      categories: pendingItem.categories,
      ingredients: pendingItem.ingredients,
      spiceIngredients: pendingItem.spiceIngredients,
      steps: pendingItem.steps,
      rating: 5.0,
      reviewCount: 0,
      author: pendingItem.author,
      isSaved: false,
      isCustom: true,
      approved_at: new Date().toISOString(),
      approved_by: auth.email || 'Admin',
      createdAt: pendingItem.createdAt || new Date().toISOString().split('T')[0]
    };

    recipesStore.unshift(approvedRecipe);
    res.json({ 
      success: true, 
      data: approvedRecipe, 
      message: `Đã duyệt thành công món "${approvedRecipe.title}" và xuất bản vào kho công thức!` 
    });
  });

  // 8. Admin: Reject pending recipe (Protected)
  app.post('/api/admin/reject/:id', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const index = pendingStore.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức trong danh sách chờ duyệt' });
    }

    const pendingItem = pendingStore[index];
    pendingStore.splice(index, 1);

    const rejectedItem: RejectedRecipe = {
      id: pendingItem.id,
      title: pendingItem.title,
      rejectReason: reason || pendingItem.aiReviewReason || 'Nội dung chưa đạt tiêu chuẩn kiểm duyệt chất lượng món ăn.',
      rejectedBy: auth.email || 'Admin',
      rejectedAt: new Date().toISOString(),
      recipeData: pendingItem,
      submittedAt: pendingItem.submittedAt
    };

    rejectedStore.unshift(rejectedItem);
    res.json({ 
      success: true, 
      data: rejectedItem, 
      message: `Đã từ chối công thức "${pendingItem.title}" và lưu vào lịch sử từ chối.` 
    });
  });

  // 8.5. Admin: Recheck duplicate for pending recipe with AI (Protected)
  app.post('/api/admin/recheck-duplicate/:id', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const { id } = req.params;
    const item = pendingStore.find(p => p.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức trong danh sách chờ duyệt' });
    }

    const dupResult = await checkRecipeDuplicateWithAI(
      item.title,
      item.ingredients || [],
      item.steps || [],
      recipesStore
    );

    item.isDuplicate = dupResult.isDuplicate;
    item.duplicateDishName = dupResult.duplicateDishName;
    item.duplicateSimilarity = dupResult.duplicateSimilarity;
    item.duplicateExplanation = dupResult.duplicateExplanation;

    if (dupResult.isDuplicate) {
      item.isValid = false;
      item.needsManualReview = true;
      item.aiReviewReason = `[TRÙNG LẶP - KHÔNG ĐƯỢC DUYỆT] Món này đã có trên hệ thống (Trùng với món "${dupResult.duplicateDishName}"). ${dupResult.duplicateExplanation || ''}`;
    }

    res.json({
      success: true,
      data: item,
      dupResult
    });
  });

  // 9. Admin: Get rejected history (Protected)
  app.get('/api/admin/rejected', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }
    res.json({ success: true, data: rejectedStore });
  });

  // 10. Admin: Post new recipe directly or through AI test pipeline (Protected)
  app.post('/api/admin/new-post', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    try {
      const {
        title,
        description,
        image,
        prepTime,
        cookTime,
        servings,
        difficulty,
        calories,
        protein,
        fat,
        carbs,
        categories,
        ingredients,
        spiceIngredients,
        steps,
        submitForReview
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Tên món ăn không được để trống' });
      }

      const newRecipeId = 'recipe-admin-' + Date.now();
      const defaultImage = (image && image.trim()) 
        ? image 
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYDEZNVg9f1p6UNel778csFr6JmmYdcT9zAn7KRsrOp9n6zBpaTHPs-QJqbh9YoPMOcdmklBZcX2_klodFoE6in56pxFWpNIQFvIHkjWMm_EI_CUtT_7L1s5AMf9BaNG3DzlW8c4VeNWbmCVrRDVJO0lGjeyQBfFxwSIwH4lYQCD-Eu5QydtG3OIHsUvqcj10HLgB16dOjqtZcU71_Gg7F3Jji_gwV6NQi3_-QwyEayAs7GlHUYG61MQ';

      const structuredIngredients = Array.isArray(ingredients) ? ingredients.map((i: any) => ({
        name: typeof i === 'string' ? i : i.name || '',
        amount: typeof i === 'string' ? 'Vừa đủ' : i.amount || 'Vừa đủ'
      })).filter((i: any) => i.name.trim() !== '') : [];

      const structuredSpices = Array.isArray(spiceIngredients) ? spiceIngredients.map((i: any) => ({
        name: typeof i === 'string' ? i : i.name || '',
        amount: typeof i === 'string' ? 'Vừa đủ' : i.amount || 'Vừa đủ'
      })).filter((i: any) => i.name.trim() !== '') : [];

      const structuredSteps = Array.isArray(steps) ? steps.map((s: any, idx: number) => ({
        step: idx + 1,
        title: typeof s === 'string' ? `Bước ${idx + 1}` : s.title || `Bước ${idx + 1}`,
        description: typeof s === 'string' ? s : s.description || ''
      })).filter((s: any) => s.description.trim() !== '') : [];

      // If Admin wants to test AI moderation pipeline
      if (submitForReview === true) {
        let aiEvaluation = {
          is_valid: true,
          reject_reason: '',
          estimated_calories: calories || 380,
          nutrition: { protein_g: protein || 22, fat_g: fat || 14, carb_g: carbs || 35 },
          tags: ['man', 'vua'],
          needs_manual_review: false,
          review_reason: 'Công thức đầy đủ, kiểm tra qua luồng AI.'
        };

        const ai = getAIClient();
        if (ai) {
          const prompt = `Bạn là hệ thống kiểm duyệt và làm giàu dữ liệu cho công thức nấu ăn mới đăng.
Bạn nhận vào:
- Tên món: "${title}"
- Danh sách nguyên liệu: ${JSON.stringify(structuredIngredients)}
- Các bước nấu: ${JSON.stringify(structuredSteps)}

Nhiệm vụ:
1. Kiểm tra nội dung có phải công thức nấu ăn hợp lệ không (không phải spam, quảng cáo, nội dung không liên quan)
2. Ước tính calo và dinh dưỡng (đạm/béo/tinh bột) cho 1 khẩu phần dựa trên nguyên liệu đã liệt kê
3. Gắn tag tự động: chay/mặn, thời gian nấu (nhanh <15p / vừa / lâu), vùng miền nếu nhận diện được từ tên món hoặc nguyên liệu
4. Đánh giá độ tin cậy: nếu nội dung mơ hồ, thiếu bước quan trọng, hoặc nghi spam thì đánh dấu "needs_manual_review": true

Trả về CHỈ JSON theo format:
{
  "is_valid": true,
  "reject_reason": "",
  "estimated_calories": 350,
  "nutrition": { "protein_g": 20, "fat_g": 12, "carb_g": 35 },
  "tags": ["chay", "nhanh", "mien-bac"],
  "needs_manual_review": false,
  "review_reason": ""
}`;

          try {
            const response = await generateContentWithRetry(ai, {
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json', temperature: 0.1 }
            });
            const parsed = JSON.parse(response.text || '{}');
            if (typeof parsed.is_valid === 'boolean') {
              aiEvaluation = parsed;
            }
          } catch (aiErr) {
            console.warn('AI moderation failed in test mode, using fallback:', aiErr);
          }
        }

        const pendingItem: PendingRecipe = {
          id: newRecipeId,
          title,
          description: description || 'Món ngon do Quản trị viên thử nghiệm',
          image: defaultImage,
          prepTime: prepTime || '25 Phút',
          cookTime: cookTime || '15 Phút',
          servings: servings || '3-4 Người',
          difficulty: difficulty || 'Dễ',
          calories: Number(calories) || aiEvaluation.estimated_calories || 350,
          nutrition: {
            calories: Number(calories) || aiEvaluation.estimated_calories || 350,
            protein: Number(protein) || aiEvaluation.nutrition?.protein_g || 20,
            fat: Number(fat) || aiEvaluation.nutrition?.fat_g || 12,
            carbs: Number(carbs) || aiEvaluation.nutrition?.carb_g || 30
          },
          categories: categories || ['Đồ mặn', 'Tất cả'],
          ingredients: structuredIngredients,
          spiceIngredients: structuredSpices,
          steps: structuredSteps,
          rating: 5.0,
          reviewCount: 0,
          author: {
            name: 'Admin (' + (auth.email?.split('@')[0] || 'Admin') + ')',
            badge: 'Ban Quản Trị'
          },
          posted_by_admin: true,
          admin_email: auth.email,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'pending',
          isValid: aiEvaluation.is_valid,
          needsManualReview: aiEvaluation.needs_manual_review,
          aiReviewReason: aiEvaluation.review_reason || (aiEvaluation.is_valid ? 'Đã phân tích qua AI thành công (Thử nghiệm)' : aiEvaluation.reject_reason),
          aiSuggestedTags: aiEvaluation.tags || [],
          submittedAt: new Date().toISOString()
        };

        pendingStore.unshift(pendingItem);
        return res.json({
          success: true,
          status: 'pending',
          message: 'Đã gửi vào hàng chờ duyệt (pending) để thử nghiệm luồng duyệt AI.',
          data: pendingItem
        });
      }

      // Direct Admin Post: Bypass Gemini moderation, publish directly to recipes collection
      const newAdminRecipe: Recipe = {
        id: newRecipeId,
        title,
        description: description || 'Công thức chính thức từ Ban Quản Trị.',
        image: defaultImage,
        prepTime: prepTime || '30 Phút',
        cookTime: cookTime || '20 Phút',
        servings: servings || '3-4 Người',
        difficulty: difficulty || 'Dễ',
        calories: Number(calories) || 350,
        nutrition: {
          calories: Number(calories) || 350,
          protein: Number(protein) || 24,
          fat: Number(fat) || 12,
          carbs: Number(carbs) || 35
        },
        categories: categories && categories.length > 0 ? categories : ['Đồ mặn', 'Tất cả'],
        ingredients: structuredIngredients.length > 0 ? structuredIngredients : [{ name: 'Nguyên liệu chính', amount: '500g' }],
        spiceIngredients: structuredSpices,
        steps: structuredSteps.length > 0 ? structuredSteps : [{ step: 1, title: 'Chuẩn bị và nấu', description: 'Thực hiện theo hướng dẫn món ăn.' }],
        rating: 5.0,
        reviewCount: 1,
        author: {
          name: 'Ban Quản Trị',
          badge: 'Official Chef'
        },
        isSaved: false,
        isCustom: false,
        posted_by_admin: true,
        admin_email: auth.email,
        approved_at: new Date().toISOString(),
        approved_by: auth.email,
        createdAt: new Date().toISOString().split('T')[0]
      };

      recipesStore.unshift(newAdminRecipe);
      res.json({
        success: true,
        status: 'published',
        message: 'Đã đăng bài thành công trực tiếp vào kho công thức!',
        data: newAdminRecipe
      });
    } catch (err: any) {
      console.error('Error posting admin recipe:', err);
      res.status(500).json({ success: false, error: err.message || 'Lỗi đăng bài Admin.' });
    }
  });

  // 11. Admin: Archive recipe (Protected)
  app.post('/api/admin/recipes/:id/archive', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const index = recipesStore.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức để gỡ bài' });
    }

    const recipe = recipesStore[index];
    recipesStore.splice(index, 1);

    const archivedItem: ArchivedRecipe = {
      ...recipe,
      archivedAt: new Date().toISOString(),
      archivedBy: auth.email || 'Admin',
      archiveReason: reason || 'Gỡ tạm thời bởi Ban Quản Trị'
    };

    archivedStore.unshift(archivedItem);
    res.json({
      success: true,
      message: `Đã gỡ bài "${recipe.title}" và chuyển vào mục lưu trữ (Archived). Bạn có thể khôi phục bất cứ lúc nào.`,
      data: archivedItem
    });
  });

  // 12. Admin: Restore archived recipe (Protected)
  app.post('/api/admin/recipes/:id/restore', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }

    const { id } = req.params;
    const index = archivedStore.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức trong kho lưu trữ' });
    }

    const archivedItem = archivedStore[index];
    archivedStore.splice(index, 1);

    // Remove archive metadata
    const { archivedAt, archivedBy, archiveReason, ...restoredRecipe } = archivedItem;
    recipesStore.unshift(restoredRecipe);

    res.json({
      success: true,
      message: `Đã khôi phục món "${restoredRecipe.title}" về kho công thức công khai!`,
      data: restoredRecipe
    });
  });

  // 13. Admin: Get archived recipes list (Protected)
  app.get('/api/admin/archived', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }
    res.json({ success: true, data: archivedStore });
  });

  // 14. Admin: Get Admin users list (Protected)
  app.get('/api/admin/admin-users', async (req, res) => {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(auth.status || 401).json({ success: false, error: auth.error });
    }
    res.json({ success: true, data: adminUsersStore });
  });

  // 15. Admin: Register new admin email into admin_users (Protected or Initial setup)
  app.post('/api/admin/register-admin', async (req, res) => {
    const { email, role, displayName } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email không hợp lệ' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = adminUsersStore.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.json({ success: true, message: `Email ${cleanEmail} đã tồn tại trong admin_users`, data: existing });
    }

    const newAdmin: AdminUser = {
      email: cleanEmail,
      role: role || 'admin',
      createdAt: new Date().toISOString(),
      displayName: displayName || cleanEmail.split('@')[0]
    };

    adminUsersStore.push(newAdmin);
    res.json({ success: true, message: `Đã cấp quyền admin cho ${cleanEmail}`, data: newAdmin });
  });

  // 8. Toggle Favorite
  app.post('/api/recipes/:id/favorite', (req, res) => {
    const recipe = recipesStore.find(r => r.id === req.params.id);
    if (recipe) {
      recipe.isSaved = !recipe.isSaved;
      return res.json({ success: true, isSaved: recipe.isSaved });
    }
    res.status(404).json({ success: false, error: 'Recipe not found' });
  });

  // Helper to calculate recipe ratings from reviews
  function updateRecipeRatingStats(recipeId: string): { average_rating: number; review_count: number } {
    const reviews = reviewsStore[recipeId] || [];
    const count = reviews.length;
    let avg = 5.0;
    if (count > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avg = Math.round((sum / count) * 10) / 10;
    }
    
    // Update main recipe document in memory
    const recipe = recipesStore.find(r => r.id === recipeId) || pendingStore.find(r => r.id === recipeId);
    if (recipe) {
      recipe.average_rating = avg;
      recipe.review_count = Math.max(recipe.reviewCount || 0, count);
      recipe.rating = avg;
      recipe.reviewCount = Math.max(recipe.reviewCount || 0, count);
    }
    
    return { average_rating: avg, review_count: recipe?.reviewCount || count };
  }

  // 9. Recipe Reviews & Rating System Endpoints
  // GET reviews for a recipe
  app.get('/api/recipes/:id/reviews', (req, res) => {
    const recipeId = req.params.id;
    const sortBy = (req.query.sort as string) || 'newest';
    const list = [...(reviewsStore[recipeId] || [])];

    if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const stats = updateRecipeRatingStats(recipeId);
    res.json({
      success: true,
      data: list,
      stats
    });
  });

  // Shared handler for creating or updating reviews via /api/recipes/:id/reviews or /api/recipes/:id/comments
  const handleCreateOrUpdateReview = (req: express.Request, res: express.Response) => {
    const recipeId = req.params.id;
    const { 
      author_uid, 
      author_name, 
      userName, 
      author_avatar, 
      userAvatar, 
      rating, 
      comment, 
      content 
    } = req.body;

    const uid = author_uid || req.body.uid;
    const name = (author_name || userName || '').trim();
    const rawComment = comment !== undefined ? comment : content;

    // 1. Kiểm tra đăng nhập
    if (!uid || !name) {
      return res.status(401).json({ 
        success: false, 
        error: 'Bạn cần đăng nhập để gửi đánh giá cho công thức này.' 
      });
    }

    // 2. Kiểm tra rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Đánh giá sao không hợp lệ (phải từ 1 đến 5 sao).' 
      });
    }

    // 3. Kiểm tra nội dung bình luận
    if (rawComment === undefined || rawComment === null || typeof rawComment !== 'string' || !rawComment.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng nhập nội dung đánh giá của bạn.' 
      });
    }

    const cleanComment = rawComment.trim().slice(0, 500);

    const recipe = recipesStore.find(r => r.id === recipeId) || pendingStore.find(r => r.id === recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy công thức.' });
    }

    // Rate limit: 2 giây để tránh spam liên tục
    const rateKey = `${uid}_${recipeId}`;
    const now = Date.now();
    const lastActionTime = reviewRateLimits.get(rateKey) || 0;
    if (now - lastActionTime < 2000) {
      return res.status(429).json({ 
        success: false, 
        error: 'Bạn đang thao tác quá nhanh, vui lòng đợi 2 giây.' 
      });
    }
    reviewRateLimits.set(rateKey, now);

    if (!reviewsStore[recipeId]) {
      reviewsStore[recipeId] = [];
    }

    const avatar = author_avatar || userAvatar || '';
    const existingIndex = reviewsStore[recipeId].findIndex(r => r.author_uid === uid);
    let resultReview: RecipeReview;

    if (existingIndex >= 0) {
      // Update existing review
      const existing = reviewsStore[recipeId][existingIndex];
      resultReview = {
        ...existing,
        author_name: name,
        author_avatar: avatar || existing.author_avatar,
        rating: Math.round(numRating),
        comment: cleanComment,
        updated_at: new Date().toISOString(),
        edited: true
      };
      reviewsStore[recipeId][existingIndex] = resultReview;
    } else {
      // Create new review
      resultReview = {
        id: `rev_${uid}`,
        recipe_id: recipeId,
        author_uid: uid,
        author_name: name,
        author_avatar: avatar || undefined,
        rating: Math.round(numRating),
        comment: cleanComment,
        created_at: new Date().toISOString(),
        edited: false
      };
      reviewsStore[recipeId].unshift(resultReview);
    }

    // Sync to commentsStore
    syncReviewsToComments(recipeId);

    const stats = updateRecipeRatingStats(recipeId);

    const responseItem = {
      ...resultReview,
      userName: resultReview.author_name,
      userAvatar: resultReview.author_avatar,
      content: resultReview.comment,
      createdAt: 'Vừa xong'
    };

    res.json({
      success: true,
      message: existingIndex >= 0 ? 'Đã cập nhật đánh giá của bạn thành công!' : 'Đã đăng đánh giá thành công!',
      data: responseItem,
      review: resultReview,
      stats
    });
  };

  app.post('/api/recipes/:id/reviews', handleCreateOrUpdateReview);
  app.post('/api/recipes/:id/comments', handleCreateOrUpdateReview);

  // PUT edit an existing review
  app.put('/api/recipes/:id/reviews/:reviewId', (req, res) => {
    const { id: recipeId, reviewId } = req.params;
    const { author_uid, rating, comment } = req.body;

    if (!author_uid) {
      return res.status(401).json({ success: false, error: 'Thiếu thông tin xác thực tác giả.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Đánh giá sao phải từ 1 đến 5 sao.' });
    }

    if (!reviewsStore[recipeId]) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đánh giá cho công thức này.' });
    }

    const reviewIndex = reviewsStore[recipeId].findIndex(r => r.id === reviewId || r.author_uid === author_uid);
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đánh giá cần sửa.' });
    }

    const existing = reviewsStore[recipeId][reviewIndex];
    if (existing.author_uid !== author_uid) {
      return res.status(403).json({ success: false, error: 'Bạn chỉ có thể sửa đánh giá của chính mình.' });
    }

    // Rate limit check
    const rateKey = `${author_uid}_${recipeId}`;
    const now = Date.now();
    const lastActionTime = reviewRateLimits.get(rateKey) || 0;
    if (now - lastActionTime < 2000) {
      return res.status(429).json({ 
        success: false, 
        error: 'Vui lòng đợi 2 giây trước khi thao tác tiếp.' 
      });
    }
    reviewRateLimits.set(rateKey, now);

    const cleanComment = typeof comment === 'string' ? comment.trim().slice(0, 500) : '';

    const updatedReview: RecipeReview = {
      ...existing,
      rating: Math.round(numRating),
      comment: cleanComment,
      updated_at: new Date().toISOString(),
      edited: true
    };

    reviewsStore[recipeId][reviewIndex] = updatedReview;
    syncReviewsToComments(recipeId);
    const stats = updateRecipeRatingStats(recipeId);

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      data: updatedReview,
      stats
    });
  });

  // DELETE a review
  app.delete('/api/recipes/:id/reviews/:reviewId', (req, res) => {
    const { id: recipeId, reviewId } = req.params;
    const { author_uid } = req.body;

    if (!reviewsStore[recipeId]) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy danh sách đánh giá.' });
    }

    const reviewIndex = reviewsStore[recipeId].findIndex(r => r.id === reviewId || r.author_uid === author_uid);
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đánh giá cần xoá.' });
    }

    const existing = reviewsStore[recipeId][reviewIndex];
    if (author_uid && existing.author_uid !== author_uid) {
      return res.status(403).json({ success: false, error: 'Bạn chỉ có quyền xoá đánh giá của chính mình.' });
    }

    reviewsStore[recipeId].splice(reviewIndex, 1);
    syncReviewsToComments(recipeId);
    const stats = updateRecipeRatingStats(recipeId);

    res.json({
      success: true,
      message: 'Đã xoá đánh giá thành công.',
      stats
    });
  });

  // ================= PRODUCTS / AFFILIATE STORE API =================
  // GET all products
  app.get('/api/products', (req, res) => {
    res.json({
      success: true,
      data: productsStore
    });
  });

  // POST create a new affiliate product
  app.post('/api/products', (req, res) => {
    try {
      const {
        name,
        productCode,
        affiliateUrl,
        platform = 'shopee',
        platformName,
        category = 'tools',
        price = 0,
        priceMax,
        originalPrice,
        image,
        images = [],
        shortDescription = '',
        description = '',
        brand = 'Chính hãng',
        origin = 'Việt Nam',
        specifications = {},
        features = [],
        badge,
        inStock = true,
        stockCount = 99
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Tên sản phẩm không được để trống' });
      }

      if (!affiliateUrl || !affiliateUrl.trim()) {
        return res.status(400).json({ success: false, error: 'Link sàn TMĐT (Affiliate URL) không được để trống' });
      }

      const code = productCode && productCode.trim() 
        ? productCode.trim().toUpperCase() 
        : `SP-${Date.now().toString(36).toUpperCase()}`;

      // Collect images array
      const imageList: string[] = [];
      if (image && image.trim()) imageList.push(image.trim());
      if (Array.isArray(images)) {
        images.forEach((img: any) => {
          if (typeof img === 'string' && img.trim() && !imageList.includes(img.trim())) {
            imageList.push(img.trim());
          }
        });
      }
      const primaryImage = imageList[0] || 'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80';

      const newProduct: ProductItem = {
        id: `prod-${Date.now()}`,
        productCode: code,
        name: name.trim(),
        affiliateUrl: affiliateUrl.trim(),
        platform: platform as any,
        platformName: platformName || (platform === 'shopee' ? 'Shopee' : platform === 'lazada' ? 'Lazada' : platform === 'tiki' ? 'Tiki' : platform === 'tiktok' ? 'TikTok Shop' : 'Sàn TMĐT'),
        category: category as any,
        price: Number(price) || 0,
        priceMax: priceMax ? Number(priceMax) : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        image: primaryImage,
        images: imageList,
        gallery: imageList.slice(1),
        rating: 5.0,
        reviewCount: 1,
        salesCount: 0,
        badge: badge || 'Mới',
        brand: brand.trim(),
        origin: origin.trim(),
        inStock: inStock !== false,
        stockCount: Number(stockCount) || 99,
        shortDescription: shortDescription.trim() || description.substring(0, 100),
        description: description.trim(),
        specifications: typeof specifications === 'object' && specifications !== null ? specifications : {},
        features: Array.isArray(features) ? features.filter(Boolean) : []
      };

      productsStore.unshift(newProduct);

      res.json({
        success: true,
        message: 'Đăng sản phẩm dụng cụ tiếp thị liên kết thành công!',
        data: newProduct
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi lưu sản phẩm' });
    }
  });

  // PUT update product
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = productsStore.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm.' });
    }

    const existing = productsStore[index];
    const updated: ProductItem = {
      ...existing,
      ...req.body,
      id: existing.id // preserve ID
    };

    productsStore[index] = updated;
    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công!',
      data: updated
    });
  });

  // DELETE product
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = productsStore.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm.' });
    }

    productsStore.splice(index, 1);
    res.json({
      success: true,
      message: 'Đã xoá sản phẩm thành công!'
    });
  });

  // Vite Middleware for dev / static for prod
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidatePaths = [
      path.join(process.cwd(), 'dist'),
      path.resolve(__dirname),
      path.resolve(__dirname, '..', 'dist')
    ];
    const distPath = candidatePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || candidatePaths[0];

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ăn Gì Hôm Nay Server (${isProduction ? 'production' : 'development'}) listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
