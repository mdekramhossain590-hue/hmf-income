const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');

  const oldBlock = `  const executeWithdraw = async () => {
    if (!auth.currentUser) return;
    
    const amount = parseFloat(withdrawAmount);
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const updateData: any = {};`;

  const newBlock = `  const executeWithdraw = async () => {
    if (!auth.currentUser) return;
    
    const amount = parseFloat(withdrawAmount);
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // DOUBLE CHECK BALANCE TO PREVENT NEGATIVE BALANCE
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        let actualCurrentBal = 0;
        if (selectedWallet === 'main') actualCurrentBal = userData.balances?.main || 0;
        else if (selectedWallet === 'bonus') actualCurrentBal = userData.balances?.bonus || 0;
        else if (selectedWallet === 'referral') actualCurrentBal = userData.balances?.referral || 0;
        else if (selectedWallet === 'partner') actualCurrentBal = userData.balances?.partner || 0;
        else if (selectedWallet === 'gift') actualCurrentBal = userData.balances?.gift || 0;
        else actualCurrentBal = userData.balances?.tasks?.[selectedWallet] || 0;

        if (amount > actualCurrentBal) {
          toast.error("Insufficient balance.");
          setShowConfirmWithdraw(false);
          return;
        }
      }

      const batch = writeBatch(db);
      const updateData: any = {};`;

  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync(file, code);
}

fix('src/pages/Wallet.tsx');
