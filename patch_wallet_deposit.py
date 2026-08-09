import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

# Replace handleDeposit implementation to navigate
new_handleDeposit = """
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/deposit');
  };
"""
code = re.sub(r'const handleDeposit = async \(e: React\.FormEvent\) => \{[\s\S]*?\n  \};', new_handleDeposit.strip(), code)

# Replace the deposit form
deposit_form_pattern = r'<form onSubmit=\{handleDeposit\} className="space-y-4">[\s\S]*?Pay with UddoktaPay[\s\S]*?<\/form>'

new_deposit_form = """
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please use our dedicated deposit page to add funds manually via bKash or Nagad.
          </p>
          <button
            onClick={() => navigate('/deposit')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 mt-4"
          >
            <Wallet className="w-5 h-5" />
            Go to Deposit Page
          </button>
        </div>
"""
code = re.sub(deposit_form_pattern, new_deposit_form.strip(), code)

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

print("Wallet patched")
