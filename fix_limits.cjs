const fs = require('fs');

function fixMath(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix useEffect profile dependency
  code = code.replace(/const userLimit = profile\.totalReferrals \|\| 0;/g, 'const userLimit = 5;');
  
  // Fix math history for wrong answer
  const wrongAnswerLogic = `    if (userAnswer !== correctAnswer) {
      toast.error("Wrong answer! Try again.");
      
      // Optionally save wrong answer to history too? Let's just create history for correct, or both?
      // For now, let's just reject.
      return;
    }`;

  const fixedWrongAnswerLogic = `    if (userAnswer !== correctAnswer) {
      toast.error("Wrong answer!");
      
      // Still deduct one attempt for wrong answer
      const todayStr = new Date().toISOString().split('T')[0];
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        dailyMaths: profile?.lastMathDate === todayStr ? increment(1) : 1,
        lastMathDate: todayStr
      });
      setMathLeft(prev => prev - 1);
      
      const mathHistoryRef = collection(db, \`users/\${auth.currentUser.uid}/mathHistory\`);
      await addDoc(mathHistoryRef, {
        question: \`\${num1} \${operator} \${num2} = ?\`,
        userAnswer: answer,
        correctAnswer: correctAnswer.toString(),
        reward: 0,
        completedAt: serverTimestamp()
      });
      
      generateMath();
      return;
    }`;
    
  code = code.replace(wrongAnswerLogic, fixedWrongAnswerLogic);

  // Fix HTML for mathLeft / 5
  code = code.replace(/\/ \{profile\?\.totalReferrals \|\| 0\}<\/span>/g, '/ 5</span>');

  fs.writeFileSync(file, code);
}

function fixSpin(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix useEffect profile dependency
  code = code.replace(/const userLimit = profile\.totalReferrals \|\| 0;/g, 'const userLimit = 5;');

  // Fix HTML for spinsLeft / 5
  code = code.replace(/\/ \{profile\?\.totalReferrals \|\| 0\}<\/span>/g, '/ 5</span>');

  // Fix reward > 0 logic
  const oldSpinUpdate = `        if (reward > 0) {
          winSound();
          const userRef = doc(db, "users", auth.currentUser!.uid);
          const transactionRef = collection(db, \`users/\${auth.currentUser!.uid}/transactions\`);
          const notificationRef = collection(db, \`users/\${auth.currentUser!.uid}/notifications\`);
          const leaderboardRef = doc(db, 'leaderboard', auth.currentUser!.uid);
          const todayStr = new Date().toISOString().split('T')[0];
          await updateDoc(userRef, {
            "balances.bonus": increment(reward),
            dailySpins: profile?.lastSpinDate === todayStr ? increment(1) : 1,
            lastSpinDate: todayStr
          });
          setSpinsLeft(prev => prev - 1);
          
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
            message: \`You earned ৳\${reward} from the lucky spin!\`,
            type: 'info',
            read: false,
            createdAt: serverTimestamp()
          });

          await processReferralCommission(auth.currentUser!.uid, reward, 'Spin');
          setShowCelebration(true);
          toast.success(\`Congratulations! You won ৳\${reward} bonus.\`);
        } else {
          loseSound();
          toast.error("Oops! Better luck next time.");
        }`;

  const newSpinUpdate = `        const userRef = doc(db, "users", auth.currentUser!.uid);
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Deduct attempt regardless of win/lose
        await updateDoc(userRef, {
           dailySpins: profile?.lastSpinDate === todayStr ? increment(1) : 1,
           lastSpinDate: todayStr
        });
        setSpinsLeft(prev => prev - 1);
          
        if (reward > 0) {
          winSound();
          const transactionRef = collection(db, \`users/\${auth.currentUser!.uid}/transactions\`);
          const notificationRef = collection(db, \`users/\${auth.currentUser!.uid}/notifications\`);
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
            message: \`You earned ৳\${reward} from the lucky spin!\`,
            type: 'info',
            read: false,
            createdAt: serverTimestamp()
          });

          await processReferralCommission(auth.currentUser!.uid, reward, 'Spin');
          setShowCelebration(true);
          toast.success(\`Congratulations! You won ৳\${reward} bonus.\`);
        } else {
          loseSound();
          toast.error("Oops! Better luck next time.");
        }`;

  code = code.replace(oldSpinUpdate, newSpinUpdate);

  // In Spin.tsx, we must also update the increment for updateDoc if it was left from before
  // Wait, I am replacing the exact string, so I don't need to do more.

  fs.writeFileSync(file, code);
}

fixMath('src/pages/MathQuiz.tsx');
fixSpin('src/pages/Spin.tsx');
