import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

# Replace handleDeposit logic
old_handle_deposit_pattern = r"const handleDeposit = async \(e: React\.FormEvent\) => \{.*?\}\s*?;\s*(?=  // Use effect)"
new_handle_deposit = """const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isSubmitting) return;
    setIsSubmitting(true);
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount < depositSettings.minDeposit || amount > depositSettings.maxDeposit) {
      toast.error(`Deposit must be between ${depositSettings.minDeposit} and ${depositSettings.maxDeposit}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/uddoktapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), uid: profile?.uid, name: profile?.fullName || "User", email: profile?.email || "user@example.com" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment gateway error');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment');
    } finally {
      setIsSubmitting(false);
    }
  };"""

code = re.sub(r'const handleDeposit = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=\s*const handleWithdraw)', new_handle_deposit + '\n\n', code)


# Replace the Deposit Form UI
old_deposit_form_pattern = r'\{/\* Deposit Form \*/\}[\s\S]*?(?=\{/\* Withdraw Form \*/\})'

new_deposit_form = """{/* Deposit Form */}
      {activeTab === 'deposit' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('amount')} (৳{depositSettings.minDeposit} - ৳{depositSettings.maxDeposit})</label>
              <input 
                type="number" 
                placeholder={`e.g. 500`} 
                required 
                min={depositSettings.minDeposit}
                max={depositSettings.maxDeposit}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-display font-medium text-lg transition-all"
              />
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98] text-base flex items-center justify-center gap-2 disabled:opacity-50">
              <Shield className="w-5 h-5" />
              {isSubmitting ? 'Processing...' : 'Pay with UddoktaPay'}
            </button>
          </form>
        </motion.div>
      )}
      """

code = re.sub(old_deposit_form_pattern, new_deposit_form, code)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

print("Updated Wallet.tsx Deposit Form")
