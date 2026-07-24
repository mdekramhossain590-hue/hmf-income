import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

target_btn = """          <button
            disabled={claimingPartner || alreadyClaimedPartner}
            className={`w-full font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs ${alreadyClaimedPartner ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
            onClick={async () => {
              if (!auth.currentUser) return;
              if (claimingPartner) return;"""

repl_btn = """          <button
            disabled={claimingPartner}
            className={`w-full font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs ${alreadyClaimedPartner ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
            onClick={async () => {
              if (alreadyClaimedPartner) {
                toast.error(language === 'Bengali' ? 'আগামীকাল পর্যন্ত অপেক্ষা করুন।' : 'Please wait until tomorrow to claim again.');
                return;
              }
              if (!auth.currentUser) return;
              if (claimingPartner) return;"""

code = code.replace(target_btn, repl_btn)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

