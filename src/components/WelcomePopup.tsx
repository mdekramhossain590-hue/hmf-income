import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { X, Send, ArrowRight, BellRing } from 'lucide-react';
import { motion } from 'motion/react';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({ 
    telegramText: 'Join Telegram',
    telegramLink: 'https://t.me/', 
    skipText: 'Skip', 
    skipLink: '#',
    title: 'Welcome!',
    subtitle: 'Join our official channel for updates'
  });

  useEffect(() => {
    const checkPopup = async () => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenWelcomePopup');
      if (!hasSeenPopup) {
        try {
          const docRef = doc(db, 'settings', 'popup');
          const docSnap = await getCachedDoc(docRef);
          if (docSnap.exists()) {
            setSettings({
              telegramText: docSnap.data().telegramText || 'Join Telegram',
              telegramLink: docSnap.data().telegramLink || 'https://t.me/',
              skipText: docSnap.data().skipText || 'Skip',
              skipLink: docSnap.data().skipLink || '#',
              title: docSnap.data().title || 'Welcome!',
              subtitle: docSnap.data().subtitle || 'Join our official channel for updates'
            });
          }
          setIsOpen(true);
          sessionStorage.setItem('hasSeenWelcomePopup', 'true');
        } catch (error: any) {
          console.warn("Error fetching popup settings", error?.message || "Unknown Error");
        }
      }
    };
    checkPopup();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#151515] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative border border-[#3D3215]"
      >
        {/* Banner header with modern glowing mesh layout */}
        <div className="bg-gradient-to-br from-[#8A6508] via-[#D4A017] to-[#FACC15] p-8 text-center text-[#090909] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8A6508]/30 rounded-full blur-lg"></div>

          <div className="w-16 h-16 bg-[#090909]/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#090909]/20 shadow-inner relative">
            <Send className="w-7 h-7 text-[#090909] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EF4444] rounded-full ring-2 ring-[#D4A017] animate-pulse"></span>
          </div>
          <h2 className="text-xl font-display font-black tracking-tight">{settings.title}</h2>
          <p className="text-[#1A1A1A] text-xs font-bold uppercase tracking-wider mt-1.5">{settings.subtitle}</p>
        </div>
        
        <div className="p-6 space-y-3.5">
          {/* Informational tips */}
          <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] flex items-start gap-2.5 text-left">
            <BellRing className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
            <p className="text-xs text-[#A3A3A3] font-semibold leading-relaxed">
              ইনকাম প্রুফ দেখতে, পেমেন্ট ইনফো পেতে এবং নতুন কাজের রুলস সম্পর্কে সবার আগে জানতে অবশ্যই আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন।
            </p>
          </div>

          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-[#D4A017]/25"
          >
            <Send className="w-4 h-4 text-[#090909]" />
            {settings.telegramText}
          </a>
          
          <a
            href={settings.skipLink}
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] hover:text-[#FFFFFF] py-3 rounded-[16px] text-xs font-bold transition duration-200 border border-[#3D3215]"
          >
            {settings.skipText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[#090909]/70 hover:text-[#090909] bg-[#090909]/15 hover:bg-[#090909]/25 rounded-full p-1.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
