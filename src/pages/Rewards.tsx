import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

export function Rewards() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Rewards & Badges</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center justify-center min-h-[400px] text-center transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="bg-amber-50 dark:bg-amber-900/30 p-5 rounded-full mb-6 ring-4 ring-white dark:ring-slate-800 shadow-sm relative z-10">
          <Award className="w-10 h-10 text-amber-500 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3 relative z-10">Coming Soon</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm font-medium leading-relaxed relative z-10">
          Exclusive rewards and badges are on the way. Collect points and unlock amazing prizes!
        </p>
      </div>
    </div>
  );
}
