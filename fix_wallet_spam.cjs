const fs = require('fs');
let code = fs.readFileSync('src/pages/Wallet.tsx', 'utf8');

const stateTarget = `const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);`;
const stateReplacement = `const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);`;

code = code.replace(stateTarget, stateReplacement);

const depositStart = `const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;`;
const depositReplacement = `const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isSubmitting) return;
    setIsSubmitting(true);`;

code = code.replace(depositStart, depositReplacement);

const depositEnd = `toast.error("Error processing deposit.");
    }
  };`;
const depositEndReplacement = `toast.error("Error processing deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(depositEnd, depositEndReplacement);


const withdrawStart = `const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;`;
const withdrawReplacement = `const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isSubmitting) return;
    setIsSubmitting(true);`;

code = code.replace(withdrawStart, withdrawReplacement);


const withdrawEnd = `toast.error(t('withdraw_error'));
    }
  };`;
const withdrawEndReplacement = `toast.error(t('withdraw_error'));
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(withdrawEnd, withdrawEndReplacement);

const submitDepositBtn = `<button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2"
                  >
                    Submit Deposit Request
                    <ArrowRight className="w-5 h-5" />
                  </button>`;
const submitDepositBtnRep = `<button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                  </button>`;

code = code.replace(submitDepositBtn, submitDepositBtnRep);

const confirmWithdrawBtn = `<button
                onClick={handleWithdraw}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg"
              >
                Confirm Request
              </button>`;
const confirmWithdrawBtnRep = `<button
                onClick={handleWithdraw}
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Request'}
              </button>`;
code = code.replace(confirmWithdrawBtn, confirmWithdrawBtnRep);

fs.writeFileSync('src/pages/Wallet.tsx', code);
console.log("Patched Wallet.tsx anti-spam!");
