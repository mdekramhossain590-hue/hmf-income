import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Send, Globe } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Support() {
  const navigate = useNavigate();
  const [supportSettings, setSupportSettings] = useState({ email: '', whatsapp: '', telegram: '', facebook: '' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "support"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSupportSettings({
          email: data.email || 'support@example.com',
          whatsapp: data.whatsapp || '',
          telegram: data.telegram || '',
          facebook: data.facebook || ''
        });
      }
    });

    return () => unsub();
  }, []);

  const handleOpenLink = (url: string) => {
    if (!url) return;
    if (url.includes('@')) {
      window.open(`mailto:${url}`, '_blank');
    } else if (url.startsWith('http') || url.startsWith('wa.me')) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(fullUrl, '_blank');
    } else if (/^\d+$/.test(url.replace(/\D/g, ''))) {
      // Looks like a phone number
      window.open(`https://wa.me/${url.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Help & Support</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center mb-6 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-5 ring-4 ring-white dark:ring-slate-800 shadow-sm relative z-10">
          <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 relative z-10">How can we help?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm font-medium relative z-10">
          If you have any questions or need assistance, please reach out to our team.
        </p>

        <div className="w-full space-y-3 relative z-10">
          {supportSettings.email && (
            <button onClick={() => handleOpenLink(supportSettings.email)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group shadow-sm active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">Email Us</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{supportSettings.email}</span>
            </button>
          )}
          
          {supportSettings.whatsapp && (
            <button onClick={() => handleOpenLink(supportSettings.whatsapp)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all group shadow-sm active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">WhatsApp</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[120px]">Live Chat</span>
            </button>
          )}

          {supportSettings.telegram && (
            <button onClick={() => handleOpenLink(supportSettings.telegram)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-sky-200 dark:hover:border-sky-500/30 transition-all group shadow-sm active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-sky-500 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">Telegram</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[120px]">Group / Admin</span>
            </button>
          )}

          {supportSettings.facebook && (
            <button onClick={() => handleOpenLink(supportSettings.facebook)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group shadow-sm active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">Facebook</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[120px]">Page / Group</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
