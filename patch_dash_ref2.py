import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

fetch_ref_code = """
        // Fetch user referrals
        const refQuery = query(
          collection(db, "users", auth.currentUser!.uid, "referrals"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const refSnapshot = await getCachedQuery(
          refQuery,
          `dashboard_ref_${auth.currentUser!.uid}`
        );
        const refItems: any[] = [];
        refSnapshot.forEach((docSnap) => {
          refItems.push({
            id: docSnap.id,
            type: "referral",
            ...docSnap.data(),
          });
        });
        setUserReferrals(refItems);
"""

code = code.replace('setUserTasks(taskItems);', 'setUserTasks(taskItems);\\n' + fetch_ref_code)

combined_code = """
  const getCombinedActivity = () => {
    const combined = [
      ...userTx
        .filter((t) => t.type !== "task")
        .map((t) => {
          const d = t.createdAt?.toDate
            ? t.createdAt.toDate()
            : t.createdAt
              ? new Date(t.createdAt)
              : new Date(0);
          return { ...t, date: d };
        }),
      ...userTasks.map((t) => {
        const timeField = t.submittedAt || t.completedAt;
        const d = timeField?.toDate
          ? timeField.toDate()
          : timeField
            ? new Date(timeField)
            : new Date(0);
        // We ensure a 'task' type to match styling logic, but keep original type for display if needed
        return { ...t, date: d, _originalType: t.type, type: "task" };
      }),
      ...userReferrals.map((t) => {
        const d = t.createdAt?.toDate
          ? t.createdAt.toDate()
          : t.createdAt
            ? new Date(t.createdAt)
            : new Date(0);
        return { ...t, date: d, _originalType: t.type, type: "referral" };
      }),
    ];

    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    return combined.slice(0, 5);
  };
"""

code = re.sub(r'const getCombinedActivity = \(\) => \{[\s\S]*?return combined\.slice\(0, 5\);\n  \};', combined_code, code)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(code)

