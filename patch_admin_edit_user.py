import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

state_to_add = """  const [editingUserBalance, setEditingUserBalance] = useState<{ id: string; fullName: string; main: number; bonus: number; referral: number; partner: number; tasks: number } | null>(null);
"""
code = code.replace("  const [editingJobId, setEditingJobId] = useState<string | null>(null);", state_to_add + "  const [editingJobId, setEditingJobId] = useState<string | null>(null);")

modal_to_add = """
      {/* Edit User Balance Modal */}
      {editingUserBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Edit Balances: {editingUserBalance.fullName}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Main Balance</label>
                <input type="number" step="0.01" value={editingUserBalance.main} onChange={e => setEditingUserBalance({...editingUserBalance, main: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Bonus Balance</label>
                <input type="number" step="0.01" value={editingUserBalance.bonus} onChange={e => setEditingUserBalance({...editingUserBalance, bonus: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Referral Balance</label>
                <input type="number" step="0.01" value={editingUserBalance.referral} onChange={e => setEditingUserBalance({...editingUserBalance, referral: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Partner Balance</label>
                <input type="number" step="0.01" value={editingUserBalance.partner} onChange={e => setEditingUserBalance({...editingUserBalance, partner: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUserBalance(null)} className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 rounded-2xl text-xs uppercase tracking-wider">Cancel</button>
              <button onClick={async () => {
                try {
                  const { updateDoc, doc, setDoc } = await import('firebase/firestore');
                  const { db } = await import('../lib/firebase');
                  await updateDoc(doc(db, "users", editingUserBalance.id), {
                    "balances.main": editingUserBalance.main,
                    "balances.bonus": editingUserBalance.bonus,
                    "balances.referral": editingUserBalance.referral,
                    "balances.partner": editingUserBalance.partner,
                  });
                  await setDoc(doc(db, "leaderboard", editingUserBalance.id), {
                    totalIncome: editingUserBalance.main + editingUserBalance.bonus + editingUserBalance.referral + editingUserBalance.partner + editingUserBalance.tasks
                  }, { merge: true });
                  toast.success("Balances updated!");
                  setEditingUserBalance(null);
                  loadData(true);
                } catch(err: any) {
                  toast.error(err.message);
                }
              }} className="flex-1 py-3 text-white font-bold bg-indigo-500 rounded-2xl text-xs uppercase tracking-wider">Save</button>
            </div>
          </motion.div>
        </div>
      )}
"""
code = code.replace("      {showNotifyModal && (", modal_to_add + "      {showNotifyModal && (")

button_to_add = """
                  <button
                    onClick={() => {
                      setEditingUserBalance({
                        id: user.id,
                        fullName: user.fullName || 'Anonymous',
                        main: Number(user.balances?.main || 0),
                        bonus: Number(user.balances?.bonus || 0),
                        referral: Number(user.balances?.referral || 0),
                        partner: Number(user.balances?.partner || 0),
                        tasks: Number(Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0))
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10 hover:bg-emerald-200"
                  >
                    <Settings className="w-4 h-4" /> Edit Balance
                  </button>
"""
code = code.replace("                  {isFullAdmin && user.role !== 'admin' && (", button_to_add + "                  {isFullAdmin && user.role !== 'admin' && (")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)
print("Patched")
