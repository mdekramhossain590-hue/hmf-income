const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const cleanupFunction = `  const handleDeleteDuplicateAdmins = async () => {
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
      toast.success(\`Successfully deleted \${deleted} duplicate admin accounts. Kept \${kept} account.\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to delete accounts.");
      console.error(e);
    }
  };

  useEffect(() => {`;

code = code.replace(
  `  useEffect(() => {`,
  cleanupFunction
);

const cleanupButton = `          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-1">
            <h3 className="font-black dark:text-white flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users className="w-4 h-4 text-indigo-500" /> Database Entities ({userList.length})
            </h3>
            
            <button
              onClick={handleDeleteDuplicateAdmins}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Delete Duplicate Admins
            </button>
            
            <div className="relative w-full sm:w-72">`;

code = code.replace(
  `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-1">
            <h3 className="font-black dark:text-white flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users className="w-4 h-4 text-indigo-500" /> Database Entities ({userList.length})
            </h3>
            
            <div className="relative w-full sm:w-72">`,
  cleanupButton
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched Admin.tsx");
