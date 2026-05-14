import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Privacy Policy</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
            <Shield className="w-8 h-8 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">1. Data Collection</h3>
          <p>We collect information you provide directly to us when you create an account, participate in any interactive features of the app, or otherwise communicate with us.</p>
          
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mt-4">2. Usage of Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, as well as to process transactions and send you related information.</p>
          
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mt-4">3. Data Protection</h3>
          <p>We implement security measures to protect your personal information and ensure it is not accessed, disclosed, altered, or destroyed without authorization.</p>
        </div>
      </div>
    </div>
  );
}
