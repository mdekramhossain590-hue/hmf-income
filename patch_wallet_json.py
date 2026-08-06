import re

with open('src/pages/Wallet.tsx', 'r') as f:
    code = f.read()

old = """
      const res = await fetch('/api/uddoktapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), uid: auth.currentUser?.uid, name: profile?.fullName || "User", email: profile?.email || "user@example.com" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment gateway error');
"""

new = """
      const res = await fetch('/api/uddoktapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), uid: auth.currentUser?.uid, name: profile?.fullName || "User", email: profile?.email || "user@example.com" })
      });
      
      const text = await res.text();
      let data;
      try {
         data = JSON.parse(text);
      } catch (e) {
         throw new Error("Server did not return a valid API response. Ensure you are running the Node.js backend server.");
      }
      
      if (!res.ok) throw new Error(data.error || 'Payment gateway error');
"""

code = code.replace(old.strip(), new.strip())

with open('src/pages/Wallet.tsx', 'w') as f:
    f.write(code)

print("patched Wallet.tsx")
