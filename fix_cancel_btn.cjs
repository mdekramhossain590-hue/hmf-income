const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

// Remove Cancel button
const cancelBtn = `            {previousSubmission && (
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="w-full mt-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            )}`;
code = code.replace(cancelBtn, '');

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
