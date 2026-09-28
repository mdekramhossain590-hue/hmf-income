import React, { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { X, ExternalLink, Zap, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({ 
    enabled: true,
    title: '🎮 RUSH TOP BD — NOW LIVE!',
    subtitle: '🔥 আপনার প্রিয় গেমের Top-Up এখন আরও সহজ!',
    features: [
      { icon: '💎', text: 'Free Fire Diamond' },
      { icon: '🎁', text: 'Weekly Membership' },
      { icon: '⚡', text: 'UID Top-Up' },
      { icon: '💰', text: 'আকর্ষণীয় দাম ও দ্রুত ডেলিভারি' }
    ],
    footerTitle: '🚀 RUSH TOP BD এখন Live!',
    footerSubtitle: 'আজই আপনার Top-Up সম্পন্ন করুন।',
    primaryBtnText: 'TOP-UP NOW',
    primaryBtnLink: 'https://rushtopbd.shop',
    secondaryBtnText: 'MAYBE LATER'
  });

  useEffect(() => {
    const checkPopup = async () => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenRushTopBDPopup_v1');
      if (!hasSeenPopup) {
        try {
          const docRef = doc(db, 'settings', 'popup');
          const docSnap = await getCachedDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.enabled !== false) {
              setSettings(prev => ({
                ...prev,
                title: data.title || prev.title,
                subtitle: data.subtitle || prev.subtitle,
                primaryBtnText: data.telegramText || data.primaryBtnText || prev.primaryBtnText,
                primaryBtnLink: data.telegramLink || data.primaryBtnLink || prev.primaryBtnLink,
                secondaryBtnText: data.skipText || data.secondaryBtnText || prev.secondaryBtnText,
              }));
            }
          }
        } catch (error: any) {
          console.warn("Error fetching popup settings", error?.message || "Unknown Error");
        }
        setIsOpen(true);
      }
    };
    checkPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenRushTopBDPopup_v1', 'true');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="bg-[#151515] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative border-2 border-[#D4A017]/40 ring-1 ring-[#FACC15]/20"
        >
          {/* Glowing Top Banner */}
          <div className="bg-gradient-to-br from-[#1C1608] via-[#2A1E0A] to-[#120E04] p-6 text-center text-white relative overflow-hidden border-b border-[#3D3215]">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FACC15]/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D4A017]/15 rounded-full blur-xl pointer-events-none"></div>

            {/* Gaming Tag Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[10px] font-black uppercase tracking-wider mb-3 shadow-inner">
              <Flame className="w-3.5 h-3.5 text-[#FACC15] animate-pulse" />
              <span>OFFICIAL TOP-UP PARTNER</span>
              <Sparkles className="w-3 h-3 text-[#FACC15]" />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight bg-gradient-to-r from-[#FFFFFF] via-[#FFF3C4] to-[#FACC15] bg-clip-text text-transparent">
              {settings.title}
            </h2>

            {/* Subtitle */}
            <p className="text-[#FACC15] text-xs font-bold mt-1.5 leading-snug">
              {settings.subtitle}
            </p>
          </div>
          
          <div className="p-5 sm:p-6 space-y-4">
            {/* Feature Highlights Grid */}
            <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2.5 shadow-inner">
              {settings.features.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-[13px] font-bold text-white group">
                  <span className="text-base sm:text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-[#E5E5E5] group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                  {idx === 2 && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      Instant
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Call to action notice */}
            <div className="text-center py-0.5">
              <p className="text-xs font-black text-white tracking-wide">
                {settings.footerTitle}
              </p>
              <p className="text-[11px] font-bold text-[#A3A3A3] mt-0.5">
                {settings.footerSubtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href={settings.primaryBtnLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#EAB308] text-[#090909] py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#D4A017]/30 hover:brightness-110"
              >
                <Zap className="w-4 h-4 fill-current text-[#090909]" />
                {settings.primaryBtnText}
                <ExternalLink className="w-4 h-4 text-[#090909] ml-0.5" />
              </a>
              
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] hover:text-white py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border border-[#3D3215] active:scale-[0.98]"
              >
                {settings.secondaryBtnText}
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#A3A3A3] hover:text-white bg-black/40 hover:bg-black/70 rounded-full p-1.5 transition-colors border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
