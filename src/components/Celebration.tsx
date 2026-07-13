import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";
import { triggerSchoolPrideConfetti } from "../lib/confetti";

export function Celebration({
  isVisible,
  onComplete,
}: {
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      // Trigger premium interactive school pride confetti streams
      triggerSchoolPrideConfetti(2200);

      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  // Generate some confetti particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 100, // spread -50vw to 50vw
    y: (Math.random() - 0.5) * 100, // spread -50vh to 50vh
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ["#0866FF", "#dc2626", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][
      Math.floor(Math.random() * 6)
    ],
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti overlay background */}
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti particles */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
                initial={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: `${p.x}vw`,
                  y: `${p.y > 0 ? p.y + 50 : p.y - 50}vh`,
                  rotate: p.rotation + 720,
                  opacity: 0,
                  scale: p.scale,
                }}
                transition={{
                  duration: 2.5 + Math.random(),
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Central Popup */}
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-2xl flex flex-col items-center justify-center mx-4 relative z-10 pointer-events-auto"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
            }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-inner"
            >
              <CheckCircle className="w-10 h-10" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-black text-slate-800 dark:text-white mb-2 text-center tracking-tight"
            >
              Great Job!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center max-w-[200px]"
            >
              Task submitted successfully. Rewards will be added once approved.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
