import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

export function Rewards() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight">Rewards & Badges</h1>
      </div>

      <div className="bg-[#151515] rounded-3xl p-6 shadow-xl border border-[#3D3215] flex flex-col items-center justify-center min-h-[400px] text-center transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="bg-[#101010] border border-[#3D3215] p-5 rounded-full mb-6 shadow-md relative z-10">
          <Award className="w-10 h-10 text-[#FACC15]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-3 relative z-10">Coming Soon</h2>
        <p className="text-[#A3A3A3] max-w-xs text-sm font-medium leading-relaxed relative z-10">
          Exclusive rewards and badges are on the way. Collect points and unlock amazing prizes!
        </p>
      </div>
    </div>
  );
}
