import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Bell, Moon, User, Lock, Globe, Info, ShieldAlert, LogOut, ChevronRight, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';

export function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const isDark = theme === 'dark';
  
  // App Preferences State
  const [notifications, setNotifications] = useState(true);
  
  // Modals & Flows State
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  return (
    <div className="pt-6 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('settings')}</h1>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-4 transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
          <SettingsIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          <h3 className="font-semibold text-gray-800 dark:text-white">{t('app_preferences')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setNotifications(!notifications)}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('notifications')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center cursor-pointer" onClick={toggleTheme}>
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('dark_mode')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${isDark ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>

          <div className="flex justify-between items-center cursor-pointer hover:opacity-80 transition" onClick={() => setLanguageModalOpen(true)}>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('language')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">{language}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Account & Security */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-4 transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
          <User className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
          <h3 className="font-semibold text-gray-800 dark:text-white">{t('account_security')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('edit_profile')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex justify-between items-center cursor-pointer hover:opacity-80 transition" onClick={() => setPasswordModalOpen(true)}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('change_password')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* About & Support */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
          <Info className="text-green-600 dark:text-green-400 w-5 h-5" />
          <h3 className="font-semibold text-gray-800 dark:text-white">{t('about')}</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/support')}>
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('help_support')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('app_version')}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">v1.0.3</span>
          </div>
        </div>
      </div>

      {/* Destructive Actions */}
      <div className="space-y-3 mb-8">
        <button 
          onClick={async () => {
            await logOut();
            navigate('/');
          }}
          className="w-full flex justify-center items-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
        >
          <LogOut className="w-5 h-5" />
          {t('log_out')}
        </button>
        
        <button 
          onClick={() => setDeleteModalOpen(true)}
          className="w-full flex justify-center items-center gap-2 py-3.5 text-gray-500 dark:text-gray-400 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
        >
          <ShieldAlert className="w-5 h-5" />
          {t('delete_account')}
        </button>
      </div>

      {/* Language Selection Modal */}
      {languageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setLanguageModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {t('select_language')}
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => { setLanguage('English'); setLanguageModalOpen(false); }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${language === 'English' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'} transition-all`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={`font-semibold ${language === 'English' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>English</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">English (US)</span>
                </div>
                {language === 'English' && <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </button>
              <button 
                onClick={() => { setLanguage('Bengali'); setLanguageModalOpen(false); }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${language === 'Bengali' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'} transition-all`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={`font-semibold ${language === 'Bengali' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>বাংলা</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Bengali</span>
                </div>
                {language === 'Bengali' && <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setPasswordModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
              </div>
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setDeleteModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Account?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This action is permanent and cannot be undone. All your data, rewards, and history will be lost forever.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type <span className="font-bold text-red-500">DELETE</span> to confirm</label>
                <input 
                  type="text" 
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all uppercase" 
                />
              </div>
              <button 
                disabled={deleteConfirmation !== 'DELETE'}
                onClick={async () => {
                  setDeleteModalOpen(false);
                  await logOut();
                  navigate('/');
                }}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${deleteConfirmation === 'DELETE' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'}`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
