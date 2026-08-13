with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

replacement = """  const fixExploit = async () => {
    toast("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {
      const { db } = await import('../lib/firebase');
      const { collection, getDocs, doc, updateDoc, query, where, getDoc } = await import('firebase/firestore');
      
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log("Total users fetched:", usersSnap.docs.length);
      toast.success(`Fetched ${usersSnap.docs.length} users. Processing...`);
"""

code = code.replace("""  const fixExploit = async () => {
    toast("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {
      const { db } = await import('../lib/firebase');
      const { collection, getDocs, doc, updateDoc, query, where, getDoc } = await import('firebase/firestore');
      
      const usersSnap = await getDocs(collection(db, 'users'));""", replacement)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
