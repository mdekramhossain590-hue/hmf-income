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

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.2
  };

  return (
    <div className="max-w-[480px] mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen relative shadow-2xl overflow-x-hidden pb-[90px] transition-colors">
      <NotificationListener />
      
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full h-full min-h-screen relative"
        >
          {currentOutlet}
        </motion.div>
      </AnimatePresence>
      
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
            <Tabs.List className="flex justify-between items-center px-6 py-4" aria-label="Main navigation tabs">
              {navItems.map((item) => {
                const isActive = currentTabValue === item.to;
                return (
                  <Tabs.Trigger
                    key={item.to}
                    value={item.to}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center cursor-pointer transition-all duration-300 relative py-1 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl",
                      isActive 
                        ? "text-indigo-600 dark:text-indigo-400 -translate-y-0.5" 
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute -top-[16px] w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn("w-5.5 h-5.5 mb-1 transition-transform duration-300", isActive && "scale-110")} />
                    <span className="text-[10px] font-black tracking-wide leading-none">{item.label}</span>
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
