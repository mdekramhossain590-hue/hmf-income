import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { Home, Briefcase, Wallet, User as UserIcon, Send } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { NotificationListener } from './NotificationListener';
import { Onboarding } from './Onboarding';
import { WelcomePopup } from './WelcomePopup';
import { AnimatePresence, motion } from 'motion/react';

export function Layout() {
  const { user, siteSettings } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentOutlet = useOutlet();

  if (!user && location.pathname !== '/login') {
    // If not logged in, we only show outlet without bottom nav if not on login, but the routing handles redirects.
  }

  const navItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/tasks', icon: Briefcase, label: t('jobs') },
    { to: '/wallet', icon: Wallet, label: t('wallet') },
    { to: '/profile', icon: UserIcon, label: t('profile') },
  ];

  const currentTabValue = navItems.find(item => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  })?.to || '';

  return (
    <div className="max-w-[480px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen relative shadow-2xl overflow-x-hidden pb-[90px] transition-colors">
      <NotificationListener />
      
      <div className="w-full h-full min-h-screen relative flex flex-col">
        <div className="flex-grow">
          {currentOutlet}
        </div>
        <div className="py-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide flex flex-col gap-1 items-center justify-center pb-8 border-t border-slate-100 dark:border-slate-800/60 mt-10">
          <p>© 2026 hmf income. All Rights Reserved.</p>
          <p>
            Developed by: <a href="https://www.facebook.com/profile.php?id=61589359523258" target="_blank" rel="noopener noreferrer" className="text-sky-500 font-bold hover:underline">Hmf Ekram</a>
          </p>
        </div>
      </div>
      
      {user && (
        <>
          <WelcomePopup />
          <Onboarding />
          <a
            href={siteSettings?.telegramUrl || "https://t.me/"}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-[90px] right-5 z-50 w-14 h-14 bg-gradient-to-tr from-[#0088cc] to-[#39abef] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0088cc]/40 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ring-2 ring-white/10 dark:ring-slate-800"
          >
            <Send className="w-6 h-6 ml-[-2px] mt-[2px]" />
          </a>
          <Tabs.Root 
            value={currentTabValue} 
            onValueChange={(val) => {
              if (val) navigate(val);
            }} 
            className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[28px] z-50 shadow-[0_-12px_44px_rgba(0,0,0,0.05)] dark:shadow-[0_-12px_44px_rgba(0,0,0,0.3)] border-t border-slate-150/45 dark:border-slate-800/40 transition-colors select-none"
          >
            <Tabs.List className="flex justify-between items-center px-4 py-2" aria-label="Main navigation tabs">
              {navItems.map((item) => {
                const isActive = currentTabValue === item.to;
                return (
                  <Tabs.Trigger
                    key={item.to}
                    value={item.to}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center cursor-pointer transition-all duration-300 relative focus:outline-none rounded-xl h-16",
                      isActive 
                        ? "text-white" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute -top-[20px] w-[56px] h-[56px] bg-[#00AEEF] rounded-full shadow-[0_4px_16px_rgba(0,174,239,0.4)] border-[6px] border-white dark:border-slate-900 z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    
                    {isActive ? (
                      <div className="relative z-10 flex flex-col items-center w-full h-full pb-1">
                        <div className="absolute top-[-4px]">
                          <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-bold tracking-wide leading-none text-[#00AEEF] dark:text-[#39abef] absolute bottom-1.5">{item.label}</span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-0.5">
                        <item.icon className="w-6 h-6 mb-1.5 opacity-60" strokeWidth={2.2} />
                        <span className="text-[11px] font-medium tracking-wide leading-none text-slate-500 dark:text-slate-400">{item.label}</span>
                      </div>
                    )}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Tabs.Root>
        </>
      )}
    </div>
  );
}
