import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export function Privacy() {
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
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
      </div>

      <div className="bg-[#151515] rounded-2xl p-6 shadow-sm border border-[#3D3215] mb-6 transition-colors">
        <div className="flex justify-center mb-6">
          <div className="bg-[#101010] border border-[#3D3215] p-4 rounded-full text-[#FACC15]">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-[#A3A3A3] leading-relaxed">
          <h3 className="font-bold text-[#FACC15] text-lg">1. Data Collection</h3>
          <p>We collect information you provide directly to us when you create an account, participate in any interactive features of the app, or otherwise communicate with us.</p>
          
          <h3 className="font-bold text-[#FACC15] text-lg mt-4">2. Usage of Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, as well as to process transactions and send you related information.</p>
          
          <h3 className="font-bold text-[#FACC15] text-lg mt-4">3. Data Protection</h3>
          <p>We implement security measures to protect your personal information and ensure it is not accessed, disclosed, altered, or destroyed without authorization.</p>
        </div>
      </div>
    </div>
  );
}
