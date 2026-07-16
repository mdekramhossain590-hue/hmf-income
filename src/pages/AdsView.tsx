import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { MonitorPlay, ArrowLeft, ExternalLink, Save, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from '@/src/lib/mock-firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import toast from 'react-hot-toast';

export function AdsView() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [adData, setAdData] = useState({
    description: 'Watch ads daily to earn extra money. Click the button below to view today\'s ad!',
    link: 'https://example.com'
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ description: '', link: '' });

  useEffect(() => {
    const loadAds = async () => {
      try {
        const docSnapshot = await getCachedDoc(doc(db, "settings", "adsView"));
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as {description: string, link: string};
          setAdData({ description: data.description || '', link: data.link || '' });
          setEditData({ description: data.description || '', link: data.link || '' });
        } else {
          setEditData({ description: adData.description, link: adData.link });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/adsView');
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  const handleSave = async () => {
    if (!editData.description || !editData.link) {
      toast.error('Both fields are required');
      return;
    }
    
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "adsView"), {
        description: editData.description,
        link: editData.link
      }, { merge: true });
      toast.success('Ad saved successfully!');
      setEditMode(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/adsView');
      toast.error('Error saving ad data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-rose-500" />
          Ads View
        </h2>
        <div className="w-9"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mb-6 shadow-inner ring-4 ring-rose-50 dark:ring-slate-800">
              <MonitorPlay className="w-10 h-10 animate-pulse" />
            </div>
            
            {editMode ? (
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Description</label>
                  <textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all min-h-[100px]"
                    placeholder="Enter description..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Link</label>
                  <input 
                    type="url"
                    value={editData.link}
                    onChange={(e) => setEditData({...editData, link: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-rose-600 transition disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 text-center tracking-tight">Daily Advertisements</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-6 w-full text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {adData.description}
                  </p>
                </div>
                
                <a 
                  href={adData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <ExternalLink className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Watch Ad Now</span>
                </a>

                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="mt-6 text-sm font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition"
                  >
                    Edit Ad Info (Admin Mode)
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
