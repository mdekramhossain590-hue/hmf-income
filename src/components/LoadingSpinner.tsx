import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { motion } from 'framer-motion';

export function LoadingSpinner() {
  const { siteSettings } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center w-12 h-12">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin absolute inset-0" />
        {siteSettings?.logoUrl && (
          <img 
            src={siteSettings.logoUrl} 
            alt="Site Logo" 
            className="w-6 h-6 object-contain absolute"
          />
        )}
      </div>
      <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}

export function FullPageLoader() {
  const { siteSettings } = useAuth();
  
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-slate-800/10 dark:to-slate-900/10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        <div className="relative flex items-center justify-center mb-6">
          <motion.div 
            animate={{ 
              boxShadow: [
                "0px 0px 0px 0px rgba(99, 102, 241, 0.2)",
                "0px 0px 0px 24px rgba(99, 102, 241, 0)",
              ] 
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-[32px]"
          />
          <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700/50 relative overflow-hidden z-10">
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt="Site Logo" 
                className="w-16 h-16 object-contain"
              />
            ) : (
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-4xl uppercase">
                {siteSettings?.siteName?.charAt(0) || 'H'}
              </span>
            )}
          </div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-black text-slate-800 dark:text-white tracking-tight text-center"
        >
          {siteSettings?.siteName || 'HMF Income'}
        </motion.h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-16 flex flex-col items-center gap-3 z-10"
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        </div>
      </motion.div>
    </div>
  );
}
