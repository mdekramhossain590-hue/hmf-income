const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const newFunc = `  const handleSaveActivationSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "activation"), {
        ...activationSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Activation settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/activation');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveWithdrawSettings = async () => {`;

content = content.replace('  const handleSaveWithdrawSettings = async () => {', newFunc);
fs.writeFileSync('src/pages/Admin.tsx', content);
