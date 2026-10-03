import { useState, useEffect } from 'react';
import { Copy, Link as LinkIcon, MessageCircle, Send, Users, History, BarChart3, TrendingUp, Coins, Calendar, DollarSign, Layers, Shield } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { collection, where, getCountFromServer, query, orderBy, getDoc, doc, getDocs, limit, updateDoc } from 'firebase/firestore';
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








  const effectiveReferCode = profile?.myReferCode || (() => {
    try {
      const cached = localStorage.getItem(`profile_${auth.currentUser?.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.myReferCode) return parsed.myReferCode;
      }
    } catch (e) {}
    if (!auth.currentUser) return '';
    const prefix = ((auth.currentUser.displayName || auth.currentUser.email || 'HM').replace(/[^a-zA-Z]/g, '').substring(0, 2) || 'HE').toUpperCase();
    const hash = Math.abs(auth.currentUser.uid.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 123456)).toString().padStart(6, '0');
    return `${prefix.padEnd(2, 'E')}${hash}`;
  })();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState<number>(1);
  const [referralBonus, setReferralBonus] = useState(10);
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const loadReferrals = async () => {
      try {
        const q = query(
          collection(db, "users", auth.currentUser!.uid, "referrals")
        );
        
        const snapshot = await getDocs(q);
        let refs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Also check if any users in the users collection used this code
        if (effectiveReferCode) {
          try {
            const uQ = query(collection(db, "users"), where("usedReferCode", "==", effectiveReferCode));
            const uSnap = await getDocs(uQ);
            const existingEmails = new Set(refs.map((r: any) => r.referredEmail?.toLowerCase()));
            uSnap.forEach((uDoc) => {
              const uData = uDoc.data();
              if (uData.email && !existingEmails.has(uData.email.toLowerCase())) {
                const synthesized = {
                  id: uDoc.id,
                  referredEmail: uData.email,
                  referredName: uData.fullName || 'User',
                  bonusEarned: 10,
                  level: 1,
                  createdAt: uData.createdAt || new Date()
                };
                refs.push(synthesized);
                existingEmails.add(uData.email.toLowerCase());
              }
            });
          } catch (e) {}
        }

        refs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setReferrals(refs);
        const gen1Count = refs.filter(r => !r.level || r.level === 1).length;
        if (gen1Count !== (profile?.totalReferrals || 0)) {
          updateDoc(doc(db, "users", auth.currentUser!.uid), { 
            totalReferrals: gen1Count,
            partnerReferrals: Math.max(gen1Count, profile?.partnerReferrals || 0)
          }).catch(e => console.error(e?.message || "Unknown Error"));
        }
        setActualReferralsCount(Math.max(gen1Count, profile?.totalReferrals || 0));
        
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
      } catch (error: any) {
        handleFirestoreError(error, OperationType.GET, `Refer`);
      }
    };
    
    loadReferrals();
  }, [auth.currentUser?.uid, profile?.myReferCode, effectiveReferCode, profile?.totalReferrals]);

  const referLink = effectiveReferCode ? `${window.location.origin}/register?ref=${effectiveReferCode}` : '';

  const copyReferCode = () => {
    if (effectiveReferCode) {
      navigator.clipboard.writeText(effectiveReferCode);
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
      const text = encodeURIComponent(`Join HMF EARNING ZONE today and start earning! Use my referral link: ${referLink}`);
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
      const text = encodeURIComponent(`Join HMF EARNING ZONE today and start earning! Use my referral link: ${referLink}`);
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referLink)}&text=${text}`, '_blank');
    }
  };

  const [analyticsSubTab, setAnalyticsSubTab] = useState<'earnings' | 'count'>('earnings');

  // Calculate key performance statistics
  const totalReferralsCount = actualReferralsCount;
  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       return raw;
    }
    if (ref.level === 3) return 0;
    if (ref.level === 2) return 3;
    return 5;
  };

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
      const bonus = getRefBonus(ref);

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
        <div className="bg-[#101010] px-3 py-2.5 rounded-xl border border-[#3D3215] shadow-xl text-left scale-95 origin-left">
          <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">{label}</p>
          <p className="text-xs font-black text-white mt-1.5 flex items-center gap-1.5">
            {analyticsSubTab === 'earnings' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
                <span>৳ {payload[0].value}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse"></span>
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
    <div className="pt-6 px-4 text-center pb-24 text-white">
      <h2 className="text-2xl font-black mb-4 tracking-tight text-white">{t('invite_earn')}</h2>
      
      {/* Trust Banner */}
      <div className="bg-[#151515] border border-[#3D3215] rounded-[20px] p-3 mb-6 flex items-center justify-center gap-2 cursor-default">
        <Shield className="w-4 h-4 text-[#FACC15]" />
        <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Rewards Guaranteed by System</span>
      </div>

      <div className="bg-gradient-to-br from-[#1C1C1C] to-[#151515] rounded-2xl p-5 text-white shadow-xl mb-6 flex justify-between items-center relative overflow-hidden border border-[#3D3215]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017] opacity-10 blur-2xl rounded-full pointer-events-none"></div>
        <div className="text-left relative z-10">
          <p className="text-xs font-semibold text-[#A3A3A3] mb-1 uppercase tracking-widest">{t('referral_earnings')}</p>
          <h3 className="text-3xl font-black tracking-tight text-[#FACC15]">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
        </div>
        <div className="w-12 h-12 bg-[#101010] border border-[#3D3215] rounded-full flex items-center justify-center relative z-10 shadow-inner text-[#FACC15]">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <img src="https://cdn-icons-png.flaticon.com/512/3039/3039396.png" alt="Refer" className="w-32 mx-auto mb-6 drop-shadow-lg" />
      
      <p className="text-sm text-[#A3A3A3] mb-4 px-2">
        {t('invite_earn_desc').replace('bonus', `৳${referralBonus}`)}
      </p>
      
      {/* Milestones Progress Bar */}
      <div className="bg-[#151515] p-5 rounded-3xl shadow-sm border border-[#3D3215] mb-6 text-left">
        <h3 className="text-sm font-black text-white mb-4 tracking-tight flex items-center justify-between">
          <span>Reward Milestones</span>
          <span className="text-[10px] bg-[#101010] border border-[#3D3215] text-[#FACC15] px-2 py-1 rounded-lg uppercase tracking-wider font-bold">
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
                  <span className={`text-xs font-bold ${isCompleted ? 'text-[#FACC15]' : 'text-[#A3A3A3]'}`}>
                    {milestone.target} Referrals
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-[#D4A017]'}`}>
                    {isCompleted ? 'Completed' : milestone.reward}
                  </span>
                </div>
                <div className="h-3 w-full bg-[#101010] border border-[#3D3215]/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15]'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-[#151515] p-4 rounded-2xl border border-[#3D3215] shadow-sm mb-4 relative text-left">
        <p className="text-[11px] font-bold text-[#A3A3A3] mb-2 uppercase tracking-wide">{t('your_referral_code')}</p>
        <div className="bg-[#101010] rounded-xl p-3 pr-12 border border-[#3D3215]">
          <h3 className="text-lg font-black tracking-widest text-[#FACC15] select-all">
            {effectiveReferCode || "HE000001"}
          </h3>
        </div>
        <button 
          onClick={copyReferCode}
          className="absolute right-6 top-[55%] transform w-10 h-10 bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:scale-105 shadow-sm cursor-pointer"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-[#151515] p-4 rounded-2xl border border-[#3D3215] shadow-sm mb-6 relative text-left overflow-hidden">
        <p className="text-[11px] font-bold text-[#A3A3A3] mb-2 uppercase tracking-wide">{t('your_referral_link')}</p>
        <div className="bg-[#101010] rounded-xl p-3 pr-12 border border-[#3D3215]">
          <p className="text-[13px] font-semibold text-[#FACC15] break-all select-all">
            {referLink || `${window.location.origin}/register?ref=${effectiveReferCode}`}
          </p>
        </div>
        <button 
          onClick={copyReferLink}
          className="absolute right-6 top-[55%] transform w-10 h-10 bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:scale-105 shadow-sm cursor-pointer"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button 
          onClick={shareOnWhatsApp}
          className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl shadow-lg shadow-green-500/20 hover:bg-[#20bd5a] transition active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">WhatsApp</span>
        </button>
        <button 
          onClick={shareOnFacebook}
          className="flex flex-col items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-[#166fe5] transition active:scale-95 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-bold">Facebook</span>
        </button>
        <button 
          onClick={shareOnTelegram}
          className="flex flex-col items-center justify-center gap-2 bg-[#2AABEE] text-white py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-[#2298d6] transition active:scale-95 cursor-pointer"
        >
          <Send className="w-6 h-6" />
          <span className="text-[10px] font-bold">Telegram</span>
        </button>
      </div>

      <div className="bg-[#151515] p-6 rounded-[24px] shadow-sm border border-[#3D3215] text-left mb-6">
        <h4 className="font-black text-white mb-5 tracking-tight flex items-center gap-2 text-base">
           <div className="p-1.5 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-lg">
             <Layers className="w-4 h-4" />
           </div>
           {t('how_it_works')}
        </h4>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] font-black text-sm">1</div>
             <p className="text-[13px] text-[#A3A3A3] font-medium leading-relaxed pt-1.5">{t('step1')}</p>
          </div>
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] font-black text-sm">2</div>
             <p className="text-[13px] text-[#A3A3A3] font-medium leading-relaxed pt-1.5">{t('step2')}</p>
          </div>
          <div className="flex gap-4 items-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] font-black text-sm">3</div>
             <p className="text-[13px] text-[#A3A3A3] font-medium leading-relaxed pt-1.5">{t('step3').replace('bonus', `৳${referralBonus}`)}</p>
          </div>
        </div>
      </div>

      {/* Referral Analytics Section */}
      <div className="bg-[#151515] p-6 rounded-[24px] shadow-sm border border-[#3D3215] text-left mb-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-white flex items-center gap-2 tracking-tight text-base">
            <div className="p-1.5 bg-[#101010] border border-[#3D3215] rounded-lg text-[#FACC15]">
              <BarChart3 className="w-4 h-4" />
            </div>
            {t('referral_analytics')}
          </h4>
          
          {/* Quick tab toggle */}
          <div className="flex bg-[#101010] border border-[#3D3215] p-1 rounded-xl">
            <button
              onClick={() => setAnalyticsSubTab('earnings')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                analyticsSubTab === 'earnings'
                  ? 'bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              {t('earnings_chart_tab')}
            </button>
            <button
              onClick={() => setAnalyticsSubTab('count')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                analyticsSubTab === 'count'
                  ? 'bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              {t('counts_chart_tab')}
            </button>
          </div>
        </div>

        {/* Bento stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-widest leading-none mb-2 pl-0.5">
              {t('total_referrals')}
            </p>
            <h5 className="text-xl font-black text-white tracking-tight">
              {totalReferralsCount}
            </h5>
          </div>
          <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-widest leading-none mb-2 pl-0.5">
              Avg. Per Ref
            </p>
            <h5 className="text-xl font-black text-[#FACC15] tracking-tight">
              ৳{averageEarnedPerReferral.toFixed(1)}
            </h5>
          </div>
          <div className="col-span-2 bg-gradient-to-br from-[#1C1C1C] to-[#151515] p-5 rounded-2xl border border-[#3D3215] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none mb-2 drop-shadow-sm">
                {t('cumulative_overview')}
              </p>
              <h5 className="text-3xl font-black text-[#FACC15] tracking-tight drop-shadow-sm">
                ৳{totalReferralEarnings.toFixed(2)}
              </h5>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] backdrop-blur-sm mt-3">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main interactive chart */}
        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-4 pl-1">
          {analyticsSubTab === 'earnings' ? t('monthly_earnings_chart') : t('monthly_counts_chart')}
        </p>
        <div className="h-56 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            {analyticsSubTab === 'earnings' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4A017" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3D3215" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  dx={10}
                  tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => `৳${v}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FACC15', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="earnings" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3D3215" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  dx={10}
                  tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 600 }}
                  allowDecimals={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FACC15', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="count" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referral History */}
      <div className="text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h4 className="font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="p-1.5 bg-[#101010] border border-[#3D3215] rounded-lg text-[#FACC15]"><History className="w-4 h-4" /></div> {t('referral_history')}
          </h4>
          <div className="flex bg-[#101010] border border-[#3D3215] p-1 rounded-xl w-fit">
            {[1, 2, 3].map((gen) => (
              <button
                key={gen}
                onClick={() => setHistoryTab(gen)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  historyTab === gen
                    ? 'bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] shadow-sm'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          {referrals.filter(r => (historyTab === 1 ? (!r.level || r.level === 1) : r.level === historyTab)).length === 0 ? (
            <div className="text-center py-6 text-[#737373] bg-[#151515] rounded-2xl border border-[#3D3215] font-medium text-sm">
              <p className="text-sm">{t('no_referrals_yet')}</p>
            </div>
          ) : (
            referrals.filter(r => (historyTab === 1 ? (!r.level || r.level === 1) : r.level === historyTab)).map((ref) => (
              <div key={ref.id} className="bg-[#151515] p-4 rounded-xl border border-[#3D3215] flex justify-between items-center group hover:border-[#D4A017]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] font-bold text-xs">
                    {ref.referredName?.charAt(0) || ref.referredEmail?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[140px]">
                      {ref.referredEmail}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-[#A3A3A3] font-medium">
                        {t('reg_date')}: {ref.createdAt?.toDate ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(ref.createdAt.toDate()) : (ref.createdAt ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ref.createdAt)) : 'Just now')}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-md font-bold uppercase">
                        Gen {ref.level || 1}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">+৳{getRefBonus(ref)}</p>
                  <p className="text-[9px] text-[#737373] uppercase font-bold">{t('earned')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
