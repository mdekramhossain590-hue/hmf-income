import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerConfetti } from '../lib/confetti';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { useAuth } from '../components/AuthProvider';
import { processReferralCommission } from '../lib/referral';
import toast from 'react-hot-toast';

let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const tickSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const winSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

const loseSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

const Confetti = () => {
  return (
    <div className="absolute top-1/2 left-1/2 w-0 h-0 z-50 pointer-events-none">
      {[...Array(30)].map((_, i) => {
        const colors = ['bg-red-500', 'bg-[#ff8a00]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
        const isCircle = i % 2 === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 1.5 + 0.5, 
              x: (Math.random() - 0.5) * 350, 
              y: (Math.random() - 0.5) * 350,
              rotate: Math.random() * 720
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`absolute w-3 h-3 ${colors[i % colors.length]}`}
            style={{ borderRadius: isCircle ? '50%' : '0%' }}
          />
        );
      })}
    </div>
  );
};

export function Spin() {
  const { refreshProfile, profile, siteSettings } = useAuth();
  const [spinsLeft, setSpinsLeft] = useState(5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [rewards, setRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [spinReq, setSpinReq] = useState({ taskReq: 0, referReq: 0 });
  const [winningIndex, setWinningIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spinDoc, gameDoc] = await Promise.all([
          getCachedDoc(doc(db, "settings", "spin")),
          getCachedDoc(doc(db, "settings", "games"))
        ]);
        
        if (spinDoc.exists() && spinDoc.data().rewards) {
          setRewards(spinDoc.data().rewards);
        }
        
        if (gameDoc.exists()) {
          const data = gameDoc.data();
          setSpinReq({
            taskReq: data.spinTaskReq || 0,
            referReq: data.spinReferReq || 0
          });
        }
      } catch (e) {
        console.error("Error fetching spin settings:", e);
      }
    };
    
    fetchData();
  }, []);

  const hasMetRequirements = () => {
    if (!profile) return false;
    const taskCount = profile.totalTasksCompleted || 0;
    const referCount = profile.totalReferrals || 0;
    return taskCount >= spinReq.taskReq && referCount >= spinReq.referReq;
  };

  const totalSlices = rewards.length;
  const sliceDegree = 360 / totalSlices;

  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16'];
  const gradientStops = rewards.map((_, i) => `${colors[i % colors.length]} ${i * sliceDegree}deg ${(i + 1) * sliceDegree}deg`).join(', ');

  const spinWheel = async () => {
    if (!hasMetRequirements()) {
      toast.error(`You need at least ${spinReq.taskReq} tasks completed and ${spinReq.referReq} referrals to spin.`);
      return;
    }
    if (spinsLeft <= 0) {
      toast.error("No spins left for today!");
      return;
    }
    if (!auth.currentUser) return;

    setIsSpinning(true);
    setWinningIndex(null);
    
    // Choose a random target slice
    const targetIndex = Math.floor(Math.random() * totalSlices);
    const reward = rewards[targetIndex];
    
    // Calculate required rotation
    const targetAngle = targetIndex * sliceDegree + sliceDegree / 2;
    const targetRotation = (360 - targetAngle) % 360; 
    
    let distance = targetRotation - (rotation % 360);
    if (distance <= 0) distance += 360;
    
    const newRotation = rotation + distance + (360 * 5); // 5 full spins + distance
    setRotation(newRotation);
    
    // Play subtle tick sounds while spinning
    getAudioCtx(); // ensure context is resumed
    const tickInterval = setInterval(tickSound, 150);
    
    setTimeout(async () => {
      clearInterval(tickInterval);
      setWinningIndex(targetIndex);
      
      try {
        if (reward > 0) {
          winSound();
          const userRef = doc(db, "users", auth.currentUser!.uid);
          const transactionRef = collection(db, `users/${auth.currentUser!.uid}/transactions`);
          const notificationRef = collection(db, `users/${auth.currentUser!.uid}/notifications`);

          const leaderboardRef = doc(db, 'leaderboard', auth.currentUser!.uid);

          await updateDoc(userRef, {
            "balances.bonus": increment(reward)
          });
          
          await setDoc(leaderboardRef, {
            fullName: profile?.fullName || auth.currentUser?.email?.split('@')[0] || 'User',
            bonus: increment(reward),
            totalIncome: increment(reward),
            referrals: increment(0),
            updatedAt: serverTimestamp()
          }, { merge: true });
          
          await addDoc(transactionRef, {
            amount: reward,
            type: 'task',
            status: 'approved (spin)',
            createdAt: serverTimestamp()
          });
          
          await addDoc(notificationRef, {
            title: 'Lucky Spin Won!',
            message: `You earned ৳${reward} from the lucky spin!`,
            type: 'info',
            read: false,
            createdAt: serverTimestamp()
          });

          await processReferralCommission(auth.currentUser!.uid, reward, 'Spin');

          triggerConfetti();
          toast.success(`Congratulations! You won ৳${reward} bonus.`);
        } else {
          loseSound();
          toast.error("Oops! Better luck next time.");
        }
        
        await refreshProfile();
        setSpinsLeft(prev => prev - 1);
        
        setTimeout(() => setWinningIndex(null), 3000);
      } catch (e: any) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
        toast.error("Failed to update bonus. Check connection.");
      } finally {
        setIsSpinning(false);
      }
    }, 4000); // 4 sec wait for animation
  };

  return (
    <div className="pt-6 px-4 pb-20 text-center relative max-w-md mx-auto overflow-hidden">
      <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">Lucky Spin</h2>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Spin the wheel to earn daily bonus!</p>
      
      {!hasMetRequirements() && (
        <div className="mx-auto w-11/12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl ring-1 ring-red-100 dark:ring-red-900/50 text-sm text-center font-bold mb-4">
          You need at least {spinReq.taskReq} tasks completed and {spinReq.referReq} referrals to unlock spinning.
        </div>
      )}

      <div className="relative w-80 h-80 mx-auto mb-10 mt-6">
        {winningIndex !== null && rewards[winningIndex] > 0 && <Confetti />}
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-20 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
          <motion.div animate={isSpinning ? { rotate: [-10, 15, -10] } : { rotate: 0 }} transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }} className="origin-top" >
             <svg width="36" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 22L4 6C4 6 7 2 12 2C17 2 20 6 20 6L12 22Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinejoin="round"/>
               <circle cx="12" cy="7" r="2.5" fill="#B45309" />
             </svg>
          </motion.div>
        </div>
        
        {/* Wheel */}
        <div className="w-full h-full p-2 bg-gradient-to-br from-indigo-200 to-indigo-100 dark:from-indigo-900/50 dark:to-slate-800 rounded-full shadow-2xl relative ring-1 ring-indigo-500/20">
           {winningIndex !== null && rewards[winningIndex] > 0 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1.15 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5, repeat: 3, repeatType: 'reverse' }}
               className="absolute inset-0 bg-indigo-500 blur-xl rounded-full -z-10 opacity-30"
             />
           )}
          <motion.div 
            className={`w-full h-full rounded-full border-4 flex items-center justify-center ${winningIndex !== null && rewards[winningIndex] > 0 ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-white dark:border-slate-800'} shadow-inner relative overflow-hidden transition-all duration-300`}
            style={{ background: `conic-gradient(${gradientStops})` }}
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
          >
            {/* Draw text on slices */}
            {rewards.map((reward, i) => {
              const textAngle = i * sliceDegree + sliceDegree / 2;
              const isWinner = winningIndex === i;
              return (
                <div 
                  key={i} 
                  className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-[10%] font-black tracking-tight text-white drop-shadow-md text-xl pointer-events-none"
                  style={{ transform: `rotate(${textAngle}deg)` }}
                >
                  <motion.span 
                    animate={isWinner ? { scale: [1, 1.5, 1.2], textShadow: "0px 0px 12px rgb(255,255,255,0.8)" } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex gap-1 justify-center origin-center relative"
                  >
                    {reward > 0 ? `৳${reward}` : '0'}
                  </motion.span>
                </div>
              );
            })}
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-2xl border-[6px] border-amber-400 dark:border-amber-500 z-10 flex items-center justify-center ring-4 ring-amber-500/20 overflow-hidden">
              {siteSettings?.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="font-black text-[11px] tracking-widest text-amber-500 dark:text-amber-400 drop-shadow-sm">SPIN</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      <button 
        onClick={spinWheel}
        disabled={isSpinning || spinsLeft <= 0}
        className="w-full max-w-[200px] mx-auto bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black tracking-widest text-lg px-8 py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group"
      >
        <span className="relative z-10">{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shimmer z-0" />
      </button>
      <p className="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Available Spins: <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded ml-1">{spinsLeft}</span> <span className="opacity-50">/ 5</span>
      </p>
    </div>
  );
}
