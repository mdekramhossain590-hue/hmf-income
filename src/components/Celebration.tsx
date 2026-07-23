import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { triggerRealisticConfetti } from "../lib/confetti";
import { playSuccessSound } from "../lib/sound";

export function Celebration({
  isVisible,
  onComplete,
}: {
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      // Trigger subtle confetti
      triggerRealisticConfetti();
      playSuccessSound();
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/20 backdrop-blur-sm cursor-pointer" onClick={() => { if(onComplete) onComplete(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Subtle Success Popup */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 mx-4 pointer-events-auto border border-emerald-100 dark:border-emerald-900/30"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Awesome!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">Task completed successfully! 🎉</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
