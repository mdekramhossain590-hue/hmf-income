const fs = require('fs');
let code = fs.readFileSync('src/pages/Drive.tsx', 'utf8');

const stateTarget = `const [loading, setLoading] = useState(true);`;
const stateReplacement = `const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);`;

code = code.replace(stateTarget, stateReplacement);

const purchaseStart = `const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedOffer) return;`;
    
const purchaseReplacement = `const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedOffer || isSubmitting) return;
    setIsSubmitting(true);`;

code = code.replace(purchaseStart, purchaseReplacement);

const purchaseEnd = `} catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, \`payment_requests/\${auth.currentUser.uid}\`);
      toast.error('Could not purchase offer.');
    }
  };`;
  
const purchaseEndReplacement = `} catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, \`payment_requests/\${auth.currentUser.uid}\`);
      toast.error('Could not purchase offer.');
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(purchaseEnd, purchaseEndReplacement);

const purchaseBtn = `<button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg mt-4 transition flex items-center justify-center gap-2"
                >
                  Confirm Purchase
                </button>`;
const purchaseBtnReplacement = `<button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg mt-4 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                </button>`;

code = code.replace(purchaseBtn, purchaseBtnReplacement);

fs.writeFileSync('src/pages/Drive.tsx', code);
console.log("Patched Drive anti-spam!");
