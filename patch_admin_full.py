import re

with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

# Replace the "Section Accessible" block with actual tabs.
old_placeholder = """{['jobs', 'submissions', 'drives', 'courses', 'gifts', 'settings'].includes(activeTab) && (
              <div className="text-center py-20 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Section Accessible</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">This section is available in the database but currently uses the default view in the restored panel.</p>
              </div>
            )}"""

# Wait, the exact placeholder text in Admin.tsx currently is:
# <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Section Accessible</h3>
# <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">This section is available in the database but currently uses the default view in the restored panel. If you need it immediately, I can add its full layout back.</p>

