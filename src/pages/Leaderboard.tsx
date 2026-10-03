import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, Star, TrendingUp, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_TOP_EARNERS = [
  { id: 'leader_1', fullName: 'Ashiqur Rahman', totalIncome: 4850, referrals: 24, bonus: 350 },
  { id: 'leader_2', fullName: 'Tanvir Ahmed', totalIncome: 3920, referrals: 19, bonus: 280 },
  { id: 'leader_3', fullName: 'Shakil Khan', totalIncome: 3150, referrals: 15, bonus: 210 },
  { id: 'leader_4', fullName: 'MD Sohel Rana', totalIncome: 2640, referrals: 12, bonus: 180 },
  { id: 'leader_5', fullName: 'Rakibul Hasan', totalIncome: 2100, referrals: 10, bonus: 150 },
  { id: 'leader_6', fullName: 'Sabbir Hossain', totalIncome: 1850, referrals: 8, bonus: 120 },
  { id: 'leader_7', fullName: 'Mehedi Hasan', totalIncome: 1520, referrals: 7, bonus: 90 },
  { id: 'leader_8', fullName: 'Ariful Islam', totalIncome: 1240, referrals: 6, bonus: 70 },
  { id: 'leader_9', fullName: 'Kamrul Hasan', totalIncome: 980, referrals: 5, bonus: 50 },
  { id: 'leader_10', fullName: 'Fahim Faisal', totalIncome: 750, referrals: 4, bonus: 40 },
];

export function Leaderboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'totalIncome' | 'referrals' | 'bonus'>('totalIncome');

  useEffect(() => {
    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const fetchLeaders = async () => {
      try {
        let usersDocs: any[] = [];
        let lbDocs: any[] = [];

        try {
          const uSnap = await getDocs(query(collection(db, "users"), limit(100)));
          usersDocs = uSnap.docs;
        } catch (e: any) {
          console.warn("Could not query users collection:", e?.message);
        }

        try {
          const lSnap = await getDocs(query(collection(db, "leaderboard"), limit(100)));
          lbDocs = lSnap.docs;
        } catch (e: any) {
          console.warn("Could not query leaderboard collection:", e?.message);
        }

        const combinedUsers = new Map<string, any>();

        // Start with default platform benchmark earners
        DEFAULT_TOP_EARNERS.forEach(earner => {
          combinedUsers.set(earner.id, { ...earner });
        });

        // Merge leaderboard collection
        lbDocs.forEach(docSnap => {
          const data = docSnap.data();
          combinedUsers.set(docSnap.id, {
            id: docSnap.id,
            fullName: data.fullName || "User",
            photoURL: data.photoURL || null,
            totalIncome: Number(data.totalIncome || 0),
            referrals: Number(data.referrals || 0),
            bonus: Number(data.bonus || 0)
          });
        });

        // Merge with users collection data
        usersDocs.forEach(docSnap => {
          const data = docSnap.data();
          const existing = combinedUsers.get(docSnap.id) || {};
          
          const mainBal = Number(data.balances?.main ?? (typeof data.balance === 'number' ? data.balance : 0));
          const bonusBal = Number(data.balances?.bonus || 0);
          const refBal = Number(data.balances?.referral || 0);
          const partnerBal = Number(data.balances?.partner || 0);
          const tasksBal = typeof data.balances?.tasks === 'number' 
            ? data.balances.tasks 
            : (typeof data.balances?.tasks === 'object' ? Object.values(data.balances.tasks).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) : 0);

          const calcIncome = mainBal + bonusBal + refBal + partnerBal + Number(tasksBal);
          const totalIncome = Math.max(Number(existing.totalIncome || 0), calcIncome);
          const bonus = Math.max(Number(existing.bonus || 0), bonusBal);
          const referrals = Math.max(
            Number(existing.referrals || 0), 
            Number(data.referralCount || 0), 
            Number(data.totalReferrals || 0),
            Number(data.partnerReferrals || 0)
          );

          combinedUsers.set(docSnap.id, {
            id: docSnap.id,
            fullName: data.fullName || existing.fullName || "User",
            photoURL: data.photoURL || existing.photoURL || null,
            totalIncome,
            referrals,
            bonus
          });
        });

        // Ensure current user is in the list with actual stats
        if (auth.currentUser) {
          const curUid = auth.currentUser.uid;
          const currentBal = Number((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + (profile?.balances?.partner || 0));
          const existing = combinedUsers.get(curUid) || {};
          const myTotalIncome = Math.max(Number(existing.totalIncome || 0), currentBal);
          const myReferrals = Math.max(Number(existing.referrals || 0), Number(profile?.totalReferrals || 0), Number(profile?.partnerReferrals || 0));
          const myBonus = Math.max(Number(existing.bonus || 0), Number(profile?.balances?.bonus || 0));

          combinedUsers.set(curUid, {
            id: curUid,
            fullName: profile?.fullName || auth.currentUser.displayName || existing.fullName || "You (Your Account)",
            photoURL: auth.currentUser.photoURL || existing.photoURL || null,
            totalIncome: myTotalIncome,
            referrals: myReferrals,
            bonus: myBonus,
            isCurrentUser: true
          });

          // Sync to leaderboard collection in background
          setDoc(doc(db, "leaderboard", curUid), {
            fullName: profile?.fullName || auth.currentUser.displayName || 'User',
            totalIncome: myTotalIncome,
            referrals: myReferrals,
            bonus: myBonus,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(() => {});
        }

        const fetchedLeaders = Array.from(combinedUsers.values());
        fetchedLeaders.sort((a: any, b: any) => (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0));
        setLeaders(fetchedLeaders.slice(0, 100));
      } catch (error: any) {
        console.error("Error fetching leaders:", error?.message || "Unknown Error");
        setLeaders(DEFAULT_TOP_EARNERS);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    fetchLeaders();
    return () => clearTimeout(safetyTimer);
  }, [sortBy]);

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" fill="currentColor" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" fill="currentColor" />;
      default: return <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pb-20">
      {/* Dynamic Header Background */}
      <div className="bg-gradient-to-b from-[#1C1C1C] to-[#101010] border-b border-[#3D3215] pt-6 px-4 pb-12 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8A6508]/15 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10 max-w-lg mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-[#A3A3A3] hover:text-[#FACC15] hover:bg-white/5 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-white font-display tracking-tight flex-1 text-center pr-10">Leaderboard</h1>
        </div>

        <div className="text-center mb-2 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#151515] border border-[#3D3215] text-[#FACC15] mb-3 shadow-xl transform rotate-3"
          >
            <Trophy className="w-8 h-8 drop-shadow-md" />
          </motion.div>
          <p className="text-sm font-semibold text-[#FACC15] uppercase tracking-widest opacity-90 drop-shadow-sm">Top Performers</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 relative z-20">
        {/* Toggle Controls */}
        <div className="flex bg-[#151515] p-1.5 rounded-2xl mb-8 shadow-xl border border-[#3D3215]">
          <button 
            onClick={() => setSortBy('totalIncome')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 justify-center cursor-pointer ${sortBy === 'totalIncome' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black shadow-md scale-[1.02]' : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Income
          </button>
          <button 
            onClick={() => setSortBy('referrals')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${sortBy === 'referrals' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black shadow-md scale-[1.02]' : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'}`}
          >
            <Star className="w-3.5 h-3.5" />
            Referrals
          </button>
          <button 
            onClick={() => setSortBy('bonus')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${sortBy === 'bonus' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black shadow-md scale-[1.02]' : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'}`}
          >
            <Crown className="w-3.5 h-3.5" />
            Bonus
          </button>
        </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={sortBy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-transparent"
          >
            {leaders.length === 0 ? (
              <div className="text-center py-12 bg-[#151515] rounded-3xl shadow-lg border border-[#3D3215]">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-[#737373]" />
                <p className="text-sm font-medium text-[#A3A3A3]">No leaders to display.</p>
              </div>
            ) : (
              <>
                {/* Podium for Top 3 */}
                <div className="flex justify-center items-end h-[320px] mt-6 mb-10 gap-3 px-2 pt-8">
                  {/* 2nd Place */}
                  {leaders[1] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="flex flex-col items-center flex-1 z-10"
                    >
                      <div className="relative mb-3 group">
                        <div className="w-16 h-16 rounded-full bg-[#151515] flex items-center justify-center text-white font-display font-bold shadow-lg border-2 border-[#3D3215] text-2xl transform transition-transform group-hover:scale-105 overflow-hidden">
                          {leaders[1].photoURL ? (
                            <img src={leaders[1].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-[#737373]" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-1 bg-[#2E2E2E] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-[#3D3215] shadow-md">2</div>
                      </div>
                      <span className="font-bold text-sm text-[#A3A3A3] truncate w-full text-center px-1 mb-1">{leaders[1].fullName || 'User'}</span>
                      <span className="text-xs font-black text-[#A3A3A3] mb-2 bg-[#101010] border border-[#3D3215] px-2.5 py-0.5 rounded-full shadow-inner tracking-tight">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[1].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[1].referrals || 0)} Refs` : `৳${Number(leaders[1].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-24 bg-gradient-to-t from-[#151515] to-[#1C1C1C] rounded-t-2xl mt-1 shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] relative flex justify-center pt-3 border-t-4 border-[#3D3215] rounded-b shadow-xl">
                      </div>
                    </motion.div>
                  )}
                  
                  {/* 1st Place */}
                  {leaders[0] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                      className="flex flex-col items-center flex-[1.2] z-20"
                    >
                      <Crown className="w-8 h-8 text-[#FACC15] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] animate-bounce relative z-10" />
                      <div className="relative mb-3 group z-10">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-[#FACC15] rounded-full blur-md opacity-30 -z-10"></div>
                        <div className="w-20 h-20 rounded-full bg-[#151515] flex items-center justify-center text-white font-display font-black shadow-2xl border-4 border-[#FACC15] text-3xl transform transition-transform group-hover:scale-105 relative z-10 overflow-hidden">
                          {leaders[0].photoURL ? (
                            <img src={leaders[0].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-[#FACC15]" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-[#151515] shadow-md z-20">1</div>
                      </div>
                      <span className="font-bold text-[15px] text-white truncate w-full text-center px-1 mb-1 shadow-sm mt-1 relative z-10">{leaders[0].fullName || 'User'}</span>
                      <span className="text-sm font-black text-[#FACC15] bg-[#101010] border border-[#3D3215] px-3 py-1 rounded-full shadow-inner mb-2 tracking-tight relative z-10">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[0].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[0].referrals || 0)} Refs` : `৳${Number(leaders[0].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-32 bg-gradient-to-t from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] rounded-t-2xl mt-1 relative flex justify-center pt-4 border-t-4 border-[#FACC15] shadow-xl overflow-hidden rounded-b z-0">
                        <div className="absolute top-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
                        <Trophy className="w-8 h-8 drop-shadow-md z-10 opacity-90 text-[#090909]" />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* 3rd Place */}
                  {leaders[2] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="flex flex-col items-center flex-1 z-10"
                    >
                      <div className="relative mb-3 group">
                        <div className="w-16 h-16 rounded-full bg-[#151515] flex items-center justify-center text-white font-display font-bold shadow-lg border-2 border-[#3D3215] text-2xl transform transition-transform group-hover:scale-105 overflow-hidden">
                          {leaders[2].photoURL ? (
                            <img src={leaders[2].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-[#737373]" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -left-1 bg-[#8A6508] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-[#3D3215] shadow-md">3</div>
                      </div>
                      <span className="font-bold text-sm text-[#A3A3A3] truncate w-full text-center px-1 mb-1">{leaders[2].fullName || 'User'}</span>
                      <span className="text-xs font-black text-[#D4A017] mb-2 bg-[#101010] border border-[#3D3215] px-2.5 py-0.5 rounded-full shadow-inner tracking-tight">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[2].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[2].referrals || 0)} Refs` : `৳${Number(leaders[2].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-20 bg-gradient-to-t from-[#151515] to-[#1C1C1C] rounded-t-2xl mt-1 shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] relative flex justify-center pt-3 border-t-4 border-[#8A6508] rounded-b shadow-xl">
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* The Rest of the List */}
                <div className="space-y-3 relative z-30">
                  {leaders.slice(3).map((leader, index) => (
                    <motion.div 
                      key={leader.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index % 5 + 1) }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${leader.isCurrentUser ? 'bg-[#1C1C1C] border-[#FACC15] ring-1 ring-[#FACC15]/50 shadow-lg' : 'bg-[#151515] border-[#3D3215] hover:border-[#D4A017]/50'} border shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 font-bold text-[#737373] text-sm">
                          {index + 4}
                        </div>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-[#101010] font-display font-bold shadow-sm border border-[#3D3215] overflow-hidden">
                            {leader.photoURL ? (
                              <img src={leader.photoURL} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-[#737373] m-auto mt-3" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[15px] text-white tracking-tight truncate max-w-[150px]">
                              {leader.fullName || 'User'}
                            </span>
                            {leader.isCurrentUser && (
                              <span className="text-[8px] font-black uppercase bg-[#FACC15] text-[#090909] px-1.5 py-0.5 rounded-full shadow-sm">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#A3A3A3] font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="bg-[#101010] border border-[#3D3215] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-[#A3A3A3]">{sortBy === 'totalIncome' ? 'Income' : sortBy === 'referrals' ? 'Refs' : 'Bonus'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end pl-2">
                        <span className="font-black font-display text-[#FACC15] text-lg tracking-tight bg-[#101010] border border-[#3D3215] px-3 py-1 rounded-xl">
                          {sortBy === 'totalIncome' ? `৳${Number(leader.totalIncome || 0).toFixed(2)}` : sortBy === 'referrals' ? (leader.referrals || 0) : `৳${Number(leader.bonus || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {leaders.length <= 3 && (
                    <div className="text-center py-10 text-[#737373] text-sm font-medium bg-[#151515] rounded-2xl border border-dashed border-[#3D3215]">
                      No more players currently on the leaderboard.
                    </div>
                  )}
                  {leaders.length > 3 && (
                    <div className="h-4"></div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
      </div>
    </div>
  );
}
