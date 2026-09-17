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
  loading: true,
  siteSettings: {
    siteName: '',
    logoUrl: '',
    apkUrl: 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file'
  },
  isQuotaExceeded: false,
  logOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  setSiteSettings: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        return parsed;
      }
    } catch (e: any) {}
    return {
      siteName: '',
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
        const data = docSnap.data() as UserProfile;
        setProfile(prev => {
          if (!prev) return data;
          return { ...data, deviceId: data.deviceId || prev.deviceId };
        });
        
        try {
          localStorage.setItem(`profile_${targetUid}`, safeStringify(data));
        } catch (e: any) {}
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
        await refreshProfile(user.uid);
        
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap: any) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
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
