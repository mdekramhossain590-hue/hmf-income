import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
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
    tasks?: Record<string, number>;
  };
  role: string;
  isActive?: boolean;
  totalReferrals?: number;
  totalTasksCompleted?: number;
  isBlocked?: boolean;
  deviceId?: string;
}

export interface SiteSettings {
  logoUrl?: string;
  faviconUrl?: string;
  telegramUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  siteSettings: SiteSettings;
  refreshProfile: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  siteSettings: {},
  refreshProfile: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    logoUrl: '',
    faviconUrl: ''
  });

  const { t } = useLanguage();

  const refreshProfile = async (uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return;
    
    try {
      const docRef = doc(db, 'users', targetUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-link device ID if missing
        if (!data.deviceId) {
          try {
            const { getDeviceId } = await import('../lib/device');
            const newDeviceId = getDeviceId();
            await updateDoc(docRef, { deviceId: newDeviceId });
            data.deviceId = newDeviceId;
          } catch (e) {
            console.error('Failed to link device ID:', e);
          }
        }
        
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    const fetchSiteSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          setSiteSettings(data);
          if (data.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.faviconUrl;
          }
        }
      } catch (e: any) {
        if (e.message?.includes('Quota exceeded')) {
          console.error("Firestore Quota exceeded. Site may not function properly until reset.");
        } else {
          console.error("Error fetching site settings:", e);
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
    <AuthContext.Provider value={{ user, profile, loading, siteSettings, refreshProfile, logOut }}>
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
