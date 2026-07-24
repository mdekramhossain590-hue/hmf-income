import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

target = """  useEffect(() => {
    if (!auth.currentUser) return;

    // Using cached read for notifications to save quota
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(
          db,
          "users",
          auth.currentUser!.uid,
          "notifications",
        );
        const q = query(
          notificationsRef,
          orderBy("createdAt", "desc"),
          limit(20),
        );
        const snapshot = await getCachedQuery(
          q,
          `notifications_${auth.currentUser!.uid}`,
        );
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDbNotifications(items);
      } catch (err) {
        console.warn("Error fetching db notifications:", err);
      }
    };

    fetchNotifications();
  }, [auth.currentUser?.uid]);"""

repl = """  useEffect(() => {
    if (!auth.currentUser) return;

    let unsubscribe: () => void;
    import('firebase/firestore').then(({ onSnapshot }) => {
      const notificationsRef = collection(
        db,
        "users",
        auth.currentUser!.uid,
        "notifications",
      );
      const q = query(
        notificationsRef,
        orderBy("createdAt", "desc"),
        limit(20),
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDbNotifications(items);
      }, (err) => {
        console.warn("Error fetching db notifications:", err);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth.currentUser?.uid]);"""

if target in code:
    code = code.replace(target, repl)
    with open('src/pages/Dashboard.tsx', 'w') as f:
        f.write(code)
    print("Patched Dashboard.tsx successfully")
else:
    print("Could not find target in Dashboard.tsx")
