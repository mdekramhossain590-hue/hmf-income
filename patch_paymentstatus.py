import re

with open('src/pages/PaymentStatus.tsx', 'r') as f:
    code = f.read()

new_effect = """
  useEffect(() => {
    let unsubscribe: any;
    
    const processPayment = async () => {
      const id = searchParams.get('id');
      if (!id) {
        setLoading(false);
        return;
      }

      if (status === 'cancel') {
         await updateDoc(doc(db, "payment_requests", id), { status: "cancelled" }).catch(()=>{});
         setLoading(false);
         return;
      }

      try {
        const docRef = doc(db, "payment_requests", id);
        
        // Listen for status changes
        import('firebase/firestore').then(({ onSnapshot }) => {
           unsubscribe = onSnapshot(docRef, (docSnap) => {
             if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'completed') {
                   setLoading(false);
                   toast.success(`Successfully added ৳${data.amount} to your balance!`);
                   if (unsubscribe) unsubscribe();
                } else if (data.status === 'cancelled') {
                   setLoading(false);
                   if (unsubscribe) unsubscribe();
                }
             }
           });
        });
        
      } catch (err: any) {
        console.error(err);
        setLoading(false);
      }
    };

    processPayment();
    
    return () => {
       if (unsubscribe) unsubscribe();
    };
  }, [status, searchParams]);
"""

old_effect = re.search(r'  useEffect\(\(\) => \{.*?\}, \[status, searchParams\]\);', code, re.DOTALL)
if old_effect:
    code = code.replace(old_effect.group(0), new_effect.strip())
else:
    print("Could not find useEffect!")

with open('src/pages/PaymentStatus.tsx', 'w') as f:
    f.write(code)

print("Patched PaymentStatus.tsx")
