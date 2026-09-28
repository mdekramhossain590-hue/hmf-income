import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { Home, Briefcase, Wallet, User as UserIcon, Send, HelpCircle } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { NotificationListener } from './NotificationListener';
import { Onboarding } from './Onboarding';
import { WelcomePopup } from './WelcomePopup';
import { AnimatePresence, motion } from 'motion/react';

export function Layout() {
  const { user, siteSettings, isQuotaExceeded } = useAuth();
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
    <div className="w-full sm:max-w-[480px] mx-auto bg-[#090909] min-h-screen relative shadow-none sm:shadow-2xl overflow-x-hidden pb-[90px] transition-colors">
      {isQuotaExceeded && (
        <div className="bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[11px] font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg relative z-[9999] animate-in slide-in-from-top duration-300">
          <span className="animate-bounce text-sm">⚠️</span>
          <p className="leading-snug text-left">
            ফ্রী ফায়ারবেস দৈনিক রিড কোটা শেষ হয়েছে। রিসেন্ট ডাটা ক্যাশ থেকে লোড হচ্ছে। আপনার নিজস্ব হোস্টিং এবং ফায়ারব্যাসে ওল্ড লিমিট এড়াতে বিলিং অন করুন।
          </p>
        </div>
      )}
      <NotificationListener />
      
      <div className="w-full h-full min-h-screen relative flex flex-col">
        <div className="flex-grow">
          {currentOutlet}
        </div>
        <div className="py-6 text-center text-[10px] text-[#737373] font-medium tracking-wide flex flex-col gap-1 items-center justify-center pb-8 border-t border-[#3D3215] mt-10">
          <p>© 2026 HMF EARNING ZONE. All Rights Reserved.</p>
          <p>
            Developed by: <a href="https://www.facebook.com/profile.php?id=61589359523258" target="_blank" rel="noopener noreferrer" className="text-[#FACC15] font-bold hover:underline">Hmf Ekram</a>
          </p>
        </div>
      </div>
      
      {user && (
        <>
          <WelcomePopup />
          <Onboarding />
          <div className="fixed bottom-[90px] right-5 z-50 sm:right-[calc(50%-220px)] pointer-events-auto flex flex-col gap-3">
            <button
              onClick={() => navigate('/support')}
              className="w-14 h-14 bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(212,160,23,0.45)] hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ring-4 ring-[#3D3215]"
              aria-label="Support"
            >
              <HelpCircle className="w-6 h-6 text-[#090909]" />
            </button>
            
          </div>
          <Tabs.Root 
            value={currentTabValue} 
            onValueChange={(val) => {
              if (val) navigate(val);
            }} 
            className="fixed bottom-0 left-0 right-0 mx-auto w-full sm:max-w-[480px] bg-[#151515]/95 backdrop-blur-2xl rounded-t-[28px] z-50 shadow-[0_-12px_44px_rgba(0,0,0,0.6)] border-t border-[#3D3215] transition-colors select-none"
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
                        ? "text-[#FFFFFF]" 
                        : "text-[#737373] hover:text-[#A3A3A3]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute -top-[20px] w-[56px] h-[56px] bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] rounded-full shadow-[0_4px_20px_rgba(212,160,23,0.5)] border-[6px] border-[#090909] z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    
                    {isActive ? (
                      <div className="relative z-10 flex flex-col items-center w-full h-full pb-1">
                        <div className="absolute top-[-4px]">
                          <item.icon className="w-6 h-6 text-[#090909]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-bold tracking-wide leading-none text-[#FACC15] absolute bottom-1.5">{item.label}</span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-0.5">
                        <item.icon className="w-6 h-6 mb-1.5 opacity-60 text-[#737373]" strokeWidth={2.2} />
                        <span className="text-[11px] font-medium tracking-wide leading-none text-[#737373]">{item.label}</span>
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
