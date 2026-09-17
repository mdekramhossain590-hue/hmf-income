import os

filepath = "src/pages/Admin.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add State
state_str = "const [adIncomeSettings, setAdIncomeSettings] = useState({ dailyAdLimit: 10, rewardPerAdView: 0.50, adCode: \"\" });"
insert_state_idx = content.find("const [activationSettings,")
if insert_state_idx != -1 and "const [adIncomeSettings" not in content:
    content = content[:insert_state_idx] + state_str + "\n  " + content[insert_state_idx:]

# 2. Add Load block
load_str = """
      const adIncomeSnap = await getCachedDoc(doc(db, "settings", "adsIncome"));
      if (adIncomeSnap.exists()) {
        const data = adIncomeSnap.data();
        setAdIncomeSettings({
          dailyAdLimit: data.dailyAdLimit ?? 10,
          rewardPerAdView: data.rewardPerAdView ?? 0.50,
          adCode: data.adCode ?? ""
        });
      }
"""
insert_load_idx = content.find("const supportSnap = await getCachedDoc")
if insert_load_idx != -1 and "doc(db, \"settings\", \"adsIncome\")" not in content:
    content = content[:insert_load_idx] + load_str + "      " + content[insert_load_idx:]

# 3. Add Save block
save_str = """
  const handleSaveAdIncomeSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "adsIncome"), {
        ...adIncomeSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Ad Income settings saved!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/adsIncome");
      toast.error("Error saving ad income settings");
    } finally {
      setIsSavingSettings(false);
    }
  };
"""
insert_save_idx = content.find("const handleSaveActivationSettings")
if insert_save_idx != -1 and "handleSaveAdIncomeSettings" not in content:
    content = content[:insert_save_idx] + save_str + "\n  " + content[insert_save_idx:]

# 4. Add UI block
ui_str = """
          {/* Ad Income Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Ad Income Settings</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ad Revenue config</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Daily Limit / User</label>
                  <input type="number" value={adIncomeSettings.dailyAdLimit} onChange={(e) => setAdIncomeSettings(prev => ({ ...prev, dailyAdLimit: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Reward / Ad (BDT)</label>
                  <input type="number" step="0.01" value={adIncomeSettings.rewardPerAdView} onChange={(e) => setAdIncomeSettings(prev => ({ ...prev, rewardPerAdView: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black text-green-500 ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Ad Code (HTML/Script/Iframe)</label>
                <textarea value={adIncomeSettings.adCode} onChange={(e) => setAdIncomeSettings(prev => ({ ...prev, adCode: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-mono h-24 ring-1 ring-slate-100 dark:ring-slate-800" placeholder="<script src=...></script> or <iframe...>" />
              </div>
            </div>
            
            <button onClick={handleSaveAdIncomeSettings} disabled={isSavingSettings} className="mt-6 w-full bg-green-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-green-600/20 active:scale-95 transition-all text-xs">Save Ad Settings</button>
          </motion.div>
"""
insert_ui_idx = content.find("Save Partner Rules</button>")
if insert_ui_idx != -1 and "Ad Income Settings" not in content:
    # Find the closing </motion.div> after Save Partner Rules</button>
    insert_ui_idx = content.find("</motion.div>", insert_ui_idx) + 13
    content = content[:insert_ui_idx] + "\n\n" + ui_str + content[insert_ui_idx:]

with open(filepath, "w") as f:
    f.write(content)
print("Admin.tsx updated fully")
