import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Send, Globe, Shield } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';

export function Support() {
  const navigate = useNavigate();
  const [supportSettings, setSupportSettings] = useState({ email: '', whatsapp: '', telegram: '', facebook: '' });

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const docSnap = await getCachedDoc(doc(db, "settings", "support"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSupportSettings({
            email: data.email || 'support@example.com',
            whatsapp: data.whatsapp || '',
            telegram: data.telegram || '',
            facebook: data.facebook || ''
          });
        }
      } catch (e: any) {
        console.warn('Failed to load support settings');
      }
    };
    fetchSupport();
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
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight">Help & Support</h1>
      </div>

      <div className="bg-[#151515] border border-[#3D3215] rounded-[20px] p-4 mb-6 flex items-start gap-4">
        <div className="bg-[#101010] border border-[#3D3215] p-2 rounded-xl text-[#FACC15]">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">24/7 Verified Support</h3>
          <p className="text-xs text-[#A3A3A3] mt-1 font-medium">Our team is always here to assist you with secure and encrypted communication channels.</p>
        </div>
      </div>

      <div className="bg-[#151515] rounded-3xl p-6 shadow-xl border border-[#3D3215] flex flex-col items-center mb-6 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="bg-[#101010] border border-[#3D3215] p-4 rounded-full mb-5 shadow-sm relative z-10 text-[#FACC15]">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 relative z-10">How can we help?</h2>
        <p className="text-[#A3A3A3] text-center mb-8 text-sm font-medium relative z-10">
          If you have any questions or need assistance, please reach out to our team.
        </p>

        <div className="w-full space-y-3 relative z-10">
          {supportSettings.email && (
            <button onClick={() => handleOpenLink(supportSettings.email)} className="w-full flex items-center justify-between p-4 bg-[#101010] border border-[#3D3215] rounded-2xl hover:border-[#D4A017] transition-all group shadow-sm active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-sm group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">Email Us</span>
              </div>
              <span className="text-xs font-semibold text-[#A3A3A3] truncate max-w-[120px]">{supportSettings.email}</span>
            </button>
          )}
          
          {supportSettings.whatsapp && (
            <button onClick={() => handleOpenLink(supportSettings.whatsapp)} className="w-full flex items-center justify-between p-4 bg-[#101010] border border-[#3D3215] rounded-2xl hover:border-emerald-500/50 transition-all group shadow-sm active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">WhatsApp</span>
              </div>
              <span className="text-xs font-semibold text-[#A3A3A3] truncate max-w-[120px]">Live Chat</span>
            </button>
          )}

          {supportSettings.telegram && (
            <button onClick={() => handleOpenLink(supportSettings.telegram)} className="w-full flex items-center justify-between p-4 bg-[#101010] border border-[#3D3215] rounded-2xl hover:border-sky-500/50 transition-all group shadow-sm active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-sky-400 shadow-sm group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">Telegram</span>
              </div>
              <span className="text-xs font-semibold text-[#A3A3A3] truncate max-w-[120px]">Group / Admin</span>
            </button>
          )}

          {supportSettings.facebook && (
            <button onClick={() => handleOpenLink(supportSettings.facebook)} className="w-full flex items-center justify-between p-4 bg-[#101010] border border-[#3D3215] rounded-2xl hover:border-blue-500/50 transition-all group shadow-sm active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">Facebook</span>
              </div>
              <span className="text-xs font-semibold text-[#A3A3A3] truncate max-w-[120px]">Page / Group</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
