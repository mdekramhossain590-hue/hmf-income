import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Bell } from 'lucide-react';
import { createRoot } from 'react-dom/client';

export function NotificationListener() {
  useEffect(() => {
    if (!auth.currentUser) return;
    
    interface NotificationItem {
      id: string;
      title: string;
      message: string;
      createdAt: Date | null;
    }

    let pendingQueue: NotificationItem[] = [];
    let digestTimeout: NodeJS.Timeout | null = null;

    const processQueue = () => {
      if (pendingQueue.length === 0) return;

      const items = [...pendingQueue];
      pendingQueue = [];

      if (items.length === 1) {
        const item = items[0];
        // Process in-app notification toaster
        showToast(items, item.title, item.message, auth.currentUser!.uid);

        // Build single browser native notifications
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const appNotificationsEnabled = localStorage.getItem('app_notifications_enabled') !== 'false';
          const paymentPushSubscribed = localStorage.getItem('payment_status_notifications_subscribed') === 'true';

          if (appNotificationsEnabled && paymentPushSubscribed && Notification.permission === 'granted') {
            const isRecent = item.createdAt ? (Date.now() - item.createdAt.getTime() < 120000) : true;
            if (isRecent) {
              try {
                new window.Notification(item.title, {
                  body: item.message,
                  icon: '/favicon.svg',
                  tag: item.id,
                  silent: false
                });
              } catch (pushErr) {
                console.warn("Native browser push notification silenced inside frame:", pushErr);
              }
            }
          }
        }
      } else {
        // Grouped digest for multiple notifications
        const title = `🔔 ${items.length} New Updates`;
        const combinedMessage = items.map(item => `• ${item.title}: ${item.message}`).join('\n');
        
        showToast(items, title, combinedMessage, auth.currentUser!.uid);

        // Build real native browser push notification digest
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const appNotificationsEnabled = localStorage.getItem('app_notifications_enabled') !== 'false';
          const paymentPushSubscribed = localStorage.getItem('payment_status_notifications_subscribed') === 'true';

          if (appNotificationsEnabled && paymentPushSubscribed && Notification.permission === 'granted') {
            const recentItems = items.filter(item => {
              return item.createdAt ? (Date.now() - item.createdAt.getTime() < 120000) : true;
            });

            if (recentItems.length > 0) {
              try {
                new window.Notification(`🔔 ${recentItems.length} New Alerts`, {
                  body: recentItems.map(item => `• ${item.title}: ${item.message}`).join('\n'),
                  icon: '/favicon.svg',
                  tag: 'payment-digest-' + Date.now(),
                  silent: false
                });
              } catch (pushErr) {
                console.warn("Native browser push notification silenced inside frame:", pushErr);
              }
            }
          }
        }
      }
    };

    // We only care about unread notifications that were just created to show a popup
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let hasAdded = false;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null);

          pendingQueue.push({
            id: change.doc.id,
            title: data.title || 'Notification',
            message: data.message || '',
            createdAt
          });
          hasAdded = true;
        }
      });

      if (hasAdded) {
        if (digestTimeout) clearTimeout(digestTimeout);
        digestTimeout = setTimeout(processQueue, 400); // 400ms buffer to merge simultaneous notification snapshots
      }
    }, (error) => {
      // Just console error if it fails to avoid breaking loops
      console.error("Notification listener error:", error);
    });

    return () => {
      unsubscribe();
      if (digestTimeout) clearTimeout(digestTimeout);
    };
  }, []);

  return null;
}

function showToast(
  items: { id: string; title: string; message: string; createdAt: Date | null }[],
  title: string,
  message: string,
  userId: string
) {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-[calc(100vw-2rem)]';
    document.body.appendChild(container);
  }

  const toastContainer = document.createElement('div');
  container.appendChild(toastContainer);

  const handleClose = async () => {
    try {
      await Promise.all(items.map(item => 
        updateDoc(doc(db, 'users', userId, 'notifications', item.id), { read: true })
      ));
    } catch(e) { /* ignore */ }
    toastContainer.remove();
  };

  const isDigest = items.length > 1;

  createRoot(toastContainer).render(
    <div className={`bg-slate-900 border ${isDigest ? 'border-blue-500 shadow-blue-500/15' : 'border-slate-700 shadow-2xl'} rounded-2xl p-4 w-72 text-white animate-in slide-in-from-top-2 fade-in duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${isDigest ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-300'}`}>
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-100 truncate">{title}</h4>
          {isDigest ? (
            <div className="text-[11px] text-slate-400 mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="border-l-2 border-blue-500/30 pl-2 py-0.5">
                  <div className="font-semibold text-slate-200 truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400 leading-snug mt-0.5">{item.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1 whitespace-pre-line leading-relaxed">{message}</p>
          )}
        </div>
        <button onClick={handleClose} className="text-slate-500 hover:text-white transition p-0.5 shrink-0 text-lg leading-none">
           &times;
        </button>
      </div>
    </div>
  );

  // Auto remove toast DOM after 12s for digests, 10s for single
  setTimeout(() => {
    try { toastContainer.remove(); } catch(e){}
  }, isDigest ? 12000 : 10000);
}
