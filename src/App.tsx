import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SuggestionsScreen } from './components/SuggestionsScreen';
import { RecipeDetailScreen } from './components/RecipeDetailScreen';
import { SubmitRecipeScreen } from './components/SubmitRecipeScreen';
import { ProfileScreen } from './components/ProfileScreen';

import { ShopScreen } from './components/ShopScreen';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { StaticPageScreen } from './components/StaticPageScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Recipe, PendingRecipe, SuggestedRecipeMatch } from './types';
import { INITIAL_RECIPES } from './data/seedRecipes';
import { CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

interface MainAppContentProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

// Tabs rendered by StaticPageScreen — kept as its own list so the URL sync
// effect and the render guard below always agree on what counts as a
// "static/policy page" tab.
const STATIC_PAGE_TABS = ['about', 'privacy', 'terms', 'faq', 'contact', 'return-policy', 'shipping-policy', 'payment-policy'];

function MainAppContent({ currentTab, setCurrentTab }: MainAppContentProps) {
  const { toast, isAdmin, showToast } = useAuth();
  const [profileInitialTab, setProfileInitialTab] = useState<'posted' | 'saved' | 'cart' | 'orders' | 'badges' | 'moderation'>('posted');
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(1);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Suggestion state
  const [searchIngredients, setSearchIngredients] = useState<string[]>(['Trứng gà', 'Cà chua']);
  const [suggestions, setSuggestions] = useState<SuggestedRecipeMatch[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [hasTriggeredSearch, setHasTriggeredSearch] = useState<boolean>(false);

  const handleNavigateToProfileTab = (tab: 'posted' | 'saved' | 'cart' | 'orders' | 'badges' | 'moderation' = 'posted') => {
    setSelectedRecipe(null);
    setProfileInitialTab(tab);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch approved recipes
  const fetchRecipes = async () => {
    try {
      const res = await fetch(`/api/recipes?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setRecipes(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Fetch pending count
  const fetchPendingCount = async () => {
    try {
      const res = await fetch('/api/pending-recipes');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPendingCount(data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchRecipes(), fetchPendingCount()]);
    
    const handleProfileUpdate = () => {
      fetchRecipes();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Handle direct link to a recipe
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const recipeId = searchParams.get('recipeId');
    
    if (recipeId) {
      const fetchSpecificRecipe = async () => {
        try {
          const res = await fetch(`/api/recipes/${recipeId}?_t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.success && data.data) {
            setSelectedRecipe(data.data);
            setCurrentTab('recipe-detail');
          } else {
            // Recipe not found (e.g. invalid shared link) — notify user and clean URL
            console.warn('Shared recipe not found:', recipeId);
            showToast('Không tìm thấy công thức này. Link có thể đã hết hạn hoặc bị xóa.', 'error');
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('recipeId');
            window.history.replaceState({}, '', cleanUrl.toString());
          }
        } catch (err) {
          console.error('Failed to fetch shared recipe:', err);
          showToast('Không thể tải công thức. Vui lòng thử lại.', 'error');
        }
      };
      fetchSpecificRecipe();
    }
  }, []);

  // Restore a deep link to a static/policy page (e.g. shared or bookmarked
  // "?staticPage=shipping-policy" link, or a page reload).
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const staticPage = searchParams.get('staticPage');
    if (staticPage && STATIC_PAGE_TABS.includes(staticPage)) {
      setCurrentTab(staticPage);
    }
  }, []);

  // Let any component navigate to a policy page without prop-drilling
  // setCurrentTab through every intermediate screen (mirrors the existing
  // 'openProfileEditModal' custom-event pattern used elsewhere in the app).
  useEffect(() => {
    const handleNavigateToPolicy = (e: Event) => {
      const page = (e as CustomEvent<{ page: string }>).detail?.page;
      if (page && STATIC_PAGE_TABS.includes(page)) {
        setSelectedRecipe(null);
        setCurrentTab(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('navigateToPolicy', handleNavigateToPolicy);
    return () => window.removeEventListener('navigateToPolicy', handleNavigateToPolicy);
  }, []);

  // Sync URL with current tab state
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentTab === 'recipe-detail' && selectedRecipe) {
      url.searchParams.set('recipeId', selectedRecipe.id);
    } else {
      url.searchParams.delete('recipeId');
    }
    if (STATIC_PAGE_TABS.includes(currentTab)) {
      url.searchParams.set('staticPage', currentTab);
    } else {
      url.searchParams.delete('staticPage');
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentTab, selectedRecipe]);

  // Request AI suggestions for ingredients
  const handleSearchWithIngredients = async (ingredients: string[]) => {
    setSearchIngredients(ingredients);
    setCurrentTab('suggestions');
    setIsSuggesting(true);
    setHasTriggeredSearch(true);

    try {
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSuggestions(data.data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, isSaved: !r.isSaved } : r));
      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
      }

      await fetch(`/api/recipes/${id}/favorite`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentTab('recipe-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecipeApproved = (approvedRecipe: Recipe) => {
    setRecipes(prev => [approvedRecipe, ...prev]);
    fetchPendingCount();
  };

  const handleRecipeAdded = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    fetchPendingCount();
  };

  const handleNavigateToShop = () => {
    setSelectedRecipe(null);
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#2B2118] flex flex-col selection:bg-[#FFE0CC] selection:text-[#a33e07] relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none max-w-md w-full px-4">
          <div className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-2.5 backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-red-900/95 text-white border-red-700'
              : 'bg-stone-900/95 text-white border-stone-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-xs font-semibold leading-snug">{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedRecipe(null);
          setCurrentTab(tab);
          if (tab === 'suggestions' && suggestions.length === 0 && hasTriggeredSearch) {
            handleSearchWithIngredients(searchIngredients);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToProfileTab={handleNavigateToProfileTab}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'home' && (
          isLoadingRecipes ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#a33e07]" />
              <span className="text-[#a33e07] font-medium text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <HomeScreen
              recipes={recipes}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavorite={handleToggleFavorite}
              onSearchWithIngredients={handleSearchWithIngredients}
              onNavigateToSubmit={() => {
                setSelectedRecipe(null);
                setCurrentTab('submit');
              }}
              onNavigateToShop={handleNavigateToShop}
            />
          )
        )}

        {currentTab === 'shop' && (
          <ShopScreen
            recipes={recipes}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {currentTab === 'suggestions' && (
          <SuggestionsScreen
            currentIngredients={searchIngredients}
            suggestions={suggestions}
            isLoading={isSuggesting}
            onSelectRecipe={handleSelectRecipe}
            onSearchWithIngredients={handleSearchWithIngredients}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'recipe-detail' && selectedRecipe && (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onBack={() => setCurrentTab('home')}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToShop={handleNavigateToShop}
          />
        )}

        {currentTab === 'submit' && (
          <SubmitRecipeScreen
            onBack={() => setCurrentTab('home')}
            onRecipeAdded={handleRecipeAdded}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            recipes={recipes}
            onSelectRecipe={handleSelectRecipe}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToSubmit={() => setCurrentTab('submit')}
            onNavigateToShop={handleNavigateToShop}
            onNavigateToAdmin={() => setCurrentTab('admin')}
            onRecipeApproved={handleRecipeApproved}
            initialTab={profileInitialTab}
          />
        )}

        {currentTab === 'admin' && (
          isAdmin ? (
            <ProfileScreen
              recipes={recipes}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavorite={handleToggleFavorite}
              onNavigateToSubmit={() => setCurrentTab('submit')}
              onNavigateToShop={handleNavigateToShop}
              onNavigateToAdmin={() => setCurrentTab('admin')}
              onRecipeApproved={handleRecipeApproved}
              initialTab="moderation"
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#EAE0D5] max-w-md mx-auto my-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#2B2118]">Khu vực Quản trị dành riêng cho Admin</h3>
              <p className="text-xs text-[#6B5D4F]">Tài khoản hiện tại không có quyền truy cập trang kiểm duyệt.</p>
              <button 
                onClick={() => setCurrentTab('home')} 
                className="px-4 py-2 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold transition-all"
              >
                Quay về Trang chủ
              </button>
            </div>
          )
        )}
        {STATIC_PAGE_TABS.includes(currentTab) && (
          <StaticPageScreen pageType={currentTab as any} />
        )}
      </main>
      
      {/* Footer */}
      <Footer setCurrentTab={(tab) => {
        setSelectedRecipe(null);
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedRecipe(null);
          setCurrentTab(tab);
          if (tab === 'suggestions' && suggestions.length === 0 && hasTriggeredSearch) {
            handleSearchWithIngredients(searchIngredients);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingCount={pendingCount}
      />

      {/* Cart Drawer Slide-over */}
      <CartDrawer onNavigateToShop={handleNavigateToShop} />

      {/* Checkout Modal */}
      <CheckoutModal onNavigateToShop={handleNavigateToShop} />

      {/* Global User Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  return (
    <ErrorBoundary>
      <AuthProvider onNavigateTab={setCurrentTab}>
        <CartProvider>
          <MainAppContent currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <Analytics />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

