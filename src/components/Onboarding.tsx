import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Gift, Users, Wallet, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    title: "Welcome to HMF Income!",
    description: "Your platform to earn real money by completing simple tasks, playing games, and referring friends.",
    icon: Target,
    color: "bg-blue-500 shadow-blue-500/40"
  },
  {
    title: "Complete Micro Jobs",
    description: "Browse the 'Earn Money' section, follow the simple instructions, and submit proof to get paid.",
    icon: CheckCircle,
    color: "bg-green-500 shadow-green-500/40"
  },
  {
    title: "Play Daily Games",
    description: "Test your luck with the Spin Wheel or solve Math Quizzes to earn extra bonus points every day.",
    icon: Gift,
    color: "bg-purple-500 shadow-purple-500/40"
  },
  {
    title: "Invite & Earn",
    description: "Share your referral code! Get a fixed bonus and a lifetime percentage commission from their task earnings.",
    icon: Users,
    color: "bg-amber-500 shadow-amber-500/40"
  },
  {
    title: "Withdraw Instantly",
    description: "Reach the minimum balance and cash out directly to your bKash, Nagad, or Rocket account.",
    icon: Wallet,
    color: "bg-teal-500 shadow-teal-500/40"
  }
];

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      // Small delay to let the app load first
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const StepIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-[360px] overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10 p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-8 text-center pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className={`w-20 h-20 rounded-full ${steps[currentStep].color} shadow-lg flex items-center justify-center text-white mb-6 transition-colors`}>
                  <StepIcon className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed min-h-[60px]">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-[#0D47A1] dark:bg-blue-500' : 'w-2 bg-gray-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition active:scale-95 text-sm"
                >
                  Back
                </button>
              )}
              <button 
                onClick={nextStep}
                className="flex-[2] py-3 rounded-xl font-bold bg-[#0D47A1] text-white shadow-lg shadow-blue-900/20 dark:shadow-blue-500/30 hover:opacity-90 transition active:scale-95 text-sm"
              >
                {currentStep === steps.length - 1 ? "Let's Earn!" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
