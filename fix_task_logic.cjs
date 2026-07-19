const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

const target1 = `        // Temporary workaround to avoid index requirement
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser.uid)
        );
        const subSnap = await getDocs(q);
        const filteredDocs = subSnap.docs.filter((doc) => doc.data().jobId === id);
        
        // Mock subSnap with only filtered docs for existing logic
        const mockSnap = {
          size: filteredDocs.length,
          empty: filteredDocs.length === 0,
          docs: filteredDocs,
          forEach: (cb: any) => filteredDocs.forEach(cb)
        } as any;
        setSubmissionCount(mockSnap.size);
        if (!mockSnap.empty) {
          setPreviousSubmission({
            id: subSnap.docs[0].id,
            ...subSnap.docs[0].data(),
          });
        }`;

const rep1 = `        // Temporary workaround to avoid index requirement
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser.uid)
        );
        const subSnap = await getDocs(q);
        
        const filteredDocs = subSnap.docs.filter((doc) => doc.data().jobId === id);
        
        // Sort to get the most recent one
        filteredDocs.sort((a, b) => {
          const tA = a.data().submittedAt?.toMillis ? a.data().submittedAt.toMillis() : 0;
          const tB = b.data().submittedAt?.toMillis ? b.data().submittedAt.toMillis() : 0;
          return tB - tA;
        });

        // Only count active ones towards the user limit
        const activeDocs = filteredDocs.filter((doc) => doc.data().status !== 'rejected');
        setSubmissionCount(activeDocs.length);
        
        if (filteredDocs.length > 0) {
          setPreviousSubmission({
            id: filteredDocs[0].id,
            ...filteredDocs[0].data(),
          });
        }`;

code = code.replace(target1, rep1);


const target2 = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;`;

const rep2 = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (previousSubmission && previousSubmission.status === 'pending') {
      toast.error("You already have a pending submission for this task.");
      return;
    }`;

code = code.replace(target2, rep2);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Patched TaskDetail logic!");
