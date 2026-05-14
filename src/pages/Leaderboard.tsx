import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'totalIncome' | 'referrals' | 'bonus'>('totalIncome');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "leaderboard"),
      orderBy(sortBy, "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLeaders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaders(fetchedLeaders);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'leaderboard');
      setLoading(false);
    });

    return () => unsubscribe();
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
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 mb-4 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">Top players based on earned points</p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-8 shadow-inner border border-slate-200 dark:border-slate-700/50">
        <button 
          onClick={() => setSortBy('totalIncome')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 justify-center ${sortBy === 'totalIncome' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Top Income
        </button>
        <button 
          onClick={() => setSortBy('referrals')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${sortBy === 'referrals' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Top Referrals
        </button>
        <button 
          onClick={() => setSortBy('bonus')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${sortBy === 'bonus' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Top Bonus
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-transparent">
          {leaders.length === 0 ? (
            <div className="text-center py-10 bg-white/80 dark:bg-slate-800/80 rounded-3xl backdrop-blur-md shadow-xl border border-gray-100 dark:border-slate-700">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm text-gray-500">No leaders yet.</p>
            </div>
          ) : (
            <>
              {/* Podium for Top 3 */}
              <div className="flex justify-center items-end h-52 mb-8 gap-2 px-2">
                {/* 2nd Place */}
                {leaders[1] && (
                  <div className="flex flex-col items-center flex-1 z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="relative mb-2">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white dark:border-slate-800 text-lg">
                        {leaders[1].fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900 shadow-sm">2</div>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full text-center mb-1">{leaders[1].fullName || 'User'}</span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                      {sortBy === 'totalIncome' ? `৳${Number(leaders[1].totalIncome || 0).toFixed(2)}` : sortBy === 'referrals' ? `${(leaders[1].referrals || 0)} Refs` : `৳${Number(leaders[1].bonus || 0).toFixed(2)}`}
                    </span>
                    <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/80 rounded-t-xl mt-3 shadow-inner relative flex justify-center pt-2">
                      <Medal className="w-6 h-6 text-slate-400 opacity-50" />
                    </div>
                  </div>
                )}
                
                {/* 1st Place */}
                {leaders[0] && (
                  <div className="flex flex-col items-center flex-1 z-20 animate-fade-in-up">
                    <Crown className="w-8 h-8 text-yellow-500 mb-1 drop-shadow-sm" />
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-xl border-4 border-white dark:border-slate-800 text-xl transform scale-110">
                        {leaders[0].fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white dark:border-slate-800 shadow-sm">1</div>
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate w-full text-center mb-1 drop-shadow-sm">{leaders[0].fullName || 'User'}</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-200 dark:ring-indigo-800/50">
                      {sortBy === 'totalIncome' ? `৳${Number(leaders[0].totalIncome || 0).toFixed(2)}` : sortBy === 'referrals' ? `${(leaders[0].referrals || 0)} Refs` : `৳${Number(leaders[0].bonus || 0).toFixed(2)}`}
                    </span>
                    <div className="w-full h-32 bg-gradient-to-t from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-t-xl mt-3 shadow-inner relative flex justify-center pt-3 border-x border-t border-yellow-300 dark:border-yellow-700/50">
                      <Trophy className="w-8 h-8 text-yellow-500 opacity-80" />
                    </div>
                  </div>
                )}
                
                {/* 3rd Place */}
                {leaders[2] && (
                  <div className="flex flex-col items-center flex-1 z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative mb-2">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white dark:border-slate-800 text-lg">
                        {leaders[2].fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">3</div>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full text-center mb-1">{leaders[2].fullName || 'User'}</span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                      {sortBy === 'totalIncome' ? `৳${Number(leaders[2].totalIncome || 0).toFixed(2)}` : sortBy === 'referrals' ? `${(leaders[2].referrals || 0)} Refs` : `৳${Number(leaders[2].bonus || 0).toFixed(2)}`}
                    </span>
                    <div className="w-full h-20 bg-gradient-to-t from-amber-200/50 to-amber-100/50 dark:from-slate-800 dark:to-slate-700/80 rounded-t-xl mt-3 shadow-inner relative flex justify-center pt-2">
                      <Medal className="w-6 h-6 text-amber-700 opacity-50" />
                    </div>
                  </div>
                )}
              </div>

              {/* The Rest of the List */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 space-y-2 relative z-30">
                {leaders.slice(3).map((leader, index) => (
                  <div 
                    key={leader.id} 
                    className="flex items-center justify-between p-3 rounded-2xl transition-all bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700/50 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 font-bold text-slate-400 text-sm">
                        {index + 4}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-sm text-sm">
                        {leader.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
                          {leader.fullName || 'User'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5 font-medium">
                          <span className={`${sortBy === 'totalIncome' ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-1.5 rounded' : ''}`}>৳{Number(leader.totalIncome || 0).toFixed(2)}</span>
                          <span className="opacity-50">•</span>
                          <span className={`${sortBy === 'referrals' ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-1.5 rounded' : ''}`}>{leader.referrals || 0} Refs</span>
                          <span className="opacity-50">•</span>
                          <span className={`${sortBy === 'bonus' ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-1.5 rounded' : ''}`}>৳{Number(leader.bonus || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-2">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
                        {sortBy === 'totalIncome' ? Number(leader.totalIncome || 0).toFixed(2) : sortBy === 'referrals' ? (leader.referrals || 0) : Number(leader.bonus || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                {leaders.length <= 3 && (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium">
                    No more players to show.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
