import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

target = """  const executeWithdraw = async () => {
    if (!auth.currentUser) return;
    
    const amount = parseFloat(withdrawAmount);
    
    try {"""

replacement = """  const executeWithdraw = async () => {
    if (!auth.currentUser) return;
    
    const amount = parseFloat(withdrawAmount);
    
    try {
      if (selectedWallet === 'partner') {
        const liveSnap = await getDoc(doc(db, "settings", "partner"));
        if (liveSnap.exists() && liveSnap.data().withdrawEnabled === false) {
          toast.error('Partner withdrawals are currently disabled.');
          setShowConfirmWithdraw(false);
          return;
        }
      }
"""

if target in code:
    code = code.replace(target, replacement)
else:
    print("TARGET NOT FOUND!")

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)
