import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'English' | 'Bengali';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  English: {
    'settings': 'Settings',
    'app_preferences': 'App Preferences',
    'notifications': 'Notifications',
    'dark_mode': 'Dark Mode',
    'language': 'Language',
    'edit_profile': 'Edit Profile',
    'change_password': 'Change Password',
    'account_security': 'Account & Security',
    'about': 'About',
    'help_support': 'Help & Support',
    'app_version': 'App Version',
    'log_out': 'Log Out',
    'delete_account': 'Delete Account',
    'select_language': 'Select Language',
    'main_menu': 'Main Menu',
    'access_all_features': 'Access all features',
    'my_profile': 'My Profile',
    'wallet_history': 'Wallet & History',
    'my_tasks': 'My Tasks',
    'refer_earn': 'Refer & Earn',
    'leaderboard': 'Leaderboard',
    'rewards_badges': 'Rewards & Badges',
    'privacy_policy': 'Privacy Policy',
    'terms_conditions': 'Terms & Conditions',
    'home': 'Home',
    'jobs': 'Jobs',
    'wallet': 'Wallet',
    'profile': 'Profile',
    'welcome_back': 'Welcome back,',
    'available_balance': 'Available Balance',
    'total_earnings': 'Total Earnings',
    'view_details': 'View Details',
    'quick_actions': 'Quick Actions',
    'tasks': 'Tasks',
    'spin': 'Spin',
    'math': 'Math',
    'refer': 'Refer',
    'recent_activities': 'Recent Activities',
    'see_all': 'See All',
    'loading': 'Loading...',
    'total_balance': 'Total Balance',
    'bonus': 'Bonus:',
    'withdraw': 'Withdraw',
    'join_telegram_support': 'Join Telegram Support',
    'daily_updates_payment_proof': 'Daily updates & payment proof',
    'join': 'Join',
    'current_time': 'Current Time',
    'year': 'YEAR',
    'mon': 'MON',
    'day': 'DAY',
    'hrs': 'HRS',
    'min': 'MIN',
    'sec': 'SEC',
    'deposit': 'Deposit',
    'withdraw_req': 'Withdraw',
    'deposit_submitted': 'Deposit request submitted! Admin will review it shortly.',
    'invalid_amount': 'Invalid amount',
    'insufficient_balance': 'Insufficient balance!',
    'withdraw_successful': 'Withdraw request successful! You will receive payment within 24 hours.',
    'our_number': 'Our bKash/Nagad Personal Number:',
    'send_money_only': 'Send Money only. Min deposit ৳100.',
    'select_method': 'Select Method',
    'amount': 'Amount (৳)',
    'trx_id': 'Transaction ID (TrxID)',
    'submit_deposit': 'Submit Deposit',
    'available': 'Available: ৳',
    'account_number': 'Account Number',
    'request_withdraw': 'Request Withdraw',
    'confirm_logout': 'Are you sure you want to logout?',
    'total_earned': 'Total Earned',
    'available_jobs': 'Available Jobs',
    'wait': 'Wait...',
    'start': 'Start',
    'task_completed': 'Task Completed! ৳{amount} added to your main balance.',
    'task_failed': 'Task failed. Check connection.',
  },
  Bengali: {
    'settings': 'সেটিংস',
    'app_preferences': 'অ্যাপ প্রেফারেন্স',
    'notifications': 'নোটিফিকেশন',
    'dark_mode': 'ডার্ক মোড',
    'language': 'ভাষা',
    'edit_profile': 'প্রোফাইল সম্পাদন',
    'change_password': 'পাসওয়ার্ড পরিবর্তন',
    'account_security': 'অ্যাকাউন্ট ও সিকিউরিটি',
    'about': 'আমাদের সম্পর্কে',
    'help_support': 'সাহায্য ও সাপোর্ট',
    'app_version': 'অ্যাপ সংস্করণ',
    'log_out': 'লগ আউট',
    'delete_account': 'অ্যাকাউন্ট ডিলিট করুন',
    'select_language': 'ভাষা নির্বাচন করুন',
    'main_menu': 'প্রধান মেনু',
    'access_all_features': 'সব ফিচার অ্যাক্সেস করুন',
    'my_profile': 'আমার প্রোফাইল',
    'wallet_history': 'ওয়ালেট ও হিস্ট্রি',
    'my_tasks': 'আমার কাজগুলো',
    'refer_earn': 'রেফার করে আয় করুন',
    'leaderboard': 'লিডারবোর্ড',
    'rewards_badges': 'রিওয়ার্ডস ও ব্যাজ',
    'privacy_policy': 'গোপনীয়তা নীতি',
    'terms_conditions': 'শর্তাবলী',
    'home': 'হোম',
    'jobs': 'কাজ',
    'wallet': 'ওয়ালেট',
    'profile': 'প্রোফাইল',
    'welcome_back': 'স্বাগতম,',
    'available_balance': 'বর্তমান ব্যালেন্স',
    'total_earnings': 'সর্বমোট আয়',
    'view_details': 'বিস্তারিত দেখুন',
    'quick_actions': 'কুইক অ্যাকশন',
    'tasks': 'কাজগুলি',
    'spin': 'স্পিন',
    'math': 'ম্যাথ',
    'refer': 'রেফার',
    'recent_activities': 'সাম্প্রতিক কাজ',
    'see_all': 'সব দেখুন',
    'loading': 'লোড হচ্ছে...',
    'total_balance': 'সর্বমোট ব্যালেন্স',
    'bonus': 'বোনাস:',
    'withdraw': 'উত্তোলন',
    'join_telegram_support': 'টেলিগ্রাম সাপোর্টে যোগ দিন',
    'daily_updates_payment_proof': 'প্রতিদিনের আপডেট ও পেমেন্ট প্রুফ',
    'join': 'যোগ দিন',
    'current_time': 'বর্তমান সময়',
    'year': 'বছর',
    'mon': 'মাস',
    'day': 'দিন',
    'hrs': 'ঘন্টা',
    'min': 'মিনিট',
    'sec': 'সেকেন্ড',
    'deposit': 'ডিপোজিট',
    'withdraw_req': 'উত্তোলন',
    'deposit_submitted': 'ডিপোজিট রিকোয়েস্ট সফল হয়েছে! এডমিন শীঘ্রই এটি রিভিউ করবেন।',
    'invalid_amount': 'ভুল পরিমাণ',
    'insufficient_balance': 'পর্যাপ্ত ব্যালেন্স নেই!',
    'withdraw_successful': 'উত্তোলন রিকোয়েস্ট সফল হয়েছে! ২৪ ঘন্টার মধ্যে পেমেন্ট পেয়ে যাবেন।',
    'our_number': 'আমাদের বিকাশ/নগদ পার্সোনাল নাম্বার:',
    'send_money_only': 'শুধুমাত্র সেন্ড মানি করুন। সর্বনিম্ন ডিপোজিট ৳১০০।',
    'select_method': 'পদ্ধতি নির্বাচন করুন',
    'amount': 'পরিমাণ (৳)',
    'trx_id': 'ট্রানজেকশন আইডি (TrxID)',
    'submit_deposit': 'ডিপোজিট সাবমিট করুন',
    'available': 'বর্তমান: ৳',
    'account_number': 'অ্যাকাউন্ট নাম্বার',
    'request_withdraw': 'উত্তোলন রিকোয়েস্ট করুন',
    'confirm_logout': 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?',
    'total_earned': 'সর্বমোট আয়',
    'available_jobs': 'বিদ্যমান কাজসমূহ',
    'wait': 'দাঁড়ান...',
    'start': 'শুরু করুন',
    'task_completed': 'কাজ সম্পন্ন হয়েছে! ৳{amount} আপনার ব্যালেন্সে যোগ হয়েছে।',
    'task_failed': 'কাজ ব্যর্থ হয়েছে। কানেকশন চেক করুন।',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'English';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
