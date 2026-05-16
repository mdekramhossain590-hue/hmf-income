import { useNavigate } from 'react-router-dom';
import { User, Bell, Wallet, ListChecks, Target, Users, Send, MoreVertical, Settings, HelpCircle, LogOut, Award, Shield, FileText, Calculator, Megaphone, Trophy, Copy, Check, Link, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ActivationPopup } from '../components/ActivationPopup';
import { motion } from 'motion/react';
import { playTapSound, playSuccessSound } from '../lib/sound';

export function Dashboard() {
  const { profile, loading, logOut, refreshProfile, siteSettings } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [banner, setBanner] = useState({ text: 'Welcome to HMF Income! Complete tasks and earn money daily.', link: '#' });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const { t } = useLanguage();

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  useEffect(() => {
    if (auth.currentUser?.email === 'mdekramhossain590@gmail.com' && profile && profile.role !== 'admin') {
      const dbRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(dbRef, { role: 'admin' }).then(() => refreshProfile()).catch(() => {});
    }
  }, [profile, auth.currentUser, refreshProfile]);
  
  useEffect(() => {
    // Show popup immediately after login if inactive
    if (profile && profile.isActive === false && profile.role !== 'admin') {
      // Check if we haven't already dismissed it recently (optional), but let's just show it once on mount
      setShowActivationPopup(true);
    }
  }, [profile?.isActive, profile?.role]);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const bannerDoc = await getDoc(doc(db, "settings", "banner"));
        if (bannerDoc.exists()) {
          setBanner(bannerDoc.data() as { text: string, link: string });
        }
      } catch (e) {
        console.error("Error fetching banner", e);
      }
    };
    fetchBanner();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeData = {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth() + 1,
    day: currentTime.getDate(),
    hours: currentTime.getHours(),
    minutes: currentTime.getMinutes(),
    seconds: currentTime.getSeconds()
  };

  return (
    <div className="pt-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 -ml-1 text-[#0D47A1] dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition relative z-20"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute top-10 left-0 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 py-3 w-64 z-30 overflow-hidden shadow-black/40">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mx-3 rounded-xl mb-3 shadow-sm border border-blue-500/30 font-bold text-sm tracking-wide flex items-center gap-2">
                  <img src={siteSettings?.logoUrl || "/favicon.svg"} alt="Logo" className="w-8 h-8 rounded-lg bg-white object-cover shadow-sm" />
                  <div>
                    <p>{t('main_menu')}</p>
                    <p className="text-[10px] text-blue-100 opacity-90 font-normal uppercase tracking-wider">{t('access_all_features')}</p>
                  </div>
                </div>

                {/* Current Time inside Menu */}
                <div className="mx-3 mb-3 bg-slate-800 rounded-xl p-2 border border-slate-700">
                  <div className="text-center mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('current_time')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.year}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('year')}</span>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-amber-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.month.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('mon')}</span>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.day.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('day')}</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.hours.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('hrs')}</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.minutes.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('min')}</span>
                    </div>
                    <div className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-black leading-none">{timeData.seconds.toString().padStart(2, '0')}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">{t('sec')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-[360px] overflow-y-auto px-2 space-y-0.5 pb-1">
                  <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full group-hover:bg-blue-900"><User className="w-4 h-4 text-blue-400" /></div> {t('my_profile')}
                  </button>
                  <button onClick={() => { navigate('/wallet'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-green-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full"><Wallet className="w-4 h-4 text-green-400" /></div> {t('wallet_history')}
                  </button>
                  <button onClick={() => { navigate('/tasks'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-purple-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full"><ListChecks className="w-4 h-4 text-purple-400" /></div> {t('my_tasks')}
                  </button>
                  <button onClick={() => { navigate('/refer'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-orange-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full"><Users className="w-4 h-4 text-orange-400" /></div> {t('refer_earn')}
                  </button>
                  <button onClick={() => { navigate('/leaderboard'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full"><Target className="w-4 h-4 text-rose-400" /></div> {t('leaderboard')}
                  </button>
                  <button onClick={() => { navigate('/rewards'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-yellow-400 rounded-lg transition font-medium">
                    <div className="bg-slate-800 p-1.5 rounded-full"><Award className="w-4 h-4 text-yellow-400" /></div> {t('rewards_badges')}
                  </button>
                  
                  { (profile?.role === 'admin' || auth.currentUser?.email === 'mdekramhossain590@gmail.com') && (
                    <button onClick={() => { navigate('/admin'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-indigo-400 rounded-lg transition font-medium">
                      <div className="bg-slate-800 p-1.5 rounded-full"><Target className="w-4 h-4 text-indigo-400" /></div> Admin Panel
                    </button>
                  )}
                  
                  <div className="h-px bg-slate-700 my-2 mx-2"></div>
                  
                  <button onClick={() => { navigate('/settings'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <Settings className="w-4 h-4 text-slate-400" /> {t('settings')}
                  </button>
                  <button onClick={() => { navigate('/support'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <HelpCircle className="w-4 h-4 text-slate-400" /> {t('help_support')}
                  </button>
                  <button onClick={() => { navigate('/privacy'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <Shield className="w-4 h-4 text-slate-400" /> {t('privacy_policy')}
                  </button>
                  <button onClick={() => { navigate('/terms'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
                    <FileText className="w-4 h-4 text-slate-400" /> {t('terms_conditions')}
                  </button>
                  
                  <div className="h-px bg-slate-700 my-2 mx-2"></div>
                  
                  <button 
                    onClick={async () => {
                      await logOut();
                      navigate('/');
                    }} 
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition font-bold"
                  >
                    <div className="bg-slate-800 p-1.5 rounded-full"><LogOut className="w-4 h-4 text-red-400" /></div> {t('log_out')}
                  </button>
                </div>
              </div>
            </>
          )}

          {loading ? (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse shadow-lg border-2 border-transparent"></div>
          ) : profile?.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white dark:border-slate-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white dark:border-slate-800">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('welcome_back')}</p>
            {loading ? (
               <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-0.5"></div>
            ) : (
               <h3 className="font-bold text-lg leading-tight text-gray-800 dark:text-white">{profile?.fullName || t('loading')}</h3>
            )}
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700 flex items-center justify-center text-[#0D47A1] dark:text-blue-400 relative shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4d8d] rounded-full"></span>
        </button>
      </div>

      {/* Scrolling Banner */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-xl py-2.5 px-3 mb-4 flex items-center border border-blue-200 dark:border-slate-600 shadow-sm overflow-hidden">
        <span className="text-[#0D47A1] dark:text-blue-400 mr-2 flex-shrink-0">
          <Megaphone className="w-5 h-5 animate-pulse" />
        </span>
        <div className="flex-1 overflow-hidden relative leading-none flex items-center h-5">
          <div className="animate-marquee whitespace-nowrap absolute">
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-[#0D47A1] dark:hover:text-blue-400">
              {banner.text}
            </a>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black rounded-3xl p-6 text-white shadow-2xl mb-6 relative overflow-hidden border border-indigo-500/20">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500 opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm opacity-90">{t('total_balance')}</p>
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loading ? (
              <div className="h-10 w-32 bg-slate-700 rounded animate-pulse mb-4 mt-1"></div>
            ) : (
              <h1 className="text-4xl font-black mb-4 tracking-tight text-white drop-shadow-md">
                {showBalance ? (
                  `৳ ${((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                ) : (
                  "৳ ******"
                )}
              </h1>
            )}
          </div>
          <button 
            onClick={() => navigate('/wallet?tab=withdraw')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-xl text-sm font-semibold shadow-lg active:scale-95 transition mt-2 flex items-center justify-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            {t('withdraw')}
          </button>
        </div>
      </div>
      
      {/* Referral Code Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] blur-2xl rounded-full"></div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center gap-2 relative z-10">
          <Link className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          Share to Earn More
        </h3>
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[50px]">Code:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex-1 truncate">{profile?.myReferCode || 'Loading...'}</span>
            <button 
              onClick={() => handleCopy(profile?.myReferCode || '', 'code')} 
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              disabled={!profile?.myReferCode}
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[50px]">Link:</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate opacity-90">{profile?.myReferCode ? `${window.location.origin}/register?ref=${profile.myReferCode}` : 'Loading...'}</span>
            <button 
              onClick={() => handleCopy(`${window.location.origin}/register?ref=${profile?.myReferCode}`, 'link')} 
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0"
              disabled={!profile?.myReferCode}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 mb-6 relative overflow-hidden">
        <details className="group">
          <summary className="flex justify-between items-center font-bold text-slate-800 dark:text-white text-sm cursor-pointer list-none outline-none">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Earnings Breakdown
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center transition-transform group-open:rotate-180 text-slate-500">
              <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="16"><path d="M6 9l6 6 6-6"></path></svg>
            </div>
          </summary>
          <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 ease-out">
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl flex justify-between items-center ring-1 ring-slate-100 dark:ring-slate-700/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Main Wallet</span>
              {loading ? (
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ) : showBalance ? (
                <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">৳ {(profile?.balances?.main || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              ) : (
                <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">৳ ***</span>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white dark:bg-slate-900/50 p-3 rounded-xl flex flex-col ring-1 ring-slate-100 dark:ring-slate-700/50">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('bonus')}</span>
                {loading ? (
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
                ) : showBalance ? (
                  <span className="font-semibold text-slate-800 dark:text-white text-lg tracking-tight mt-1">৳ {(profile?.balances?.bonus || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-white text-lg tracking-tight mt-1">৳ ***</span>
                )}
              </div>
              <div className="flex-1 bg-white dark:bg-slate-900/50 p-3 rounded-xl flex flex-col ring-1 ring-slate-100 dark:ring-slate-700/50">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Referral</span>
                {loading ? (
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
                ) : showBalance ? (
                  <span className="font-semibold text-slate-800 dark:text-white text-lg tracking-tight mt-1">৳ {(profile?.balances?.referral || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-white text-lg tracking-tight mt-1">৳ ***</span>
                )}
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-4 outline-none">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest pl-1">Task Balances</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map(taskName => {
                  const balance = profile?.balances?.tasks?.[taskName] || 0;
                  return (
                    <div key={taskName} className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-transparent dark:border-slate-700/30 flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-1 uppercase font-medium tracking-wider">{taskName}</span>
                      {loading ? (
                        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      ) : showBalance ? (
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">৳ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">৳ ***</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Premium Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/wallet'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-inner shadow-blue-800/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('wallet')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">History & Withdraw</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/tasks'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shadow-inner shadow-purple-800/20">
            <ListChecks className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('tasks')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Earn doing tasks</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/spin'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-inner shadow-amber-800/20">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('spin')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Lucky Wheel</p>
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/math'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center shadow-inner shadow-cyan-800/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('math')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Solve & Earn</p>
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/refer'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center shadow-inner shadow-green-800/20">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('refer')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Invite Friends</p>
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/leaderboard'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shadow-inner shadow-rose-800/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('leaderboard')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Top Earners</p>
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/rewards'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white flex items-center justify-center shadow-inner shadow-yellow-800/20">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('rewards_badges')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Claim prizes</p>
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playTapSound(); navigate('/support'); }} 
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center shadow-inner shadow-teal-800/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{t('help_support')}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">Get Help</p>
          </div>
        </motion.div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#ff4d8d] rounded-2xl p-4 flex items-center justify-between text-white shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{t('join_telegram_support')}</h4>
            <p className="text-[10px] opacity-80">{t('daily_updates_payment_proof')}</p>
          </div>
        </div>
        <button className="bg-white text-[#7c3aed] text-xs font-bold px-3 py-1.5 rounded-lg">{t('join')}</button>
      </div>
      
      {showActivationPopup && (
        <ActivationPopup onClose={() => setShowActivationPopup(false)} />
      )}
    </div>
  );
}
