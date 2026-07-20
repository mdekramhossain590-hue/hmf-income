import { useState, useEffect } from 'react';
import { Copy, Link as LinkIcon, MessageCircle, Send, Users, History, BarChart3, TrendingUp, Coins, Calendar, DollarSign, Layers, Shield } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { collection, where, getCountFromServer, query, orderBy, getDoc, doc, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedQuery, getCachedDoc } from '../lib/cache';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export function Refer() {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage();
    const [actualReferralsCount, setActualReferralsCount] = useState<number>(profile?.totalReferrals || 0);

  useEffect(() => {
    setActualReferralsCount(profile?.totalReferrals || 0);
  }, [profile?.totalReferrals]);


  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    const fetchCount = async () => {
      try {
        const { getCountFromServer, query, collection } = await import('firebase/firestore');
        const snap = await getCountFromServer(query(collection(db, "users", uid, "referrals")));
        const realCount = snap.data().count;
        setActualReferralsCount(Math.max(realCount, profile?.totalReferrals || 0));
        
        if (realCount > (profile?.totalReferrals || 0)) {
           const { doc, updateDoc } = await import('firebase/firestore');
           await updateDoc(doc(db, "users", uid), { totalReferrals: realCount });
        }
      } catch (error) {
        console.error("Failed to fetch referral count:", error);
      }
    };
    fetchCount();
  }, [user?.uid, profile?.totalReferrals]);





  const [referrals, setReferrals] = useState<any[]>([]);
    const [referralBonus, setReferralBonus] = useState(10);
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const loadReferrals = async () => {
      try {
        const q = query(
          collection(db, "users", auth.currentUser!.uid, "referrals")
        );
        const { getDocs } = await import('firebase/firestore');
        const snapshot = await getDocs(q);
        const refs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        refs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setReferrals(refs);
        
        const [refDoc, pDoc] = await Promise.all([
          getCachedDoc(doc(db, "settings", "referral")),
          getCachedDoc(doc(db, "settings", "partner"))
        ]);
        if (refDoc.exists()) {
          setReferralBonus(refDoc.data().fixedBonus || 10);
        }
        if (pDoc.exists()) {
          const d = pDoc.data();
          setPartnerSettings({
            requiredReferrals: d.requiredReferrals !== undefined ? d.requiredReferrals : 10,
            dailyBonus: d.dailyBonus !== undefined ? d.dailyBonus : 100,
            enabled: d.enabled !== false
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `Refer`);
      }
    };
    
    loadReferrals();
  }, [profile?.uid]);

  const referLink = profile?.myReferCode ? `${window.location.origin}/register?ref=${profile.myReferCode}` : '';

  const copyReferCode = () => {
    if (profile?.myReferCode) {
      navigator.clipboard.writeText(profile.myReferCode);
      toast.success("Referral code copied!");
    }
  };

  const copyReferLink = () => {
    if (referLink) {
      navigator.clipboard.writeText(referLink);
      toast.success("Referral link copied!");
    }
  };

  const shareOnWhatsApp = () => {
    if (referLink) {
      const text = encodeURIComponent(`Join HMF Income today and start earning! Use my referral link: ${referLink}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const shareOnFacebook = () => {
    if (referLink) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referLink)}`, '_blank');
    }
  };

  const shareOnTelegram = () => {
    if (referLink) {
      const text = encodeURIComponent(`Join HMF Income today and start earning! Use my referral link: ${referLink}`);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referLink)}&text=${text}`, '_blank');
    }
  };

  const [analyticsSubTab, setAnalyticsSubTab] = useState<'earnings' | 'count'>('earnings');

  // Calculate key performance statistics
  const totalReferralsCount = actualReferralsCount;
  const totalReferralEarnings = profile?.balances?.referral || 0;
  const averageEarnedPerReferral = totalReferralsCount > 0 ? (totalReferralEarnings / totalReferralsCount) : 0;

  const getMonthlyData = () => {
    // Generate the last 6 months to guarantee clean visual display
    const monthsData: Record<string, { monthName: string; count: number; earnings: number }> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const monthLabel = d.toLocaleDateString(language === 'Bengali' ? 'bn-BD' : 'en-US', {
        month: 'short',
        year: '2-digit',
      });
      monthsData[monthKey] = {
        monthName: monthLabel,
        count: 0,
        earnings: 0,
      };
    }

    // Accumulate real refer bonus entries
    referrals.forEach((ref) => {
      if (!ref.createdAt) return;
      const date = ref.createdAt.toDate ? ref.createdAt.toDate() : new Date(ref.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const bonus = Number(ref.bonusEarned) || 0;

      if (monthsData[monthKey]) {
        monthsData[monthKey].count += 1;
        monthsData[monthKey].earnings += bonus;
      } else {
        const monthLabel = date.toLocaleDateString(language === 'Bengali' ? 'bn-BD' : 'en-US', {
          month: 'short',
          year: '2-digit',
        });
        monthsData[monthKey] = {
          monthName: monthLabel,
          count: 1,
          earnings: bonus,
        };
      }
    });

    return Object.keys(monthsData)
      .sort()
      .map((key) => ({
        month: monthsData[key].monthName,
        count: monthsData[key].count,
        earnings: Number(monthsData[key].earnings.toFixed(2)),
      }));
  };

  const chartData = getMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-700/60 shadow-xl text-left scale-95 origin-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-xs font-black text-white mt-1.5 flex items-center gap-1.5">
            {analyticsSubTab === 'earnings' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>৳ {payload[0].value}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{payload[0].value} {language === 'Bengali' ? 'জন' : 'Users'}</span>
              </>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pt-6 px-4 text-center pb-24">
      <h2 className="text-2xl font-black mb-4 tracking-tight text-slate-800 dark:text-white">{t('invite_earn')}</h2>
      
      {/* Trust Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-[20px] p-3 mb-6 flex items-center justify-center gap-2 cursor-default">
        <Shield className="w-4 h-4 text-blue-500" />
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Rewards Guaranteed by System</span>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg mb-6 flex justify-between items-center relative overflow-hidden border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full pointer-events-none"></div>
        <div className="text-left relative z-10">
          <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-widest">{t('referral_earnings')}</p>
          <h3 className="text-3xl font-black tracking-tight">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
        </div>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center relative z-10 shadow-inner">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <img src="https://cdn-icons-png.flaticon.com/512/3039/3039396.png" alt="Refer" className="w-32 mx-auto mb-6 drop-shadow-lg" />
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-2">
        {t('invite_earn_desc').replace('bonus', `৳${referralBonus}`)}
      </p>
      
            {/* Milestones Progress Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 text-left">
        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4 tracking-tight flex items-center justify-between">
          <span>Reward Milestones</span>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg uppercase tracking-wider">
            {totalReferralsCount} Referrals
          </span>
        </h3>
        
        <div className="space-y-5">
          {[
            { target: 10, reward: '৳50 Bonus' },
            { target: 50, reward: '৳300 Bonus' },
            { target: 100, reward: '৳1000 Bonus' }
          ].map((milestone, idx) => {
            const progress = Math.min(100, (totalReferralsCount / milestone.target) * 100);
            const isCompleted = totalReferralsCount >= milestone.target;
            
            return (
              <div key={idx} className="relative">
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-xs font-bold ${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                    {milestone.target} Referrals
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-500' : 'text-amber-500'}`}>
                    {isCompleted ? 'Completed' : milestone.reward}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-indigo-100 dark:ring-indigo-500/20 shadow-sm mb-4 relative text-left">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">{t('your_referral_code')}</p>
        <div className="bg-indigo-50/50 dark:bg-slate-900/50 rounded-xl p-3 pr-12 border border-indigo-100/50 dark:border-slate-700">
          <h3 className="text-lg font-black tracking-widest text-indigo-600 dark:text-indigo-400 select-all">
            {profile?.myReferCode || <span className="text-slate-400">Unavailable</span>}
          </h3>
        </div>
        <button 
          onClick={copyReferCode}
          className="absolute right-6 top-[55%] transform w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:scale-105 shadow-sm"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl ring-1 ring-amber-100 dark:ring-amber-500/20 shadow-sm mb-6 relative text-left overflow-hidden">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">{t('your_referral_link')}</p>
        <div className="bg-amber-50/50 dark:bg-slate-900/50 rounded-xl p-3 pr-12 border border-amber-100/50 dark:border-slate-700">
          <p className="text-[13px] font-semibold text-amber-600 dark:text-amber-400 break-all select-all">
            {referLink || <span className="text-slate-400">Unavailable</span>}
          </p>
        </div>
        <button 
          onClick={copyReferLink}
          className="absolute right-6 top-[55%] transform w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:scale-105 shadow-sm"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button 
          onClick={shareOnWhatsApp}
          className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl shadow-lg shadow-green-500/30 hover:bg-[#20bd5a] transition active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">WhatsApp</span>
        </button>
        <button 
          onClick={shareOnFacebook}
          className="flex flex-col items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-[#166fe5] transition active:scale-95"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-bold">Facebook</span>
        </button>
        <button 
          onClick={shareOnTelegram}
          className="flex flex-col items-center justify-center gap-2 bg-[#2AABEE] text-white py-3 rounded-xl shadow-lg shadow-cyan-500/30 hover:bg-[#2298d6] transition active:scale-95"
        >
          <Send className="w-6 h-6" />
          <span className="text-[10px] font-bold">Telegram</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 text-left mb-6">
        <h4 className="font-black text-slate-800 dark:text-white mb-5 tracking-tight flex items-center gap-2 text-base">
           <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
             <Layers className="w-4 h-4" />
           </div>
           {t('how_it_works')}
        </h4>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">1</div>
             <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1.5">{t('step1')}</p>
          </div>
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">2</div>
             <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1.5">{t('step2')}</p>
          </div>
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">3</div>
             <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1.5">{t('step3').replace('bonus', `৳${referralBonus}`)}</p>
          </div>
        </div>
      </div>

      {/* Referral Analytics Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 text-left mb-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight text-base">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            {t('referral_analytics')}
          </h4>
          
          {/* Quick tab toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setAnalyticsSubTab('earnings')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                analyticsSubTab === 'earnings'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('earnings_chart_tab')}
            </button>
            <button
              onClick={() => setAnalyticsSubTab('count')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                analyticsSubTab === 'count'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('counts_chart_tab')}
            </button>
          </div>
        </div>

        {/* Bento stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-2 pl-0.5">
              {t('total_referrals')}
            </p>
            <h5 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              {totalReferralsCount}
            </h5>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-2 pl-0.5">
              Avg. Per Ref
            </p>
            <h5 className="text-xl font-black text-indigo-500 dark:text-indigo-400 tracking-tight">
              ৳{averageEarnedPerReferral.toFixed(1)}
            </h5>
          </div>
          <div className="col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-green-700/70 dark:text-green-400/70 uppercase tracking-widest leading-none mb-2 drop-shadow-sm">
                {t('cumulative_overview')}
              </p>
              <h5 className="text-3xl font-black text-green-600 dark:text-green-400 tracking-tight drop-shadow-sm">
                ৳{totalReferralEarnings.toFixed(2)}
              </h5>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-green-600 dark:text-green-400 backdrop-blur-sm mt-3 border border-green-200/50 dark:border-green-800/50">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main interactive chart */}
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 pl-1">
          {analyticsSubTab === 'earnings' ? t('monthly_earnings_chart') : t('monthly_counts_chart')}
        </p>
        <div className="h-56 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            {analyticsSubTab === 'earnings' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} className="dark:stroke-slate-700/30" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  dx={10}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => `৳${v}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} className="dark:stroke-slate-700/30" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  dx={10}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  allowDecimals={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referral History */}
      <div className="text-left">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 tracking-tight">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-indigo-500"><History className="w-4 h-4" /></div> {t('referral_history')}
        </h4>
        
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="text-center py-6 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50 font-medium text-sm">
              <p className="text-sm">{t('no_referrals_yet')}</p>
            </div>
          ) : (
            referrals.map((ref) => (
              <div key={ref.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-600">
                    {ref.referredName?.charAt(0) || ref.referredEmail?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[140px]">
                      {ref.referredEmail}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-500 font-medium">
                        {t('reg_date')}: {ref.createdAt?.toDate ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(ref.createdAt.toDate()) : (ref.createdAt ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ref.createdAt)) : 'Just now')}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md font-bold uppercase">
                        Gen {ref.level || 1}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600 dark:text-green-400">+৳{ref.bonusEarned || 0}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">{t('earned')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
