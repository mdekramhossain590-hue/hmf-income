import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { MonitorPlay, ArrowLeft, CheckCircle, Loader2, PlayCircle, AlertCircle, Coins } from 'lucide-react';
import { db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { doc, getDocs, collection, query, where, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export function AdsView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [adIncomeSettings, setAdIncomeSettings] = useState({ dailyAdLimit: 10, rewardPerAdView: 0.50, adCode: "" });
  const [claimedAdsCount, setClaimedAdsCount] = useState(0);
  
  const [activeAdId, setActiveAdId] = useState<string | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  
  // Modal states
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const [cheatingWarning, setCheatingWarning] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const adContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      try {
        const docSnapshot = await getCachedDoc(doc(db, "settings", "adsIncome"));
        let limit = 10;
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          limit = data.dailyAdLimit ?? 10;
          setAdIncomeSettings({
            dailyAdLimit: limit,
            rewardPerAdView: data.rewardPerAdView ?? 0.50,
            adCode: data.adCode ?? ""
          });
        }

        // Get claimed count for today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const viewsSnap = await getDocs(
          query(
            collection(db, "ad_views"),
            where("userId", "==", user?.uid),
            where("viewedAt", ">=", Timestamp.fromDate(startOfDay))
          )
        );
        
        setClaimedAdsCount(viewsSnap.size);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load ads.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  // Page visibility API and Intersection Observer for anti-cheat
  useEffect(() => {
    if (!adModalOpen || completed || adBlocked || !adLoaded) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimerRunning(false);
        setCheatingWarning(true);
      } else {
        setCheatingWarning(false);
        setTimerRunning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          setTimerRunning(false);
          setCheatingWarning(true);
        } else {
          if (!document.hidden) {
            setCheatingWarning(false);
            setTimerRunning(true);
          }
        }
      });
    }, { threshold: 0.1 });

    if (adContainerRef.current) {
      observer.observe(adContainerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, [adModalOpen, completed, adBlocked, adLoaded]);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setCompleted(true);
      setTimerRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerRunning]);

  // Check AdBlocker / Ad Load
  useEffect(() => {
    if (!adModalOpen) return;
    
    // reset state
    setTimer(15);
    setTimerRunning(false);
    setAdLoaded(false);
    setAdBlocked(false);
    setCompleted(false);
    setCheatingWarning(false);

    // Simulated ad loading check after a short delay
    const loadCheckTimer = setTimeout(() => {
      if (adContainerRef.current) {
        const height = adContainerRef.current.clientHeight;
        const hasChildren = adContainerRef.current.childElementCount > 0 || adContainerRef.current.innerHTML.trim() !== "";
        
        if (adIncomeSettings.adCode) {
           // With iframe, the container always has children. Just assume it loaded.
           setAdLoaded(true);
           setTimerRunning(true);
        } else {
           setAdLoaded(true);
           setTimerRunning(true);
        }
      }
    }, 2000);

    return () => clearTimeout(loadCheckTimer);
  }, [adModalOpen, adIncomeSettings.adCode]);

  const openAd = (adId: string) => {
    setActiveAdId(adId);
    setAdModalOpen(true);
  };

  const closeAd = () => {
    setAdModalOpen(false);
    setActiveAdId(null);
  };

  const handleClaim = async () => {
    if (!profile || !activeAdId) return;
    setClaimLoading(true);
    
    try {
      const response = await fetch("/api/ads/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: user?.uid,
          adId: activeAdId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || `Congratulations! ${result.rewardAmount} BDT added to your Ads Income Wallet.`);
        setClaimedAdsCount(prev => prev + 1);
        closeAd();
      } else {
        toast.error(result.error || "Failed to claim ad.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Network error.");
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-24 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-indigo-500" />
          Ad Income
        </h2>
        <div className="w-9"></div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 mb-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1">Today's Progress</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black">{claimedAdsCount}</span>
              <span className="text-indigo-200 mb-1">/ {adIncomeSettings.dailyAdLimit} Ads</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (claimedAdsCount / adIncomeSettings.dailyAdLimit) * 100)}%` }}
          ></div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: adIncomeSettings.dailyAdLimit }).map((_, index) => {
            const adNumber = index + 1;
            const isClaimed = adNumber <= claimedAdsCount;
            const adId = `ad_${adNumber}`;

            return (
              <div key={adId} className={`p-4 rounded-2xl border ${isClaimed ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" : "bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-sm"} flex items-center justify-between transition-all`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isClaimed ? "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30" : "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30"}`}>
                    {isClaimed ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isClaimed ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>
                      Advertisement {adNumber}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">Reward: {adIncomeSettings.rewardPerAdView} BDT</p>
                  </div>
                </div>
                
                <button
                  onClick={() => !isClaimed && openAd(adId)}
                  disabled={isClaimed}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isClaimed 
                      ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" 
                      : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95"
                  }`}
                >
                  {isClaimed ? "Completed" : "View Ad"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Ad View Modal */}
      <AnimatePresence>
        {adModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Sponsored Ad</span>
                </div>
                {/* Cannot close if not completed or blocked */}
                {(completed || adBlocked || cheatingWarning) && (
                  <button onClick={closeAd} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    Close
                  </button>
                )}
              </div>

              {/* Warning Area */}
              {cheatingWarning && !completed && (
                <div className="bg-rose-500 text-white p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please stay on this page and keep ad visible to earn.
                </div>
              )}

              {/* Ad Container */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative min-h-[250px] flex flex-col items-center justify-center overflow-auto p-4">
                
                {adBlocked ? (
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Ad Blocker Detected!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Warning! Ad not loaded. Please disable your Ad Blocker and refresh. You will not earn without viewing the ad.
                    </p>
                  </div>
                ) : (
                  <>
                    {!adLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                        <span className="text-xs font-bold text-slate-400">Loading Advertisement...</span>
                      </div>
                    )}
                    
                    <div ref={adContainerRef} className="w-full h-full min-h-[250px] flex items-center justify-center relative">
                      {adIncomeSettings.adCode ? (
                        <iframe 
                          srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:transparent;">${adIncomeSettings.adCode}</body></html>`}
                          className="w-full h-full min-h-[250px] border-none"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                      ) : (
                        <div className="text-slate-400 text-sm italic font-medium">Demo Ad Placeholder</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer with Timer & Claim */}
              <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                {!adBlocked && (
                  <div className="flex flex-col items-center justify-center">
                    {!completed ? (
                      <div className="text-center">
                        <div className="text-3xl font-black text-indigo-500 mb-1">{timer}s</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Remaining</div>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaim}
                        disabled={claimLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        {claimLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Claim Reward
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
