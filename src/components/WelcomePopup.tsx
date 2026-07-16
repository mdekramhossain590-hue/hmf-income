import React, { useState, useEffect } from 'react';
import { doc, getDoc } from '@/src/lib/mock-firestore';
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
        } catch (error) {
          console.warn("Error fetching popup settings", error);
        }
      }
    };
    checkPopup();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100 dark:border-slate-800/80"
      >
        {/* Banner header with modern glowing mesh layout */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-lg"></div>

          <div className="w-16 h-16 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner relative">
            <Send className="w-7 h-7 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-blue-600 animate-pulse"></span>
          </div>
          <h2 className="text-xl font-display font-black tracking-tight">{settings.title}</h2>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mt-1.5">{settings.subtitle}</p>
        </div>
        
        <div className="p-6 space-y-3.5">
          {/* Informational tips */}
          <div className="bg-slate-50 dark:bg-slate-950/45 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60 flex items-start gap-2.5 text-left">
            <BellRing className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              ইনকাম প্রুফ দেখতে, পেমেন্ট ইনফো পেতে এবং নতুন কাজের রুলস সম্পর্কে সবার আগে জানতে অবশ্যই আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন।
            </p>
          </div>

          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-sky-500/10"
          >
            <Send className="w-4 h-4" />
            {settings.telegramText}
          </a>
          
          <a
            href={settings.skipLink}
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-3 rounded-[16px] text-xs font-bold transition duration-200"
          >
            {settings.skipText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/35 rounded-full p-1.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
