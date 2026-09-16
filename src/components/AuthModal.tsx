import React, { useState } from 'react';
import { 
  X, Mail, Lock, User as UserIcon, ChefHat, 
  ArrowRight, Sparkles, AlertCircle, Bookmark,
  Zap, Eye, EyeOff, UserPlus, LogIn, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { REALISTIC_USERS } from '../lib/firebase';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalReason, 
    authModalMode, 
    setAuthModalMode,
    handleGoogleSignIn,
    handleEmailLogin,
    handleEmailRegister,
    handleResetPassword,
    handleQuickLogin
  } = useAuth();

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  if (!isAuthModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setLocalError('Vui lòng nhập Email hoặc Tên đăng nhập của bạn.');
      return;
    }

    if (!loginPassword) {
      setLocalError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await handleEmailLogin(identifier, loginPassword);
      if (!ok) {
        setLocalError('Email/Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const name = registerDisplayName.trim();
    const email = registerEmail.trim();

    if (!name) {
      setLocalError('Vui lòng nhập tên hiển thị của bạn.');
      return;
    }

    if (!email) {
      setLocalError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    // Basic email check
    if (!email.includes('@') || !email.includes('.')) {
      setLocalError('Địa chỉ email không đúng định dạng.');
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setLocalError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await handleEmailRegister(email, registerPassword, name);
      if (!ok) {
        setLocalError('Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Đăng ký không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!forgotEmail.trim()) {
      setLocalError('Vui lòng nhập địa chỉ email để khôi phục.');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleResetPassword(forgotEmail.trim());
    } catch (err: any) {
      setLocalError(err.message || 'Không thể gửi email đặt lại mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In
  const onGoogleClick = async () => {
    setLocalError('');
    setIsSubmitting(true);
    try {
      await handleGoogleSignIn();
    } catch (err: any) {
      setLocalError(err.message || 'Đăng nhập Google không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Account Select
  const onSelectQuickUser = async (userEmail: string) => {
    setLocalError('');
    setIsSubmitting(true);
    try {
      await handleQuickLogin(userEmail);
    } catch (err: any) {
      setLocalError('Không thể chuyển sang tài khoản này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#EAE0D5] shadow-2xl space-y-4 relative my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F2EE] hover:bg-[#EAE0D5] text-[#6B5D4F] flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#a33e07] to-[#e8703a] flex items-center justify-center text-white mx-auto shadow-md shadow-[#a33e07]/20">
            <ChefHat className="w-6 h-6" />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#2B2118] tracking-tight">
            Hôm Nay Ăn Gì AI
          </h2>

          <p className="text-xs text-[#6B5D4F]">
            Khám phá tinh hoa ẩm thực, lưu công thức ngon & cùng sẻ chia đam mê nấu nướng
          </p>
        </div>

        {/* Action Prompt Reason Banner if opened by an action */}
        {authModalReason && (
          <div className="p-3 rounded-2xl bg-[#FFF0E6] border border-[#FFE0CC] text-xs text-[#a33e07] font-medium flex items-start gap-2">
            <Bookmark className="w-4 h-4 shrink-0 mt-0.5 text-[#a33e07]" />
            <span>{authModalReason}</span>
          </div>
        )}

        {/* 2 Segmented Tabs: Đăng nhập & Đăng ký */}
        {authModalMode !== 'forgot' && (
          <div className="flex p-1 bg-[#F7F2EE] rounded-2xl border border-[#EAE0D5]">
            <button
              type="button"
              id="tab-auth-login"
              onClick={() => {
                setLocalError('');
                setAuthModalMode('login');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-[#a33e07] shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>

            <button
              type="button"
              id="tab-auth-register"
              onClick={() => {
                setLocalError('');
                setAuthModalMode('register');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-white text-[#a33e07] shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký</span>
            </button>
          </div>
        )}

        {/* Local Error Alert */}
        {localError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{localError}</span>
          </div>
        )}

        {/* TAB 1: FORM ĐĂNG NHẬP */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Field: Email / Tên đăng nhập */}
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  id="login-input-identifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@example.com hoặc Tên đăng nhập"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <UserIcon className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
              </div>
            </div>

            {/* Field: Mật khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2B2118]">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLocalError('');
                    setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                    setAuthModalMode('forgot');
                  }}
                  className="text-[11px] font-semibold text-[#a33e07] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-input-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 pr-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <Lock className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-[#8C7D6F] hover:text-[#2B2118] cursor-pointer"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#a33e07]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-[#EAE0D5]" />
              <span className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wider">hoặc</span>
              <div className="flex-1 h-px bg-[#EAE0D5]" />
            </div>

            {/* Nút Đăng nhập bằng Google */}
            <button
              id="btn-google-login"
              type="button"
              onClick={onGoogleClick}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-[#EAE0D5] hover:border-[#a33e07]/40 bg-white hover:bg-[#FFF8F0] text-xs sm:text-sm font-bold text-[#2B2118] flex items-center justify-center gap-2.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>

            {/* Collapsible Demo Accounts Shortcut */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full text-center text-[11px] font-semibold text-[#8C7D6F] hover:text-[#a33e07] flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-[#a33e07]" />
                <span>Hoặc đăng nhập nhanh bằng tài khoản thử nghiệm</span>
                {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemoAccounts && (
                <div className="mt-2 grid grid-cols-1 gap-1.5 p-2 rounded-2xl bg-[#FFF8F0] border border-[#F0DFD1] animate-in fade-in duration-150">
                  {Object.values(REALISTIC_USERS).map(({ user: u, profile: p, role }) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => onSelectQuickUser(u.email)}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-white hover:bg-[#FFF0E6] border border-[#EAE0D5] flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={p.avatar_url} alt={p.display_name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#2B2118] flex items-center gap-1">
                            <span>{p.display_name}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#FFE0CC] text-[#a33e07]">
                              {role === 'admin' ? 'Admin' : role === 'chef' ? 'Đầu bếp' : 'Thành viên'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8C7D6F] truncate">{u.email}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#8C7D6F] group-hover:text-[#a33e07] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: FORM ĐĂNG KÝ */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {/* Field: Tên hiển thị */}
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">
                Tên hiển thị
              </label>
              <div className="relative">
                <input
                  id="register-input-name"
                  type="text"
                  value={registerDisplayName}
                  onChange={(e) => setRegisterDisplayName(e.target.value)}
                  placeholder="VD: Minh Châu, Hoàng Nam..."
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <UserIcon className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
              </div>
            </div>

            {/* Field: Email */}
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  id="register-input-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <Mail className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
              </div>
            </div>

            {/* Field: Mật khẩu */}
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="register-input-password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 pr-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <Lock className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-3 text-[#8C7D6F] hover:text-[#2B2118] cursor-pointer"
                  tabIndex={-1}
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field: Nhập lại mật khẩu */}
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="register-input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu vừa đặt"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 pr-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07] text-[#2B2118]"
                  required
                />
                <Lock className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-[#8C7D6F] hover:text-[#2B2118] cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nút Tạo tài khoản */}
            <button
              id="btn-submit-register"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#a33e07]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer mt-1"
            >
              {isSubmitting ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo tài khoản</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-[#EAE0D5]" />
              <span className="text-[10px] font-bold text-[#8C7D6F] uppercase tracking-wider">hoặc</span>
              <div className="flex-1 h-px bg-[#EAE0D5]" />
            </div>

            {/* Nút Đăng nhập bằng Google */}
            <button
              type="button"
              onClick={onGoogleClick}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-[#EAE0D5] hover:border-[#a33e07]/40 bg-white hover:bg-[#FFF8F0] text-xs sm:text-sm font-bold text-[#2B2118] flex items-center justify-center gap-2.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>
          </form>
        )}

        {/* SUB-VIEW: QUÊN MẬT KHẨU */}
        {authModalMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#2B2118]">Khôi phục mật khẩu</h3>
              <p className="text-xs text-[#6B5D4F] mt-1">
                Nhập địa chỉ email đăng ký để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm p-2.5 pl-9 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                  required
                />
                <Mail className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#a33e07]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <span>Gửi liên kết khôi phục</span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setLocalError('');
                  setAuthModalMode('login');
                }}
                className="text-xs font-bold text-[#a33e07] hover:underline"
              >
                ← Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}

        {/* Footer info & toggle note */}
        {authModalMode === 'login' && (
          <p className="text-center text-xs text-[#6B5D4F] pt-1">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => {
                setLocalError('');
                setAuthModalMode('register');
              }}
              className="font-bold text-[#a33e07] hover:underline cursor-pointer"
            >
              Đăng ký tài khoản ngay
            </button>
          </p>
        )}

        {authModalMode === 'register' && (
          <p className="text-center text-xs text-[#6B5D4F] pt-1">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => {
                setLocalError('');
                setAuthModalMode('login');
              }}
              className="font-bold text-[#a33e07] hover:underline cursor-pointer"
            >
              Đăng nhập tại đây
            </button>
          </p>
        )}

      </div>
    </div>
  );
};
