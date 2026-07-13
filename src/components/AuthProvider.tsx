import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { useLanguage } from './LanguageProvider';
import { ShieldAlert, LogOut } from 'lucide-react';

export interface UserProfile {
  fullName: string;
  email: string;
  photoURL?: string;
  myReferCode: string;
  usedReferCode: string;
  balances: {
    main: number;
    bonus: number;
    referral: number;
    partner?: number;
    tasks?: Record<string, number>;
    gift?: number;
  };
  role: string;
  permissions?: string[];
  isActive?: boolean;
  totalReferrals?: number;
  partnerClaimedAt?: any;
  totalTasksCompleted?: number;
  isBlocked?: boolean;
  deviceId?: string;
}

export interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
  telegramUrl?: string;
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
  refreshProfile: () => Promise<void>;
  logOut: () => Promise<void>;
  isQuotaExceeded: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  siteSettings: {},
  refreshProfile: async () => {},
  logOut: async () => {},
  isQuotaExceeded: false,
});

const detectQuotaError = (err: any): boolean => {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes('quota') || 
    msg.includes('resource_exhausted') || 
    msg.includes('exceeded') ||
    msg.includes('free daily read units') ||
    msg.includes('quota limits') ||
    msg.includes('offline') ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('backend didn\'t respond')
  );
};

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
    } catch(e) {}
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
      const docRef = doc(db, 'users', targetUid);
      
      let timeoutId: any;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('timeout')), 8000);
      });
      
      const docSnap = await Promise.race([
        getDoc(docRef),
        timeoutPromise
      ]) as any;

      clearTimeout(timeoutId);

      if (docSnap && docSnap.exists && docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-link device ID if missing
        if (!data.deviceId) {
          try {
            const { getDeviceId } = await import('../lib/device');
            const newDeviceId = getDeviceId();
            await updateDoc(docRef, { deviceId: newDeviceId });
            data.deviceId = newDeviceId;
          } catch (e) {
             console.warn('Failed to link device ID:', e);
           }
         }
         
         setProfile(data);
         try {
           localStorage.setItem(`profile_${targetUid}`, JSON.stringify(data));
         } catch (e) {}
       } else if (docSnap && docSnap.exists && !docSnap.exists() && auth.currentUser) {
         // Profile is completely missing for logged in user! Recover by recreating basic profile.
         console.warn("Profile completely missing for user. Self-healing by creating default profile.");
         
         const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
         const numbers = '0123456789';
         let myReferCode = '';
         for (let i = 0; i < 2; i++) { myReferCode += letters.charAt(Math.floor(Math.random() * letters.length)); }
         for (let i = 0; i < 6; i++) { myReferCode += numbers.charAt(Math.floor(Math.random() * numbers.length)); }
         
         const defaultProfile: UserProfile = {
           fullName: auth.currentUser.displayName || "User",
           email: auth.currentUser.email || "",
           myReferCode,
           usedReferCode: "none",
           balances: { main: 0, bonus: 0, referral: 0 },
           role: 'user',
           isActive: false,
           deviceId: 'unknown',
         };
         
         try {
           await setDoc(docRef, defaultProfile);
           setProfile(defaultProfile);
         } catch (e) {
           console.error("Failed to self-heal profile", e);
         }
       }
     } catch (error: any) {
       console.warn('Error fetching profile:', error.message || error);
       if (detectQuotaError(error)) {
         setIsQuotaExceeded(true);
       }
       try {
         const cached = localStorage.getItem(`profile_${targetUid}`);
         if (cached) {
           setProfile(JSON.parse(cached));
         }
       } catch (cacheErr) {
         console.warn('Cache read error:', cacheErr);
       }
     }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Auth state change error:", error.message || error);
      if (detectQuotaError(error)) {
        setIsQuotaExceeded(true);
      }
      setLoading(false);
    });

    const fetchSiteSettings = async () => {
      try {
        const snap = await getCachedDoc(doc(db, "settings", "site"));
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          if (!data.apkUrl) {
            data.apkUrl = 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file';
          }
          setSiteSettings(data);
          try {
            localStorage.setItem('siteSettings', JSON.stringify(data));
          } catch(e) {}
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
          console.warn("Error fetching site settings:", e.message || e);
        }
      }
    };
    
    fetchSiteSettings();

    // Fallback for loading state in case auth hang
    const loadingFallback = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      unsubscribeAuth();
      clearTimeout(loadingFallback);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, siteSettings, refreshProfile, logOut, isQuotaExceeded }}>
      {profile?.isBlocked ? (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-xl shadow-rose-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('account_blocked_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">{t('account_blocked_desc')}</p>
          <button 
            onClick={logOut}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            {t('log_out')}
          </button>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
