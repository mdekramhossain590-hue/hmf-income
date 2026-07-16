import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, Star, TrendingUp, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from '@/src/lib/mock-firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getCachedQuery } from '../lib/cache';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';

export function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'totalIncome' | 'referrals' | 'bonus'>('totalIncome');

  useEffect(() => {
    setLoading(true);

    const fetchLeaders = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "users"), limit(100)));
        const fetchedLeaders = snapshot.docs.map((doc) => {
          try {
            const data = doc.data();
            const main = Number(data.balances?.main || 0);
            const bonus = Number(data.balances?.bonus || 0);
            const ref = Number(data.balances?.referral || 0);
            let taskSum = 0;
            if (data.balances?.tasks && typeof data.balances.tasks === 'object') {
              taskSum = Object.values(data.balances.tasks).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) as number;
            }
            const totalIncome = main + bonus + ref + taskSum;
            
            return {
              id: doc.id,
              fullName: data.fullName || "User",
              photoURL: data.photoURL || null,
              totalIncome,
              referrals: Number(data.referralCount || 0),
              bonus
            };
          } catch (err) {
            console.warn("Skipping malformed user record:", doc.id, err);
            return null;
          }
        }).filter(Boolean);
        
        fetchedLeaders.sort((a: any, b: any) => b[sortBy] - a[sortBy]);
        setLeaders(fetchedLeaders.slice(0, 50));
        
      } catch (error) {
        console.error("Error fetching leaders:", error);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaders();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Dynamic Header Background */}
      <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 pt-6 px-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10 max-w-lg mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-white/80 hover:bg-white/10 rounded-full transition-colors active:scale-95"
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-yellow-400 mb-3 shadow-xl ring-1 ring-white/20 transform rotate-3"
          >
            <Trophy className="w-8 h-8 drop-shadow-md" />
          </motion.div>
          <p className="text-sm font-semibold text-indigo-100 uppercase tracking-widest opacity-90 drop-shadow-sm">Top Performers</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 relative z-20">
        {/* Toggle Controls */}
        <div className="flex bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-1.5 rounded-2xl mb-8 shadow-xl border border-white/20 dark:border-slate-700/50">
          <button 
            onClick={() => setSortBy('totalIncome')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 justify-center ${sortBy === 'totalIncome' ? 'bg-indigo-600 shadow-md text-white scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Income
          </button>
          <button 
            onClick={() => setSortBy('referrals')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${sortBy === 'referrals' ? 'bg-indigo-600 shadow-md text-white scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <Star className="w-3.5 h-3.5" />
            Referrals
          </button>
          <button 
            onClick={() => setSortBy('bonus')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${sortBy === 'bonus' ? 'bg-indigo-600 shadow-md text-white scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
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
              <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 rounded-3xl backdrop-blur-md shadow-lg border border-gray-100 dark:border-slate-700">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No leaders to display.</p>
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
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-white font-display font-bold shadow-lg border-2 border-white dark:border-slate-800 text-2xl transform transition-transform group-hover:scale-105 overflow-hidden">
                          {leaders[1].photoURL ? (
                            <img src={leaders[1].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-1 bg-slate-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white dark:border-slate-900 shadow-md">2</div>
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate w-full text-center px-1 mb-1">{leaders[1].fullName || 'User'}</span>
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400 mb-2 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full shadow-inner tracking-tight">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[1].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[1].referrals || 0)} Refs` : `৳${Number(leaders[1].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-24 bg-gradient-to-t from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-t-2xl mt-1 shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] relative flex justify-center pt-3 border-t-4 border-slate-300 dark:border-slate-500 rounded-b shadow-xl">
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
                      <Crown className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-bounce relative z-10" />
                      <div className="relative mb-3 group z-10">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 -z-10"></div>
                        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-white font-display font-black shadow-2xl border-4 border-white dark:border-slate-800 text-3xl transform transition-transform group-hover:scale-105 relative z-10 overflow-hidden">
                          {leaders[0].photoURL ? (
                            <img src={leaders[0].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-white dark:border-slate-800 shadow-md z-20">1</div>
                      </div>
                      <span className="font-bold text-[15px] text-slate-900 dark:text-white truncate w-full text-center px-1 mb-1 shadow-sm mt-1 relative z-10">{leaders[0].fullName || 'User'}</span>
                      <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-full shadow-inner ring-1 ring-indigo-200 dark:ring-indigo-700 mb-2 tracking-tight relative z-10">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[0].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[0].referrals || 0)} Refs` : `৳${Number(leaders[0].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-32 bg-gradient-to-t from-yellow-300 to-yellow-100 dark:from-yellow-600 dark:to-yellow-500 rounded-t-2xl mt-1 relative flex justify-center pt-4 border-t-4 border-yellow-400 text-yellow-700 dark:text-yellow-100 shadow-xl overflow-hidden rounded-b z-0">
                        <div className="absolute top-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
                        <Trophy className="w-8 h-8 drop-shadow-md z-10 opacity-80" />
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
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-white font-display font-bold shadow-lg border-2 border-white dark:border-slate-800 text-2xl transform transition-transform group-hover:scale-105 overflow-hidden">
                          {leaders[2].photoURL ? (
                            <img src={leaders[2].photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -left-1 bg-amber-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white dark:border-slate-800 shadow-md">3</div>
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate w-full text-center px-1 mb-1">{leaders[2].fullName || 'User'}</span>
                      <span className="text-xs font-black text-orange-800 dark:text-orange-300 mb-2 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 rounded-full shadow-inner tracking-tight">
                        {sortBy === 'totalIncome' ? `৳${Number(leaders[2].totalIncome || 0).toFixed(0)}` : sortBy === 'referrals' ? `${(leaders[2].referrals || 0)} Refs` : `৳${Number(leaders[2].bonus || 0).toFixed(0)}`}
                      </span>
                      <div className="w-full h-20 bg-gradient-to-t from-amber-300 to-amber-100 dark:from-amber-600 dark:to-amber-500 rounded-t-2xl mt-1 shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] relative flex justify-center pt-3 border-t-4 border-amber-400 dark:border-amber-400 rounded-b shadow-xl">
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
                      className="flex items-center justify-between p-3.5 rounded-2xl transition-all bg-white dark:bg-slate-800/90 hover:shadow-md hover:-translate-y-0.5 border border-slate-100 dark:border-slate-700/50 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 font-bold text-slate-400 text-sm">
                          {index + 4}
                        </div>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-slate-700 font-display font-bold shadow-sm border border-indigo-100 dark:border-slate-600 overflow-hidden">
                            {leader.photoURL ? (
                              <img src={leader.photoURL} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[15px] text-slate-900 dark:text-slate-100 tracking-tight">
                            {leader.fullName || 'User'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{sortBy === 'totalIncome' ? 'Income' : sortBy === 'referrals' ? 'Refs' : 'Bonus'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end pl-2">
                        <span className="font-black font-display text-indigo-600 dark:text-indigo-400 text-lg tracking-tight bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-xl">
                          {sortBy === 'totalIncome' ? `৳${Number(leader.totalIncome || 0).toFixed(2)}` : sortBy === 'referrals' ? (leader.referrals || 0) : `৳${Number(leader.bonus || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {leaders.length <= 3 && (
                    <div className="text-center py-10 text-slate-400 text-sm font-medium bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
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
