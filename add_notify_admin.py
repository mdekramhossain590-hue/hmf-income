import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

target_state = """  const [userList, setUserList] = useState<any[]>([]);"""

repl_state = target_state + """
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<'all' | string>('all');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);"""

target_btn_all = """            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFixBonusAmounts(); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold ml-2"
            >
              Fix Bonus Amounts
            </button>"""

repl_btn_all = target_btn_all + """
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                setNotifyTarget('all');
                setNotifyTitle('');
                setNotifyMessage('');
                setShowNotifyModal(true);
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold ml-2 flex items-center gap-1"
            >
              <BellRing className="w-3 h-3" /> Global Notify
            </button>"""

target_btn_user = """                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">"""

repl_btn_user = target_btn_user + """
                  <button
                    onClick={() => {
                      setNotifyTarget(user.id);
                      setNotifyTitle('');
                      setNotifyMessage('');
                      setShowNotifyModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-sky-100 text-sky-600 shadow-lg shadow-sky-500/10 hover:bg-sky-200"
                  >
                    <BellRing className="w-4 h-4" /> Notify
                  </button>"""

target_modal = """    </div>
  );
}"""

repl_modal = """      {showNotifyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <BellRing className="w-5 h-5 text-sky-500" />
                {notifyTarget === 'all' ? 'Notify All Users' : 'Send Notification'}
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Title</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white"
                  placeholder="Notification Title"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Message</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white min-h-[100px]"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              
              <button
                onClick={async () => {
                  if (!notifyTitle.trim() || !notifyMessage.trim()) {
                    toast.error("Please enter a title and message.");
                    return;
                  }
                  setIsSendingNotification(true);
                  try {
                    if (notifyTarget === 'all') {
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
                      toast.success(`Sent to ${userList.length} users!`);
                    } else {
                      const notifRef = doc(collection(db, "users", notifyTarget, "notifications"));
                      await setDoc(notifRef, {
                        title: notifyTitle,
                        message: notifyMessage,
                        read: false,
                        type: 'admin_direct',
                        createdAt: serverTimestamp()
                      });
                      toast.success("Notification sent!");
                    }
                    setShowNotifyModal(false);
                  } catch (e: any) {
                    toast.error(e.message || "Failed to send notification.");
                  } finally {
                    setIsSendingNotification(false);
                  }
                }}
                disabled={isSendingNotification}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
              >
                {isSendingNotification ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}"""

if target_state in code and target_btn_all in code and target_btn_user in code and target_modal in code:
    code = code.replace(target_state, repl_state)
    code = code.replace(target_btn_all, repl_btn_all)
    code = code.replace(target_btn_user, repl_btn_user)
    code = code.replace(target_modal, repl_modal)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(code)
    print("Patched Admin.tsx successfully")
else:
    print("Could not find targets in Admin.tsx")
    if target_state not in code: print("target_state failed")
    if target_btn_all not in code: print("target_btn_all failed")
    if target_btn_user not in code: print("target_btn_user failed")
    if target_modal not in code: print("target_modal failed")
