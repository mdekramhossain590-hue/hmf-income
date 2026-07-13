import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, XCircle, History } from 'lucide-react';
import { triggerConfetti } from '../lib/confetti';
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
  const [mathLeft, setMathLeft] = useState(5);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `MathQuiz`);
      }
    };
    
    loadData();
  }, []);

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
      toast.error("Wrong answer! Try again.");
      
      // Optionally save wrong answer to history too? Let's just create history for correct, or both?
      // For now, let's just reject.
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
      await updateDoc(userRef, {
        "balances.bonus": increment(reward)
      });
      
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
      triggerConfetti();
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
    <div className="pt-6 px-4 pb-20 text-center relative max-w-md mx-auto">
      
      <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">Math Quiz</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Solve math to earn daily bonus!</p>
      
      {!hasMetRequirements() && (
        <div className="mx-auto w-11/12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center font-bold mb-6 ring-1 ring-red-100 dark:ring-red-900/50">
          You need at least {mathReq.taskReq} tasks completed and {mathReq.referReq} referrals to unlock math quizzes.
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-8 shadow-inner border border-slate-200 dark:border-slate-700/50">
        <button 
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'quiz' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Calculator className="w-4 h-4" /> Quiz
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {activeTab === 'quiz' && (
        <>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 max-w-sm mx-auto mb-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-800 relative z-10">
              <Calculator className="w-10 h-10" />
            </div>
            
            {mathLeft > 0 ? (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="text-4xl font-black text-slate-800 dark:text-white mb-6 tracking-tight drop-shadow-sm">
                  {num1} <span className="text-indigo-500">{operator}</span> {num2} <span className="text-slate-400">=</span> ?
                </div>
                
                <input 
                  type="number" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full text-center text-2xl font-bold p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl mb-6 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white shadow-inner"
                  placeholder="Your answer"
                  required
                  autoFocus
                />
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Sumitting...' : 'SUBMIT ANSWER'}
                </button>
              </form>
            ) : (
              <div className="py-10 text-xl font-bold text-slate-500 dark:text-slate-400 relative z-10">
                Come back tomorrow for more!
              </div>
            )}
          </div>
          
          <p className="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Available Math Quizzes: <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded ml-1">{mathLeft}</span> <span className="opacity-50">/ 5</span>
          </p>
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3 text-left pb-10">
          {mathHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-700/50">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No math history yet.</p>
            </div>
          ) : (
            mathHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-slate-700/80">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">{historyItem.question}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">Your Answer: {historyItem.userAnswer}</span>
                    <span className="text-xs text-emerald-500 font-bold">({historyItem.correctAnswer})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-emerald-500 font-black">+৳{historyItem.reward}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
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
