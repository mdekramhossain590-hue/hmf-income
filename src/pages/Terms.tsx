import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function Terms() {
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Terms & Conditions</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
            <FileText className="w-8 h-8 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">1. Acceptance of Terms</h3>
          <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mt-4">2. User Conduct</h3>
          <p>You agree to use this application only for lawful purposes. You are responsible for all of your activities in connection with the application.</p>
          
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mt-4">3. Modifications</h3>
          <p>We reserve the right to modify these terms at any time. Your continued use of the app after any modifications indicated your acceptance of the new terms.</p>
        </div>
      </div>
    </div>
  );
}
