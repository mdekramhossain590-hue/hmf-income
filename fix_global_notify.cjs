const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldLogic = `                    if (notifyTarget === 'all') {
                      let chunk = [];
                      for (let i = 0; i < userList.length; i++) {
                        chunk.push(userList[i]);
                        if (chunk.length === 450 || i === userList.length - 1) {
                          const batch = writeBatch(db);
                          chunk.forEach(u => {
                            const notifRef = doc(collection(db, "users", u.id, "notifications"));
                            batch.set(notifRef, {
                              title: notifyTitle,
                              message: notifyMessage,
                              read: false,
                              type: 'admin_broadcast',
                              createdAt: serverTimestamp()
                            });
                          });
                          await batch.commit();
                          chunk = [];
                        }
                      }
                      toast.success(\`Sent to \${userList.length} users!\`);
                    }`;

const newLogic = `                    if (notifyTarget === 'all') {
                      const allUsersSnap = await getDocs(collection(db, "users"));
                      const allUsers = allUsersSnap.docs;
                      let chunk = [];
                      for (let i = 0; i < allUsers.length; i++) {
                        chunk.push(allUsers[i]);
                        if (chunk.length === 450 || i === allUsers.length - 1) {
                          const batch = writeBatch(db);
                          chunk.forEach(u => {
                            const notifRef = doc(collection(db, "users", u.id, "notifications"));
                            batch.set(notifRef, {
                              title: notifyTitle,
                              message: notifyMessage,
                              read: false,
                              type: 'admin_broadcast',
                              createdAt: serverTimestamp()
                            });
                          });
                          await batch.commit();
                          chunk = [];
                        }
                      }
                      toast.success(\`Sent to \${allUsers.length} users!\`);
                    }`;

if (code.includes("for (let i = 0; i < userList.length; i++) {")) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/pages/Admin.tsx', code);
  console.log("Fixed Admin global notifications");
} else {
  console.log("Could not find the target code.");
}
