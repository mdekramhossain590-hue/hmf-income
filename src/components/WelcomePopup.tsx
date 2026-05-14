import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Send, ArrowRight } from 'lucide-react';

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
          const docSnap = await getDoc(docRef);
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
          console.error("Error fetching popup settings", error);
        }
      }
    };
    checkPopup();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <div className="bg-[#0D47A1] p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send className="w-8 h-8 text-white ml-[-2px]" />
          </div>
          <h2 className="text-xl font-bold">{settings.title}</h2>
          <p className="text-blue-100 text-sm mt-1">{settings.subtitle}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white py-3 rounded-xl font-bold transition shadow-sm"
          >
            <Send className="w-5 h-5" />
            {settings.telegramText}
          </a>
          
          <a
            href={settings.skipLink}
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold transition"
          >
            {settings.skipText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
