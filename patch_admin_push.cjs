const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const importPush = `import { sendPushNotification } from '../lib/push';\n`;
if (!code.includes('sendPushNotification')) {
  code = importPush + code;
}

// 1. Task Approval/Rejection
code = code.replace(
  /const notifRef = doc\(collection\(db, "users", userId, "notifications"\)\);\s*batch\.set\(notifRef, \{\s*title: status === 'approved' \? 'Task Approved' : 'Task Rejected',\s*message: `Your task "\$\{subTitle\}" has been \$\{status\}\. \$\{status === 'approved' \? \`You earned ৳\$\{safeReward\}\` : ''\}`,\s*read: false,\s*type: 'task',\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const notifRef = doc(collection(db, "users", userId, "notifications"));
            const nTitle = status === 'approved' ? 'Task Approved' : 'Task Rejected';
            const nMessage = \`Your task "\${subTitle}" has been \${status}. \${status === 'approved' ? \`You earned ৳\${safeReward}\` : ''}\`;
            batch.set(notifRef, {
              title: nTitle,
              message: nMessage,
              read: false,
              type: 'task',
              createdAt: serverTimestamp()
            });
            // Push Notification
            sendPushNotification(userId, nTitle, nMessage);`
);

// 2. Deposit/Withdrawal Approval/Rejection
code = code.replace(
  /const notifRef = doc\(collection\(db, "users", reqUserId, "notifications"\)\);\s*batch\.set\(notifRef, \{\s*title: `\$\{reqType === 'deposit' \? 'Deposit' : reqType === 'activation' \? 'Account Activation' : 'Withdrawal'\} \$\{status\}`,\s*message: `Your \$\{reqType\} request of ৳\$\{reqAmount\} has been \$\{status\}\.`,\s*read: false,\s*type: 'transaction',\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const notifRef = doc(collection(db, "users", reqUserId, "notifications"));
            const nTitle = \`\${reqType === 'deposit' ? 'Deposit' : reqType === 'activation' ? 'Account Activation' : 'Withdrawal'} \${status}\`;
            const nMessage = \`Your \${reqType} request of ৳\${reqAmount} has been \${status}.\`;
            batch.set(notifRef, {
              title: nTitle,
              message: nMessage,
              read: false,
              type: 'transaction',
              createdAt: serverTimestamp()
            });
            sendPushNotification(reqUserId, nTitle, nMessage);`
);

// 3. Admin Custom Notifications (Notify All)
code = code.replace(
  /toast\.success\(`Sent to \$\{allUsers\.length\} users!`\);/g,
  `sendPushNotification('all', notifyTitle, notifyMessage);
                      toast.success(\`Sent to \${allUsers.length} users!\`);`
);

// 4. Admin Custom Notifications (Direct)
code = code.replace(
  /const notifRef = doc\(collection\(db, "users", notifyTarget, "notifications"\)\);\s*await setDoc\(notifRef, \{\s*title: notifyTitle,\s*message: notifyMessage,\s*read: false,\s*type: 'admin_direct',\s*createdAt: serverTimestamp\(\)\s*\}\);/g,
  `const notifRef = doc(collection(db, "users", notifyTarget, "notifications"));
                      await setDoc(notifRef, {
                        title: notifyTitle,
                        message: notifyMessage,
                        read: false,
                        type: 'admin_direct',
                        createdAt: serverTimestamp()
                      });
                      sendPushNotification(notifyTarget, notifyTitle, notifyMessage);`
);


fs.writeFileSync('src/pages/Admin.tsx', code);
