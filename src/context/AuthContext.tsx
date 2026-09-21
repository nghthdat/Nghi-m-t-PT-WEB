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
  updateUserProfileDoc,
  toggleRecipeSavedForUser,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  resetPassword,
  resendVerificationEmail,
  reloadAndCheckEmailVerified,
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
  authModalMode: 'login' | 'register' | 'forgot' | 'verify-email';
  pendingVerificationEmail: string;
  toast: { text: string; type: 'success' | 'error' | 'info' } | null;
  openAuthModal: (options?: { reason?: string; mode?: 'login' | 'register'; pendingAction?: PendingUserAction }) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'verify-email') => void;
  handleQuickLogin: (email: string) => Promise<boolean>;
  handleGoogleSignIn: () => Promise<boolean>;
  handleEmailLogin: (email: string, pass: string) => Promise<boolean>;
  handleEmailRegister: (email: string, pass: string, name: string) => Promise<boolean>;
  handleResetPassword: (email: string) => Promise<void>;
  handleResendVerification: () => Promise<void>;
  handleCheckEmailVerification: () => Promise<boolean>;
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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'verify-email'>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

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

  // Activate an already-signed-in, email-verified Firebase user: loads their
  // Firestore profile, admin status and resumes any pending action. Shared
  // by the auth-state listener and the "I've verified" button.
  const activateFirebaseUser = useCallback(async (firebaseUser: User) => {
    setUser(firebaseUser);
    try {
      const adminCheck = await checkIsAdminUser(firebaseUser.email || '');
      setIsAdmin(adminCheck);

      const userProfile = await getOrCreateUserProfile(firebaseUser);
      setProfile(userProfile);
      setSavedRecipeIds(userProfile.saved_recipes || []);

      if (adminCheck) {
        const token = await firebaseUser.getIdToken();
        setAdminSession(token, firebaseUser.email || '');
      }

      await executePendingAction(userProfile, firebaseUser);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, [executePendingAction]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser && !firebaseUser.emailVerified) {
        // Email/password account that hasn't confirmed their Gmail yet:
        // keep them gated out of the app and surface the verification screen.
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setSavedRecipeIds([]);
        setPendingVerificationEmail(firebaseUser.email || '');
        setAuthModalMode('verify-email');
        setIsAuthModalOpen(true);
        setIsLoading(false);
        return;
      }
      if (firebaseUser) {
        await activateFirebaseUser(firebaseUser);
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
  }, [executePendingAction, showToast, activateFirebaseUser]);

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
      if (err.code === 'auth/email-not-verified') {
        setPendingVerificationEmail(email.trim());
        setAuthModalMode('verify-email');
        showToast('Tài khoản của bạn chưa xác thực email. Vui lòng kiểm tra Gmail (kể cả mục Spam) để xác nhận trước khi đăng nhập.', 'info');
        return false;
      }
      showToast(errMsg, 'error');
      return false;
    }
  };

  const handleEmailRegister = async (email: string, pass: string, name: string): Promise<boolean> => {
    try {
      const { user: authedUser, requiresVerification } = await registerWithEmail(email, pass, name);

      if (requiresVerification) {
        // Do not grant access yet: keep the user signed out at the app
        // level until they confirm the verification email sent to their Gmail.
        setPendingVerificationEmail(authedUser.email || email.trim());
        setAuthModalMode('verify-email');
        showToast('Mã xác thực đã được gửi về Gmail của bạn. Vui lòng kiểm tra hộp thư đến (và cả mục Spam) rồi xác nhận để kích hoạt tài khoản.', 'info');
        return false;
      }

      // Degraded fallback path only (Firebase Email/Password disabled on
      // this project) — no real account exists to verify, so log in directly.
      const newProfile = getUserSession()?.profile;
      if (newProfile) {
        setUser(authedUser);
        setProfile(newProfile);
        setSavedRecipeIds([]);
        const adminCheck = await checkIsAdminUser(authedUser.email || '');
        setIsAdmin(adminCheck);
        closeAuthModal();
        showToast(`Đăng ký tài khoản thành công! Chào mừng ${newProfile.display_name}`, 'success');
        await executePendingAction(newProfile, authedUser);
      }
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

  const handleResendVerification = async (): Promise<void> => {
    try {
      await resendVerificationEmail();
      showToast('Đã gửi lại mã xác thực về Gmail của bạn. Vui lòng kiểm tra cả hộp thư Spam.', 'success');
    } catch (err: any) {
      console.error('Resend verification error:', err);
      let errMsg = 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.';
      if (err.code === 'auth/too-many-requests') errMsg = 'Bạn vừa yêu cầu gửi lại quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.';
      showToast(errMsg, 'error');
    }
  };

  const handleCheckEmailVerification = async (): Promise<boolean> => {
    try {
      const verified = await reloadAndCheckEmailVerified();
      if (!verified) {
        showToast('Email vẫn chưa được xác thực. Vui lòng bấm vào liên kết xác thực trong Gmail trước.', 'error');
        return false;
      }
      // reload() alone doesn't reliably re-fire onAuthStateChanged, so
      // activate the session directly here rather than waiting for it.
      if (auth.currentUser) {
        await activateFirebaseUser(auth.currentUser);
      }
      showToast('Xác thực email thành công! Chào mừng bạn đến với Hôm Nay Ăn Gì AI.', 'success');
      return true;
    } catch (err: any) {
      console.error('Check verification error:', err);
      showToast('Không thể kiểm tra trạng thái xác thực. Vui lòng thử lại.', 'error');
      return false;
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword(email);
      showToast('Đã gửi liên kết đặt lại mật khẩu về Gmail của bạn. Vui lòng kiểm tra hộp thư đến (và cả mục Spam)!', 'success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errMsg = err.message || 'Không thể gửi email đặt lại mật khẩu.';
      showToast(errMsg, 'error');
      throw err;
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
        pendingVerificationEmail,
        toast,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        handleGoogleSignIn,
        handleEmailLogin,
        handleEmailRegister,
        handleResetPassword,
        handleResendVerification,
        handleCheckEmailVerification,
        handleSignOut,
        handleQuickLogin,
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
