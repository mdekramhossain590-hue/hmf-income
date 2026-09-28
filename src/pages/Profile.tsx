import React, { useRef, useState, useEffect } from 'react';
import { Check, ChevronRight, HeadphonesIcon, LineChart, ShieldHalf, ShieldCheck, LogOut, Moon, Camera, Loader2, Edit2, Copy, Link, User, RefreshCw } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { uploadImageOrFallback } from '../lib/imageUpload';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useTheme } from '../components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export function Profile() {
  const { profile, user, loading, logOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [copiedReferCode, setCopiedReferCode] = useState(false);
  const [copiedUsedCode, setCopiedUsedCode] = useState(false);
  const [upgradingCode, setUpgradingCode] = useState(false);

  const upgradeReferralCode = async () => {
    if (!auth.currentUser || upgradingCode) return;
    setUpgradingCode(true);
    const idToast = toast.loading("Updating referral code...");
    try {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      let myReferCode = '';
      for (let i = 0; i < 2; i++) {
        myReferCode += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      for (let i = 0; i < 6; i++) {
        myReferCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { myReferCode });
      await refreshProfile();
      toast.success("Your referral code is now updated to the 8-character (2 letters, 6 numbers) format!", { id: idToast });
    } catch (e: any) {
      console.error("Upgrade code error:", e?.message || "Unknown Error");
      toast.error("Failed to update referral code.", { id: idToast });
      try {
        handleFirestoreError(e, OperationType.UPDATE, "users");
      } catch (err: any) {}
    } finally {
      setUpgradingCode(false);
    }
  };

  useEffect(() => {
    if (profile?.myReferCode) {
      const isCorrectFormat = /^[A-Z]{2}[0-9]{6}$/.test(profile.myReferCode);
      if (!isCorrectFormat) {
        upgradeReferralCode();
      }
    }
  }, [profile?.myReferCode]);

    const [requiredReferrals, setRequiredReferrals] = useState(10);
  useEffect(() => {
    getCachedDoc(doc(db, "settings", "dashboard")).then(snap => {
      if (snap.exists() && snap.data().partnerSettings) {
        setRequiredReferrals(snap.data().partnerSettings.requiredReferrals || 10);
      }
    });
  }, []);

  const handleEditName = () => {
    setNewName(profile?.fullName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || !auth.currentUser || savingName) return;
    
    setSavingName(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { fullName: newName.trim() });
      await refreshProfile();
      setIsEditingName(false);
      toast.success("Name updated successfully!");
    } catch (e: any) {
      console.error("Update name error:", e?.message || "Unknown Error");
      toast.error("Failed to update name.");
      try {
        handleFirestoreError(e, OperationType.UPDATE, "users");
      } catch (err: any) {}
    } finally {
      setSavingName(false);
    }
  };

  const copyToClipboard = (text: string, type: 'my' | 'used') => {
    navigator.clipboard.writeText(text);
    if (type === 'my') {
      setCopiedReferCode(true);
      setTimeout(() => setCopiedReferCode(false), 2000);
    } else {
      setCopiedUsedCode(true);
      setTimeout(() => setCopiedUsedCode(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Logout failed', error?.message || "Unknown Error");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageOrFallback(file, 200);

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: imageUrl });
      
      await refreshProfile();
      toast.success("Profile picture updated!");
    } catch (e: any) {
      console.error("Upload error:", e?.message || "Unknown Error");
      toast.error(e.message || "Failed to upload profile picture.");
      if (e.message && !e.message.includes("Cloudinary") && !e.message.includes("upload image")) {
        try {
          handleFirestoreError(e, OperationType.UPDATE, "users");
        } catch (err: any) {}
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarUrl = profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&background=0D47A1&color=fff`;

  if (loading) {
    return (
      <div className="pt-8 px-4 flex flex-col items-center justify-center space-y-4 pb-20 bg-[#090909]">
        <div className="w-24 h-24 rounded-full bg-[#1C1C1C] border border-[#3D3215] animate-pulse"></div>
        <div className="w-48 h-8 bg-[#1C1C1C] rounded border border-[#3D3215] animate-pulse"></div>
        <div className="w-64 h-4 bg-[#1C1C1C] rounded border border-[#3D3215] animate-pulse mb-8"></div>
        
        <div className="w-full bg-[#151515] rounded-2xl h-64 border border-[#3D3215] animate-pulse"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pt-6 px-5 text-center pb-24 min-h-screen relative overflow-hidden bg-[#090909]"
    >
      {/* Background Gold Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#D4A017]/10 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-[#FACC15]/5 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Premium Profile Header */}
      <motion.div variants={itemVariants} className="relative mb-8 pt-8 pb-8 bg-[#151515] backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-[#3D3215] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/5 via-transparent to-transparent pointer-events-none"></div>
      
        <div className="relative w-28 h-28 mx-auto mb-5 group z-10">
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] p-[3px] shadow-xl group-hover:shadow-[#D4A017]/30 transition-all duration-500">
             <div className="w-full h-full rounded-full overflow-hidden bg-[#101010] border-2 border-[#151515] relative">
               <img 
                 src={avatarUrl} 
                 alt="Avatar"
                 className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                 onClick={() => !uploading && fileInputRef.current?.click()}
               />
               
               {uploading ? (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
                 </div>
               ) : (
                 <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                 >
                   <Camera className="w-8 h-8 text-[#FACC15]" />
                 </div>
               )}
             </div>
          </div>
          <div className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 rounded-full border-[3px] border-[#151515] flex items-center justify-center text-white shadow-lg pointer-events-none z-20">
            <Check className="w-4 h-4" />
          </div>
        </div>
        
        <div className="relative z-10 px-6">
          {isEditingName ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 mb-2">
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                disabled={savingName}
                className="bg-[#1C1C1C] border border-[#3D3215] text-white rounded-2xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#D4A017] w-full max-w-[200px] text-center shadow-inner disabled:opacity-70 font-semibold"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button 
                onClick={handleSaveName} 
                disabled={savingName} 
                className="text-[#090909] font-black bg-gradient-to-r from-[#D4A017] to-[#FACC15] hover:opacity-95 rounded-2xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center w-11 h-11 active:scale-95 shrink-0"
              >
                {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center mb-1 group cursor-pointer" onClick={handleEditName}>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#FACC15] transition-colors drop-shadow-sm flex items-center gap-2">
                  {profile?.fullName || user?.displayName || 'User'}
                  {((profile?.partnerReferrals || 0) >= requiredReferrals) && (
                  <div className="bg-[#D4A017] rounded-full p-0.5 text-[#090909] shadow-sm" title="Verified Partner">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  )}
                </h2>
                <div className="w-6 h-6 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#A3A3A3] opacity-0 group-hover:opacity-100 transition-all">
                  <Edit2 className="w-3 h-3" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-full bg-[#1C1C1C] border border-[#3D3215]">
                <ShieldHalf className="w-3.5 h-3.5 text-[#FACC15]" />
                <p className="text-xs font-semibold text-[#A3A3A3]">{profile?.email || user?.email || 'Unavailable'}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Active Connection"></span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Account Stats & Trust Signals */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#151515] rounded-[24px] p-4 shadow-sm border border-[#3D3215] flex flex-col items-center justify-center text-center group cursor-default transition-all hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15] mb-2">
            <Check className="w-5 h-5" />
          </div>
          <span className="text-[20px] font-black text-white leading-none mb-1">100%</span>
          <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Trust Score</span>
        </div>
        <div className="bg-[#151515] rounded-[24px] p-4 shadow-sm border border-[#3D3215] flex flex-col items-center justify-center text-center group cursor-default transition-all hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15] mb-2">
            <LineChart className="w-5 h-5" />
          </div>
          <span className="text-[20px] font-black text-white leading-none mb-1">{profile?.isActive ? "Active" : "Inactive"}</span>
          <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Account Status</span>
        </div>
      </motion.div>

      {/* Premium Bento Grid Config */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        
        {/* Code Box */}
        <motion.div variants={itemVariants} className="bg-[#151515] rounded-[32px] p-5 shadow-sm border border-[#3D3215] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="flex items-center gap-4 mb-5 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-inner">
               <Link className="w-6 h-6" />
             </div>
             <div className="text-left flex-1">
               <h3 className="font-display font-medium tracking-tight text-white text-base">{t('refer')}</h3>
               <p className="text-[10px] uppercase font-bold text-[#737373] tracking-widest">{t('refer')}</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-3 relative z-10">
             <div className="flex justify-between items-center bg-[#101010] p-4 rounded-2xl border border-[#3D3215] group/box hover:border-[#D4A017]/40 transition-colors">
               <div className="flex flex-col text-left">
                 <span className="text-[10px] text-[#737373] font-bold tracking-widest uppercase mb-1">My Code</span>
                 <div className="flex items-center gap-2 flex-wrap">
                   <span className="font-display font-bold text-[#FACC15] text-lg tracking-tight select-all">{profile?.myReferCode || 'Unavailable'}</span>
                   {profile?.myReferCode && !/^[A-Z]{2}[0-9]{6}$/.test(profile.myReferCode) && (
                     <button 
                       onClick={upgradeReferralCode}
                       disabled={upgradingCode}
                       className="p-1 px-2 rounded-lg bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] hover:bg-[#3D3215]/40 active:scale-95 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                       title="Convert to New Format"
                     >
                       <RefreshCw className={`w-3.5 h-3.5 ${upgradingCode ? 'animate-spin' : ''}`} />
                       <span>Convert to New Format</span>
                     </button>
                   )}
                 </div>
               </div>
               {profile?.myReferCode && (
                 <button onClick={() => copyToClipboard(profile.myReferCode, 'my')} className="p-3 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] hover:text-white transition-all active:scale-90 hover:bg-[#3D3215]/30">
                   {copiedReferCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                 </button>
               )}
             </div>

             {profile?.usedReferCode && (
               <div className="flex justify-between items-center bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
                 <div className="flex flex-col text-left">
                   <span className="text-[10px] text-[#737373] font-bold tracking-widest uppercase mb-1">Used Code</span>
                   <span className="font-display font-semibold text-[#A3A3A3] text-lg tracking-tight opacity-70">{profile.usedReferCode}</span>
                 </div>
                 <button onClick={() => copyToClipboard(profile.usedReferCode, 'used')} className="p-3 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white transition-all active:scale-90 hover:bg-[#3D3215]/30">
                   {copiedUsedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                 </button>
               </div>
             )}
          </div>
        </motion.div>

        {/* Global Settings List */}
        <motion.div variants={itemVariants} className="bg-[#151515] rounded-[32px] p-2 shadow-sm border border-[#3D3215] flex flex-col gap-1 text-left">
          
          <div className="flex justify-between items-center p-4 rounded-[24px] cursor-pointer hover:bg-[#1C1C1C] transition-all" onClick={toggleTheme}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white">{t('dark_mode')}</span>
            </div>
            <div className={`w-[52px] h-7 rounded-full relative transition-colors duration-300 ring-2 ring-[#3D3215] ${theme === 'dark' ? 'bg-[#D4A017]' : 'bg-[#1C1C1C]'}`}>
              <div className={`w-5 h-5 rounded-full absolute top-[2px] shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[26px] bg-[#090909]' : 'left-[4px] bg-[#A3A3A3]'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[24px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-inner">
                <LineChart className="w-5 h-5" /> 
              </div>
              <span className="text-sm font-bold text-white">{t('total_earned')}</span>
            </div>
            <div className="bg-[#101010] border border-[#3D3215] px-4 py-2 rounded-2xl shadow-inner">
              <span className="font-black tracking-tighter text-[#FACC15] text-lg">
                ৳ {((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + (profile?.balances?.gift || 0) + (profile?.balances?.partner || 0) + (typeof profile?.balances?.tasks === 'object' ? Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a||0) + Number(b||0), 0) as number : Number(profile?.balances?.tasks || 0))).toFixed(2)}
              </span>
            </div>
          </div>

          {(profile?.role === 'admin' || profile?.role === 'employee' || auth.currentUser?.email === 'mdekramhossain590@gmail.com') && (
            <div onClick={() => navigate('/admin')} className="flex items-center justify-between p-4 rounded-[24px] cursor-pointer bg-gradient-to-r from-[#1C1C1C] to-[#151515] hover:border-[#FACC15]/40 transition-all border border-[#3D3215] group shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#FACC15] text-[#090909] flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5 font-black" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-white block">Admin Panel</span>
                  <span className="text-[11px] text-[#D4A017] font-medium">ইউজার, পেমেন্ট ও সাইট ম্যানেজমেন্ট</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center transition-transform group-hover:translate-x-1 shadow-inner">
                 <ChevronRight className="w-4 h-4 text-[#FACC15]" />
              </div>
            </div>
          )}

          <div onClick={() => navigate('/support')} className="flex items-center justify-between p-4 rounded-[24px] cursor-pointer hover:bg-[#1C1C1C] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-inner">
                <HeadphonesIcon className="w-5 h-5" /> 
              </div>
              <span className="text-sm font-bold text-white">{t('help_support')}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#101010] border border-[#3D3215] flex items-center justify-center transition-transform group-hover:translate-x-1 shadow-inner">
               <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#FACC15]" />
            </div>
          </div>

        </motion.div>

        {/* Device ID Card */}
        <motion.div variants={itemVariants} className="bg-[#151515] rounded-[28px] p-6 border border-[#3D3215] text-left flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#737373] font-black uppercase tracking-widest block mb-1">{t('device_id')}</span>
            <span className="text-xs font-mono font-medium text-[#A3A3A3]">{profile?.deviceId || 'Not Linked'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
            <ShieldHalf className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      <motion.button 
        variants={itemVariants}
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-rose-900/80 to-rose-700/80 hover:from-rose-800 hover:to-rose-600 text-white font-bold py-4 rounded-[24px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-rose-600/30 shadow-xl"
      >
        <LogOut className="w-5 h-5" /> {t('log_out')}
      </motion.button>
    </motion.div>
  );
}
