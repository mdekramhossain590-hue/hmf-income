import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { useLanguage } from './LanguageProvider';
import { ShieldAlert, LogOut } from 'lucide-react';

const safeStringify = (obj: any) => {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return undefined;
        cache.add(value);
        if (value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
          return undefined; 
        }
      }
      return value;
    });
  } catch (error: any) {
    return '{}';
  }
};

const detectQuotaError = (error: any) => {
  const msg = error?.message?.toLowerCase() || '';
  return (
    msg.includes('quota') ||
    msg.includes('resource exhausted') ||
    msg.includes('client is offline') ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('backend didn\'t respond')
  );
};

export interface UserProfile {
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin' | 'employee';
  deviceId?: string;
  photoURL?: string;
  balance?: number;
  balances?: Record<string, number>;
  walletAddress?: string;
  phone?: string;
  referralCode?: string;
  createdAt?: string;
  referredBy?: string;
  approvedTasks?: number;
  rejectedTasks?: number;
  fullName?: string;
  myReferCode?: string;
  usedReferCode?: string;
  totalReferrals?: number;
  totalTasksCompleted?: number;
  totalSpinsPlayed?: number;
  partnerReferrals?: number;
  isActive?: boolean;
  uid?: string;
  partnerClaimedAt?: any;
  permissions?: any;
  referralBonusPaid?: boolean;
  totalMathsPlayed?: number;
  [key: string]: any;
}

export interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
  telegramUrl?: string;
  adsViewLink?: string;
  adsViewText?: string;
  dailyTaskLimit?: number;
  driveOffersEnabled?: boolean;
  coursesEnabled?: boolean;
  rechargeEnabled?: boolean;
  adsViewEnabled?: boolean;
  reviewsEnabled?: boolean;
  apkUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  siteSettings: SiteSettings;
  isQuotaExceeded: boolean;
  logOut: () => Promise<void>;
  refreshProfile: (uid?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  setProfile: () => {},
  loading: true,
  siteSettings: {
    siteName: 'HMF EARNING ZONE',
    logoUrl: '',
    apkUrl: 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file'
  },
  isQuotaExceeded: false,
  logOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  setSiteSettings: () => {},
});

export const generateUserReferralCode = (fullName?: string): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let prefix = '';
  const trimmed = (fullName || '').trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && parts[0][0] && parts[1][0] && /[a-zA-Z]/.test(parts[0][0]) && /[a-zA-Z]/.test(parts[1][0])) {
    prefix = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (trimmed.length >= 2 && /[a-zA-Z]/.test(trimmed[0]) && /[a-zA-Z]/.test(trimmed[1])) {
    prefix = (trimmed[0] + trimmed[1]).toUpperCase();
  } else {
    for (let i = 0; i < 2; i++) {
      prefix += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }
  let digits = '';
  for (let i = 0; i < 6; i++) {
    digits += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return `${prefix}${digits}`;
};

const ensureValidReferralCode = async (uid: string, data: any): Promise<any> => {
  if (!data) return data;
  if (!data.myReferCode || typeof data.myReferCode !== 'string' || data.myReferCode.trim() === '' || data.myReferCode === 'none') {
    const newReferCode = generateUserReferralCode(data.fullName || data.name);
    data.myReferCode = newReferCode;
    try {
      await updateDoc(doc(db, 'users', uid), { myReferCode: newReferCode });
    } catch (e: any) {
      console.warn("Could not persist auto-generated refer code:", e?.message || e);
    }
  }
  return data;
};

const normalizeProfileData = (targetUid: string, rawData: any): UserProfile => {
  let mainBal = Number(
    (rawData.balances?.main !== undefined && rawData.balances?.main !== null && Number(rawData.balances?.main) > 0)
      ? rawData.balances.main
      : (typeof rawData.balance === 'number' && rawData.balance > 0 ? rawData.balance : (Number(rawData.balances?.main) || Number(rawData.balance) || 0))
  );

  const bonusBal = Number(rawData.balances?.bonus || 0);
  const refBal = Number(rawData.balances?.referral || 0);
  const partnerBal = Number(rawData.balances?.partner || 0);
  const giftBal = Number(rawData.balances?.gift || 0);
  const tasksBal = rawData.balances?.tasks || {};

  const email = (rawData.email || auth.currentUser?.email || '').toLowerCase();
  const isAdminUser = email === 'mdekramhossain590@gmail.com' || rawData.role === 'admin' || rawData.role === 'super_admin';

  if (isAdminUser && mainBal === 0 && bonusBal === 0 && refBal === 0 && partnerBal === 0 && giftBal === 0) {
    mainBal = 500;
    try {
      setDoc(doc(db, 'users', targetUid), {
        balance: 500,
        balances: { main: 500, bonus: 0, referral: 0, partner: 0, gift: 0 },
        isActive: true,
        role: 'admin'
      }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'leaderboard', targetUid), {
        fullName: rawData.fullName || 'Admin',
        totalIncome: 500,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } catch (e) {}
  }

  return {
    ...rawData,
    id: targetUid,
    uid: targetUid,
    role: isAdminUser ? 'admin' : (rawData.role || 'user'),
    balance: mainBal,
    balances: {
      main: mainBal,
      bonus: bonusBal,
      referral: refBal,
      partner: partnerBal,
      gift: giftBal,
      tasks: tasksBal
    },
    totalReferrals: Number(rawData.totalReferrals || 0),
    partnerReferrals: Number(rawData.partnerReferrals || 0)
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const lastUid = localStorage.getItem('last_user_uid');
        if (lastUid) {
          const cached = localStorage.getItem(`profile_${lastUid}`);
          if (cached) return JSON.parse(cached);
        }
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('siteSettings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.apkUrl) {
          parsed.apkUrl = 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file';
        }
        if (!parsed.siteName || parsed.siteName.toLowerCase().includes('income')) {
          parsed.siteName = 'HMF EARNING ZONE';
        }
        return parsed;
      }
    } catch (e: any) {}
    return {
      siteName: 'HMF EARNING ZONE',
      logoUrl: '',
      apkUrl: 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file'
    };
  });

  const { t } = useLanguage();

  const refreshProfile = async (uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return;

    try {
      const docSnap = await getCachedDoc(doc(db, 'users', targetUid), true);
      if (docSnap.exists()) {
        let raw = { id: targetUid, uid: targetUid, ...docSnap.data() };
        raw = await ensureValidReferralCode(targetUid, raw);
        const data = normalizeProfileData(targetUid, raw);
        setProfile(prev => {
          if (!prev) return data;
          return { ...data, deviceId: data.deviceId || prev.deviceId };
        });
        
        try {
          localStorage.setItem(`profile_${targetUid}`, safeStringify(data));
        } catch (e: any) {}
      } else {
        // If document doesn't exist yet, auto-bootstrap it so user is never empty
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === targetUid) {
          const defaultReferCode = generateUserReferralCode(currentUser.displayName || currentUser.email || 'User');
          const newProfileData: any = {
            id: targetUid,
            uid: targetUid,
            email: currentUser.email || '',
            fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            role: (currentUser.email?.toLowerCase() === 'mdekramhossain590@gmail.com') ? 'admin' : 'user',
            myReferCode: defaultReferCode,
            usedReferCode: 'none',
            balances: { main: 0, bonus: 0, referral: 0, partner: 0, tasks: 0 },
            balance: 0,
            isActive: true,
            totalReferrals: 0,
            partnerReferrals: 0,
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(doc(db, 'users', targetUid), newProfileData, { merge: true });
          } catch (e) {}
          setProfile(newProfileData);
          try {
            localStorage.setItem(`profile_${targetUid}`, safeStringify(newProfileData));
          } catch (e) {}
        }
      }
    } catch (error: any) {
      if (detectQuotaError(error)) {
        setIsQuotaExceeded(true);
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
      await refreshProfile();
    } catch (error: any) {
      if (detectQuotaError(error)) {
        setIsQuotaExceeded(true);
      }
      throw error;
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    let unsubscribeProfile: any = null;
    let unsubscribeSettings: any = null;

    const fetchSiteSettings = async () => {
      try {
        const snap = await getCachedDoc(doc(db, "settings", "site"), true);
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          if (!data.siteName || data.siteName.toLowerCase().includes('income')) {
            data.siteName = 'HMF EARNING ZONE';
          }
          if (!data.apkUrl) {
            data.apkUrl = 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file';
          }
          if (data.adsViewEnabled === undefined) {
              data.adsViewEnabled = false;
          } else {
              data.adsViewEnabled = !!data.adsViewEnabled;
          }
          setSiteSettings(data);
          try {
            localStorage.setItem('siteSettings', safeStringify(data));
          } catch (e: any) {}
          if (data.logoUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.logoUrl;
          }
        }
      } catch (e: any) {
        if (detectQuotaError(e)) {
          setIsQuotaExceeded(true);
          console.warn("Firestore Quota exceeded. Site may not function properly until reset.");
        } else {
          console.warn("Error fetching site settings:", e.message || "Unknown Error");
        }
      }
    };

    fetchSiteSettings();

    try {
      unsubscribeSettings = onSnapshot(doc(db, "settings", "site"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          if (!data.siteName || data.siteName.toLowerCase().includes('income')) {
            data.siteName = 'HMF EARNING ZONE';
          }
          if (!data.apkUrl) {
            data.apkUrl = 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file';
          }
          if (data.adsViewEnabled === undefined) {
              data.adsViewEnabled = false;
          } else {
              data.adsViewEnabled = !!data.adsViewEnabled;
          }
          setSiteSettings(data);
          try {
            localStorage.setItem('siteSettings', safeStringify(data));
          } catch (e: any) {}
        }
      });
    } catch (e: any) {
      console.warn("Could not setup settings snapshot");
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          localStorage.setItem('last_user_uid', user.uid);
          const cached = localStorage.getItem(`profile_${user.uid}`);
          if (cached) {
            setProfile(JSON.parse(cached));
          }
        } catch (e) {}
        
        await refreshProfile(user.uid);
        
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (docSnap: any) => {
            if (docSnap.exists()) {
              let raw = { id: user.uid, uid: user.uid, ...docSnap.data() };
              raw = await ensureValidReferralCode(user.uid, raw);
              const data = normalizeProfileData(user.uid, raw);
              setProfile(prev => {
                if (!prev) return data;
                return { ...data, deviceId: data.deviceId || prev.deviceId };
              });
              try {
                localStorage.setItem(`profile_${user.uid}`, safeStringify(data));
              } catch (e: any) {}
            }
          });
        } catch (e: any) {
          console.warn("Could not setup profile snapshot");
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Auth state change error:", error.message || "Unknown Error");
      if (detectQuotaError(error)) {
        setIsQuotaExceeded(true);
      }
      setLoading(false);
    });

    const loadingFallback = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      if (unsubscribeSettings) {
        unsubscribeSettings();
      }
      clearTimeout(loadingFallback);
    };
  }, []);

  if (isQuotaExceeded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('quota_exceeded')}</h2>
          <p className="text-slate-600 mb-8">{t('quota_exceeded_desc')}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      setProfile,
      loading,
      siteSettings,
      isQuotaExceeded,
      logOut,
      refreshProfile,
      updateProfile,
      setSiteSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
