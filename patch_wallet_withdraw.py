import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

target = """    if (selectedWallet === 'partner' && !partnerSettings.withdrawEnabled) {
      toast.error('Partner withdrawals are currently disabled.');
      return;
    }"""

replacement = """    if (selectedWallet === 'partner') {
      try {
        const liveSnap = await getDoc(doc(db, "settings", "partner"));
        if (liveSnap.exists() && liveSnap.data().withdrawEnabled === false) {
          toast.error('Partner withdrawals are currently disabled.');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch live partner settings, falling back to local state");
        if (!partnerSettings.withdrawEnabled) {
           toast.error('Partner withdrawals are currently disabled.');
           setIsSubmitting(false);
           return;
        }
      }
    }"""

code = code.replace(target, replacement)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

