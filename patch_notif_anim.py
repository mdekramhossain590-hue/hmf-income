import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    code = f.read()

target1 = """              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[220px]">
                {loading ? (
                  <div className="flex flex-col gap-2 py-8 items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                ) : dbNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3 border border-dashed border-slate-200 dark:border-slate-700">
                      <Bell className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {t("no_new_notifications")}
                    </p>
                  </div>
                ) : (
                  dbNotifications.map((notif) => {"""

repl1 = """              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[220px]">
                {loading ? (
                  <div className="flex flex-col gap-2 py-8 items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                ) : dbNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3 border border-dashed border-slate-200 dark:border-slate-700">
                      <Bell className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {t("no_new_notifications")}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                  {dbNotifications.map((notif) => {"""

target2 = """                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) {
                            handleMarkAsRead(notif.id);
                          }
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all text-left relative cursor-pointer flex gap-3 ${
                          notif.read
                            ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50"
                            : "bg-indigo-50/15 dark:bg-indigo-950/10 border-indigo-500/20 shadow-sm shadow-indigo-500/5 hover:border-indigo-500/40"
                        }`}
                        id={`notification-card-item-${notif.id}`}
                      >"""

repl2 = """                    return (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) {
                            handleMarkAsRead(notif.id);
                          }
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all text-left relative cursor-pointer flex gap-3 ${
                          notif.read
                            ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50"
                            : "bg-indigo-50/15 dark:bg-indigo-950/10 border-indigo-500/20 shadow-sm shadow-indigo-500/5 hover:border-indigo-500/40"
                        }`}
                        id={`notification-card-item-${notif.id}`}
                      >"""

target3 = """                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>"""

repl3 = """                        </div>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>"""

if target1 in code and target2 in code and target3 in code:
    code = code.replace(target1, repl1)
    code = code.replace(target2, repl2)
    code = code.replace(target3, repl3)
    with open('src/pages/Dashboard.tsx', 'w') as f:
        f.write(code)
    print("Patched Dashboard.tsx successfully")
else:
    print("Could not find targets in Dashboard.tsx")
    if target1 not in code: print("target1 failed")
    if target2 not in code: print("target2 failed")
    if target3 not in code: print("target3 failed")

