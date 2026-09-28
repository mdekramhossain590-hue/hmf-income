import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Gift, Users, Wallet, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    title: "Welcome to HMF EARNING ZONE!",
    description: "Your platform to earn real money by completing simple tasks, playing games, and referring friends.",
    icon: Target,
    color: "bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] shadow-[#D4A017]/40 text-[#090909]"
  },
  {
    title: "Complete Micro Jobs",
    description: "Browse the 'Earn Money' section, follow the simple instructions, and submit proof to get paid.",
    icon: CheckCircle,
    color: "bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] shadow-[#D4A017]/40 text-[#090909]"
  },
  {
    title: "Play Daily Games",
    description: "Test your luck with the Spin Wheel or solve Math Quizzes to earn extra bonus points every day.",
    icon: Gift,
    color: "bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] shadow-[#D4A017]/40 text-[#090909]"
  },
  {
    title: "Invite & Earn",
    description: "Share your referral code! Get a fixed bonus and a lifetime percentage commission from their task earnings.",
    icon: Users,
    color: "bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] shadow-[#D4A017]/40 text-[#090909]"
  },
  {
    title: "Withdraw Instantly",
    description: "Reach the minimum balance and cash out directly to your bKash, Nagad, or Rocket account.",
    icon: Wallet,
    color: "bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] shadow-[#D4A017]/40 text-[#090909]"
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#151515] border border-[#3D3215] rounded-3xl w-full max-w-[360px] overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#737373] hover:text-[#FFFFFF] z-10 p-1"
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
                <div className={`w-20 h-20 rounded-full ${steps[currentStep].color} shadow-lg flex items-center justify-center mb-6 transition-colors`}>
                  <StepIcon className="w-10 h-10 text-[#090909]" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-[#FFFFFF]">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed min-h-[60px]">
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
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-[#FACC15]' : 'w-2 bg-[#3D3215]'}`}
                />
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button 
                    onClick={prevStep}
                    className="flex-1 py-3 rounded-xl font-bold bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-[#FFFFFF] transition active:scale-95 text-sm"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={nextStep}
                  className="flex-[2] py-3 rounded-xl font-black bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/25 hover:opacity-95 transition active:scale-95 text-sm"
                >
                  {currentStep === steps.length - 1 ? "Let's Earn!" : "Next"}
                </button>
              </div>
              {currentStep < steps.length - 1 && (
                <button 
                  onClick={handleClose}
                  className="py-2 text-xs font-semibold text-[#737373] hover:text-[#A3A3A3] transition-colors"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
