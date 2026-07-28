const fs = require('fs');

let code = fs.readFileSync('src/pages/Recharge.tsx', 'utf8');

const regex = /const updateData: any = {};/;

const newCode = `      // DOUBLE CHECK BALANCE
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        let actualCurrentBal = 0;
        if (selectedWallet === 'main') actualCurrentBal = userData.balances?.main || 0;
        else if (selectedWallet === 'bonus') actualCurrentBal = userData.balances?.bonus || 0;
        else if (selectedWallet === 'referral') actualCurrentBal = userData.balances?.referral || 0;
        else actualCurrentBal = userData.balances?.tasks?.[selectedWallet] || 0;

        if (rechargeAmount > actualCurrentBal) {
          toast.error('Insufficient balance');
          setLoading(false);
          return;
        }
      }

      const updateData: any = {};`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/pages/Recharge.tsx', code);
