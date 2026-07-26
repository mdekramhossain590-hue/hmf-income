const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const functionCode = `
  const handleCreateGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftCode || newGiftCode.length < 5) {
      toast.error('Code must be at least 5 characters');
      return;
    }
    
    try {
      const upperCode = newGiftCode.trim().toUpperCase();
      const codeRef = doc(db, 'giftCodes', upperCode);
      const docSnap = await getDoc(codeRef);
      if (docSnap.exists()) {
        toast.error('This code already exists');
        return;
      }
      
      const now = serverTimestamp();
      let expiresDate = null;
      if (giftExpiresInHours && Number(giftExpiresInHours) > 0) {
        expiresDate = new Date();
        expiresDate.setHours(expiresDate.getHours() + Number(giftExpiresInHours));
      }
      
      await setDoc(codeRef, {
        code: upperCode,
        type: giftType,
        amount: giftType === 'fixed' ? Number(giftAmount) : null,
        minAmount: giftType === 'random' ? Number(giftMinAmount) : null,
        maxAmount: giftType === 'random' ? Number(giftMaxAmount) : null,
        maxUses: giftMaxUses ? Number(giftMaxUses) : 0,
        usedBy: [],
        status: 'active',
        expiresAt: expiresDate,
        createdAt: now,
      });
      
      toast.success('Gift code created successfully');
      setNewGiftCode('');
      loadData(true);
    } catch (err) {
      toast.error('Failed to create gift code');
      console.error(err);
    }
  };

`;

code = code.replace("const handleToggleBlock", functionCode + "const handleToggleBlock");

fs.writeFileSync('src/pages/Admin.tsx', code);
