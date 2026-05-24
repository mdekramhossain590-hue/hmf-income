import React, { useRef, useState } from 'react';
import { Check, ChevronRight, HeadphonesIcon, LineChart, ShieldHalf, LogOut, Moon, Camera, Loader2, Edit2, Copy, Link, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { uploadImageOrFallback } from '../lib/imageUpload';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useTheme } from '../components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export function Profile() {
  const { profile, loading, logOut, refreshProfile } = useAuth();
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

  const handleEditName = () => {
    setNewName(profile?.fullName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || !auth.currentUser) return;
    
    setSavingName(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { fullName: newName.trim() });
      await refreshProfile();
      setIsEditingName(false);
      toast.success("Name updated successfully!");
    } catch (e: any) {
      console.error("Update name error:", e);
      toast.error("Failed to update name.");
      try {
        handleFirestoreError(e, OperationType.UPDATE, "users");
      } catch (err) {}
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
    } catch (error) {
      console.error('Logout failed', error);
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
      console.error("Upload error:", e);
      toast.error(e.message || "Failed to upload profile picture.");
      if (e.message && !e.message.includes("Cloudinary") && !e.message.includes("upload image")) {
        try {
          handleFirestoreError(e, OperationType.UPDATE, "users");
        } catch (err) {}
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarUrl = profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&background=0D47A1&color=fff`;

  if (loading) {
    return (
      <div className="pt-8 px-4 flex flex-col items-center justify-center space-y-4 pb-20">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
        <div className="w-48 h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="w-64 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-8"></div>
        
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl h-64 border border-gray-100 dark:border-slate-700 animate-pulse"></div>
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
      className="pt-6 px-5 text-center pb-24 min-h-screen relative overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Premium Profile Header */}
      <motion.div variants={itemVariants} className="relative mb-8 pt-8 pb-8 bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white dark:border-slate-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-500/5 dark:to-blue-500/5 pointer-events-none"></div>
      
        <div className="relative w-28 h-28 mx-auto mb-5 group z-10">
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 p-[3px] shadow-xl group-hover:shadow-indigo-500/25 transition-all duration-500">
             <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 relative">
               <img 
                 src={avatarUrl} 
                 alt="Avatar"
                 className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                 onClick={() => !uploading && fileInputRef.current?.click()}
               />
               
               {uploading ? (
                 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-white animate-spin" />
                 </div>
               ) : (
                 <div 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                 >
                   <Camera className="w-8 h-8 text-white" />
                 </div>
               )}
             </div>
          </div>
          <div className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 rounded-full border-[3px] border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg pointer-events-none z-20">
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
                className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50 dark:text-white rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-[200px] text-center shadow-inner disabled:opacity-70 font-semibold backdrop-blur-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button 
                onClick={handleSaveName} 
                disabled={savingName} 
                className="text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center w-11 h-11 active:scale-95 shrink-0"
              >
                {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center mb-1 group cursor-pointer" onClick={handleEditName}>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-medium tracking-tight text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-sm">{profile?.fullName || t('loading')}</h2>
                <div className="w-6 h-6 rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                  <Edit2 className="w-3 h-3" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{profile?.email || 'loading...'}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Premium Bento Grid Config */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        
        {/* Code Box */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white dark:border-slate-700/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="flex items-center gap-4 mb-5 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner border border-indigo-100/50 dark:border-indigo-500/20">
               <Link className="w-6 h-6" />
             </div>
             <div className="text-left flex-1">
               <h3 className="font-display font-medium tracking-tight text-slate-800 dark:text-white text-base">{t('refer')}</h3>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('refer')}</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-3 relative z-10">
             <div className="flex justify-between items-center bg-white dark:bg-slate-900/80 p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 group/box hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors">
               <div className="flex flex-col text-left">
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mb-1">My Code</span>
                 <span className="font-display font-semibold text-indigo-600 dark:text-indigo-400 text-lg tracking-tight select-all">{profile?.myReferCode || '...'}</span>
               </div>
               {profile?.myReferCode && (
                 <button onClick={() => copyToClipboard(profile.myReferCode, 'my')} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-all active:scale-90 opacity-80 hover:opacity-100 group-hover/box:shadow-sm">
                   {copiedReferCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                 </button>
               )}
             </div>

             {profile?.usedReferCode && (
               <div className="flex justify-between items-center bg-white dark:bg-slate-900/80 p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800">
                 <div className="flex flex-col text-left">
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mb-1">Used Code</span>
                   <span className="font-display font-semibold text-slate-500 dark:text-slate-400 text-lg tracking-tight opacity-70">{profile.usedReferCode}</span>
                 </div>
                 <button onClick={() => copyToClipboard(profile.usedReferCode, 'used')} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-90 opacity-70 hover:opacity-100">
                   {copiedUsedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                 </button>
               </div>
             )}
          </div>
        </motion.div>

        {/* Global Settings List */}
        <motion.div variants={itemVariants} className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white dark:border-slate-700/50 flex flex-col gap-1 text-left">
          
          <div className="flex justify-between items-center p-4 rounded-[24px] cursor-pointer hover:bg-white dark:hover:bg-slate-800/80 transition-all hover:shadow-[0_2px_10px_rgb(0,0,0,0.02)]" onClick={toggleTheme}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('dark_mode')}</span>
            </div>
            <div className={`w-[52px] h-7 rounded-full relative transition-colors duration-300 ring-4 ring-transparent dark:ring-slate-800/50 shadow-inner ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-[4px] shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[26px]' : 'left-[4px]'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[24px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                <LineChart className="w-5 h-5" /> 
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('total_earned')}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
              <span className="font-black tracking-tighter text-slate-800 dark:text-white text-lg">
                ৳ {((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <div onClick={() => navigate('/support')} className="flex items-center justify-between p-4 rounded-[24px] cursor-pointer hover:bg-white dark:hover:bg-slate-800/80 transition-all hover:shadow-[0_2px_10px_rgb(0,0,0,0.02)] group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                <HeadphonesIcon className="w-5 h-5" /> 
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('help_support')}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-transform group-hover:translate-x-1 shadow-inner">
               <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

        </motion.div>

        {/* Device ID Card */}
        <motion.div variants={itemVariants} className="bg-slate-100/50 dark:bg-slate-900/30 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/50 dark:border-slate-800/50 text-left flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block mb-1">{t('device_id')}</span>
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">{profile?.deviceId || 'Not Linked'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
            <ShieldHalf className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      <motion.button 
        variants={itemVariants}
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 rounded-[24px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-rose-500/20"
      >
        <LogOut className="w-5 h-5" /> {t('log_out')}
      </motion.button>
    </motion.div>
  );
}
