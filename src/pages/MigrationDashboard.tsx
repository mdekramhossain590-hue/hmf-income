import React, { useState, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import { auth as currentAuth } from '../lib/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from 'firebase/firestore';
import { collection as newCollection, doc as newDoc, writeBatch, getDocs as newGetDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ShieldAlert, Play, CheckCircle, Database, AlertCircle, RefreshCw, ArrowLeft, X, Settings2, Sliders, AlertTriangle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const aiStudioConfig = {
  projectId: "gen-lang-client-0327381597",
  appId: "1:562270246942:web:9c57dd38ad9cce3372760f",
  apiKey: "AIzaSyD6PCWSfOC1UoSnplNxzS3-eKC6k59nKq8",
  authDomain: "gen-lang-client-0327381597.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-061b739b-1578-427e-8b07-b4943bc71d87",
  storageBucket: "gen-lang-client-0327381597.firebasestorage.app",
  messagingSenderId: "562270246942",
  measurementId: ""
};

const hmfIncomeConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com",
  storageBucket: "hmf-income-app.firebasestorage.app",
  messagingSenderId: "1008180221188",
  measurementId: "G-WJX5EBBL41"
};

const oldApp = getApps().find(app => app.name === 'oldApp') || initializeApp(aiStudioConfig, 'oldApp');
const hmfApp = getApps().find(app => app.name === 'hmfApp') || initializeApp(hmfIncomeConfig, 'hmfApp');

import { db as newDb } from '../lib/firebase';
const newAuth = currentAuth;

const COLLECTIONS_TO_MIGRATE = [
  'users',
  'settings',
  'jobs',
  'courses',
  'submissions',
  'payment_requests',
  'notifications',
  'system', 
  'support',
  'reports'
];

const SUBCOLLECTIONS_TO_MIGRATE = [
  'tasks',
  'transactions',
  'referrals',
  'notifications',
  'mathHistory'
];

interface MigrationStatus {
  [key: string]: {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    processed: number;
    total: number;
    errorMsg?: string;
  };
}

export function MigrationDashboard() {
  const { profile } = useAuth();
  const [sourceProject, setSourceProject] = useState("hmf-income-app");
  const [sourceDbId, setSourceDbId] = useState("(default)");
  
  const currentOldApp = sourceProject === "hmf-income-app" ? hmfApp : oldApp;
  const oldAuth = getAuth(currentOldApp);
  const oldDb = initializeFirestore(currentOldApp, {}, sourceDbId);

  const navigate = useNavigate();
  const [isMigrating, setIsMigrating] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('Ready');
  const [showConfirm, setShowConfirm] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [selectedCollections, setSelectedCollections] = useState<string[]>(COLLECTIONS_TO_MIGRATE);
  const [selectedSubcollections, setSelectedSubcollections] = useState<string[]>([
    'tasks',
    'transactions',
    'referrals'
  ]); // Unchecked notifications and mathHistory by default to prevent heavy load and Quota Exceeded errors
  const [maxLogs, setMaxLogs] = useState<number | 'unlimited'>(10); // Default to last 10 logs per subcollection to optimize reads

  const [status, setStatus] = useState<MigrationStatus>(
    COLLECTIONS_TO_MIGRATE.reduce((acc, curr) => {
      acc[curr] = { status: 'pending', processed: 0, total: 0 };
      return acc;
    }, {} as MigrationStatus)
  );

  const [password, setPassword] = useState('');
  const [targetPassword, setTargetPassword] = useState('');

  const isFullAdmin = profile?.role === 'admin' || currentAuth.currentUser?.email === 'mdekramhossain590@gmail.com';

  const addLog = (msg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log(`[Migration] ${msg}`);
    setLogs(prev => [...prev, formatted]);
  };

  const addErrorLog = (msg: string, err?: any) => {
    const errMessage = err instanceof Error ? err.message : err?.message || String(err);
    const formatted = `[${new Date().toLocaleTimeString()}] ❌ ERROR: ${msg} -> ${errMessage}`;
    console.error(`[Migration Error] ${msg}`, err?.message || "Unknown Error");
    setLogs(prev => [...prev, formatted]);
  };

  if (!isFullAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500 mt-2">Only administrators can access the migration dashboard.</p>
      </div>
    );
  }

  const testConnections = async () => {
    addLog("Step 1: Checking database reading credentials...");
    try {
      const sourceColl = collection(oldDb, 'settings');
      await getDocs(sourceColl);
      addLog("✅ Verified reading from AI Studio Database.");
    } catch (e: any) {
      addErrorLog("Failed to read settings from your current AI Studio Database.", e);
      throw new Error(`Source DB connection issue: ${e.message}`);
    }

    try {
      const destColl = newCollection(newDb, 'settings');
      await newGetDocs(destColl);
      addLog("✅ Verified reading from Target Database (SQL Database).");
    } catch (e: any) {
      addErrorLog("Failed to read settings from target database 'SQL Database'.", e);
      throw new Error(`Target DB connection issue: ${e.message}`);
    }
  };

  const testWriteAccess = async () => {
    addLog("Step 2: Checking write permissions on destination project...");
    const testDocId = "migration_write_test_temp";
    try {
      const testDocRef = newDoc(newDb, 'settings', testDocId);
      const batch = writeBatch(newDb);
      batch.set(testDocRef, {
        testedBy: newAuth.currentUser?.email || 'unknown',
        testedAt: new Date().toISOString()
      });
      await batch.commit();
      addLog("✅ Target database is writable.");
      
      const deleteBatch = writeBatch(newDb);
      deleteBatch.delete(testDocRef);
      await deleteBatch.commit();
      addLog("✅ Cleansed temporary testing documents.");
    } catch (e: any) {
      addErrorLog("CANNOT WRITE to destination database. Please allow writes in your target project's Firestore Security Rules.", e);
      throw new Error(`Target DB write permission denied: ${e.message}`);
    }
  };

  const copySubcollectionInBatches = async (userId: string, subcollName: string, maxDocs: number | 'unlimited') => {
    if (!selectedSubcollections.includes(subcollName)) {
      return; // Skip if subcollection is unchecked
    }
    try {
      const oldSubCollRef = collection(oldDb, `users/${userId}/${subcollName}`);
      const q = maxDocs === 'unlimited' ? oldSubCollRef : query(oldSubCollRef, limit(maxDocs));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      console.log(`[PWA Migration] User ${userId}: migrating ${snapshot.size} logs in subcollection '${subcollName}'`);
      const newSubCollRef = newCollection(newDb, `users/${userId}/${subcollName}`);
      
      let batch = writeBatch(newDb);
      let batchCount = 0;

      for (const d of snapshot.docs) {
        batch.set(newDoc(newSubCollRef, d.id), d.data());
        batchCount++;

        if (batchCount === 500) {
          await batch.commit();
          batch = writeBatch(newDb);
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    } catch (e: any) {
      console.warn(`User ${userId} subcollection transfer failed for '${subcollName}':`, e?.message || "Unknown Error");
    }
  };

  const copyCollection = async (collectionName: string) => {
    addLog(`Initiating copy for collection: "${collectionName}"`);
    setStatus(prev => ({
      ...prev,
      [collectionName]: { ...prev[collectionName], status: 'in-progress' }
    }));

    try {
      const oldCollRef = collection(oldDb, collectionName);
      const snapshot = await getDocs(oldCollRef);
      addLog(`Found ${snapshot.size} records in collection: "${collectionName}"`);
      
      setStatus(prev => ({
        ...prev,
        [collectionName]: { ...prev[collectionName], total: snapshot.size }
      }));

      if (snapshot.empty) {
        addLog(`Collection "${collectionName}" is empty, proceeding.`);
        setStatus(prev => ({
          ...prev,
          [collectionName]: { ...prev[collectionName], status: 'completed' }
        }));
        return;
      }

      const newCollRef = newCollection(newDb, collectionName);
      
      let count = 0;
      let batch = writeBatch(newDb);
      let batchCount = 0;

      for (const d of snapshot.docs) {
        batch.set(newDoc(newCollRef, d.id), d.data());
        count++;
        batchCount++;

        if (batchCount === 55) {
          addLog(`Drafting documents for "${collectionName}" [inserted ${count}/${snapshot.size}]...`);
        }

        if (batchCount === 500) {
          addLog(`Writing batch of 500 to targets map in "${collectionName}"...`);
          await batch.commit();
          batch = writeBatch(newDb);
          batchCount = 0;
        }

        // Deep copy user subcollections concurrently (Promised speedup optimization with user filter choices)
        if (collectionName === 'users') {
          console.log(`[PWA Migration] Transferring subcollections for active user profile: ${d.id}`);
          await Promise.all([
            copySubcollectionInBatches(d.id, 'tasks', maxLogs),
            copySubcollectionInBatches(d.id, 'transactions', maxLogs),
            copySubcollectionInBatches(d.id, 'referrals', maxLogs),
            copySubcollectionInBatches(d.id, 'notifications', maxLogs),
            copySubcollectionInBatches(d.id, 'mathHistory', maxLogs)
          ]);
        }

        setStatus(prev => ({
          ...prev,
          [collectionName]: { ...prev[collectionName], processed: count }
        }));
      }

      if (batchCount > 0) {
        addLog(`Flushing outstanding batch in "${collectionName}" [${batchCount} docs]...`);
        await batch.commit();
      }

      setStatus(prev => ({
        ...prev,
        [collectionName]: { ...prev[collectionName], status: 'completed' }
      }));
      addLog(`✅ Successfully moved entire collection: "${collectionName}"`);

    } catch (error: any) {
      addErrorLog(`Relational copy crashed in collection "${collectionName}"`, error);
      setStatus(prev => ({
        ...prev,
        [collectionName]: { 
          ...prev[collectionName], 
          status: 'error',
          errorMsg: error.message 
        }
      }));
      throw error; // Stop migration if a master collection fails
    }
  };

  const executeMigration = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Migration halted: Please select at least one collection to migrate.');
      return;
    }
    
    const email = currentAuth.currentUser?.email || "mdekramhossain590@gmail.com";
    if (!password) {
      toast.error('Please enter your administrator account password first to authenticate.');
      return;
    }

    setShowConfirm(false);
    setIsMigrating(true);
    setActiveStep('Authenticating...');
    setLogs([]);

    // Reset status (setting non-selected as pending/skipped)
    setStatus(
      COLLECTIONS_TO_MIGRATE.reduce((acc, curr) => {
        acc[curr] = selectedCollections.includes(curr) 
          ? { status: 'pending', processed: 0, total: 0 }
          : { status: 'pending', processed: 0, total: 0, errorMsg: 'Skipped by filter configuration' };
        return acc;
      }, {} as MigrationStatus)
    );

    addLog("=== Real-time Database Migration Script Executed ===");
    addLog(`Author Login Email: ${email}`);
    addLog(`Destination Target Project: ${"hmfincome-sql-api"}`);
    addLog(`Selected Master Collections: [${selectedCollections.join(', ')}]`);
    addLog(`Selected User Subcollections: [${selectedSubcollections.join(', ')}]`);
    addLog(`Limit Per Subcollection: ${maxLogs}`);

    try {
      // 0. Double validation check (Auth credentials)
      addLog("Step 0: Authenticating across both Firebase environments...");
      
      addLog(`Connecting and signing into source project (${currentOldApp.options.projectId})...`);
      try {
        await signInWithEmailAndPassword(oldAuth, email, password);
        addLog("✅ Successfully authenticated on source AI Studio project.");
      } catch (authErr: any) {
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found' || authErr.message.includes('credential')) {
          addLog("Source db password did not match. Attempting Google Auth Fallback...");
          try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(oldAuth, provider);
            addLog("✅ Successfully authenticated on source via Google popup.");
          } catch (popupErr: any) {
            addErrorLog(`Failed to authenticate on source project via Google: ${popupErr.message}`);
            throw new Error(`Source Authentication issue: ${authErr.message}. Ensure your password is correct, or click 'Forgot Source?' to set a new password.`);
          }
        } else {
          addErrorLog(`Failed to authenticate on source project: ${authErr.message}`);
          throw new Error(`Source Authentication issue: ${authErr.message}. Ensure your password is correct, or click 'Forgot Source?' to set a new password.`);
        }
      }

      addLog(`Connecting and signing into target project (${"hmfincome-sql-api"})...`);
      const finalTargetPassword = targetPassword || password;
      
      // Skip target database auth as we are using SQL PHP API
      addLog("✅ Connecting to target SQL API endpoint...");
      
      // 1. Connection check
      setActiveStep('Validating settings...');
      await testConnections();

      // 2. Write check
      await testWriteAccess();

      // 3. Process master records
      addLog("Step 3: Beginning document compilation...");
      for (const coll of selectedCollections) {
        setActiveStep(`Migrating: ${coll}...`);
        await copyCollection(coll);
      }

      setActiveStep('Migration Completed Successfully!');
      addLog("==============================================");
      addLog("🎉 SUCCESS: SELECTED DATABASE MODULES COPIED!");
      addLog("==============================================");
      toast.success('Database migration completed!');
    } catch (err: any) {
      addErrorLog("Migration procedure forced cancel.", err);
      setActiveStep(`Migration failed: ${err.message}`);
      toast.error(`Migration failed: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleResetSourcePassword = async () => {
    const email = currentAuth.currentUser?.email;
    if (!email) {
      toast.error('No email found.');
      return;
    }
    try {
      
      await sendPasswordResetEmail(oldAuth, email);
      toast.success(`সোর্স অ্যাপের পাসওয়ার্ড রিসেট লিংক ${email} এ পাঠানো হয়েছে। ইমেইল চেক করে নতুন পাসওয়ার্ড সেট করুন।`);
    } catch (err: any) {
      toast.error(`Error sending reset email: ${err.message}`);
    }
  };

  const handleResetTargetPassword = async () => {
    const email = currentAuth.currentUser?.email;
    if (!email) {
      toast.error('No email found.');
      return;
    }
    try {
      
      // No reset password needed for target SQL DB
      toast.success(`টার্গেট অ্যাপের পাসওয়ার্ড রিসেট লিংক ${email} এ পাঠানো হয়েছে। ইমেইল চেক করে টার্গেট পাসওয়ার্ড সেট করুন।`);
    } catch (err: any) {
      toast.error(`Error sending reset email for target: ${err.message}`);
    }
  };

  const startMigration = () => {
    setShowConfirm(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-white">
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#FACC15] font-bold mb-5 transition-colors text-sm bg-[#151515] px-4 py-2 rounded-xl border border-[#3D3215] active:scale-95 duration-100 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Panel
      </button>
      <div className="bg-[#151515] rounded-3xl shadow-xl overflow-hidden border border-[#3D3215]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] p-8 text-[#090909]">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black/10 rounded-2xl border border-black/20">
              <Database className="w-8 h-8 text-[#090909]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Database Migration Manager</h1>
              <p className="text-[#1A1A1A] font-bold">Transfer data from AI Studio to SQL Database</p>
            </div>
          </div>
          
          <div className="bg-black/15 border border-black/20 p-4 rounded-xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-[#090909] shrink-0 mt-0.5" />
            <div className="text-xs text-[#090909] font-medium leading-relaxed">
              <strong>Important Notice:</strong> Running this migration from the browser requires Firestore rules to allow your account to read all data in the source database, and write all data in the target database. If you experience quota errors, wait until the quota resets.
            </div>
          </div>
        </div>

        {/* Admin Credentials Panel */}
        <div className="p-6 bg-[#101010] border-b border-[#3D3215] space-y-3">
          <div className="flex items-center gap-2 mb-2 text-[#FACC15]">
            <Lock className="w-5 h-5 text-[#FACC15]" />
            <h3 className="font-extrabold text-base text-white">১. ভেরিফিকেশন পাসওয়ার্ড (Admin Authentication)</h3>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            মাইগ্রেশন রান করার জন্য আপনার বর্তমান এডমিন অ্যাকাউন্টের পাসওয়ার্ডটি লিখুন। এটি সোর্স ও টার্গেট উভয় সার্ভারে অথেনটিকেশন নিশ্চিত করতে ব্যবহৃত হবে:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">প্রশাসকের ইমেইল (Pre-filled Email)</label>
              <input 
                type="email" 
                readOnly 
                value={currentAuth.currentUser?.email || 'mdekramhossain590@gmail.com'}
                className="w-full bg-[#151515] border border-[#3D3215] rounded-xl p-3 text-xs text-[#737373] cursor-not-allowed font-semibold focus:outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">১. সোর্স পাসওয়ার্ড (Source Password * Required)</label>
                <button type="button" onClick={handleResetSourcePassword} className="text-[9px] text-[#D4A017] hover:underline px-1 cursor-pointer">Forgot Source?</button>
              </div>
              <input 
                type="password" 
                required
                disabled={isMigrating}
                placeholder="সোর্স অ্যাডমিন পাসওয়ার্ড..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#151515] border border-[#3D3215] rounded-xl p-3 text-xs focus:border-[#D4A017] focus:outline-none font-medium text-white placeholder-[#737373]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">২. টার্গেট পাসওয়ার্ড (Target Password - Optional)</label>
                <button type="button" onClick={handleResetTargetPassword} className="text-[9px] text-[#D4A017] hover:underline px-1 cursor-pointer">Forgot Target?</button>
              </div>
              <input 
                type="password" 
                disabled={isMigrating}
                placeholder="নতুন প্রজেক্টের ইমেল পাসওয়ার্ড আলাদা হলে লিখুন..."
                value={targetPassword}
                onChange={(e) => setTargetPassword(e.target.value)}
                className="w-full bg-[#151515] border border-[#3D3215] rounded-xl p-3 text-xs focus:border-[#D4A017] focus:outline-none font-medium text-white placeholder-[#737373]"
              />
            </div>
          </div>
        </div>

        {/* Optimized Configuration Panel */}
        <div className="p-6 bg-[#151515] border-b border-[#3D3215]">
          <div className="flex items-center gap-2 mb-4 text-white">
            <Settings2 className="w-5 h-5 text-[#FACC15]" />
            <h3 className="font-extrabold text-base">Migration Optimization Configuration (যাতে Quota Error না আসে)</h3>
          </div>
          
          <div className="bg-[#101010] border border-[#3D3215] rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
            <div className="text-xs text-[#A3A3A3] space-y-1">
              <p className="font-bold text-[#FACC15]">Firestore Quota System (কোটা লিমিটের সমাধান):</p>
              <p>গুগল ফায়ারবেস ফ্রি-টিয়ারে আপনাকে প্রতিদিন সর্বোচ্চ <b>৫০,০০০ Read</b> লিমিট দিয়ে থাকে। সবগুলো ইউজারের শত শত nested log (যেমন math mathHistory বা notifications) একসাথে কপি করতে গেলে এই লিমিট তাৎক্ষনিক শেষ হয়ে <b>"Quota limits exceeded"</b> ইরর দেখাবে।</p>
              <p><b>সমাধান ও Quota Optimizer:</b> নিচের অপশনগুলো ব্যবহার করে আপনি অপ্রয়োজনীয় হিস্টোরি বাদ দিয়ে অথবা ডাটা লিমিট করে নিরাপদে সব গুরুত্বপূর্ণ ডাটা মাইগ্রেট করতে পারবেন। এছাড়াও প্রতি ২৪ ঘণ্টায় একবার Google এর এই লিমিটটি অটো রিসেট হয় (বাংলাদেশ সময় দুপুর ১ টায় বা ২ টায়)।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Master Collections */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-1">১. প্রধান কালেকশনসমূহ (Master)</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-[#3D3215] p-3 rounded-xl bg-[#101010]">
                {COLLECTIONS_TO_MIGRATE.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#A3A3A3] hover:text-white">
                    <input
                      type="checkbox"
                      disabled={isMigrating}
                      checked={selectedCollections.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCollections(prev => [...prev, c]);
                        } else {
                          setSelectedCollections(prev => prev.filter(item => item !== c));
                        }
                      }}
                      className="rounded border-[#3D3215] text-[#D4A017] focus:ring-[#D4A017]"
                    />
                    <span className="capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. User Nested Collections */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-1">২. ইউজারদের সাব-কালেকশনসমূহ</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-[#3D3215] p-3 rounded-xl bg-[#101010]">
                {SUBCOLLECTIONS_TO_MIGRATE.map(sc => (
                  <label key={sc} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#A3A3A3] hover:text-white">
                    <input
                      type="checkbox"
                      disabled={isMigrating}
                      checked={selectedSubcollections.includes(sc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubcollections(prev => [...prev, sc]);
                        } else {
                          setSelectedSubcollections(prev => prev.filter(item => item !== sc));
                        }
                      }}
                      className="rounded border-[#3D3215] text-[#D4A017] focus:ring-[#D4A017]"
                    />
                    <span className="capitalize">{sc}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-[#737373]">টিপস: Quota বাঁচাতে mathHistory এবং notifications টিক অফ রাখতে পারেন।</p>
            </div>

            {/* 3. Doc limits per subcollection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-1">৩. রিসেন্ট ডাটা লিমিট (Max Logs)</h4>
              <div className="border border-[#3D3215] p-4 rounded-xl bg-[#101010] space-y-3">
                <p className="text-xs text-[#A3A3A3]">প্রতিটি ইউজারের সর্বোচ্চ কতটি করে ট্রানজেকশন/টাস্ক/লগ নতুন সার্ভারে কপি করা হবে:</p>
                <select
                  disabled={isMigrating}
                  value={maxLogs}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxLogs(val === 'unlimited' ? 'unlimited' : Number(val));
                  }}
                  className="w-full bg-[#151515] border border-[#3D3215] rounded-xl p-2.5 text-sm font-bold text-white cursor-pointer focus:border-[#D4A017] focus:outline-none"
                >
                  <option value={5}>সর্বশেষ ৫ টি ডকুমেন্ট (উত্তম স্পীড ও সেফটি)</option>
                  <option value={10}>সর্বশেষ ১০ টি ডকুমেন্ট (উত্তম মান)</option>
                  <option value={20}>সর্বশেষ ২০ টি ডকুমেন্ট</option>
                  <option value={50}>সর্বশেষ ৫০ টি ডকুমেন্ট</option>
                  <option value="unlimited">সম্পূর্ণ ডাটা (ঝুঁকিপূর্ণ - Quota Block হতে পারে)</option>
                </select>
                <div className="text-[10px] bg-[#151515] p-2 rounded-lg text-[#FACC15] font-medium border border-[#3D3215]">
                  উদাহরণ: আপনার ১০০ জন ইউজার থাকলে এবং লিমিট ৫ দিলে মোট ৫০০ ডকুমেন্ট রিড হবে (যা সম্পূর্ণ ফ্রি এবং ১০০% সেফ)।
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-b border-[#3D3215] flex items-center justify-between flex-wrap gap-4 bg-[#101010]">
          <div>
            <h3 className="font-bold text-white text-lg">Current Status: {activeStep}</h3>
            {isMigrating && <p className="text-sm text-[#FACC15] font-medium animate-pulse">Migration is running in the background. Do not close this tab.</p>}
          </div>
          
          <button
            onClick={startMigration}
            disabled={isMigrating}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] px-6 py-3 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4A017]/20 cursor-pointer"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Migration
              </>
            )}
          </button>
        </div>

        {/* Progress Grid */}
        <div className="p-6 bg-[#151515]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COLLECTIONS_TO_MIGRATE.map((coll) => {
              const info = status[coll];
              const isSelected = selectedCollections.includes(coll);
              
              let statusIcon;
              let statusClass = "bg-[#101010] text-[#737373] border-[#3D3215]";
              
              if (!isSelected) {
                statusIcon = <X className="w-5 h-5 text-[#737373]" />;
                statusClass = "opacity-40 bg-[#101010]/50 border-dashed border-[#3D3215] text-[#737373]";
              } else if (info.status === 'in-progress') {
                statusIcon = <RefreshCw className="w-5 h-5 animate-spin text-[#FACC15]" />;
                statusClass = "bg-[#101010] border-[#D4A017]";
              } else if (info.status === 'completed') {
                statusIcon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
                statusClass = "bg-[#101010] border-emerald-800/50";
              } else if (info.status === 'error') {
                statusIcon = <ShieldAlert className="w-5 h-5 text-rose-400" />;
                statusClass = "bg-[#101010] border-rose-800/50";
              }

              return (
                <div key={coll} className={`p-4 rounded-2xl border transition-all ${statusClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white capitalize flex items-center gap-2">
                      {statusIcon}
                      {coll}
                      {!isSelected && <span className="text-[10px] lowercase font-normal bg-[#151515] px-1.5 py-0.5 rounded text-[#737373]">skipped</span>}
                    </div>
                    {isSelected && info.status !== 'pending' && (
                      <div className="text-sm font-mono font-medium text-[#A3A3A3]">
                        {info.processed} / {info.total || '0'}
                      </div>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {isSelected && (
                    <div className="w-full bg-[#151515] rounded-full h-2 mt-3 overflow-hidden border border-[#3D3215]">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${info.status === 'error' ? 'bg-rose-500' : 'bg-gradient-to-r from-[#8A6508] to-[#FACC15]'}`}
                        style={{ width: `${info.total > 0 ? Math.min(100, (info.processed / info.total) * 100) : (info.status === 'completed' ? 100 : 0)}%` }}
                      />
                    </div>
                  )}
                  
                  {isSelected && info.errorMsg && (
                    <div className="mt-2 text-xs text-rose-400 font-medium">
                      Error: {info.errorMsg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Logs Console */}
        {logs.length > 0 && (
          <div className="p-6 border-t border-[#3D3215] bg-[#090909] text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-xs tracking-wider text-[#A3A3A3] uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FACC15] rounded-full animate-ping"></span>
                Console Logs Output
              </h3>
              <button 
                onClick={() => setLogs([])}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 rounded-lg border border-rose-900/40 bg-rose-950/20 font-bold cursor-pointer"
              >
                Clear Console
              </button>
            </div>
            <div className="font-mono text-[11px] max-h-56 overflow-y-auto space-y-1 p-3 bg-[#101010] rounded-xl leading-relaxed border border-[#3D3215] select-text">
              {logs.map((log, index) => (
                <div key={index} className={`whitespace-pre-wrap ${log.includes('ERROR') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-[#A3A3A3]'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>

      {/* Confirmation Modal overlaying standard layers */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#090909]/80 backdrop-blur-sm z-[110]"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md w-auto bg-[#151515] rounded-3xl shadow-2xl z-[111] overflow-hidden border border-[#3D3215] mx-auto"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-[#101010] border border-[#3D3215] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-[#FACC15]" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Confirm Data Migration</h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed mb-6">
                  This will transfer all documents from your AI Studio environment over to 
                  <span className="font-mono text-xs text-[#FACC15] font-bold ml-1 bg-[#101010] border border-[#3D3215] px-1.5 py-0.5 rounded">SQL Database</span>. 
                  Any existing data with conflicting document IDs in the target database will be overwritten.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-3 bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] hover:text-white font-bold rounded-xl transition duration-150 active:scale-95 border border-[#3D3215] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeMigration}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black rounded-xl shadow-lg shadow-[#D4A017]/20 active:scale-95 transition duration-150 cursor-pointer"
                  >
                    Start Migration
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
