import re

filepath = 'src/pages/TaskDetail.tsx'
with open(filepath, 'r') as f:
    text = f.read()

old_query = """        const q = query(
          collection(db, "submissions"),
          where("jobId", "==", id),
          where("userId", "==", auth.currentUser.uid),
        );
        const subSnap = await getDocs(q);"""

new_query = """        // Temporary workaround to avoid index requirement
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
        } as any;"""

# Need to update references from subSnap to mockSnap
if old_query in text:
    text = text.replace(old_query, new_query)
    text = text.replace('setSubmissionCount(subSnap.size);', 'setSubmissionCount(mockSnap.size);')
    text = text.replace('if (!subSnap.empty) {', 'if (!mockSnap.empty) {')
    text = text.replace('const latestSubDoc = subSnap.docs[0];', 'const latestSubDoc = mockSnap.docs[0];')
    
    with open(filepath, 'w') as f:
        f.write(text)
    print("Fixed query in TaskDetail.tsx!")
else:
    print("Old query not found!")
