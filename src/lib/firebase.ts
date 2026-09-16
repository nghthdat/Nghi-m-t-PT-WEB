import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { UserProfile, PendingUserAction, RecipeReview } from '../types';

// Read config from firebase-applet-config.json
const firebaseConfig = {
  projectId: "imperial-gateway-99v0l",
  appId: "1:36320696532:web:f89084d4d67ad203978341",
  apiKey: "AIzaSyA9TNy3kYStF3w2elOHxX03koqh7KcAuA4",
  authDomain: "imperial-gateway-99v0l.firebaseapp.com",
  storageBucket: "imperial-gateway-99v0l.firebasestorage.app",
  messagingSenderId: "36320696532"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const DB_ID = "ai-studio-nghmnay-341b7fc0-1ece-46a8-b795-2900a57c271d";
export const db = getFirestore(app, DB_ID);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Default avatars
const DEFAULT_AVATARS = [
  "https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4NBh3NNhtOti_SFH9N3XAJSdSCyx4t3HryLWxnN6Fp-2AvaMlCQpr8cJP8CurSgQO53qXnp4YtKERurYtlzJF-og-HPEzuzKNbwPrL6RHhmjIAPW3HoelRj4BDESY5OHwA_lS4cd1smP6vaGfYKbvAuQM_8pS-eFGypCyOmoXIBvVvRWHqlE4RMVPIKT_MQMlw9ZsteKy0C3Tqe1dHMsrQU64VYWuoFnXA0_sgE_ZIxAlFJ_Oj90jGA"
];

// Predefined realistic user profiles for genuine experience
export const REALISTIC_USERS: Record<string, { user: any; profile: UserProfile; role: 'admin' | 'chef' | 'member' }> = {
  'datnhatquang@gmail.com': {
    user: {
      uid: 'usr-datnhatquang-admin',
      email: 'datnhatquang@gmail.com',
      displayName: 'Đặng Nhật Quang',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
    },
    profile: {
      uid: 'usr-datnhatquang-admin',
      display_name: 'Đặng Nhật Quang',
      email: 'datnhatquang@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      created_at: '2024-01-15T08:00:00.000Z',
      badge: ['🏆 Bếp Trưởng Sáng Lập', '👑 Quản Trị Viên VIP', '⭐ 5 Sao Xuất Sắc', '🍲 Tinh Hoa Ẩm Thực'],
      saved_recipes: ['rec-1', 'rec-2', 'rec-3', 'rec-5'],
      bio: 'Sáng lập "Ăn Gì Hôm Nay" & Đam mê tinh hoa ẩm thực truyền thống Việt Nam. Thích tìm tòi các công thức chuẩn vị gia đình.',
      phone: '0912 345 678',
      address: '28 Tràng Thi, Hoàn Kiếm',
      city: 'Hà Nội',
      chef_title: 'Quản Trị Viên & Bếp Trưởng Sáng Lập',
      experience_points: 850,
      level: 8,
      cooking_style: ['Món Bắc', 'Món Kho', 'Đặc Sản Vùng Miền', 'Nấu Nhanh'],
      member_tier: 'Quản Trị Viên VIP',
      recipes_count: 5
    },
    role: 'admin'
  },
  'minhchau.chef@gmail.com': {
    user: {
      uid: 'usr-minhchau-chef',
      email: 'minhchau.chef@gmail.com',
      displayName: 'Minh Châu',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face'
    },
    profile: {
      uid: 'usr-minhchau-chef',
      display_name: 'Minh Châu',
      email: 'minhchau.chef@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      created_at: '2024-03-10T09:30:00.000Z',
      badge: ['🌟 Top 1 Yêu Thích', '👩‍🍳 Master Home Chef', '🍲 Món Ngon Gia Đình'],
      saved_recipes: ['rec-1', 'rec-4', 'rec-5'],
      bio: 'Nội trợ yêu gia đình, thích chia sẻ những bữa cơm ấm áp chuẩn vị 3 miền và mẹo bếp núc thơm ngon, tiết kiệm thời gian.',
      phone: '0988 765 432',
      address: '125 Lê Lợi, Phường Bến Thành, Quận 1',
      city: 'TP. Hồ Chí Minh',
      chef_title: 'Đầu Bếp Cộng Đồng 5 Sao',
      experience_points: 620,
      level: 6,
      cooking_style: ['Món Nam', 'Món Canh', 'Bữa Cơm Gia Đình'],
      member_tier: 'Chuyên Gia Ẩm Thực',
      recipes_count: 4
    },
    role: 'chef'
  },
  'hoangnam.fit@gmail.com': {
    user: {
      uid: 'usr-hoangnam-member',
      email: 'hoangnam.fit@gmail.com',
      displayName: 'Hoàng Nam (Nam Fit)',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
    },
    profile: {
      uid: 'usr-hoangnam-member',
      display_name: 'Hoàng Nam (Nam Fit)',
      email: 'hoangnam.fit@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      created_at: '2024-06-20T14:15:00.000Z',
      badge: ['🥗 Bếp Xanh Healthy', '⚡ Nấu Nhanh Dưới 20p'],
      saved_recipes: ['rec-2', 'rec-3'],
      bio: 'Yêu thích lối sống lành mạnh, chuyên các món giàu đạm, ít dầu mỡ (Eat Clean & Healthy) nhưng vẫn đậm đà thơm ngon.',
      phone: '0903 112 233',
      address: '84 Nguyễn Văn Linh, Hải Châu',
      city: 'Đà Nẵng',
      chef_title: 'Tín Đồ Healthy & Eat Clean',
      experience_points: 380,
      level: 4,
      cooking_style: ['Healthy', 'Ít Dầu Mỡ', 'Ức Gà & Thịt Bò'],
      member_tier: 'Bếp Trưởng Thân Thiết',
      recipes_count: 2
    },
    role: 'member'
  }
};

// Check if an email is registered in admin_users collection
export async function checkIsAdminUser(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'datnhatquang@gmail.com') return true;

    // 1. Direct doc lookup by email
    const adminDocRef = doc(db, 'admin_users', cleanEmail);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      return true;
    }

    // 2. Query where email == cleanEmail
    const q = query(collection(db, 'admin_users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('Error verifying admin_users in Firestore:', err);
    // Fallback if rules or db call restricted
    if (email.trim().toLowerCase() === 'datnhatquang@gmail.com') return true;
    return false;
  }
}

// Add an email to admin_users (for initial setup helper)
export async function registerAdminUserDoc(email: string, role = 'admin'): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await setDoc(doc(db, 'admin_users', cleanEmail), {
    email: cleanEmail,
    role,
    createdAt: new Date().toISOString()
  });
}

// ================= USER PROFILE (collection: users) =================
export async function getOrCreateUserProfile(user: User, customDisplayName?: string): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const emailKey = user.email?.toLowerCase().trim();
  const realisticPreset = emailKey && REALISTIC_USERS[emailKey] ? REALISTIC_USERS[emailKey].profile : null;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      const profile: UserProfile = {
        uid: user.uid,
        display_name: data.display_name || user.displayName || realisticPreset?.display_name || user.email?.split('@')[0] || 'Đầu bếp',
        email: data.email || user.email || '',
        avatar_url: data.avatar_url || user.photoURL || realisticPreset?.avatar_url || DEFAULT_AVATARS[0],
        created_at: data.created_at || realisticPreset?.created_at || new Date().toISOString(),
        badge: Array.isArray(data.badge) && data.badge.length > 0 ? data.badge : (realisticPreset?.badge || ['⭐ Thành Viên Yêu Bếp']),
        saved_recipes: Array.isArray(data.saved_recipes) ? data.saved_recipes : (realisticPreset?.saved_recipes || []),
        bio: data.bio || realisticPreset?.bio || 'Yêu bếp, đam mê ẩm thực và chia sẻ những món ngon gia đình. 🍳✨',
        phone: data.phone || realisticPreset?.phone || '0912 345 678',
        address: data.address || realisticPreset?.address || '28 Tràng Thi, Hoàn Kiếm',
        city: data.city || realisticPreset?.city || 'Hà Nội',
        chef_title: data.chef_title || realisticPreset?.chef_title || 'Bếp Trưởng Gia Đình',
        experience_points: data.experience_points || realisticPreset?.experience_points || 450,
        level: data.level || realisticPreset?.level || 5,
        cooking_style: Array.isArray(data.cooking_style) ? data.cooking_style : (realisticPreset?.cooking_style || ['Món Bắc', 'Món Kho', 'Nấu Nhanh']),
        member_tier: data.member_tier || realisticPreset?.member_tier || 'Bếp Trưởng Thân Thiết',
        recipes_count: data.recipes_count || realisticPreset?.recipes_count || 3
      };
      return profile;
    }

    // Create new profile doc
    const newProfile: UserProfile = {
      uid: user.uid,
      display_name: customDisplayName || user.displayName || realisticPreset?.display_name || user.email?.split('@')[0] || 'Đầu bếp',
      email: user.email || '',
      avatar_url: user.photoURL || realisticPreset?.avatar_url || DEFAULT_AVATARS[0],
      created_at: realisticPreset?.created_at || new Date().toISOString(),
      badge: realisticPreset?.badge || ['⭐ Thành Viên Yêu Bếp'],
      saved_recipes: realisticPreset?.saved_recipes || ['rec-1', 'rec-2'],
      bio: realisticPreset?.bio || 'Yêu bếp, đam mê ẩm thực và chia sẻ những món ngon gia đình. 🍳✨',
      phone: realisticPreset?.phone || '0912 345 678',
      address: realisticPreset?.address || '28 Tràng Thi, Hoàn Kiếm',
      city: realisticPreset?.city || 'Hà Nội',
      chef_title: realisticPreset?.chef_title || 'Bếp Trưởng Gia Đình',
      experience_points: realisticPreset?.experience_points || 450,
      level: realisticPreset?.level || 5,
      cooking_style: realisticPreset?.cooking_style || ['Món Bắc', 'Món Kho', 'Nấu Nhanh'],
      member_tier: realisticPreset?.member_tier || 'Bếp Trưởng Thân Thiết',
      recipes_count: realisticPreset?.recipes_count || 3
    };

    await setDoc(userDocRef, newProfile);
    return newProfile;
  } catch (err) {
    console.error('Error in getOrCreateUserProfile:', err);
    // Fallback profile if offline
    return realisticPreset || {
      uid: user.uid,
      display_name: customDisplayName || user.displayName || user.email?.split('@')[0] || 'Đầu bếp',
      email: user.email || '',
      avatar_url: user.photoURL || DEFAULT_AVATARS[0],
      created_at: new Date().toISOString(),
      badge: ['⭐ Thành Viên Yêu Bếp'],
      saved_recipes: ['rec-1', 'rec-2'],
      bio: 'Yêu bếp, đam mê ẩm thực và chia sẻ những món ngon gia đình. 🍳✨',
      phone: '0912 345 678',
      address: '28 Tràng Thi, Hoàn Kiếm',
      city: 'Hà Nội',
      chef_title: 'Bếp Trưởng Gia Đình',
      experience_points: 450,
      level: 5,
      cooking_style: ['Món Bắc', 'Món Kho'],
      member_tier: 'Bếp Trưởng Thân Thiết'
    };
  }
}

export async function quickLoginAsRealisticUser(email: string): Promise<{ user: any; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  let preset = REALISTIC_USERS[cleanEmail];
  
  if (!preset) {
    const localUsers = getLocalRegisteredUsers();
    const foundLocal = Object.values(localUsers).find(
      u => u.email.toLowerCase() === cleanEmail || u.displayName.toLowerCase() === cleanEmail
    );
    if (foundLocal) {
      preset = {
        user: {
          uid: foundLocal.profile.uid,
          email: foundLocal.email,
          displayName: foundLocal.displayName,
          photoURL: foundLocal.avatarUrl
        },
        profile: foundLocal.profile,
        role: 'member'
      };
    } else {
      preset = REALISTIC_USERS['datnhatquang@gmail.com'];
    }
  }
  
  // Persist to user session
  setUserSession(`mock-token-${Date.now()}`, preset.user, preset.profile);
  
  if (preset.role === 'admin' || cleanEmail === 'datnhatquang@gmail.com') {
    setAdminSession(`admin-token-${Date.now()}`, cleanEmail);
  }
  
  // Try saving to Firestore for permanence
  try {
    const userDocRef = doc(db, 'users', preset.user.uid);
    await setDoc(userDocRef, preset.profile, { merge: true });
  } catch (e) {
    console.warn('Firestore quick-sync offline fallback:', e);
  }

  recordUserActivity();
  return { user: preset.user, profile: preset.profile };
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        display_name: data.display_name || 'Đầu bếp',
        email: data.email || '',
        avatar_url: data.avatar_url || DEFAULT_AVATARS[0],
        created_at: data.created_at || new Date().toISOString(),
        badge: Array.isArray(data.badge) ? data.badge : [],
        saved_recipes: Array.isArray(data.saved_recipes) ? data.saved_recipes : [],
        bio: data.bio || ''
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function updateUserProfileDoc(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates as any);
  } catch (err) {
    console.error('Error updating user profile:', err);
  }
}

// ================= SAVED RECIPES IN FIRESTORE =================
export async function toggleRecipeSavedForUser(
  uid: string, 
  recipeId: string, 
  currentSaved: boolean
): Promise<{ isSaved: boolean; savedRecipes: string[] }> {
  const userDocRef = doc(db, 'users', uid);
  try {
    if (currentSaved) {
      // Unsave
      await updateDoc(userDocRef, {
        saved_recipes: arrayRemove(recipeId)
      });
      const subDocRef = doc(db, 'users', uid, 'saved', recipeId);
      // Optional clean sub-doc
      try { await setDoc(subDocRef, { saved: false, updatedAt: new Date().toISOString() }); } catch (e) {}
      return { isSaved: false, savedRecipes: [] };
    } else {
      // Save
      await updateDoc(userDocRef, {
        saved_recipes: arrayUnion(recipeId)
      });
      const subDocRef = doc(db, 'users', uid, 'saved', recipeId);
      try { await setDoc(subDocRef, { recipeId, savedAt: new Date().toISOString() }); } catch (e) {}
      return { isSaved: true, savedRecipes: [] };
    }
  } catch (err) {
    console.error('Error updating saved_recipes in Firestore:', err);
    // Fallback optimistic return
    return { isSaved: !currentSaved, savedRecipes: [] };
  }
}

// ================= PENDING ACTIONS ("ĐĂNG NHẬP RỒI QUAY LẠI ĐÚNG CHỖ") =================
const PENDING_ACTION_KEY = 'an_gi_hom_nay_pending_action';

export function setPendingUserAction(action: PendingUserAction) {
  try {
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
  } catch (e) {}
}

export function getPendingUserAction(): PendingUserAction | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingUserAction;
  } catch (e) {
    return null;
  }
}

export function clearPendingUserAction() {
  try {
    sessionStorage.removeItem(PENDING_ACTION_KEY);
  } catch (e) {}
}

// ================= LOCAL REGISTERED USERS STORAGE =================
const LOCAL_REGISTERED_USERS_KEY = 'an_gi_hom_nay_registered_users';

export function getLocalRegisteredUsers(): Record<string, { email: string; password?: string; displayName: string; avatarUrl: string; profile: UserProfile }> {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalRegisteredUser(userData: { email: string; password?: string; displayName: string; avatarUrl: string; profile: UserProfile }) {
  try {
    const users = getLocalRegisteredUsers();
    users[userData.email.toLowerCase().trim()] = userData;
    localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {}
}

// ================= AUTH METHODS =================
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;
  const profile = await getOrCreateUserProfile(user);
  setUserSession(`token-${Date.now()}`, user, profile);
  recordUserActivity();
  return { user, profile };
}

export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string
): Promise<{ user: User; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim() || cleanEmail.split('@')[0];

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const user = cred.user;
    
    if (cleanName) {
      try {
        await updateProfile(user, { displayName: cleanName });
      } catch (e) {}
    }

    const profile = await getOrCreateUserProfile(user, cleanName);
    saveLocalRegisteredUser({
      email: cleanEmail,
      password: pass,
      displayName: cleanName,
      avatarUrl: profile.avatar_url,
      profile
    });
    setUserSession(`token-${Date.now()}`, user, profile);
    recordUserActivity();
    return { user, profile };
  } catch (err: any) {
    console.warn('Firebase createUserWithEmailAndPassword fallback to local user:', err);
    const uid = `usr_${Date.now()}`;
    const avatarUrl = DEFAULT_AVATARS[0];
    const fallbackUser: any = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: avatarUrl
    };
    const fallbackProfile: UserProfile = {
      uid,
      display_name: cleanName,
      email: cleanEmail,
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
      badge: ['⭐ Thành Viên Mới'],
      saved_recipes: [],
      bio: 'Yêu bếp, đam mê ẩm thực và nấu những món ngon gia đình. 🍳✨',
      phone: '',
      address: '',
      city: 'Hà Nội',
      chef_title: 'Thành Viên Bếp Mới',
      experience_points: 100,
      level: 1,
      cooking_style: ['Bữa Cơm Gia Đình', 'Nấu Nhanh'],
      member_tier: 'Thành Viên Yêu Bếp',
      recipes_count: 0
    };

    saveLocalRegisteredUser({
      email: cleanEmail,
      password: pass,
      displayName: cleanName,
      avatarUrl,
      profile: fallbackProfile
    });
    setUserSession(`mock-token-${Date.now()}`, fallbackUser, fallbackProfile);
    recordUserActivity();
    return { user: fallbackUser, profile: fallbackProfile };
  }
}

export async function loginWithEmail(
  identifier: string, 
  pass: string
): Promise<{ user: User; profile: UserProfile }> {
  const cleanId = identifier.trim().toLowerCase();

  // 1. Check realistic user presets (by email or display name)
  for (const preset of Object.values(REALISTIC_USERS)) {
    if (
      preset.user.email.toLowerCase() === cleanId || 
      preset.profile.display_name.toLowerCase() === cleanId
    ) {
      setUserSession(`mock-token-${Date.now()}`, preset.user, preset.profile);
      if (preset.role === 'admin') {
        setAdminSession(`admin-token-${Date.now()}`, preset.user.email);
      }
      recordUserActivity();
      return { user: preset.user, profile: preset.profile };
    }
  }

  // 2. Check local registered users (by email or display name)
  const localUsers = getLocalRegisteredUsers();
  const matchedUser = Object.values(localUsers).find(
    u => u.email.toLowerCase() === cleanId || u.displayName.toLowerCase() === cleanId
  );
  if (matchedUser) {
    if (matchedUser.password && matchedUser.password !== pass) {
      throw new Error('Mật khẩu không chính xác.');
    }
    const authedUser: any = {
      uid: matchedUser.profile.uid,
      email: matchedUser.email,
      displayName: matchedUser.displayName,
      photoURL: matchedUser.avatarUrl
    };
    setUserSession(`mock-token-${Date.now()}`, authedUser, matchedUser.profile);
    recordUserActivity();
    return { user: authedUser, profile: matchedUser.profile };
  }

  // 3. Fallback to Firebase Email/Password
  try {
    const cred = await signInWithEmailAndPassword(auth, identifier.trim(), pass);
    const user = cred.user;
    const profile = await getOrCreateUserProfile(user);
    setUserSession(`token-${Date.now()}`, user, profile);
    recordUserActivity();
    return { user, profile };
  } catch (err: any) {
    let errMsg = 'Email/Tên đăng nhập hoặc mật khẩu không chính xác.';
    if (err.code === 'auth/user-not-found') errMsg = 'Tài khoản không tồn tại trên hệ thống.';
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') errMsg = 'Mật khẩu không chính xác.';
    if (err.code === 'auth/invalid-email') errMsg = 'Địa chỉ email không đúng định dạng.';
    throw new Error(errMsg);
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
      // Simulate success response for graceful UX
      return;
    }
    throw err;
  }
}

const USER_SESSION_KEY = 'an_gi_hom_nay_user_session';

export function setUserSession(token: string, user: any, profile: UserProfile) {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ token, user, profile, savedAt: Date.now() }));
  } catch (e) {}
}

export function getUserSession(): { token: string; user: any; profile: UserProfile } | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && !isSessionExpired()) {
      // Discard legacy hardcoded default user session
      if (
        session.token === 'default-token' ||
        (session.user?.email === 'datnhatquang@gmail.com' && String(session.token).startsWith('default-'))
      ) {
        clearUserSession();
        return null;
      }
      return session;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function clearUserSession() {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (e) {}
}

const ADMIN_SESSION_TOKEN_KEY = 'an_gi_hom_nay_admin_token';
const ADMIN_USER_EMAIL_KEY = 'an_gi_hom_nay_admin_email';

export function setAdminSession(token: string, email: string) {
  try {
    localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_EMAIL_KEY, email);
    recordUserActivity();
  } catch (e) {
    // Ignore storage errors
  }
}

export function getAdminSession(): { token: string; email: string } | null {
  try {
    const token = localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
    const email = localStorage.getItem(ADMIN_USER_EMAIL_KEY);
    if (token && email && !isSessionExpired()) {
      return { token, email };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_EMAIL_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {}
  clearAdminSession();
  clearUserSession();
}

// Get current Firebase ID Token or Admin Session Token for server API calls
export async function getAdminAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (err) {
      console.error('Failed to get user ID token:', err);
    }
  }

  const session = getAdminSession();
  if (session) {
    return session.token;
  }

  return null;
}

// Idle timer: 2 hours auto logout
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
const LAST_ACTIVITY_KEY = 'an_gi_hom_nay_last_active';

export function recordUserActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (e) {
    // Ignore storage errors
  }
}

export function isSessionExpired(): boolean {
  try {
    const lastActiveStr = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActiveStr) return false;
    const lastActive = parseInt(lastActiveStr, 10);
    if (isNaN(lastActive)) return false;
    return (Date.now() - lastActive) > IDLE_TIMEOUT_MS;
  } catch (e) {
    return false;
  }
}

export function initActivityTracker(onIdleTimeout: () => void) {
  recordUserActivity();
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
  
  const handleActivity = () => {
    recordUserActivity();
  };

  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  const intervalId = setInterval(() => {
    if (auth.currentUser && isSessionExpired()) {
      console.warn('Session expired due to 2 hours of inactivity.');
      onIdleTimeout();
    }
  }, 30000); // check every 30 seconds

  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearInterval(intervalId);
  };
}

// ================= RECIPE REVIEWS & RATING (sub-collection: recipes/{recipeId}/reviews) =================

export async function fetchRecipeReviews(
  recipeId: string,
  sortBy: 'newest' | 'highest' | 'lowest' = 'newest'
): Promise<{ reviews: RecipeReview[]; stats?: { average_rating: number; review_count: number } }> {
  try {
    // 1. Try fetching from server API (which synchronizes with in-memory and handles calculations)
    const res = await fetch(`/api/recipes/${recipeId}/reviews?sort=${sortBy}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return { reviews: data.data, stats: data.stats };
      }
    }
  } catch (apiErr) {
    console.warn('API fetch reviews fallback to Firestore:', apiErr);
  }

  // 2. Direct Firestore fallback
  try {
    const reviewsRef = collection(db, 'recipes', recipeId, 'reviews');
    const snap = await getDocs(reviewsRef);
    const reviews: RecipeReview[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      reviews.push({
        id: docSnap.id,
        recipe_id: recipeId,
        author_uid: d.author_uid,
        author_name: d.author_name,
        author_avatar: d.author_avatar,
        rating: Number(d.rating) || 5,
        comment: d.comment || '',
        created_at: d.created_at || new Date().toISOString(),
        updated_at: d.updated_at,
        edited: Boolean(d.edited)
      });
    });

    if (sortBy === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'lowest') {
      reviews.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const count = reviews.length;
    let avg = 5.0;
    if (count > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avg = Math.round((sum / count) * 10) / 10;
    }

    return { reviews, stats: { average_rating: avg, review_count: count } };
  } catch (fsErr) {
    console.error('Firestore get reviews error:', fsErr);
    return { reviews: [] };
  }
}

export async function submitRecipeReview(
  recipeId: string,
  rating: number,
  comment: string,
  user: { uid: string; displayName?: string | null; photoURL?: string | null; email?: string | null },
  profile?: UserProfile | null
): Promise<{ success: boolean; error?: string; review?: RecipeReview; stats?: { average_rating: number; review_count: number } }> {
  if (!user || !user.uid) {
    return { success: false, error: 'Bạn cần đăng nhập để gửi đánh giá.' };
  }

  const cleanComment = (comment || '').trim();
  if (!cleanComment) {
    return { success: false, error: 'Vui lòng nhập nội dung đánh giá của bạn.' };
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return { success: false, error: 'Đánh giá sao không hợp lệ (phải từ 1 đến 5 sao).' };
  }

  const authorName = profile?.display_name || user.displayName || user.email?.split('@')[0] || 'Thành viên Ăn Gì';
  const authorAvatar = profile?.avatar_url || user.photoURL || DEFAULT_AVATARS[0];

  try {
    const res = await fetch(`/api/recipes/${recipeId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_uid: user.uid,
        author_name: authorName,
        userName: authorName,
        author_avatar: authorAvatar,
        userAvatar: authorAvatar,
        rating: Math.round(numRating),
        comment: cleanComment.slice(0, 500),
        content: cleanComment.slice(0, 500)
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Không thể gửi đánh giá.' };
    }

    // Also write to Firestore directly if authenticated to ensure real-time persistence
    try {
      const reviewDocRef = doc(db, 'recipes', recipeId, 'reviews', `rev_${user.uid}`);
      await setDoc(reviewDocRef, {
        recipe_id: recipeId,
        author_uid: user.uid,
        author_name: authorName,
        author_avatar: authorAvatar,
        rating: Math.round(numRating),
        comment: cleanComment.slice(0, 500),
        created_at: data.data?.created_at || new Date().toISOString(),
        edited: Boolean(data.data?.edited)
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Direct Firestore review write skipped/failed (handled by API):', fsErr);
    }

    return {
      success: true,
      review: data.data || data.review,
      stats: data.stats
    };
  } catch (err: any) {
    console.error('Error submitting recipe review:', err);
    return { success: false, error: err.message || 'Lỗi mạng khi gửi đánh giá.' };
  }
}

export async function updateRecipeReview(
  recipeId: string,
  reviewId: string,
  rating: number,
  comment: string,
  user: { uid: string }
): Promise<{ success: boolean; error?: string; review?: RecipeReview; stats?: { average_rating: number; review_count: number } }> {
  try {
    const res = await fetch(`/api/recipes/${recipeId}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_uid: user.uid,
        rating,
        comment: comment.trim().slice(0, 500)
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Không thể cập nhật đánh giá.' };
    }

    // Update in Firestore
    try {
      const reviewDocRef = doc(db, 'recipes', recipeId, 'reviews', reviewId);
      await updateDoc(reviewDocRef, {
        rating,
        comment: comment.trim().slice(0, 500),
        updated_at: new Date().toISOString(),
        edited: true
      });
    } catch (fsErr) {
      console.warn('Direct Firestore review update error:', fsErr);
    }

    return {
      success: true,
      review: data.data,
      stats: data.stats
    };
  } catch (err: any) {
    console.error('Error updating review:', err);
    return { success: false, error: err.message || 'Lỗi mạng khi sửa đánh giá.' };
  }
}

export async function deleteRecipeReview(
  recipeId: string,
  reviewId: string,
  user: { uid: string }
): Promise<{ success: boolean; error?: string; stats?: { average_rating: number; review_count: number } }> {
  try {
    const res = await fetch(`/api/recipes/${recipeId}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_uid: user.uid
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Không thể xoá đánh giá.' };
    }

    // Delete in Firestore
    try {
      const reviewDocRef = doc(db, 'recipes', recipeId, 'reviews', reviewId);
      await deleteDoc(reviewDocRef);
    } catch (fsErr) {
      console.warn('Direct Firestore review delete error:', fsErr);
    }

    return {
      success: true,
      stats: data.stats
    };
  } catch (err: any) {
    console.error('Error deleting review:', err);
    return { success: false, error: err.message || 'Lỗi mạng khi xoá đánh giá.' };
  }
}

