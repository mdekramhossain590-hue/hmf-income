import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Briefcase, Wallet, User as UserIcon, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { NotificationListener } from './NotificationListener';
import { Onboarding } from './Onboarding';
import { WelcomePopup } from './WelcomePopup';
import toast from 'react-hot-toast';

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();

  if (!user && location.pathname !== '/login') {
    // If not logged in, we only show outlet without bottom nav if not on login, but the routing handles redirects.
  }

  const navItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/tasks', icon: Briefcase, label: t('jobs') },
    { to: '/wallet', icon: Wallet, label: t('wallet') },
    { to: '/profile', icon: UserIcon, label: t('profile') },
  ];

  return (
    <div className="max-w-[480px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen relative shadow-2xl overflow-x-hidden pb-[90px] transition-colors">
      <NotificationListener />
      <Outlet />
      
      {user && (
        <>
          <WelcomePopup />
          <Onboarding />
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toast.success('Redirecting to Telegram Group...'); }}
            className="fixed bottom-[100px] right-6 z-50 w-14 h-14 bg-[#2AABEE] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#2AABEE]/40 hover:scale-110 active:scale-95 transition-transform"
          >
            <Send className="w-6 h-6 ml-[-2px] mt-[2px]" />
          </a>
          <div className="fixed bottom-4 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-[448px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl px-6 py-3.5 flex justify-between items-center z-50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/50 dark:border-slate-800/50 transition-colors">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center cursor-pointer transition-all duration-300 relative",
                    isActive ? "text-indigo-600 dark:text-indigo-400 scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:scale-105"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute -top-3 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                    )}
                    <item.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
