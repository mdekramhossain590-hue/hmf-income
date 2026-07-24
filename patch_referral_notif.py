import re

with open('src/lib/referral.ts', 'r') as f:
    code = f.read()

# For processReferralCommission
target1 = """          await addDoc(collection(db, `users/${referrerId}/transactions`), {
            amount: commissionAmount,
            type: `referral`,
            status: `approved`,
            createdAt: serverTimestamp(),
            account: sourceUserEmail
          });"""

repl1 = target1 + """
          
          await addDoc(collection(db, `users/${referrerId}/notifications`), {
            title: 'New Referral Commission',
            message: `You earned ৳${commissionAmount} commission from ${sourceUserEmail}'s task.`,
            type: 'referral_commission',
            read: false,
            createdAt: serverTimestamp()
          });"""

# For processRegistrationReferral
target2 = """      if (fixedBonus > 0) {
        userUpdates["balances.referral"] = increment(fixedBonus);
      }
      
      await updateDoc(doc(db, "users", referrerId), userUpdates);"""

repl2 = target2 + """
      
      if (fixedBonus > 0) {
        await addDoc(collection(db, `users/${referrerId}/notifications`), {
          title: 'New Referral Bonus',
          message: `You earned ৳${fixedBonus} for referring ${userData.email || 'a new user'}.`,
          type: 'referral_bonus',
          read: false,
          createdAt: serverTimestamp()
        });
      }"""

if target1 in code and target2 in code:
    code = code.replace(target1, repl1)
    code = code.replace(target2, repl2)
    with open('src/lib/referral.ts', 'w') as f:
        f.write(code)
    print("Patched referral.ts successfully")
else:
    print("Could not find targets in referral.ts")

