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

# Insert handleResetPartnerReferrals before return (
code = re.sub(r'(  return \(\n    <div className="min-h-screen)', reset_func + r'\n\1', code)

# Add the button in the settings UI
reset_ui = """
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-[32px] shadow-sm border border-orange-200 dark:border-orange-900/30 md:col-span-2 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-rose-800 dark:text-rose-400 uppercase tracking-tight italic">Partner Program Reset</h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Reset partner referrals to 0 for all users.</p>
              </div>
            </div>
            <button 
              onClick={handleResetPartnerReferrals}
              disabled={isSavingSettings} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all text-xs"
            >
              Reset Partner Progress
            </button>
          </motion.div>
"""

code = code.replace("{settingsSubTab === 'danger' && (", reset_ui + "\n          {settingsSubTab === 'danger' && (")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

