import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
}

export interface SiteSettings {
  logoUrl?: string;
  faviconUrl?: string;
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

  const refreshProfile = async (uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return;
    
    try {
      const docRef = doc(db, 'users', targetUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
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
      } catch (e) {
        console.error("Error fetching site settings:", e);
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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
