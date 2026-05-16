import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { Home, Briefcase, Wallet, User as UserIcon, Send, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { NotificationListener } from './NotificationListener';
import { Onboarding } from './Onboarding';
import { WelcomePopup } from './WelcomePopup';
import toast from 'react-hot-toast';
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

  const handleNotificationClick = () => {
    toast('No new notifications', {
      icon: '📭',
      style: {
        borderRadius: '10px',
        background: '#1e293b',
        color: '#fff',
      },
    });
  };

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
          <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-t-3xl px-6 py-4 flex justify-between items-center z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.2)] border-t border-white/50 dark:border-slate-800/50 transition-colors">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative px-2",
                    isActive ? "text-indigo-600 dark:text-indigo-400 -translate-y-1" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute -top-4 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                    )}
                    <item.icon className={cn("w-6 h-6 mb-1.5 transition-transform duration-300", isActive && "scale-110")} />
                    <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
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
