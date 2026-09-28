import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageProvider';
import { useAuth } from '../components/AuthProvider';

export function FAQ() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { siteSettings } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const fAQs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
    { question: t('faq_q4'), answer: t('faq_a4') },
    { question: t('faq_q5'), answer: t('faq_a5') },
    { question: t('faq_q6'), answer: t('faq_a6') },
    { question: t('faq_q7'), answer: t('faq_a7') }
  ];

  const [dynamicFaqs, setDynamicFaqs] = useState<any[]>([]);

  useEffect(() => {
    import('firebase/firestore').then(({ doc }) => {
      import('../lib/firebase').then(({ db }) => {
        import('../lib/cache').then(({ getCachedDoc }) => {
          getCachedDoc(doc(db, "settings", "faqs")).then((docSnap) => {
            if (docSnap.exists()) {
              setDynamicFaqs(docSnap.data().faqs || []);
            }
          }).catch(e => console.warn(e?.message || "Unknown Error"));
        });
      });
    });
  }, []);

  const displayFaqs = dynamicFaqs.length > 0 ? dynamicFaqs.map(f => ({
    question: language === 'Bengali' ? f.question_bn : f.question_en,
    answer: language === 'Bengali' ? f.answer_bn : f.answer_en
  })) : fAQs;

  return (
    <div className="flex flex-col h-screen bg-[#090909] text-white border-x border-[#3D3215] relative shadow-2xl mx-auto w-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#090909]/95 backdrop-blur-md border-b border-[#3D3215] px-4 py-4 flex items-center justify-center relative shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-4 p-2 hover:bg-[#151515] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#A3A3A3] hover:text-[#FACC15]" />
        </button>
        <h1 className="font-bold text-lg text-white">{t('faq_title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide pb-24">
        
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#151515] border-2 border-[#3D3215] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HelpCircle className="w-8 h-8 text-[#FACC15]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-display">{t('faq_title')}</h2>
          <p className="text-sm text-[#A3A3A3]">{t('faq_subtitle')}</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {displayFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-[#151515] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${isOpen ? 'border-[#FACC15]/60 ring-1 ring-[#D4A017]/30' : 'border-[#3D3215] hover:border-[#D4A017]/50'}`}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none cursor-pointer"
                >
                  <span className={`font-semibold text-[13px] sm:text-sm ${isOpen ? 'text-[#FACC15]' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  <span className={`p-1 rounded-full flex-shrink-0 ml-2 transition-colors ${isOpen ? 'bg-[#D4A017]/20 text-[#FACC15]' : 'text-[#737373] bg-[#101010]'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 text-[13px] sm:text-sm text-[#A3A3A3] border-t border-[#3D3215] mt-1 pt-3 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still Need Help */}
        <div className="mt-8 bg-gradient-to-br from-[#1C1C1C] to-[#151515] rounded-2xl p-6 text-center border border-[#3D3215]">
          <MessageCircle className="w-8 h-8 text-[#FACC15] mx-auto mb-3" />
          <h3 className="font-bold text-white mb-2">{t('faq_still_need_help')}</h3>
          <p className="text-[13px] text-[#A3A3A3] mb-4">{t('faq_we_are_here')}</p>
          
        </div>
      </div>
    </div>
  );
}
