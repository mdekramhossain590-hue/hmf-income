import re

with open('src/pages/PaymentStatus.tsx', 'r') as f:
    code = f.read()

old = """
                if (data.status === 'completed') {
                   setLoading(false);
                   toast.success(`Successfully added ৳${data.amount} to your balance!`);
                   if (unsubscribe) unsubscribe();
                } else if (data.status === 'cancelled') {
"""

new = """
                if (data.status === 'completed') {
                   setLoading(false);
                   if (data.type === 'activation') {
                      toast.success(`Account activated successfully!`);
                      if (data.userId) {
                         import('../lib/referral').then(module => {
                            module.processRegistrationReferral(data.userId).catch(console.error);
                         });
                      }
                   } else {
                      toast.success(`Successfully added ৳${data.amount} to your balance!`);
                   }
                   if (unsubscribe) unsubscribe();
                } else if (data.status === 'cancelled') {
"""

code = code.replace(old.strip(), new.strip())

with open('src/pages/PaymentStatus.tsx', 'w') as f:
    f.write(code)

print("patched PaymentStatus")
