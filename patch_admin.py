import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Add a state for changing password
state_pattern = r'const \[editingUserBalance, setEditingUserBalance\] = useState[^;]+;'
new_states = """
  const [editingUserBalance, setEditingUserBalance] = useState<{ id: string; fullName: string; main: number; bonus: number; referral: number; partner: number; tasks: number } | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: changingPasswordUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      toast.success(`Password for ${changingPasswordUser.fullName} updated successfully!`);
      setChangingPasswordUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
"""
code = re.sub(state_pattern, new_states.strip(), code)

# Find where editingUserBalance is rendered (Modal) and add the change password modal there too
modal_pattern = r'\{editingUserBalance && \(\s*<div className="fixed inset-0[^>]+>[\s\S]*?</div>\s*\)\}'

new_modal = """
{editingUserBalance && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Edit Balance: {editingUserBalance.fullName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Main Balance</label>
                <input type="number" value={editingUserBalance.main} onChange={(e) => setEditingUserBalance({...editingUserBalance, main: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bonus Balance</label>
                <input type="number" value={editingUserBalance.bonus} onChange={(e) => setEditingUserBalance({...editingUserBalance, bonus: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Referral Balance</label>
                <input type="number" value={editingUserBalance.referral} onChange={(e) => setEditingUserBalance({...editingUserBalance, referral: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tasks Balance</label>
                <input type="number" value={editingUserBalance.tasks} onChange={(e) => setEditingUserBalance({...editingUserBalance, tasks: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUserBalance(null)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 font-bold transition">Cancel</button>
              <button onClick={saveUserBalance} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold transition">Save</button>
            </div>
          </div>
        </div>
      )}

      {changingPasswordUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set a new password for <strong>{changingPasswordUser.fullName}</strong> ({changingPasswordUser.email}).</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">New Password</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setChangingPasswordUser(null); setNewPassword(''); }} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 font-bold transition">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold transition disabled:opacity-50">
                  {isChangingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""
if re.search(modal_pattern, code):
    code = re.sub(modal_pattern, new_modal.strip(), code)
else:
    print("modal pattern not found")


# add change password button to the user list item
button_pattern = r'<button onClick=\{.*setEditingUserBalance.*\} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="Edit Balances">[\s\S]*?<\/button>'

# We replace the Edit button with itself + a Change Password button
# I will use a Lock icon for the change password button
new_button = """
<button onClick={() => setChangingPasswordUser({ id: user.id, fullName: user.fullName, email: user.email })} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition" title="Change Password">
  <Lock className="w-4 h-4" />
</button>
"""
def repl(m):
    return m.group(0) + '\n' + new_button

code = re.sub(button_pattern, repl, code)


with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

print("Admin patched")
