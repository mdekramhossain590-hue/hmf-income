import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Reviews } from './pages/Reviews';
import { TaskDetail } from './pages/TaskDetail';
import { Spin } from './pages/Spin';
import { MathQuiz } from './pages/MathQuiz';
import { Refer } from './pages/Refer';
import { Wallet } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Rewards } from './pages/Rewards';
import { Recharge } from './pages/Recharge';
import { GiftCode } from './pages/GiftCode';
import { AdsView } from './pages/AdsView';
import { Drive } from './pages/Drive';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { AdminPanel } from './pages/Admin';
import { Payment } from './pages/Payment';
import { Courses } from './pages/Courses';
import { FAQ } from './pages/FAQ';
import { PostJob } from './pages/PostJob';

import { FullPageLoader } from './components/LoadingSpinner';

import { ActivationPopup } from './components/ActivationPopup';

import { MigrationDashboard } from './pages/MigrationDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullPageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function ActiveGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const [showPopup, setShowPopup] = React.useState(false);
  
  if (loading) return <FullPageLoader />;
  
  // If inactive, show content but maybe block interactions with an overlay?
  // Or just show the ActivationPopup instead of the content
  if (profile && profile.isActive === false && profile.role !== 'admin') {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-30 select-none filter blur-sm">
          {children}
        </div>
        <ActivationPopup onClose={() => window.history.back()} />
      </div>
    );
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullPageLoader />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}


function DynamicFavicon() {
  const { siteSettings } = useAuth();
  React.useEffect(() => {
    if (siteSettings?.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.logoUrl;
      
      let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = siteSettings.logoUrl;
    }
  }, [siteSettings?.logoUrl]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <DynamicFavicon />
      <Toaster position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
          <Routes>
            <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Auth /></PublicRoute>} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<ActiveGuard><Tasks /></ActiveGuard>} />
            <Route path="/post-job" element={<ActiveGuard><PostJob /></ActiveGuard>} />
            <Route path="/reviews" element={<ActiveGuard><Reviews /></ActiveGuard>} />
            <Route path="/tasks/:id" element={<ActiveGuard><TaskDetail /></ActiveGuard>} />
            <Route path="/spin" element={<ActiveGuard><Spin /></ActiveGuard>} />
            <Route path="/math" element={<ActiveGuard><MathQuiz /></ActiveGuard>} />
            <Route path="/refer" element={<ActiveGuard><Refer /></ActiveGuard>} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/gift" element={<ActiveGuard><GiftCode /></ActiveGuard>} />
            <Route path="/drive" element={<ActiveGuard><Drive /></ActiveGuard>} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/ads" element={<ActiveGuard><AdsView /></ActiveGuard>} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<ActiveGuard><Rewards /></ActiveGuard>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/migrate" element={<MigrationDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        </BrowserRouter>
      </AuthProvider>
  );
}
