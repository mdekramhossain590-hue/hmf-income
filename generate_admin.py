# python script to write Admin.tsx
content = """import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Shield, Users, DollarSign, Settings, Lock, CheckCircle, XCircle, Search, Gift, MonitorPlay, Briefcase, FileText, Smartphone, HardDrive, GraduationCap } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'requests' | 'jobs' | 'submissions' | 'drives' | 'courses' | 'gifts' | 'settings'>('dashboard');
  
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [siteConfig, setSiteConfig] = useState<any>({});
  
  const isAdminUser = profile?.role === 'admin' || profile?.role === 'employee' || user?.email === 'mdekramhossain590@gmail.com';

  useEffect(() => {
    if (!user) return;
    if (!isAdminUser) {
      navigate('/');
    }
  }, [user, profile, navigate, isAdminUser]);

  useEffect(() => {
    if (!isAdminUser) return;
    const unsubs: any[] = [];
    
    if (activeTab === 'users') {
      unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(500)), (snap) => {
        setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'requests' || activeTab === 'dashboard') {
      unsubs.push(onSnapshot(query(collection(db, "payment_requests"), orderBy("createdAt", "desc"), limit(500)), (snap) => {
        setRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'jobs') {
      unsubs.push(onSnapshot(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(200)), (snap) => {
        setJobs(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'submissions') {
      unsubs.push(onSnapshot(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(200)), (snap) => {
        setSubmissions(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'drives') {
      unsubs.push(onSnapshot(query(collection(db, "drive_offers"), limit(100)), (snap) => {
        setDrives(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'courses') {
      unsubs.push(onSnapshot(query(collection(db, "courses"), limit(100)), (snap) => {
        setCourses(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'gifts') {
      unsubs.push(onSnapshot(query(collection(db, "giftCodes"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setGifts(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }));
    } else if (activeTab === 'settings') {
      const loadSettings = async () => {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (snap.exists()) setSiteConfig(snap.data());
      };
      loadSettings();
    }

    return () => unsubs.forEach(u => u());
  }, [activeTab, isAdminUser]);

  const handleApproveRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, "payment_requests", req.id), { status: 'approved' });
      toast.success("Payment approved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRejectRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, "payment_requests", req.id), { status: 'rejected' });
      toast.success("Payment rejected.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        "balances.main": Number(editingUser.balances?.main || 0),
        "balances.bonus": Number(editingUser.balances?.bonus || 0),
        "balances.referral": Number(editingUser.balances?.referral || 0),
        "balances.partner": Number(editingUser.balances?.partner || 0),
        "balances.tasks": Number(editingUser.balances?.tasks || 0)
      });
      await setDoc(doc(db, "leaderboard", editingUser.id), {
        totalIncome: Number(editingUser.balances?.main || 0) + Number(editingUser.balances?.bonus || 0) + Number(editingUser.balances?.referral || 0) + Number(editingUser.balances?.partner || 0) + Number(editingUser.balances?.tasks || 0)
      }, { merge: true });
      toast.success("Balances updated!");
      setEditingUser(null);
    } catch(err: any) {
      toast.error(err.message);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: changingPasswordUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      toast.success(`Password updated successfully!`);
      setChangingPasswordUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAdminUser) return null;

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.includes(searchTerm)
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Payments', icon: DollarSign },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'drives', label: 'Drive Offers', icon: HardDrive },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'gifts', label: 'Gift Codes', icon: Gift },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 pt-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-800 rounded-[32px] p-4 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
          <div className="flex items-center gap-3 px-2 mb-6 mt-2">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Admin<br/>Panel</h2>
          </div>
          <div className="flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[500px]">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Dashboard Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Requests</p>
                    <p className="text-3xl font-black text-indigo-900 dark:text-indigo-100">{requests.length}</p>
                  </div>
                  {/* Add more stats here as needed */}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Payment Requests</h3>
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                            {req.status}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{new Date(req.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                        </div>
                        <p className="font-black text-slate-800 dark:text-white text-lg">৳{req.amount} via {req.method}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{req.account} • {req.email}</p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveRequest(req)} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button onClick={() => handleRejectRequest(req)} className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-10 text-slate-500 font-medium">No payment requests found.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Manage Users</h3>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or ID..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-lg">{u.fullName || 'Unknown'}</p>
                        <p className="text-sm font-medium text-slate-500">{u.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">Main: ৳{u.balances?.main || 0}</span>
                          <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">Bonus: ৳{u.balances?.bonus || 0}</span>
                          <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">Tasks: ৳{u.balances?.tasks || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser(u)} className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl font-bold transition-all text-sm">
                          Edit Balances
                        </button>
                        <button onClick={() => setChangingPasswordUser(u)} className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl transition-all" title="Change Password">
                          <Lock className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {['jobs', 'submissions', 'drives', 'courses', 'gifts', 'settings'].includes(activeTab) && (
              <div className="text-center py-20 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Section Accessible</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">This section is available in the database but currently uses the default view in the restored panel.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-4 dark:text-white uppercase tracking-tight">Edit Balances</h3>
            <p className="text-sm text-slate-500 mb-4 font-medium">{editingUser.fullName}</p>
            <form onSubmit={saveUserBalance} className="space-y-4">
              {['main', 'bonus', 'referral', 'partner', 'tasks'].map(type => (
                <div key={type}>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest pl-1">{type} Balance</label>
                  <input 
                    type="number" step="0.01" 
                    value={editingUser.balances?.[type] ?? ''} 
                    onChange={(e) => setEditingUser({...editingUser, balances: {...(editingUser.balances || {}), [type]: parseFloat(e.target.value) || 0}})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" 
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider text-xs transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-4 dark:text-white uppercase tracking-tight">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Set a new password for <strong>{changingPasswordUser.fullName}</strong>.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest pl-1">New Password</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setChangingPasswordUser(null); setNewPassword(''); }} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider text-xs transition-colors">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95">
                  {isChangingPassword ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
