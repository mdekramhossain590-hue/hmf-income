import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { motion } from 'framer-motion';

export function LoadingSpinner() {
  const { siteSettings } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center w-14 h-14">
        <Loader2 className="w-14 h-14 text-[#D4A017] animate-spin absolute inset-0" />
        {siteSettings?.logoUrl && (
          <img 
            src={siteSettings.logoUrl} 
            alt="Site Logo" 
            className="w-8 h-8 object-contain rounded-full absolute p-0.5"
          />
        )}
      </div>
      <p className="text-sm font-semibold text-[#A3A3A3] animate-pulse">Loading...</p>
    </div>
  );
}

export function FullPageLoader() {
  const { siteSettings } = useAuth();
  
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090909] pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#151515] to-[#090909]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        <div className="relative flex items-center justify-center mb-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.06, 1],
              opacity: [0.2, 0.45, 0.2]
            }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#D4A017] rounded-[36px] blur-xl"
          />
          <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#141414] rounded-[32px] shadow-2xl flex items-center justify-center border-2 border-[#D4A017]/60 relative overflow-hidden z-10 p-2">
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt="Site Logo" 
                className="w-full h-full object-contain rounded-[24px]"
              />
            ) : (
              <span className="text-[#FACC15] font-black text-5xl uppercase">
                {siteSettings?.siteName?.charAt(0) || 'H'}
              </span>
            )}
          </div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-black text-[#FFFFFF] tracking-tight text-center"
        >
          {siteSettings?.siteName || 'HMF EARNING ZONE'}
        </motion.h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-16 flex flex-col items-center gap-3 z-10"
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        </div>
      </motion.div>
    </div>
  );
}
