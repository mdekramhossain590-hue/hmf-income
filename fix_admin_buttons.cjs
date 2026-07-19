const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldDelete = `  const handleDeleteDuplicateAdmins = async () => {
    if (!window.confirm("Are you sure you want to delete all accounts with email mdekramhossain590@gmail.com EXCEPT the oldest one?")) return;
    
    try {
      toast.loading("Finding and deleting accounts...");
      const { query, collection, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
      const q = query(
        collection(db, "users"),
        where("email", "==", "mdekramhossain590@gmail.com")
      );
      
      const snapshot = await getDocs(q);
      let deleted = 0;
      let kept = 0;
      
      const docsArr = snapshot.docs.map(d => ({id: d.id, data: d.data()}));
      docsArr.sort((a, b) => {
          const ta = a.data.createdAt?.toMillis ? a.data.createdAt.toMillis() : 0;
          const tb = b.data.createdAt?.toMillis ? b.data.createdAt.toMillis() : 0;
          return ta - tb;
      });

      for (let i = 0; i < docsArr.length; i++) {
        if (i === 0) {
          kept++;
        } else {
          await deleteDoc(doc(db, "users", docsArr[i].id));
          deleted++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Deleted \${deleted} duplicate admins. Kept \${kept}.\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to delete duplicate admins: " + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    }
  };`;

const newDelete = `  const handleDeleteDuplicateAdmins = async () => {
    if (!window.confirm("Are you sure you want to delete all accounts with email mdekramhossain590@gmail.com EXCEPT the one with referral code NN743526?")) return;
    
    try {
      toast.loading("Finding and deleting accounts...");
      const { query, collection, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
      const q = query(
        collection(db, "users"),
        where("email", "==", "mdekramhossain590@gmail.com")
      );
      
      const snapshot = await getDocs(q);
      let deleted = 0;
      let kept = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        if (data.myReferCode === "NN743526") {
          kept++;
        } else {
          await deleteDoc(doc(db, "users", userDoc.id));
          deleted++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Deleted \${deleted} duplicate admins. Kept \${kept}.\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to delete duplicate admins.");
      console.error(e);
    }
  };`;

adminCode = adminCode.replace(oldDelete, newDelete);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);
console.log("Patched Admin.tsx");
