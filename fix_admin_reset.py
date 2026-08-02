import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

reset_func = """
  const handleResetPartnerReferrals = async () => {
    if (!window.confirm("Are you sure you want to reset partner referrals for ALL users? This cannot be undone.")) return;
    setIsSavingSettings(true);
    try {
      const uQs = await getDocs(collection(db, "users"));
      const batch = writeBatch(db);
      let count = 0;
      for (const uDoc of uQs.docs) {
        batch.update(doc(db, "users", uDoc.id), { partnerReferrals: 0 });
        count++;
        if (count % 400 === 0) {
          await batch.commit();
        }
      }
      if (count % 400 !== 0) await batch.commit();
      toast.success("Successfully reset partner referrals for all users!");
    } catch (e: any) {
      toast.error("Failed to reset: " + e.message);
    } finally {
      setIsSavingSettings(false);
    }
  };
"""

code = code.replace("  const handleCancelEditFaq = () => {\n    setEditingFaqIndex(null);\n    setNewFaq({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });\n  };\n\n  return (", reset_func + "\n  const handleCancelEditFaq = () => {\n    setEditingFaqIndex(null);\n    setNewFaq({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });\n  };\n\n  return (")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

