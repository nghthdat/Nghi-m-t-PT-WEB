import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  auth, 
  checkIsAdminUser, 
  getOrCreateUserProfile, 
  fetchUserProfile, 
  updateUserProfileDoc,
  toggleRecipeSavedForUser,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  resetPassword,
  setPendingUserAction,
  getPendingUserAction,
  clearPendingUserAction,
  initActivityTracker,
  setAdminSession,
  clearAdminSession,
  getUserSession,
  setUserSession,
  clearUserSession,
  signOutUser,
  quickLoginAsRealisticUser,
  REALISTIC_USERS
} from '../lib/firebase';
import { UserProfile, PendingUserAction } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  savedRecipeIds: string[];
  isAuthModalOpen: boolean;
  authModalReason: string;
  authModalMode: 'login' | 'register' | 'forgot';
  toast: { text: string; type: 'success' | 'error' | 'info' } | null;
  openAuthModal: (options?: { reason?: string; mode?: 'login' | 'register'; pendingAction?: PendingUserAction }) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  handleQuickLogin: (email: string) => Promise<boolean>;
  handleGoogleSignIn: () => Promise<boolean>;
  handleEmailLogin: (email: string, pass: string) => Promise<boolean>;
  handleEmailRegister: (email: string, pass: string, name: string) => Promise<boolean>;
  handleResetPassword: (email: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  toggleFavorite: (recipeId: string, recipeTitle?: string) => Promise<boolean>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ 
  children: ReactNode;
  onNavigateTab?: (tab: string) => void;
}> = ({ children, onNavigateTab }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Toast notification
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // Process pending action after successful authentication
  const executePendingAction = useCallback(async (currentProfile: UserProfile, targetUser: any) => {
    const pending = getPendingUserAction();
    if (!pending) return;

    try {
      if (pending.type === 'save_recipe' && pending.recipeId) {
        // Save the recipe for user
        const alreadySaved = currentProfile.saved_recipes?.includes(pending.recipeId);
        if (!alreadySaved) {
          await toggleRecipeSavedForUser(targetUser.uid, pending.recipeId, false);
          const nextSaved = [...(currentProfile.saved_recipes || []), pending.recipeId];
          setSavedRecipeIds(nextSaved);
          setProfile(prev => prev ? { ...prev, saved_recipes: nextSaved } : null);
          showToast(`Đã lưu công thức "${pending.recipeTitle || 'Món ăn'}" vào bộ sưu tập cá nhân!`, 'success');
        }
      } else if (pending.type === 'navigate_submit') {
        onNavigateTab?.('submit');
        showToast('Đăng nhập thành công! Bạn có thể bắt đầu đăng bài chia sẻ công thức.', 'success');
      } else if (pending.type === 'navigate_profile') {
        onNavigateTab?.('profile');
      }
    } catch (err) {
      console.error('Error executing pending action:', err);
    } finally {
      clearPendingUserAction();
    }
  }, [showToast, onNavigateTab]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Check Admin status
          const adminCheck = await checkIsAdminUser(firebaseUser.email || '');
          setIsAdmin(adminCheck);

          // Get or create Firestore profile
          const userProfile = await getOrCreateUserProfile(firebaseUser);
          setProfile(userProfile);
          setSavedRecipeIds(userProfile.saved_recipes || []);

          if (adminCheck) {
            const token = await firebaseUser.getIdToken();
            setAdminSession(token, firebaseUser.email || '');
          }

          // Check if there is any pending action to resume
          await executePendingAction(userProfile, firebaseUser);
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      } else {
        // Check if there is a local session from fallback auth
        const localSession = getUserSession();
        if (localSession && localSession.user && localSession.profile) {
          setUser(localSession.user);
          setProfile(localSession.profile);
          setSavedRecipeIds(localSession.profile.saved_recipes || []);
          const adminCheck = await checkIsAdminUser(localSession.user.email || '');
          setIsAdmin(adminCheck);
        } else {
          // Default: Guest state (Unauthenticated)
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setSavedRecipeIds([]);
        }
      }
      setIsLoading(false);
    });

    // Inactivity 2 hours tracker
    const cleanupActivity = initActivityTracker(() => {
      signOutUser();
      showToast('Phiên đăng nhập đã tự động kết thúc sau 2 giờ không hoạt động.', 'info');
    });

    return () => {
      unsubscribe();
      cleanupActivity();
    };
  }, [executePendingAction, showToast]);

  const openAuthModal = useCallback((options?: { 
    reason?: string; 
    mode?: 'login' | 'register'; 
    pendingAction?: PendingUserAction 
  }) => {
    if (options?.pendingAction) {
      setPendingUserAction(options.pendingAction);
    }
    setAuthModalReason(options?.reason || '');
    setAuthModalMode(options?.mode || 'login');
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  }, []);

  const handleQuickLogin = async (email: string): Promise<boolean> => {
    try {
      sessionStorage.removeItem('an_gi_hom_nay_explicit_logout');
      const { user: authedUser, profile: newProfile } = await quickLoginAsRealisticUser(email);
      setUser(authedUser);
      setProfile(newProfile);
      setSavedRecipeIds(newProfile.saved_recipes || []);
      
      const adminCheck = await checkIsAdminUser(authedUser.email || '');
      setIsAdmin(adminCheck);

      closeAuthModal();
      showToast(`Đã chuyển sang tài khoản: ${newProfile.display_name} (${newProfile.chef_title || 'Thành viên'})!`, 'success');
      await executePendingAction(newProfile, authedUser);
      return true;
    } catch (err: any) {
      console.error('Quick login error:', err);
      showToast('Không thể đăng nhập tài khoản.', 'error');
      return false;
    }
  };

  const handleGoogleSignIn = async (): Promise<boolean> => {
    try {
      const { user: authedUser, profile: newProfile } = await signInWithGoogle();
      setUser(authedUser);
      setProfile(newProfile);
      setSavedRecipeIds(newProfile.saved_recipes || []);
      
      const adminCheck = await checkIsAdminUser(authedUser.email || '');
      setIsAdmin(adminCheck);

      closeAuthModal();
      showToast(`Chào mừng bạn, ${newProfile.display_name}!`, 'success');
      await executePendingAction(newProfile, authedUser);
      return true;
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      let errMsg = err.message || 'Đăng nhập Google không thành công.';
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.';
      } else if (err.code === 'auth/popup-blocked') {
        errMsg = 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup.';
      }
      showToast(errMsg, 'error');
      return false;
    }
  };

  const handleEmailLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const { user: authedUser, profile: newProfile } = await loginWithEmail(email, pass);
      setUser(authedUser);
      setProfile(newProfile);
      setSavedRecipeIds(newProfile.saved_recipes || []);

      const adminCheck = await checkIsAdminUser(authedUser.email || '');
      setIsAdmin(adminCheck);

      closeAuthModal();
      showToast(`Đăng nhập thành công! Xin chào ${newProfile.display_name}`, 'success');
      await executePendingAction(newProfile, authedUser);
      return true;
    } catch (err: any) {
      console.error('Email login error:', err);
      let errMsg = err.message || 'Email hoặc mật khẩu không chính xác.';
      if (err.code === 'auth/user-not-found') errMsg = 'Tài khoản email này chưa được đăng ký.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') errMsg = 'Mật khẩu không chính xác.';
      if (err.code === 'auth/invalid-email') errMsg = 'Địa chỉ email không đúng định dạng.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Phương thức Email/Mật khẩu chưa được bật. Bạn có thể sử dụng "Tiếp tục với Google" để đăng nhập nhanh.';
      }
      showToast(errMsg, 'error');
      return false;
    }
  };

  const handleEmailRegister = async (email: string, pass: string, name: string): Promise<boolean> => {
    try {
      const { user: authedUser, profile: newProfile } = await registerWithEmail(email, pass, name);
      setUser(authedUser);
      setProfile(newProfile);
      setSavedRecipeIds([]);

      const adminCheck = await checkIsAdminUser(authedUser.email || '');
      setIsAdmin(adminCheck);

      closeAuthModal();
      showToast(`Đăng ký tài khoản thành công! Chào mừng ${newProfile.display_name}`, 'success');
      await executePendingAction(newProfile, authedUser);
      return true;
    } catch (err: any) {
      console.error('Email register error:', err);
      let errMsg = err.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      if (err.code === 'auth/email-already-in-use') errMsg = 'Email này đã được sử dụng.';
      if (err.code === 'auth/weak-password') errMsg = 'Mật khẩu phải có ít nhất 6 ký tự.';
      if (err.code === 'auth/invalid-email') errMsg = 'Địa chỉ email không đúng định dạng.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Phương thức Email/Mật khẩu chưa được bật. Bạn có thể sử dụng "Tiếp tục với Google" để đăng nhập nhanh.';
      }
      showToast(errMsg, 'error');
      return false;
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword(email);
      showToast('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hòm thư của bạn!', 'success');
      setAuthModalMode('login');
    } catch (err: any) {
      console.error('Reset password error:', err);
      let errMsg = 'Không thể gửi email đặt lại mật khẩu.';
      if (err.code === 'auth/user-not-found') errMsg = 'Không tìm thấy tài khoản với email này.';
      showToast(errMsg, 'error');
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      sessionStorage.setItem('an_gi_hom_nay_explicit_logout', 'true');
      await signOutUser();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setSavedRecipeIds([]);
      showToast('Đã đăng xuất tài khoản. Bạn đang ở chế độ Khách.', 'info');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Toggle favorite recipe (Save / Unsave)
  const toggleFavorite = async (recipeId: string, recipeTitle?: string): Promise<boolean> => {
    if (!user) {
      // Prompt login and remember action
      openAuthModal({
        reason: 'Vui lòng đăng nhập để lưu công thức món ăn này vào bộ sưu tập cá nhân của bạn.',
        mode: 'login',
        pendingAction: {
          type: 'save_recipe',
          recipeId,
          recipeTitle
        }
      });
      return false;
    }

    const isCurrentlySaved = savedRecipeIds.includes(recipeId);
    // Optimistic UI update
    const updatedIds = isCurrentlySaved
      ? savedRecipeIds.filter(id => id !== recipeId)
      : [...savedRecipeIds, recipeId];

    setSavedRecipeIds(updatedIds);
    setProfile(prev => prev ? { ...prev, saved_recipes: updatedIds } : null);

    try {
      await toggleRecipeSavedForUser(user.uid, recipeId, isCurrentlySaved);
      if (!isCurrentlySaved) {
        showToast(`Đã lưu "${recipeTitle || 'Món ăn'}" vào danh sách yêu thích!`, 'success');
      } else {
        showToast(`Đã bỏ lưu "${recipeTitle || 'Món ăn'}" khỏi danh sách.`, 'info');
      }
      return !isCurrentlySaved;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert on error
      setSavedRecipeIds(savedRecipeIds);
      return isCurrentlySaved;
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    try {
      await updateUserProfileDoc(user.uid, updates);
      
      // Tell backend to update author names in memory
      if (updates.display_name || updates.avatar_url) {
        try {
          await fetch('/api/users/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              name: updates.display_name,
              avatar: updates.avatar_url
            })
          });
        } catch (syncErr) {
          console.error('Failed to sync profile to backend:', syncErr);
        }
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Dispatch an event so App.tsx can refetch recipes and other data
      if (updates.display_name || updates.avatar_url) {
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }

      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast('Lỗi khi lưu thông tin hồ sơ.', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        savedRecipeIds,
        isAuthModalOpen,
        authModalReason,
        authModalMode,
        toast,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        handleGoogleSignIn,
        handleEmailLogin,
        handleEmailRegister,
        handleResetPassword,
        handleSignOut,
        toggleFavorite,
        updateProfileData,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
