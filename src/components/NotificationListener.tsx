import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Bell } from 'lucide-react';
import { createRoot } from 'react-dom/client';

export function NotificationListener() {
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // We only care about unread notifications that were just created to show a popup
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Optionally skip showing popup for old unread notifications when page loads
          // We'll show a toast for every unread one for simplicity.
          showToast(data.title, data.message, change.doc.id, auth.currentUser!.uid);
        }
      });
    }, (error) => {
      // Just console error if it fails to avoid breaking loops
      console.error("Notification listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  return null;
}

function showToast(title: string, message: string, id: string, userId: string) {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
  }

  const toastContainer = document.createElement('div');
  container.appendChild(toastContainer);

  const handleClose = async () => {
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', id), { read: true });
    } catch(e) { /* ignore */ }
    toastContainer.remove();
  };

  createRoot(toastContainer).render(
    <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-4 w-72 text-white animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="bg-blue-600/30 p-2 rounded-full text-blue-400">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-slate-100">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{message}</p>
        </div>
        <button onClick={handleClose} className="text-slate-500 hover:text-white transition">
           &times;
        </button>
      </div>
    </div>
  );

  // Auto remove toast DOM after 10s (but keep it unread in DB until user dismisses or views a page maybe)
  setTimeout(() => {
    try { toastContainer.remove(); } catch(e){}
  }, 10000);
}
