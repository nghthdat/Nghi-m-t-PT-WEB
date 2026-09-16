import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Check, X, AlertTriangle, Sparkles, 
  Lock, Eye, Flame, Clock, Users, RefreshCw, ChefHat, 
  Send, Plus, Trash2, Archive, RotateCcw, Search, Filter, 
  HelpCircle, Info, Key, LogOut, BookOpen, AlertCircle, FileText, CheckCircle2, Camera
} from 'lucide-react';
import { 
  PendingRecipe, 
  Recipe, 
  RejectedRecipe, 
  ArchivedRecipe, 
  AdminDashboardStats 
} from '../types';
import { 
  auth, 
  db,
  checkIsAdminUser, 
  registerAdminUserDoc, 
  getAdminAuthToken, 
  initActivityTracker,
  setAdminSession,
  getAdminSession,
  clearAdminSession
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { ImageUploadDropzone } from './ImageUploadDropzone';
import { OptimizedImage } from './OptimizedImage';
import { ChangeDishImageModal } from './ChangeDishImageModal';

interface AdminScreenProps {
  onRecipeApproved: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onBackToHome?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  onRecipeApproved,
  onSelectRecipe,
  onBackToHome
}) => {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  
  // Login Form (Pre-populated or ready for input)
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);

  // Guide Modal
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'dashboard' | 'pending' | 'new-post' | 'recipes' | 'archived' | 'rejected'>('dashboard');

  // Data states
  const [stats, setStats] = useState<AdminDashboardStats>({
    pendingCount: 0,
    recipesCount: 0,
    totalUsersCount: 0,
    rejectedLast7DaysCount: 0
  });
  const [pendingList, setPendingList] = useState<PendingRecipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [rejectedList, setRejectedList] = useState<RejectedRecipe[]>([]);
  const [archivedList, setArchivedList] = useState<ArchivedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Inspect Modal
  const [inspectRecipe, setInspectRecipe] = useState<PendingRecipe | Recipe | null>(null);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<PendingRecipe | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  // Recipes search & filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Tất cả');
  const [recipeToChangeImage, setRecipeToChangeImage] = useState<Recipe | null>(null);

  // Admin New Post Form state
  const [postTitle, setPostTitle] = useState<string>('');
  const [postDescription, setPostDescription] = useState<string>('');
  const [postImage, setPostImage] = useState<string>('');
  const [postPrepTime, setPostPrepTime] = useState<string>('25 Phút');
  const [postCookTime, setPostCookTime] = useState<string>('15 Phút');
  const [postServings, setPostServings] = useState<string>('4 Người');
  const [postDifficulty, setPostDifficulty] = useState<'Dễ' | 'Rất dễ' | 'Trung bình' | 'Khó'>('Dễ');
  const [postCalories, setPostCalories] = useState<number>(350);
  const [postProtein, setPostProtein] = useState<number>(25);
  const [postFat, setPostFat] = useState<number>(12);
  const [postCarbs, setPostCarbs] = useState<number>(35);
  const [postCategories, setPostCategories] = useState<string[]>(['Đồ mặn', 'Tất cả']);
  const [ingredientsList, setIngredientsList] = useState<Array<{ name: string; amount: string }>>([
    { name: 'Thịt bò phi lê', amount: '300g' },
    { name: 'Hành tây', amount: '1 củ' },
    { name: 'Tỏi băm', amount: '1 thìa' }
  ]);
  const [stepsList, setStepsList] = useState<Array<{ step: number; title: string; description: string }>>([
    { step: 1, title: 'Sơ chế nguyên liệu', description: 'Rửa sạch thịt bò, thái lát mỏng vừa ăn. Bóc vỏ hành tây thái múi cau.' },
    { step: 2, title: 'Xào chín tới', description: 'Phi thơm tỏi, cho thịt bò xào lửa lớn trong 2 phút rồi cho hành tây vào đảo đều, nêm gia vị vừa ăn.' }
  ]);
  const [submitForReviewToggle, setSubmitForReviewToggle] = useState<boolean>(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // Authenticated fetch wrapper
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getAdminAuthToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  }, []);

  // Show Toast
  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => {
      setActionToast(null);
    }, 4000);
  };

  // Auth Listener & Session Check
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialSession = async () => {
      setIsAuthChecking(true);
      // 1. Check local admin session
      const savedSession = getAdminSession();
      if (savedSession) {
        if (isMounted) {
          setAdminEmail(savedSession.email);
          setIsAdminVerified(true);
          setIsAuthChecking(false);
        }
        return;
      }

      // 2. Check Firebase Auth user
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;
        if (user && user.email) {
          const cleanEmail = user.email.toLowerCase().trim();
          const isAdmin = await checkIsAdminUser(cleanEmail);
          if (isAdmin || cleanEmail === 'datnhatquang@gmail.com') {
            setCurrentUser(user);
            setAdminEmail(cleanEmail);
            setIsAdminVerified(true);
            setLoginError(null);
          } else {
            await signOut(auth);
            setCurrentUser(null);
            setAdminEmail('');
            setIsAdminVerified(false);
            setLoginError(`Tài khoản "${user.email}" không có quyền quản trị viên.`);
          }
        } else {
          setCurrentUser(null);
          setAdminEmail('');
          setIsAdminVerified(false);
        }
        setIsAuthChecking(false);
      });

      return unsubscribe;
    };

    checkInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Idle Tracker (2 hours timeout)
  useEffect(() => {
    if (isAdminVerified) {
      const cleanup = initActivityTracker(async () => {
        clearAdminSession();
        await signOut(auth);
        setCurrentUser(null);
        setAdminEmail('');
        setIsAdminVerified(false);
        alert('Phiên làm việc đã tự động kết thúc sau 2 giờ không hoạt động để đảm bảo an toàn.');
      });
      return cleanup;
    }
  }, [isAdminVerified]);

  // Fetch Dashboard Stats & Lists
  const loadAdminData = useCallback(async () => {
    if (!isAdminVerified) return;
    setIsLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetchWithAuth('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Pending
      const pendingRes = await fetchWithAuth('/api/pending-recipes');
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setPendingList(pendingData.data);
      }

      // 3. Recipes
      const recipesRes = await fetch('/api/recipes');
      const recipesData = await recipesRes.json();
      if (recipesData.success) {
        setAllRecipes(recipesData.data);
      }

      // 4. Rejected
      const rejectedRes = await fetchWithAuth('/api/admin/rejected');
      const rejectedData = await rejectedRes.json();
      if (rejectedData.success) {
        setRejectedList(rejectedData.data);
      }

      // 5. Archived
      const archivedRes = await fetchWithAuth('/api/admin/archived');
      const archivedData = await archivedRes.json();
      if (archivedData.success) {
        setArchivedList(archivedData.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdminVerified, fetchWithAuth]);

  useEffect(() => {
    if (isAdminVerified) {
      loadAdminData();
    }
  }, [isAdminVerified, loadAdminData]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoggingIn(true);
    try {
      // 1. First try Firebase Auth
      let firebaseSuccess = false;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        if (cred.user && cred.user.email) {
          const isAdmin = await checkIsAdminUser(cred.user.email);
          if (isAdmin || cred.user.email === 'datnhatquang@gmail.com') {
            setCurrentUser(cred.user);
            setAdminEmail(cred.user.email);
            setIsAdminVerified(true);
            showToast(`Chào mừng Quản trị viên ${cred.user.email}!`);
            firebaseSuccess = true;
          }
        }
      } catch (fbErr: any) {
        // Fall through to server-side admin verification
        console.log('Firebase Auth direct sign-in skipped/failed, trying secure admin login route:', fbErr.message);
      }

      if (firebaseSuccess) {
        setIsLoggingIn(false);
        return;
      }

      // 2. Server-side Admin authentication route
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const data = await res.json();
      if (data.success && data.token) {
        setAdminSession(data.token, data.user?.email || cleanEmail);
        setAdminEmail(data.user?.email || cleanEmail);
        setIsAdminVerified(true);
        showToast(`Chào mừng Quản trị viên ${data.user?.displayName || cleanEmail}!`);
      } else {
        setLoginError(data.error || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      clearAdminSession();
      await signOut(auth);
      setCurrentUser(null);
      setAdminEmail('');
      setIsAdminVerified(false);
      showToast('Đã đăng xuất tài khoản quản trị.');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Password Reset
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus('Vui lòng nhập địa chỉ email nhận link đặt lại mật khẩu.');
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus(`Đã gửi email khôi phục mật khẩu tới ${resetEmail}. Hãy kiểm tra hòm thư của bạn.`);
    } catch (err: any) {
      setResetStatus('Lỗi: ' + (err.message || 'Không thể gửi email đặt lại mật khẩu.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle Approve with Duplicate Protection
  const handleApproveRecipe = async (id: string, forceApprove = false) => {
    const item = pendingList.find(p => p.id === id);
    if (item?.isDuplicate && !forceApprove) {
      const confirmForce = window.confirm(
        `⚠️ CẢNH BÁO AI KIỂM DUYỆT TRÙNG LẶP:\n\nMón "${item.title}" đã bị AI xác định TRÙNG LẶP với món "${item.duplicateDishName}".\nQuy chế hệ thống: Món đã có sẽ KHÔNG ĐƯỢC DUYỆT.\n\nBạn có chắc chắn muốn duyệt ngoại lệ (Bỏ qua cảnh báo) không?`
      );
      if (!confirmForce) return;
      forceApprove = true;
    }

    try {
      const res = await fetchWithAuth(`/api/admin/approve/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceApprove })
      });
      const data = await res.json();
      if (data.success) {
        setPendingList(prev => prev.filter(p => p.id !== id));
        setAllRecipes(prev => [data.data, ...prev]);
        setStats(prev => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          recipesCount: prev.recipesCount + 1
        }));
        onRecipeApproved(data.data);
        if (inspectRecipe?.id === id) setInspectRecipe(null);
        showToast(`✓ Đã duyệt và xuất bản: ${data.data.title}`);
      } else {
        alert(data.error || 'Duyệt bài thất bại');
      }
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  // Handle Recheck Duplicate with AI
  const handleRecheckDuplicate = async (id: string) => {
    try {
      showToast('AI đang quét kiểm tra trùng lặp...');
      const res = await fetchWithAuth(`/api/admin/recheck-duplicate/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPendingList(prev => prev.map(p => p.id === id ? data.data : p));
        if (data.dupResult?.isDuplicate) {
          showToast(`⚠️ AI phát hiện trùng với món: "${data.dupResult.duplicateDishName}" (${data.dupResult.duplicateSimilarity}%)`);
        } else {
          showToast('✓ AI xác nhận: Món ăn độc nhất, không trùng lặp!');
        }
      } else {
        alert(data.error || 'Kiểm tra thất bại.');
      }
    } catch (err) {
      console.error('Recheck duplicate error:', err);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const reason = customRejectReason.trim() || 'Nội dung chưa đạt tiêu chuẩn kiểm duyệt chất lượng món ăn.';
    try {
      const res = await fetchWithAuth(`/api/admin/reject/${rejectingItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        const rejectedDoc = data.data;
        setPendingList(prev => prev.filter(p => p.id !== rejectingItem.id));
        setRejectedList(prev => [rejectedDoc, ...prev]);
        setStats(prev => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          rejectedLast7DaysCount: prev.rejectedLast7DaysCount + 1
        }));
        if (inspectRecipe?.id === rejectingItem.id) setInspectRecipe(null);
        setRejectingItem(null);
        setCustomRejectReason('');
        showToast(`Đã từ chối công thức "${rejectingItem.title}"`);
      } else {
        alert(data.error || 'Từ chối bài thất bại');
      }
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  // Handle Archive Recipe (Gỡ bài)
  const handleArchiveRecipe = async (recipe: Recipe) => {
    const reason = prompt(`Nhập lý do gỡ bài "${recipe.title}" (Lưu vào kho lưu trữ):`, 'Gỡ tạm thời để cập nhật hình ảnh / nội dung');
    if (reason === null) return;

    try {
      const res = await fetchWithAuth(`/api/admin/recipes/${recipe.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setAllRecipes(prev => prev.filter(r => r.id !== recipe.id));
        setArchivedList(prev => [data.data, ...prev]);
        setStats(prev => ({
          ...prev,
          recipesCount: Math.max(0, prev.recipesCount - 1)
        }));
        showToast(`Đã gỡ bài "${recipe.title}" vào kho lưu trữ (Archived)`);
      } else {
        alert(data.error || 'Gỡ bài thất bại');
      }
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  // Handle Restore Recipe (Khôi phục)
  const handleRestoreRecipe = async (archivedItem: ArchivedRecipe) => {
    try {
      const res = await fetchWithAuth(`/api/admin/recipes/${archivedItem.id}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setArchivedList(prev => prev.filter(a => a.id !== archivedItem.id));
        setAllRecipes(prev => [data.data, ...prev]);
        setStats(prev => ({
          ...prev,
          recipesCount: prev.recipesCount + 1
        }));
        showToast(`Đã khôi phục món "${archivedItem.title}" thành công!`);
      } else {
        alert(data.error || 'Khôi phục bài thất bại');
      }
    } catch (err) {
      console.error('Restore error:', err);
    }
  };

  // Handle Admin Direct Post Submit
  const handleAdminPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      alert('Vui lòng nhập tên món ăn.');
      return;
    }

    const validIngredients = ingredientsList.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) {
      alert('Vui lòng nhập ít nhất 1 nguyên liệu.');
      return;
    }

    const validSteps = stepsList.filter(s => s.description.trim() !== '');
    if (validSteps.length === 0) {
      alert('Vui lòng nhập ít nhất 1 bước thực hiện.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetchWithAuth('/api/admin/new-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          description: postDescription.trim(),
          image: postImage.trim(),
          prepTime: postPrepTime,
          cookTime: postCookTime,
          servings: postServings,
          difficulty: postDifficulty,
          calories: Number(postCalories),
          protein: Number(postProtein),
          fat: Number(postFat),
          carbs: Number(postCarbs),
          categories: postCategories,
          ingredients: validIngredients,
          steps: validSteps,
          submitForReview: submitForReviewToggle
        })
      });

      const data = await res.json();
      if (data.success) {
        if (submitForReviewToggle) {
          setPendingList(prev => [data.data, ...prev]);
          setStats(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }));
          setAdminTab('pending');
          showToast(`Đã gửi "${postTitle}" vào hàng đợi duyệt AI.`);
        } else {
          setAllRecipes(prev => [data.data, ...prev]);
          setStats(prev => ({ ...prev, recipesCount: prev.recipesCount + 1 }));
          onRecipeApproved(data.data);
          setAdminTab('recipes');
          showToast(`Đã xuất bản trực tiếp món "${postTitle}"!`);
        }

        // Reset form
        setPostTitle('');
        setPostDescription('');
        setPostImage('');
      } else {
        alert(data.error || 'Đăng bài thất bại');
      }
    } catch (err: any) {
      console.error('Admin post error:', err);
      alert('Lỗi đăng bài: ' + err.message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Filtered recipes
  const filteredRecipes = allRecipes.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = selectedTag === 'Tất cả' || r.categories.includes(selectedTag);
    return matchSearch && matchTag;
  });

  // Loading indicator for initial auth check
  if (isAuthChecking) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#a33e07] animate-spin mx-auto" />
        <p className="text-xs text-[#8C7D6F] font-medium">Đang kiểm tra quyền hạn quản trị viên...</p>
      </div>
    );
  }

  // LOGIN SCREEN (If not authenticated as admin)
  if (!isAdminVerified) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-3xl p-8 border border-[#EAE0D5] shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#2B2118]">Quản Trị Viên & Kiểm Duyệt</h2>
          <p className="text-xs text-[#6B5D4F] mt-1">
            Xác thực bảo mật qua Firebase Authentication và Firestore <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">admin_users</code>.
          </p>
        </div>

        {/* Error notification */}
        {loginError && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-start gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{loginError}</div>
          </div>
        )}

        {/* Action Toast */}
        {actionToast && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionToast}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">Email Quản trị</label>
              <input
                type="email"
                required
                placeholder="admin@angi.vn hoặc email của bạn"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2B2118]">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetEmail(emailInput);
                    setResetStatus(null);
                  }}
                  className="text-[11px] text-[#a33e07] font-semibold hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu tài khoản Firebase"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang xác thực tài khoản...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Đăng nhập Quản trị viên
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendPasswordReset} className="space-y-4 text-left">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              Nhập email quản trị để nhận link đặt lại mật khẩu từ Firebase Authentication.
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">Email cần khôi phục</label>
              <input
                type="email"
                required
                placeholder="Nhập email của bạn"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>

            {resetStatus && (
              <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200">
                {resetStatus}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSendingReset}
                className="flex-1 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isSendingReset ? 'Đang gửi...' : 'Gửi link reset'}
              </button>
            </div>
          </form>
        )}

        {/* Guide button & Back to home */}
        <div className="pt-4 border-t border-[#F7F2EE] flex flex-col gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-[#6B5D4F] hover:text-[#2B2118] py-2 px-3 rounded-xl border border-[#EAE0D5] hover:bg-[#F7F2EE] transition-colors"
            >
              ← Quay lại trang chủ
            </button>
          )}
          <button
            onClick={() => setShowGuideModal(true)}
            className="text-xs font-bold text-[#a33e07] hover:text-[#8c3405] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#FFF0E6] hover:bg-[#FFE0CC] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Hướng dẫn tạo tài khoản Admin đầu tiên qua Firebase Console
          </button>
        </div>

        {/* Modal Guide */}
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-left space-y-4 border border-[#EAE0D5] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
                <h3 className="font-bold text-sm text-[#2B2118] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#a33e07]" />
                  Các bước tạo tài khoản Admin trong Firebase
                </h3>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-[#8C7D6F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#524436] leading-relaxed">
                <p>
                  Để đảm bảo bảo mật tuyệt đối, hệ thống <strong>KHÔNG</strong> sinh mật khẩu mặc định sẵn trong mã nguồn. Hãy tạo tài khoản thật theo 3 bước sau:
                </p>
                <div className="p-3 bg-[#FFF8F0] rounded-2xl border border-[#EAE0D5] space-y-2">
                  <p><strong>Bước 1: Tạo tài khoản Auth</strong></p>
                  <p>Truy cập <em>Firebase Console &gt; Authentication &gt; Users &gt; Add user</em>. Nhập Email (ví dụ: <code className="bg-white px-1 py-0.5 rounded border border-[#EAE0D5]">datnhatquang@gmail.com</code>) và mật khẩu của bạn.</p>
                </div>
                <div className="p-3 bg-[#FFF8F0] rounded-2xl border border-[#EAE0D5] space-y-2">
                  <p><strong>Bước 2: Phân quyền trong Firestore</strong></p>
                  <p>Truy cập <em>Firestore Database &gt; Collection <code>admin_users</code></em> &gt; Thêm document có Document ID là chính email đó, kèm field <code>role: "admin"</code>.</p>
                </div>
                <div className="p-3 bg-[#FFF8F0] rounded-2xl border border-[#EAE0D5] space-y-2">
                  <p><strong>Bước 3: Đăng nhập</strong></p>
                  <p>Quay lại form đăng nhập này, nhập Email và Mật khẩu vừa tạo để truy cập toàn quyền trang Admin.</p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#a33e07] text-white text-xs font-bold"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-[#EAE0D5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a33e07] to-[#e8703a] text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#2B2118]">Trung Tâm Quản Trị & Kiểm Duyệt</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Firebase Active
              </span>
            </div>
            <p className="text-xs text-[#6B5D4F] mt-0.5">
              Đăng nhập: <strong className="text-[#2B2118]">{currentUser?.email || adminEmail || 'Quản trị viên'}</strong> (Tự động đăng xuất sau 2h không hoạt động)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF8F0] hover:bg-[#F7F2EE] text-[#6B5D4F] border border-[#EAE0D5] text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {actionToast}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#EAE0D5]">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'dashboard'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Flame className="w-4 h-4" />
          Tổng quan Dashboard
        </button>

        <button
          onClick={() => setAdminTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer relative ${
            adminTab === 'pending'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Duyệt bài chờ ({pendingList.length})
          {pendingList.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          onClick={() => setAdminTab('new-post')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'new-post'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Plus className="w-4 h-4" />
          Đăng bài mới (Admin)
        </button>

        <button
          onClick={() => setAdminTab('recipes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'recipes'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Quản lý công thức ({allRecipes.length})
        </button>

        <button
          onClick={() => setAdminTab('archived')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'archived'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <Archive className="w-4 h-4" />
          Kho lưu trữ / Đã gỡ ({archivedList.length})
        </button>

        <button
          onClick={() => setAdminTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'rejected'
              ? 'bg-[#a33e07] text-white shadow-sm shadow-[#a33e07]/20'
              : 'bg-white text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
          }`}
        >
          <X className="w-4 h-4" />
          Lịch sử từ chối ({rejectedList.length})
        </button>
      </div>

      {/* 1. DASHBOARD TAB */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Real-time Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7D6F]">
                <span className="text-xs font-bold">Chờ duyệt (Pending)</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[#2B2118]">{stats.pendingCount}</div>
              <p className="text-[11px] text-[#8C7D6F]">Cần kiểm tra và duyệt</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7D6F]">
                <span className="text-xs font-bold">Món đã xuất bản (Recipes)</span>
                <ChefHat className="w-4 h-4 text-[#a33e07]" />
              </div>
              <div className="text-2xl font-black text-[#a33e07]">{stats.recipesCount}</div>
              <p className="text-[11px] text-[#8C7D6F]">Đang hiển thị công khai</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7D6F]">
                <span className="text-xs font-bold">Tổng số User & Đầu bếp</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-[#2B2118]">{stats.totalUsersCount}</div>
              <p className="text-[11px] text-[#8C7D6F]">Thành viên cộng đồng</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7D6F]">
                <span className="text-xs font-bold">Bị từ chối (7 ngày qua)</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-600">{stats.rejectedLast7DaysCount}</div>
              <p className="text-[11px] text-[#8C7D6F]">Lưu vào collection rejected</p>
            </div>
          </div>

          {/* Quick Actions & Pending Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EAE0D5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#2B2118] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a33e07]" />
                  Bài đăng mới cần duyệt gần đây
                </h3>
                <button
                  onClick={() => setAdminTab('pending')}
                  className="text-xs font-bold text-[#a33e07] hover:underline"
                >
                  Xem tất cả ({pendingList.length})
                </button>
              </div>

              {pendingList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8C7D6F]">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2 p-1.5 bg-emerald-50 rounded-full" />
                  Hàng đợi kiểm duyệt hiện tại đang trống.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingList.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8F0] border border-[#EAE0D5]">
                      <div className="flex items-center gap-3">
                        <OptimizedImage
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover"
                          containerClassName="w-12 h-12 rounded-xl shrink-0"
                        />
                        <div>
                          <div className="font-bold text-xs text-[#2B2118]">{item.title}</div>
                          <div className="text-[11px] text-[#8C7D6F]">Tác giả: {item.author?.name || item.author_name || 'Đầu bếp'} • {item.prepTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRecipe(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Duyệt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#EAE0D5] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#2B2118] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a33e07]" />
                Phím tắt Quản trị viên
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setAdminTab('new-post')}
                  className="w-full p-3 rounded-xl bg-[#FFF8F0] hover:bg-[#FFE0CC] text-[#2B2118] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border border-[#EAE0D5]"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#a33e07]" />
                    Đăng công thức mới
                  </span>
                  <span className="text-[10px] text-[#8C7D6F]">Bỏ qua duyệt AI</span>
                </button>

                <button
                  onClick={() => setAdminTab('recipes')}
                  className="w-full p-3 rounded-xl bg-[#FFF8F0] hover:bg-[#FFE0CC] text-[#2B2118] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border border-[#EAE0D5]"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#a33e07]" />
                    Quản lý kho công thức
                  </span>
                  <span className="text-[10px] text-[#8C7D6F]">{allRecipes.length} món</span>
                </button>

                <button
                  onClick={() => setAdminTab('archived')}
                  className="w-full p-3 rounded-xl bg-[#FFF8F0] hover:bg-[#FFE0CC] text-[#2B2118] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border border-[#EAE0D5]"
                >
                  <span className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-[#a33e07]" />
                    Kho lưu trữ / Đã gỡ
                  </span>
                  <span className="text-[10px] text-[#8C7D6F]">{archivedList.length} món</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUYỆT BÀI TAB (PENDING MODERATION) */}
      {adminTab === 'pending' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#EAE0D5]">
            <div className="text-xs text-[#6B5D4F]">
              Danh sách các công thức chờ duyệt (Collection: <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">pending</code>).
            </div>
            <span className="text-xs font-bold text-[#2B2118]">{pendingList.length} bài chờ</span>
          </div>

          {pendingList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-xs space-y-3">
              <Check className="w-12 h-12 text-emerald-600 mx-auto p-2 bg-emerald-50 rounded-full" />
              <h3 className="font-bold text-base text-[#2B2118]">Không có bài đăng nào cần duyệt</h3>
              <p className="text-xs text-[#6B5D4F] max-w-sm mx-auto">
                Tất cả bài gửi mới đã được phê duyệt hoặc chuyển vào kho lưu trữ từ chối.
              </p>
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-[#EAE0D5] shadow-xs hover:border-[#a33e07]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full sm:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-[#F7F2EE] shrink-0">
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      aspectRatio="4/3"
                      allowZoom
                    />
                    {item.isDuplicate ? (
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                        <AlertTriangle className="w-3 h-3" />
                        TRÙNG LẶP
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                        Chờ duyệt
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#2B2118]">{item.title}</h3>
                          {item.isDuplicate && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                              KHÔNG ĐƯỢC DUYỆT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8C7D6F]">
                          Người gửi: <span className="font-semibold text-[#2B2118]">{item.author?.name || item.author_name || 'Đầu bếp'}</span> • {item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : 'Mới gửi'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#8C7D6F]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.prepTime}</span>
                        <span>•</span>
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{item.calories} kcal</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#524436] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* AI Review Reason & Duplicate Box */}
                    {item.isDuplicate ? (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-red-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            AI CẢNH BÁO: MÓN ĂN ĐÃ CÓ TRÊN HỆ THỐNG
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-extrabold">
                            {item.duplicateSimilarity ? `${item.duplicateSimilarity}% tương đồng` : 'Trùng lặp'}
                          </span>
                        </div>
                        <div className="text-xs text-red-900 font-semibold">
                          Trùng với món đã có: <span className="underline font-bold text-red-800">"{item.duplicateDishName}"</span>
                        </div>
                        {item.duplicateExplanation && (
                          <p className="text-xs text-red-800 italic leading-relaxed">
                            "{item.duplicateExplanation}"
                          </p>
                        )}
                        <div className="text-[11px] text-red-700 font-medium bg-red-100/60 p-2 rounded-lg">
                          ⚠️ <strong>Quy chế kiểm duyệt:</strong> Món đã có KHÔNG ĐƯỢC PHÉP DUYỆT. Khuyến nghị nhấn "Từ chối" để thông báo cho tác giả.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#FFE0CC] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#a33e07] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Đánh giá của Gemini AI:
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            item.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isValid ? '✓ Hợp lệ' : '✗ Cần lưu ý'}
                          </span>
                        </div>

                        <p className="text-xs text-[#524436]">
                          {item.aiReviewReason || 'Công thức chuẩn chỉnh, hợp lệ cho người dùng.'}
                        </p>

                        {item.aiSuggestedTags && item.aiSuggestedTags.length > 0 && (
                          <div className="flex items-center gap-1 pt-1">
                            <span className="text-[11px] text-[#8C7D6F] font-semibold">Tags:</span>
                            {item.aiSuggestedTags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#EAE0D5] text-[#524436]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#F7F2EE] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInspectRecipe(item)}
                      className="flex items-center gap-1 text-xs font-bold text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>

                    <button
                      onClick={() => handleRecheckDuplicate(item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-[#6B5D4F] hover:text-[#a33e07] transition-colors cursor-pointer"
                      title="Quét lại kiểm tra trùng lặp với AI"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Quét lại AI
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (item.isDuplicate) {
                          setCustomRejectReason(`Món ăn này đã có trên hệ thống (Trùng với món "${item.duplicateDishName}"). Theo quy chế cộng đồng, những món đã có sẽ không được duyệt.`);
                        }
                        setRejectingItem(item);
                      }}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Từ chối
                    </button>

                    <button
                      onClick={() => handleApproveRecipe(item.id)}
                      className={`flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.isDuplicate
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                          : 'bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white shadow-md shadow-[#a33e07]/20'
                      }`}
                      title={item.isDuplicate ? 'Cảnh báo: Món ăn trùng lặp' : 'Duyệt bài'}
                    >
                      <Check className="w-4 h-4" />
                      {item.isDuplicate ? 'Duyệt ngoại lệ' : 'Duyệt & Đăng ngay'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. ADMIN ĐĂNG BÀI MỚI (/admin/new-post) */}
      {adminTab === 'new-post' && (
        <form onSubmit={handleAdminPostSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D5] shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#2B2118]">Đăng công thức mới (Đặc quyền Quản trị)</h2>
              <p className="text-xs text-[#6B5D4F]">
                Lưu thẳng vào collection <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">recipes</code> (với field <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">posted_by_admin: true</code>) hoặc thử nghiệm luồng duyệt AI.
              </p>
            </div>

            {/* Toggle AI moderation test */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F0] border border-[#FFE0CC]">
              <div className="text-right">
                <div className="text-xs font-bold text-[#2B2118]">Đưa vào hàng chờ duyệt như bình thường</div>
                <div className="text-[10px] text-[#8C7D6F]">Thử nghiệm luồng thẩm định của Gemini AI</div>
              </div>
              <button
                type="button"
                onClick={() => setSubmitForReviewToggle(!submitForReviewToggle)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  submitForReviewToggle ? 'bg-[#a33e07]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  submitForReviewToggle ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bò xào hành cần chuẩn vị"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2118] block mb-1">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  placeholder="Giới thiệu hương vị, nét đặc trưng của món ăn..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                />
              </div>

              <ImageUploadDropzone
                value={postImage}
                onChange={(url) => setPostImage(url)}
                label="Hình ảnh món ăn"
                helperText="Tải ảnh trực tiếp từ máy tính/điện thoại (JPG, PNG, WebP) hoặc chọn ảnh mẫu. Tự động nén tối ưu."
                aspectRatio="16/9"
                maxDimension={1280}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#2B2118] block mb-1">Thời gian nấu</label>
                  <input
                    type="text"
                    value={postPrepTime}
                    onChange={(e) => setPostPrepTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#2B2118] block mb-1">Khẩu phần</label>
                  <input
                    type="text"
                    value={postServings}
                    onChange={(e) => setPostServings(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#2B2118] block mb-1">Độ khó</label>
                  <select
                    value={postDifficulty}
                    onChange={(e) => setPostDifficulty(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
                  >
                    <option value="Rất dễ">Rất dễ</option>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              {/* Nutrition Inputs */}
              <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#EAE0D5] space-y-3">
                <div className="text-xs font-bold text-[#a33e07]">Thông tin Dinh dưỡng (1 Khẩu phần)</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8C7D6F] block">Calo (kcal)</label>
                    <input
                      type="number"
                      value={postCalories}
                      onChange={(e) => setPostCalories(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C7D6F] block">Đạm (g)</label>
                    <input
                      type="number"
                      value={postProtein}
                      onChange={(e) => setPostProtein(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C7D6F] block">Béo (g)</label>
                    <input
                      type="number"
                      value={postFat}
                      onChange={(e) => setPostFat(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C7D6F] block">Tinh bột (g)</label>
                    <input
                      type="number"
                      value={postCarbs}
                      onChange={(e) => setPostCarbs(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ingredients & Steps */}
            <div className="space-y-4">
              {/* Ingredients List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#2B2118]">Danh sách Nguyên liệu</label>
                  <button
                    type="button"
                    onClick={() => setIngredientsList([...ingredientsList, { name: '', amount: 'Vừa đủ' }])}
                    className="text-[11px] text-[#a33e07] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Thêm nguyên liệu
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ingredientsList.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tên nguyên liệu"
                        value={ing.name}
                        onChange={(e) => {
                          const updated = [...ingredientsList];
                          updated[idx].name = e.target.value;
                          setIngredientsList(updated);
                        }}
                        className="flex-1 text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
                      />
                      <input
                        type="text"
                        placeholder="Định lượng"
                        value={ing.amount}
                        onChange={(e) => {
                          const updated = [...ingredientsList];
                          updated[idx].amount = e.target.value;
                          setIngredientsList(updated);
                        }}
                        className="w-28 text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
                      />
                      {ingredientsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setIngredientsList(ingredientsList.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#2B2118]">Các bước nấu</label>
                  <button
                    type="button"
                    onClick={() => setStepsList([...stepsList, { step: stepsList.length + 1, title: `Bước ${stepsList.length + 1}`, description: '' }])}
                    className="text-[11px] text-[#a33e07] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Thêm bước
                  </button>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {stepsList.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#a33e07]">Bước {idx + 1}</span>
                        {stepsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setStepsList(stepsList.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Tiêu đề bước (ví dụ: Sơ chế)"
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...stepsList];
                          updated[idx].title = e.target.value;
                          setStepsList(updated);
                        }}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Mô tả chi tiết cách làm..."
                        value={step.description}
                        onChange={(e) => {
                          const updated = [...stepsList];
                          updated[idx].description = e.target.value;
                          setStepsList(updated);
                        }}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE0D5] flex items-center justify-between">
            <span className="text-xs text-[#8C7D6F]">
              Đăng với tư cách: <strong className="text-[#2B2118]">{currentUser?.email || adminEmail || 'Quản trị viên'}</strong>
            </span>

            <button
              type="submit"
              disabled={isSubmittingPost}
              className="px-6 py-3 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold shadow-md shadow-[#a33e07]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmittingPost ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang xử lý đăng bài...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {submitForReviewToggle ? 'Gửi vào hàng chờ duyệt AI' : 'Xuất bản trực tiếp ngay'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. QUẢN LÝ CÔNG THỨC ĐÃ ĐĂNG TAB (RECIPES MANAGEMENT) */}
      {adminTab === 'recipes' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Search & Tag Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE0D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên món..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['Tất cả', 'Đồ mặn', 'Ăn chay', 'Dưới 15 phút', 'Miền Bắc', 'Miền Nam'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#a33e07] text-white shadow-xs'
                      : 'bg-[#FFF8F0] text-[#6B5D4F] border border-[#EAE0D5] hover:bg-[#F7F2EE]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Recipes List Table */}
          <div className="bg-white rounded-2xl border border-[#EAE0D5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF8F0] border-b border-[#EAE0D5] text-[#8C7D6F] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">Món ăn</th>
                    <th className="p-3.5">Danh mục</th>
                    <th className="p-3.5">Thời gian & Calo</th>
                    <th className="p-3.5">Người đăng / Nguồn</th>
                    <th className="p-3.5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F2EE]">
                  {filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#8C7D6F]">
                        Không tìm thấy công thức nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredRecipes.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FFFDFB] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <OptimizedImage
                              src={r.image}
                              alt={r.title}
                              className="w-10 h-10 rounded-xl object-cover"
                              containerClassName="w-10 h-10 rounded-xl shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#2B2118] line-clamp-1">{r.title}</div>
                              <div className="text-[11px] text-[#8C7D6F]">{r.servings} • {r.difficulty}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {r.categories.filter(c => c !== 'Tất cả').slice(0, 2).map((c, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFF0E6] text-[#a33e07] border border-[#FFE0CC]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[#2B2118] font-medium">{r.prepTime}</div>
                          <div className="text-[11px] text-orange-600 font-semibold">{r.calories} kcal</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-[#2B2118]">{r.author?.name || r.author_name || 'Đầu bếp'}</div>
                          {r.posted_by_admin ? (
                            <span className="inline-block text-[10px] text-[#a33e07] font-bold">Admin Post</span>
                          ) : (
                            <span className="inline-block text-[10px] text-[#8C7D6F]">Cộng đồng</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setRecipeToChangeImage(r)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#a33e07] text-[11px] font-bold border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Thay đổi ảnh món ăn từ máy"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Đổi ảnh
                            </button>
                            <button
                              onClick={() => setInspectRecipe(r)}
                              className="p-1.5 text-[#6B5D4F] hover:text-[#a33e07] rounded-lg hover:bg-[#FFF8F0]"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchiveRecipe(r)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Chuyển vào kho lưu trữ (không xóa hẳn)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Gỡ bài
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. KHO LƯU TRỮ TAB (ARCHIVED) */}
      {adminTab === 'archived' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-white rounded-2xl border border-[#EAE0D5] text-xs text-[#6B5D4F] flex items-center justify-between">
            <span>Danh sách công thức đã gỡ (Collection: <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">archived</code>). Bạn có thể khôi phục lại bất cứ lúc nào.</span>
            <span className="font-bold text-[#2B2118]">{archivedList.length} bài đã lưu trữ</span>
          </div>

          {archivedList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-xs space-y-3">
              <Archive className="w-12 h-12 text-[#8C7D6F] mx-auto p-2 bg-[#FFF8F0] rounded-full stroke-1" />
              <h3 className="font-bold text-base text-[#2B2118]">Kho lưu trữ trống</h3>
              <p className="text-xs text-[#6B5D4F]">Chưa có món ăn nào bị gỡ bài.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archivedList.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#EAE0D5] shadow-xs space-y-3">
                  <div className="flex gap-3">
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover"
                      containerClassName="w-16 h-16 rounded-xl shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#2B2118]">{item.title}</h4>
                      <p className="text-[11px] text-[#8C7D6F] mt-0.5">
                        Gỡ bởi: <span className="font-semibold">{item.archivedBy}</span>
                      </p>
                      <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 line-clamp-1 border border-amber-200">
                        Lý do: {item.archiveReason || 'Gỡ tạm thời'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F7F2EE] flex items-center justify-between">
                    <span className="text-[10px] text-[#8C7D6F]">
                      {new Date(item.archivedAt).toLocaleString('vi-VN')}
                    </span>
                    <button
                      onClick={() => handleRestoreRecipe(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Khôi phục bài
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. LỊCH SỬ TỪ CHỐI TAB (REJECTED) */}
      {adminTab === 'rejected' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-white rounded-2xl border border-[#EAE0D5] text-xs text-[#6B5D4F] flex items-center justify-between">
            <span>Lịch sử các bài đăng bị từ chối kiểm duyệt (Collection: <code className="bg-[#F7F2EE] px-1 py-0.5 rounded text-[#a33e07] font-semibold">rejected</code>).</span>
            <span className="font-bold text-[#2B2118]">{rejectedList.length} bài bị từ chối</span>
          </div>

          {rejectedList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE0D5] shadow-xs space-y-3">
              <Check className="w-12 h-12 text-emerald-600 mx-auto p-2 bg-emerald-50 rounded-full" />
              <h3 className="font-bold text-base text-[#2B2118]">Không có lịch sử từ chối</h3>
              <p className="text-xs text-[#6B5D4F]">Tất cả bài đăng đều đạt chất lượng kiểm duyệt.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedList.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2B2118]">{item.title}</h4>
                      <p className="text-xs text-[#8C7D6F]">
                        Từ chối bởi: <span className="font-semibold text-[#2B2118]">{item.rejectedBy}</span> • {new Date(item.rejectedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                      Đã từ chối
                    </span>
                  </div>

                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-red-900">
                    <strong>Lý do từ chối:</strong> {item.rejectReason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INSPECT RECIPE MODAL */}
      {inspectRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#EAE0D5] shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
              <h2 className="font-bold text-base text-[#2B2118]">{inspectRecipe.title}</h2>
              <button
                onClick={() => setInspectRecipe(null)}
                className="p-1 text-[#8C7D6F] hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#2B2118]">
              <div className="flex items-center gap-3">
                <OptimizedImage
                  src={inspectRecipe.image}
                  alt={inspectRecipe.title}
                  className="w-24 h-24 rounded-2xl object-cover"
                  containerClassName="w-24 h-24 rounded-2xl shrink-0"
                  allowZoom
                />
                <div>
                  <p className="font-medium text-[#524436]">{inspectRecipe.description}</p>
                  <p className="text-[#8C7D6F] mt-1">Khẩu phần: {inspectRecipe.servings} • Thời gian: {inspectRecipe.prepTime} • Calo: {inspectRecipe.calories} kcal</p>
                  <button
                    onClick={() => setRecipeToChangeImage(inspectRecipe)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#a33e07] text-xs font-bold border border-[#FFE0CC] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Thay đổi ảnh món này từ máy
                  </button>
                </div>
              </div>

              <div>
                <strong className="block text-[#a33e07] mb-1">Nguyên liệu:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {inspectRecipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing.name}: {ing.amount}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="block text-[#a33e07] mb-1">Các bước thực hiện:</strong>
                <ol className="list-decimal pl-5 space-y-2">
                  {inspectRecipe.steps.map((st, i) => (
                    <li key={i}>
                      <span className="font-semibold">{st.title}:</span> {st.description}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE0D5] flex justify-end gap-2">
              <button
                onClick={() => setInspectRecipe(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                Đóng
              </button>
              {'status' in inspectRecipe && inspectRecipe.status === 'pending' && (
                <button
                  onClick={() => handleApproveRecipe(inspectRecipe.id)}
                  className="px-5 py-2 rounded-xl bg-[#a33e07] text-white text-xs font-bold shadow-md"
                >
                  Duyệt bài ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT WITH REASON MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE0D5] shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3">
              <h3 className="font-bold text-sm text-[#2B2118] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Từ chối công thức: {rejectingItem.title}
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-[#8C7D6F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#2B2118] block">Chọn hoặc nhập lý do từ chối:</label>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Nội dung spam / không phải món ăn',
                  'Vi phạm an toàn vệ sinh thực phẩm',
                  'Thiếu nguyên liệu hoặc bước nấu cốt lõi',
                  'Hình ảnh không phù hợp / mờ'
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomRejectReason(reason)}
                    className="text-[11px] p-2 rounded-lg bg-[#FFF8F0] hover:bg-[#FFE0CC] text-[#524436] border border-[#EAE0D5] transition-colors text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Nhập lý do chi tiết để lưu vào hồ sơ rejected..."
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>

            <div className="pt-3 border-t border-[#EAE0D5] flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Thay Đổi Ảnh Món Ăn Cho Admin */}
      <ChangeDishImageModal
        isOpen={!!recipeToChangeImage}
        onClose={() => setRecipeToChangeImage(null)}
        recipe={recipeToChangeImage}
        onImageUpdated={(newUrl, updated) => {
          setAllRecipes(prev => prev.map(r => r.id === updated.id ? { ...r, image: newUrl } : r));
          if (inspectRecipe && inspectRecipe.id === updated.id) {
            setInspectRecipe(prev => prev ? { ...prev, image: newUrl } : null);
          }
        }}
      />
    </div>
  );
};
