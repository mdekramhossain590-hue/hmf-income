import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { ArrowLeft, BookOpen, Search, Play, ExternalLink, Sparkles, HelpCircle, Layers, CheckCircle2, ChevronRight, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export interface TutorialItem {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoLink: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoLink: string;
  category: 'টাস্ক কমপ্লিট' | 'টাকা উইথড্র' | 'অন্যান্য';
  status: 'active' | 'inactive';
  items?: TutorialItem[];
}

const DEFAULT_COURSES: Omit<Course, 'id'>[] = [
  {
    title: "নিয়ম মেনে প্রতিদিনের কাজ সম্পন্ন করার গাইডলাইন",
    description: "আমাদের অ্যাপে দেওয়া প্রতিদিনের টাস্ক বা কাজগুলো কিভাবে সঠিক নিয়মে সম্পন্ন করবেন, কোন কোন ভুলগুলো পরিহার করবেন এবং সঠিক উপায়ে আর্নিং ব্যালেন্স যোগ করবেন তা বিস্তারিত দেখুন। ভুল নিয়মে কাজ করলে আইডি ব্লক হতে পারে।",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    category: "টাস্ক কমপ্লিট",
    status: 'active'
  },
  {
    title: "বিকাশ ও নগদে সফলভাবে উইথড্র বা টাকা তোলার নিয়ম",
    description: "বিকাশ, নগদ বা রকেটের মাধ্যমে কিভাবে সফলভাবে আপনার কষ্টার্জিত টাকা মাত্র ১ মিনিটে উইথড্র নিবেন তা ধাপে ধাপে শিখুন। পেমেন্ট রিকুয়েস্ট দেওয়ার পর এডমিন লাইংথ অনুযায়ী কতক্ষণে টাকা পাবেন তা জানুন।",
    thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    category: "টাকা উইথড্র",
    status: 'active'
  },
  {
    title: "ডেইলি স্পিন ও কুইজ গেম খেলে আনলিমিটেড আয়ের উপায়",
    description: "প্লাটফর্মে প্রতিদিন কোনো লিমিট ছাড়া কিভাবে আনলিমিটেড স্পিন এবং সহজ ম্যাথ কুইজ সমাধান করে অতিরিক্ত রিওয়ার্ড আর্ন করবেন তার পূর্ণাঙ্গ সিক্রেট নিয়মাবলি।",
    thumbnailUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    category: "অন্যান্য",
    status: 'active'
  },
  {
    title: "রেফারেল কমিশন বাড়াতে গ্রুপ ও সোশ্যাল মিডিয়া ট্রিকস",
    description: "আপনার বন্ধুদেরকে রেফার করে এবং বিভিন্ন ফেসবুক-টেলিগ্রাম গ্রুপে আপনার রেফার লিংক শেয়ার করে প্রতিদিন কিভাবে অতিরিক্ত ১০০০ টাকা পর্যন্ত রেফারেল কমিশন আয় করবেন তা বিস্তারিত ভিডিও গাইড।",
    thumbnailUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=600&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    category: "অন্যান্য",
    status: 'active'
  }
];

export function Courses() {
  const { profile, siteSettings } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'টাস্ক কমপ্লিট' | 'টাকা উইথড্র' | 'অন্যান্য'>('all');

  // Active watching state (popup description or video player)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (siteSettings?.coursesEnabled === false) {
      toast.error("দুঃখিত, কোর্স সেশনটি এডমিন দ্বারা সাময়িকভাবে বন্ধ আছে।");
      navigate('/');
    }
  }, [siteSettings, navigate]);

  useEffect(() => {
    // Only fetch courses once we verify the user session exists to prevent permission errors
    let isMounted = true;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        if (!isMounted) return;
        const list: Course[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.status === 'active') {
            list.push({ id: docSnap.id, ...data } as Course);
          }
        });
        setCourses(list);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCourses();
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubAuth();
    };
  }, []);

  const handleImportSampleCourses = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      DEFAULT_COURSES.forEach((cItem, idx) => {
        const id = `course_${idx + Date.now()}`;
        const ref = doc(db, "courses", id);
        batch.set(ref, cItem);
      });
      await batch.commit();
      toast.success("নমুনা টিউটোরিয়াল ও কোর্সগুলো সফলভাবে যুক্ত হয়েছে!");
    } catch (err: any) {
      toast.error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      handleFirestoreError(err, OperationType.WRITE, 'courses');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search & category
  const filteredCourses = courses.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32">
      {/* Dynamic Glassy Header */}
      <div className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800/60 px-4 py-4 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-base font-black tracking-tight font-display flex items-center justify-center gap-1.5 uppercase leading-none">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              কোর্স ও হেল্প সেন্টার
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">LEARN & EARN TUTORIALS</p>
          </div>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Hero Welcome banner inside limit container */}
      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-650 to-indigo-800 rounded-[28px] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10 dark:shadow-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-lg"></div>
          
          <div className="flex items-center gap-2 mb-2 bg-white/10 dark:bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-[9px] font-black tracking-wider uppercase">Official Training Gide</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-tight">
            সহজ গাইডলাইন শিখে <br/>দ্বিগুণ আর্নিং করুন!
          </h2>
          <p className="text-[11px] text-indigo-100 font-medium leading-relaxed mt-2">
            কিভাবে নির্ভুল উপায়ে কাজ সম্পন্ন করবেন, কিভাবে দ্রুত পেমেন্ট হাতে পাবেন তা আমাদের মাল্টিপল ভিডিও টিউটোরিয়ালগুলোর মাধ্যমে ক্লিয়ার হয়ে নিন।
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="সার্চ করুন (টাস্ক, উইথড্র, কমিশন...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-none pl-12 pr-4 py-3.5 rounded-2xl text-xs font-semibold ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm focus:ring-2 focus:ring-purple-555 transition-all outline-none text-slate-800 dark:text-white dark:placeholder-slate-500" 
          />
        </div>

        {/* Categories Tab list */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide select-none -mx-4 px-4">
          {[
            { id: 'all', label: 'সকল টিউটোরিয়াল', icon: Layers },
            { id: 'টাস্ক কমপ্লিট', label: 'টাস্ক কমপ্লিট', icon: CheckCircle2 },
            { id: 'টাকা উইথড্র', label: 'টাকা উইথড্র', icon: Video },
            { id: 'অন্যান্য', label: 'অন্যান্য হেল্প', icon: HelpCircle }
          ].map((tab) => {
            const IsActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 border
                  ${IsActive 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/15' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50'
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Courses & Tutorials list */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-250 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-405 text-xs font-black uppercase tracking-wider">টপিকগুলো লোড হচ্ছে...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-1.5 leading-relaxed">
              অনুসন্ধান মেলেনি বা এখনো কোনো টিউটোরিয়াল আপডেট করা হয়নি।
            </p>
            {profile?.role === 'admin' && courses.length === 0 && (
              <button 
                onClick={handleImportSampleCourses}
                className="mt-5 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-550 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg shadow-purple-600/10 transition-all"
              >
                নমুনা কোর্সসমূহ ইম্পোর্ট করুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="wait">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Thumbnail Cover image container with play badge button */}
                  <div className="aspect-video w-full relative overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-50 dark:border-slate-900">
                    <img 
                      src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent p-4 flex justify-between items-end">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-600/90 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {course.category}
                      </span>
                    </div>
                    
                    {/* Play floating action button over center */}
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="absolute inset-0 m-auto w-12 h-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Body textual content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 mb-4">
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 hover:dark:bg-slate-800/80 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest border border-slate-100/40 dark:border-slate-800/50 transition-all flex items-center justify-center gap-1"
                      >
                        বিস্তারিত পড়ুন
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      
                      {course.videoLink && (
                        <a 
                          href={course.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 rounded-xl bg-purple-600 hover:bg-purple-550 text-white flex items-center justify-center shadow-md shadow-purple-600/10 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Course Detail Modal Dialog description info */}
      <AnimatePresence>
        {selectedCourse && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="fixed inset-0 bg-slate-950/75 z-55 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-white dark:bg-slate-900 rounded-[30px] overflow-hidden shadow-2xl z-55 border border-slate-100 dark:border-slate-800/80"
            >
              {/* Cover cover frame layout */}
              <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
                <img 
                  src={selectedCourse.thumbnailUrl} 
                  alt={selectedCourse.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating watch action overlay */}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <a 
                    href={selectedCourse.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg active:scale-95 hover:scale-105 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-purple-600" />
                    ভিডিও টিউটোরিয়াল দেখুন
                  </a>
                </div>
              </div>

              {/* textual layout sheets list */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100/30 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {selectedCourse.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-snug pt-1.5">
                    {selectedCourse.title}
                  </h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-350 text-xs sm:text-[13px] leading-relaxed font-semibold max-h-[140px] overflow-y-auto">
                  {selectedCourse.description}
                </div>

                {/* Multiple custom sub-tutorials/options inside the Course */}
                {selectedCourse.items && selectedCourse.items.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      আলাদা আলাদা অপশন / বিষয়সমূহ ({selectedCourse.items.length})
                    </h4>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedCourse.items.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className="bg-slate-55/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/80 flex items-start gap-2.5 hover:border-purple-300 dark:hover:border-purple-900 transition-all"
                        >
                          <img 
                            src={opt.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                            alt="" 
                            className="w-14 h-10 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200/40 dark:border-slate-850"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-150 line-clamp-1 leading-normal">{opt.title}</h5>
                            <p className="text-[9px] text-slate-400 font-bold line-clamp-2 mt-0.5 leading-relaxed">{opt.description}</p>
                            {opt.videoLink && (
                              <a 
                                href={opt.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400 hover:underline mt-1 uppercase"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                প্লে ভিডিও বা লিংক
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {selectedCourse.videoLink && (
                    <a 
                      href={selectedCourse.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-[18px] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/10 bg-purple-600 hover:bg-purple-550 transition-all text-center flex items-center justify-center gap-1"
                    >
                      টিউটোরিয়াল ভিডিও লিংক (Link)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="w-full py-3 rounded-[16px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-700 hover:dark:text-slate-300 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    ডায়ালগ উইন্ডো অফ করুন
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
