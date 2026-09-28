import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, XCircle, History } from 'lucide-react';
import { Celebration } from '../components/Celebration';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, getDocs, getDoc, limit, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedDoc, getCachedQuery } from '../lib/cache';
import { useAuth } from '../components/AuthProvider';
import { processReferralCommission } from '../lib/referral';
import toast from 'react-hot-toast';

export function MathQuiz() {
  const { refreshProfile, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'quiz' | 'history'>('quiz');
  const [mathHistory, setMathHistory] = useState<any[]>([]);
  const [mathLeft, setMathLeft] = useState(0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mathReq, setMathReq] = useState({ taskReq: 0, referReq: 0 });

  const generateMath = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 20) + 1;
    let n2 = Math.floor(Math.random() * 20) + 1;
    
    // Ensure positive results for subtraction
    if (op === '-' && n1 < n2) {
      const temp = n1;
      n1 = n2;
      n2 = temp;
    }
    
    // Keep multiplication simple
    if (op === '*') {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer('');
  };

  useEffect(() => {
    generateMath();
    
    if (!auth.currentUser) return;
    
    const loadData = async () => {
      try {
        const q = query(
          collection(db, `users/${auth.currentUser!.uid}/mathHistory`),
          orderBy("completedAt", "desc"),
          limit(20)
        );
        const snapshot = await getCachedQuery(q, `math_history_${auth.currentUser!.uid}`);
        setMathHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const docSnapshot = await getCachedDoc(doc(db, "settings", "games"));
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setMathReq({
            taskReq: data.mathTaskReq || 0,
            referReq: data.mathReferReq || 0
          });
        } } catch (error: any) {
        handleFirestoreError(error, OperationType.GET, `MathQuiz`);
      }
    };
    
    loadData();
  }, []);

  
    const getUnlocks = () => {
    if (!profile) return 0;
    const taskCount = profile.totalTasksCompleted || 0;
    const referCount = profile.totalReferrals || 0;
    
    if (mathReq.taskReq === 0 && mathReq.referReq === 0) return Infinity;
    
    let unlocks = Infinity;
    if (mathReq.taskReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(taskCount / mathReq.taskReq));
    }
    if (mathReq.referReq > 0) {
      unlocks = Math.min(unlocks, Math.floor(referCount / mathReq.referReq));
    }
    return unlocks;
  };

  useEffect(() => {
    if (profile) {
      if (mathReq.taskReq === 0 && mathReq.referReq === 0) {
        setMathLeft(999999);
      } else {
        const totalAllowed = getUnlocks() * 5;
        const totalPlayed = profile.totalMathsPlayed || 0;
        setMathLeft(Math.max(0, totalAllowed - totalPlayed));
      }
    }
  }, [profile, mathReq]);

  const hasMetRequirements = () => {
    if (!profile) return false;
    const taskCount = profile.totalTasksCompleted || 0;
    const referCount = profile.totalReferrals || 0;
    return taskCount >= mathReq.taskReq && referCount >= mathReq.referReq;
  };

  const calculateCorrectAnswer = () => {
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '*': return num1 * num2;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!hasMetRequirements()) {
      toast.error(`You need at least ${mathReq.taskReq} tasks completed and ${mathReq.referReq} referrals to do math quiz.`);
      return;
    }
    if (mathLeft <= 0) {
      toast.error("No math quizzes left for today!");
      return;
    }
    if (!auth.currentUser) return;
    
    if (answer.trim() === '') return;

    const correctAnswer = calculateCorrectAnswer();
    const userAnswer = parseInt(answer);

    if (userAnswer !== correctAnswer) {
      toast.error("Wrong answer!");
      
      // Still deduct one attempt for wrong answer
      const todayStr = new Date().toISOString().split('T')[0];
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        totalMathsPlayed: increment(1)
      });
      setMathLeft(prev => prev - 1);
      
      const mathHistoryRef = collection(db, `users/${auth.currentUser.uid}/mathHistory`);
      await addDoc(mathHistoryRef, {
        question: `${num1} ${operator} ${num2} = ?`,
        userAnswer: answer,
        correctAnswer: correctAnswer.toString(),
        reward: 0,
        completedAt: serverTimestamp()
      });
      
      generateMath();
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reward = Math.floor(Math.random() * 3) + 1; // 1 to 3 Taka reward
      const userRef = doc(db, "users", auth.currentUser.uid);
      const mathHistoryRef = collection(db, `users/${auth.currentUser.uid}/mathHistory`);
      const transactionRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
      const notificationRef = collection(db, `users/${auth.currentUser.uid}/notifications`);
      const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);

      // 1. Update balance
      const todayStr = new Date().toISOString().split('T')[0];
          await updateDoc(userRef, {
            "balances.bonus": increment(reward),
            totalMathsPlayed: increment(1)
          });
          setMathLeft(prev => prev - 1);
      
      await setDoc(leaderboardRef, {
        fullName: auth.currentUser.email?.split('@')[0] || 'User',
        bonus: increment(reward),
        totalIncome: increment(reward),
        referrals: increment(0),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Add to Math History
      await addDoc(mathHistoryRef, {
        question: `${num1} ${operator} ${num2} = ?`,
        userAnswer: answer,
        correctAnswer: correctAnswer.toString(),
        reward: reward,
        completedAt: serverTimestamp()
      });
      
      // 3. Add to Transaction History
      await addDoc(transactionRef, {
        amount: reward,
        type: 'task',
        status: 'approved (math)',
        createdAt: serverTimestamp()
      });
      
      // 4. Add Notification
      await addDoc(notificationRef, {
        title: 'Math Quiz Solved!',
        message: `You earned ৳${reward} for solving the math correctly!`,
        type: 'info',
        read: false,
        createdAt: serverTimestamp()
      });

      await processReferralCommission(auth.currentUser.uid, reward, 'Math Quiz');
      
      await refreshProfile();
      setMathLeft(prev => prev - 1);
      setShowCelebration(true);
      toast.success(`Correct! You won ৳${reward} bonus.`);
      if (mathLeft - 1 > 0) {
        generateMath();
      }
    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser.uid}/mathHistory`);
      toast.error("Failed to submit. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20 text-center relative max-w-md mx-auto bg-[#090909] min-h-screen text-white">
      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent tracking-tight">Math Quiz</h2>
      <p className="text-sm text-[#A3A3A3] mb-6 font-medium">Solve math to earn daily bonus!</p>
      
      {!hasMetRequirements() && (
        <div className="mx-auto w-11/12 bg-red-950/40 text-red-400 p-3 rounded-xl text-sm text-center font-bold mb-6 ring-1 ring-red-900/50 border border-red-800/30">
          You need at least {mathReq.taskReq} tasks completed and {mathReq.referReq} referrals to unlock math quizzes.
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#151515] p-1.5 rounded-2xl mb-8 shadow-inner border border-[#3D3215]">
        <button 
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'quiz' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md font-black' : 'text-[#A3A3A3] hover:text-[#FACC15]'}`}
        >
          <Calculator className="w-4 h-4" /> Quiz
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md font-black' : 'text-[#A3A3A3] hover:text-[#FACC15]'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {activeTab === 'quiz' && (
        <>
          <div className="bg-[#151515] rounded-3xl p-8 shadow-sm border border-[#3D3215] max-w-sm mx-auto mb-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-20 h-20 mx-auto bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-[#151515] relative z-10">
              <Calculator className="w-10 h-10" />
            </div>
            
            {mathLeft > 0 ? (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="text-4xl font-black text-white mb-6 tracking-tight drop-shadow-sm">
                  {num1} <span className="text-[#FACC15]">{operator}</span> {num2} <span className="text-[#737373]">=</span> ?
                </div>
                
                <input 
                  type="number" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full text-center text-2xl font-bold p-4 bg-[#101010] border border-[#3D3215] rounded-2xl mb-6 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all text-white shadow-inner"
                  placeholder="Your answer"
                  required
                  autoFocus
                />
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] hover:opacity-95 text-[#090909] font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-[#D4A017]/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'SUBMIT ANSWER'}
                </button>
              </form>
            ) : (
              <div className="py-10 text-xl font-bold text-[#A3A3A3] relative z-10">
                Come back tomorrow for more!
              </div>
            )}
          </div>
          
          <p className="mt-6 text-sm font-semibold text-[#A3A3A3]">
            Available Math Quizzes: <span className="text-[#FACC15] bg-[#1C1C1C] border border-[#3D3215] px-2 py-0.5 rounded ml-1 font-bold">{mathLeft}</span> 
          </p>
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3 text-left pb-10">
          {mathHistory.length === 0 ? (
            <div className="text-center py-10 text-[#737373] bg-[#151515] rounded-3xl border border-[#3D3215]">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#A3A3A3]" />
              <p className="text-sm font-medium">No math history yet.</p>
            </div>
          ) : (
            mathHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-[#151515] p-4 rounded-2xl shadow-sm border border-[#3D3215] flex justify-between items-center transition-all hover:border-[#D4A017]/50">
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg tracking-tight">{historyItem.question}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#A3A3A3] font-medium">Your Answer: {historyItem.userAnswer}</span>
                    <span className="text-xs text-emerald-400 font-bold">({historyItem.correctAnswer})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[#FACC15] font-black">+৳{historyItem.reward}</div>
                  <div className="text-[10px] text-[#737373] font-medium uppercase tracking-wider mt-0.5">
                    {historyItem.completedAt ? new Date(historyItem.completedAt.toDate()).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
