import React, { useState } from 'react';
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
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../lib/firebase').then(({ db }) => {
        const unsub = onSnapshot(doc(db, "settings", "faqs"), (docSnap) => {
          if (docSnap.exists()) {
            setDynamicFaqs(docSnap.data().faqs || []);
          }
        });
        return () => unsub();
      });
    });
  }, []);

  const displayFaqs = dynamicFaqs.length > 0 ? dynamicFaqs.map(f => ({
    question: language === 'Bengali' ? f.question_bn : f.question_en,
    answer: language === 'Bengali' ? f.answer_bn : f.answer_en
  })) : fAQs;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 border-x border-gray-100 dark:border-slate-800 relative shadow-2xl mx-auto w-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-4 flex items-center justify-center relative shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="font-bold text-lg text-slate-800 dark:text-white">{t('faq_title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide pb-24">
        
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 font-display">{t('faq_title')}</h2>
          <p className="text-sm border-slate-500 text-slate-500 dark:text-slate-400">{t('faq_subtitle')}</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {displayFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${isOpen ? 'border-blue-200 dark:border-blue-500/30 ring-1 ring-blue-100 dark:ring-blue-500/10' : 'border-gray-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-slate-600'}`}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                >
                  <span className={`font-semibold text-[13px] sm:text-sm ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {faq.question}
                  </span>
                  <span className={`p-1 rounded-full flex-shrink-0 ml-2 transition-colors ${isOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-400 bg-slate-50 dark:bg-slate-700'}`}>
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
                      <div className="px-4 pb-4 text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-700/50 mt-1 pt-3 leading-relaxed">
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
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 text-center border border-indigo-100/50 dark:border-slate-700">
          <MessageCircle className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('faq_still_need_help')}</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">{t('faq_we_are_here')}</p>
          <a href={siteSettings?.telegramUrl || "https://t.me"} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-indigo-600/30">
            {t('faq_contact_support')}
          </a>
        </div>
      </div>
    </div>
  );
}
