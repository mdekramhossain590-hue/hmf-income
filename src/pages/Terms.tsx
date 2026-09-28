import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-4 pb-20 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] rounded-full transition cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
      </div>

      <div className="bg-[#151515] rounded-2xl p-6 shadow-sm border border-[#3D3215] mb-6 transition-colors">
        <div className="flex justify-center mb-6">
          <div className="bg-[#101010] border border-[#3D3215] p-4 rounded-full text-[#FACC15]">
            <FileText className="w-8 h-8" />
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-[#A3A3A3] leading-relaxed">
          <h3 className="font-bold text-[#FACC15] text-lg">1. Acceptance of Terms</h3>
          <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3 className="font-bold text-[#FACC15] text-lg mt-4">2. User Conduct</h3>
          <p>You agree to use this application only for lawful purposes. You are responsible for all of your activities in connection with the application.</p>
          
          <h3 className="font-bold text-[#FACC15] text-lg mt-4">3. Modifications</h3>
          <p>We reserve the right to modify these terms at any time. Your continued use of the app after any modifications indicated your acceptance of the new terms.</p>
        </div>
      </div>
    </div>
  );
}
