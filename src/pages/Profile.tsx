import React, { useRef, useState } from 'react';
import { Check, ChevronRight, HeadphonesIcon, LineChart, ShieldHalf, LogOut, Moon, Camera, Loader2, Edit2, Copy, Link } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useTheme } from '../components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
      const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.");
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }
      
      const data = await res.json();
      const imageUrl = data.secure_url;

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

  return (
    <div className="pt-8 px-4 text-center pb-20">
      <div className="relative w-28 h-28 mx-auto mb-5 group">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-20 dark:opacity-40 -z-10 animate-pulse"></div>
        <input 
          type="file" 
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <img 
          src={avatarUrl} 
          alt="Avatar"
          className="rounded-full shadow-lg border-4 border-white dark:border-slate-800 w-full h-full object-cover cursor-pointer bg-white" 
          onClick={() => !uploading && fileInputRef.current?.click()}
        />
        
        {uploading ? (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div 
             className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer border-4 border-transparent"
             onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-white pointer-events-none">
          <Check className="w-4 h-4" />
        </div>
      </div>
      
      {isEditingName ? (
        <div className="flex items-center justify-center gap-2 mb-1">
          <input 
            type="text" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            disabled={savingName}
            className="border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 text-center shadow-sm disabled:opacity-70"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
          />
          <button 
            onClick={handleSaveName} 
            disabled={savingName} 
            className="text-white p-2 bg-[#0D47A1] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-md disabled:opacity-50 transition-all flex items-center justify-center w-8 h-8"
          >
            {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-1 group cursor-pointer" onClick={handleEditName}>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{profile?.fullName || t('loading')}</h2>
          <button className="text-slate-300 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{profile?.email || 'loading...'}</p>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 overflow-hidden text-left mb-6">
        
        {/* Referral Codes */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50">
             <div className="flex flex-col">
               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5"><Link className="w-3.5 h-3.5 text-indigo-500" /> My Referral Code</span>
               <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg tracking-tight">{profile?.myReferCode || '...'}</span>
             </div>
             {profile?.myReferCode && (
               <button onClick={() => copyToClipboard(profile.myReferCode, 'my')} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-all active:scale-95">
                 {copiedReferCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
               </button>
             )}
           </div>

           {profile?.usedReferCode && (
             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50">
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Used Referral Code</span>
                 <span className="font-mono font-medium text-slate-500 dark:text-slate-400 text-lg tracking-tight">{profile.usedReferCode}</span>
               </div>
               <button onClick={() => copyToClipboard(profile.usedReferCode, 'used')} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-all active:scale-95">
                 {copiedUsedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
               </button>
             </div>
           )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors" onClick={toggleTheme}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 text-slate-500 dark:text-slate-400">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold dark:text-slate-200">{t('dark_mode')}</span>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] shadow-sm transition-all duration-300 ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3 text-blue-500">
              <LineChart className="w-4 h-4" /> 
            </div>
            <span className="text-sm font-semibold dark:text-slate-200">{t('total_earned')}</span>
          </div>
          <span className="font-black tracking-tight text-indigo-600 dark:text-indigo-400 text-lg">
            ৳ {((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0)).toFixed(2)}
          </span>
        </div>
        <div onClick={() => navigate('/support')} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mr-3 text-indigo-500">
              <HeadphonesIcon className="w-4 h-4" /> 
            </div>
            <span className="text-sm font-semibold dark:text-slate-200">{t('help_support')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 font-bold py-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700/50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm"
      >
        <LogOut className="w-5 h-5" /> {t('log_out')}
      </button>
    </div>
  );
}
