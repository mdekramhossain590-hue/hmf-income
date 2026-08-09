import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

# Add states if not present
if "const [changingPasswordUser" not in code:
    code = code.replace(
        "const [editingUserBalance, setEditingUserBalance] = useState",
        "const [changingPasswordUser, setChangingPasswordUser] = useState<{ id: string; fullName: string; email: string } | null>(null);\n  const [newPassword, setNewPassword] = useState('');\n  const [isChangingPassword, setIsChangingPassword] = useState(false);\n\n  const handleChangePassword = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!changingPasswordUser || !newPassword) return;\n    if (newPassword.length < 6) {\n      toast.error('Password must be at least 6 characters');\n      return;\n    }\n    setIsChangingPassword(true);\n    try {\n      const res = await fetch('/api/admin/change-password', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ uid: changingPasswordUser.id, newPassword })\n      });\n      const data = await res.json();\n      if (!res.ok) throw new Error(data.error || 'Failed to change password');\n      toast.success(`Password updated successfully!`);\n      setChangingPasswordUser(null);\n      setNewPassword('');\n    } catch (err: any) {\n      toast.error(err.message || 'Failed to change password');\n    } finally {\n      setIsChangingPassword(false);\n    }\n  };\n\n  const [editingUserBalance, setEditingUserBalance] = useState"
    )

# Add UI modal for change password
if "Change Password</h3>" not in code:
    modal_html = """
      {changingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set a new password for <strong>{changingPasswordUser.fullName}</strong>.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">New Password</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setChangingPasswordUser(null); setNewPassword(''); }} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold transition">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold transition disabled:opacity-50">
                  {isChangingPassword ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""
    code = code.replace("{editingUserBalance && (", modal_html + "\n      {editingUserBalance && (")

# Add button
btn_code = """
<button onClick={() => setChangingPasswordUser({ id: user.id, fullName: user.fullName, email: user.email })} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition" title="Change Password">
                            <Lock className="w-4 h-4" />
                          </button>
"""
if "setChangingPasswordUser({ id: user.id" not in code:
    code = code.replace(
        '<button onClick={() => setEditingUserBalance({ id: user.id',
        btn_code + '\n                          <button onClick={() => setEditingUserBalance({ id: user.id'
    )

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

print("Admin patched 2")
