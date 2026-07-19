const fs = require('fs');
let code = fs.readFileSync('src/pages/Payment.tsx', 'utf8');

const target = `const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!paymentMethod || !paymentAccount || !paymentTrx) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {`;

const replacement = `const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!paymentMethod || !paymentAccount || !paymentTrx) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { query, collection, where, getDocs } = await import('firebase/firestore');
      const q = query(
        collection(db, "users", auth.currentUser.uid, "transactions"),
        where("type", "==", "activation"),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast.error("You already have a pending activation request.");
        setSubmitting(false);
        return;
      }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/Payment.tsx', code);
console.log("Patched Payment pending check!");
