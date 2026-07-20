import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Image,
  UploadCloud,
  Loader2,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Lock,
  Copy,
  Key,
  Star,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from "../lib/firebase";
import { getCachedDoc, getCachedQuery } from "../lib/cache";
import { FullPageLoader } from "../components/LoadingSpinner";
import { uploadImageOrFallback } from "../lib/imageUpload";
import toast from "react-hot-toast";

import { Celebration } from "../components/Celebration";

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { siteSettings } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [proofText, setProofText] = useState("");
  const [proofImage, setProofImage] = useState(""); // Stores URL if pasted
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [has2FA, setHas2FA] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedComment, setSelectedComment] = useState("");

  const rotateComment = () => {
    if (job && job.reviewComments && job.reviewComments.length > 0) {
      const remainingComments = job.reviewComments.filter((c: string) => c !== selectedComment);
      const list = remainingComments.length > 0 ? remainingComments : job.reviewComments;
      const randomIndex = Math.floor(Math.random() * list.length);
      setSelectedComment(list[randomIndex]);
      toast.success("নতুন কমেন্ট লোড হয়েছে!");
    } else {
      const defaultComments = [
        "খুব সুন্দর এবং দ্রুত সার্ভিস, আমি অনেক সন্তুষ্ট।",
        "Highly recommended! Very professional and cooperative.",
        "তাদের ব্যবহার এবং কাজের মান অসাধারণ।",
        "Excellent customer service. Truly appreciate their effort.",
        "অল্প সময়ে অনেক ভালো সেবা পেয়েছি, ধন্যবাদ।"
      ];
      const remainingComments = defaultComments.filter((c: string) => c !== selectedComment);
      const list = remainingComments.length > 0 ? remainingComments : defaultComments;
      const randomIndex = Math.floor(Math.random() * list.length);
      setSelectedComment(list[randomIndex]);
      toast.success("নতুন কমেন্ট লোড হয়েছে!");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(
          "Image must be smaller than 5MB. Please choose a smaller file.",
        );
        return;
      }
      setErrorMsg(null);
      setProofFile(file);
      setProofImage(""); // Clear URL if file is selected
      const reader = new FileReader();
      reader.onerror = () => { console.error("FileReader error", reader.error); };
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProofFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const fetchJobAndSubmission = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const jobData = { id: docSnap.id, ...docSnap.data() } as any;
          setJob(jobData);
          if (jobData.type === "Review") {
            if (jobData.reviewComments && jobData.reviewComments.length > 0) {
              const randomIndex = Math.floor(Math.random() * jobData.reviewComments.length);
              setSelectedComment(jobData.reviewComments[randomIndex]);
            } else {
              const defaultComments = [
                "খুব সুন্দর এবং দ্রুত সার্ভিস, আমি অনেক সন্তুষ্ট।",
                "Highly recommended! Very professional and cooperative.",
                "তাদের ব্যবহার এবং কাজের মান অসাধারণ।",
                "Excellent customer service. Truly appreciate their effort.",
                "অল্প সময়ে অনেক ভালো সেবা পেয়েছি, ধন্যবাদ।"
              ];
              const randomIndex = Math.floor(Math.random() * defaultComments.length);
              setSelectedComment(defaultComments[randomIndex]);
            }
          }
        }

        // Temporary workaround to avoid index requirement
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser?.uid || "")
        );
        const subSnap = await getDocs(q);
        
        const filteredDocs = subSnap.docs.filter((doc) => doc.data().jobId === id);
        
        // Sort to get the most recent one
        filteredDocs.sort((a, b) => {
          const tA = a.data().submittedAt?.toMillis ? a.data().submittedAt.toMillis() : 0;
          const tB = b.data().submittedAt?.toMillis ? b.data().submittedAt.toMillis() : 0;
          return tB - tA;
        });

        // Only count active ones towards the user limit
        const activeDocs = filteredDocs.filter((doc) => doc.data().status !== 'rejected');
        setSubmissionCount(activeDocs.length);
        
        if (filteredDocs.length > 0) {
          setPreviousSubmission({
            id: filteredDocs[0].id,
            ...filteredDocs[0].data(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `jobs/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndSubmission();
  }, [id]);

  if (loading) return <FullPageLoader />;
  if (!job)
    return (
      <div className="p-10 text-center text-gray-500">
        Task not found or unavailable
      </div>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (previousSubmission && previousSubmission.status === 'pending') {
      toast.error("You already have a pending submission for this task.");
      return;
    }

    // Check per-job user limit
    if (job.userLimit && job.userLimit > 0) {
      if (submissionCount >= job.userLimit) {
        toast.error(
          `You have already completed this task ${submissionCount} time(s). Limit is ${job.userLimit}.`,
        );
        return;
      }
    }

    // Check daily task limit (site-wide)
    if (siteSettings.dailyTaskLimit && siteSettings.dailyTaskLimit > 0) {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const dailyQuery = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser.uid)
        );
        const dailySnap = await getDocs(dailyQuery);
        const recentCount = dailySnap.docs.filter(d => {
          const t = d.data().submittedAt;
          const time = t?.toMillis ? t.toMillis() : (t?.seconds ? t.seconds * 1000 : 0);
          return time >= twentyFourHoursAgo.getTime();
        }).length;
        if (recentCount >= siteSettings.dailyTaskLimit) {
          toast.error(
            `Daily task limit reached (${siteSettings.dailyTaskLimit}). Please try again later.`,
          );
          return;
        }
      } catch (err) {
        console.error("Error checking daily limit:", err);
      }
    }

    // Specific input validation
    if (!job.isAccountSell) {
      if (job.requiredProofs?.includes("text") && proofText.trim().length < 10) {
        toast.error("Text proof must be at least 10 characters long.");
        return;
      }

      if (
        job.requiredProofs?.includes("videoUrl") &&
        !/^https?:\/\/.+/.test(videoUrl)
      ) {
        toast.error(
          "Please provide a valid URL for the video (starting with http:// or https://).",
        );
        return;
      }
    }

    if (
      (job.requiredProofs?.includes("username") || job.isAccountSell) &&
      username.trim().length < 3
    ) {
      toast.error("Please provide a valid username.");
      return;
    }

    if (
      (job.requiredProofs?.includes("password") || job.isAccountSell) &&
      password.trim().length <= 0
    ) {
      toast.error("Please provide the account password.");
      return;
    }

    if (
      (job.isAccountSell || job.requiredProofs?.includes("password") || job.requiredProofs?.includes("2facode")) &&
      has2FA &&
      twoFactorCode.trim().length <= 0
    ) {
      toast.error("Please provide the 2FA Code/Recovery Key or disable it.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      let finalImageUrl = proofImage;

      // Handle Image Upload if file is selected
      if (job.requiredProofs?.includes("screenshot") && proofFile) {
        finalImageUrl = await uploadImageOrFallback(proofFile, 600, (p) =>
          setUploadProgress(p),
        );
      }

      const proofs: any = {};

      if (job.requiredProofs?.includes("text")) proofs.text = proofText;
      if (job.requiredProofs?.includes("screenshot"))
        proofs.screenshot = finalImageUrl;
      if (job.requiredProofs?.includes("username") || job.isAccountSell)
        proofs.username = username;
      if (job.requiredProofs?.includes("password") || job.isAccountSell)
        proofs.password = password;
      if (
        (job.isAccountSell || job.requiredProofs?.includes("password") || job.requiredProofs?.includes("2facode")) &&
        has2FA
      )
        proofs.twoFactorCode = twoFactorCode;
      if (job.requiredProofs?.includes("videoUrl")) proofs.videoUrl = videoUrl;

      const subRef = doc(collection(db, "submissions"));

      const subData = {
        jobId: job.id,
        userId: auth.currentUser?.uid || "",
        userEmail: (auth.currentUser?.email || "Unknown").slice(0, 150),
        title: (job.title || "Untitled Task").slice(0, 150),
        jobType: (job.type || "Other").slice(0, 50),
        reward: Number(job.reward) || 0,
        proofs: proofs,
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      await setDoc(subRef, subData);

      setPreviousSubmission(subData);
      setShowSubmitForm(false);
      setShowConfirmModal(false);
      setShowCelebration(true);
      toast.success("Task submitted successfully!");
      // Wait for celebration to end before we navigate away or reload
    } catch (e: any) {
      console.error(e);
      let errorText =
        "An unexpected error occurred while submitting. Please try again.";

      if (e.message?.includes("Cloudinary")) {
        errorText = e.message;
      } else if (
        e.message?.includes("upload image") ||
        e.message?.includes("network")
      ) {
        errorText =
          "Network error or image upload failed. Please check your connection and try again.";
      } else if (e.message?.includes("Missing or insufficient permissions")) {
        errorText =
          "Permission denied. Make sure you are logged in and authorized to submit this task.";
      } else {
        errorText = e.message || "Failed to submit task proof.";
      }

      toast.error(errorText);
      try {
        handleFirestoreError(e, OperationType.CREATE, "submissions");
      } catch (err) {
        // Suppress handleFirestoreError throwing again
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (job.isAccountSell) {
    const jobTypeL = job.type.toLowerCase();

    let themeColor = "bg-indigo-600";
    let themeLight =
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
    let themeBorder = "border-l-indigo-600";
    let themeRing = "focus:ring-indigo-500";
    let IconLetter = "A";

    if (jobTypeL.includes("facebook")) {
      themeColor = "bg-[#0866FF]";
      themeLight =
        "bg-blue-50 text-blue-600 dark:bg-[#0866FF]/20 dark:text-blue-400";
      themeBorder = "border-l-[#0866FF]";
      themeRing = "focus:ring-[#0866FF]";
      IconLetter = "f";
    } else if (jobTypeL.includes("instagram")) {
      themeColor = "bg-pink-600";
      themeLight =
        "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400";
      themeBorder = "border-l-pink-600";
      themeRing = "focus:ring-pink-500";
      IconLetter = "Ig";
    } else if (jobTypeL.includes("gmail") || jobTypeL.includes("mail")) {
      themeColor = "bg-red-500";
      themeLight =
        "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      themeBorder = "border-l-red-500";
      themeRing = "focus:ring-red-500";
      IconLetter = "M";
    } else if (jobTypeL.includes("twitter") || jobTypeL.includes("x")) {
      themeColor = "bg-slate-900 dark:bg-slate-700";
      themeLight =
        "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white";
      themeBorder = "border-l-slate-900 dark:border-l-slate-400";
      themeRing = "focus:ring-slate-500";
      IconLetter = "X";
    } else if (jobTypeL.includes("tiktok")) {
      themeColor = "bg-black dark:bg-slate-800";
      themeLight = "bg-slate-100 text-black dark:bg-slate-800 dark:text-white";
      themeBorder = "border-l-black dark:border-l-white";
      themeRing = "focus:ring-slate-500";
      IconLetter = "Tt";
    } else if (jobTypeL.includes("telegram")) {
      themeColor = "bg-[#229ED9]";
      themeLight =
        "bg-[#229ED9]/10 text-[#229ED9] dark:bg-[#229ED9]/30 dark:text-[#229ED9]";
      themeBorder = "border-l-[#229ED9]";
      themeRing = "focus:ring-[#229ED9]";
      IconLetter = "Tg";
    } else {
      IconLetter = job.type.charAt(0).toUpperCase();
    }

    return (
      <div className="pt-4 px-4 pb-24 max-w-lg mx-auto">
        <Celebration
          isVisible={showCelebration}
          onComplete={() => setShowCelebration(false)}
        />
        {/* Top nav */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full transition active:scale-95 text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Tutorial Button */}
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-white font-bold py-3.5 px-5 rounded-[18px] shadow-sm mb-5 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center p-1 ${themeLight}`}
              >
                <span
                  className={`font-black text-lg leading-none tracking-tight`}
                >
                  {IconLetter}
                </span>
              </div>
              <span className="text-sm">{job.title} টিউটোরিয়াল</span>
            </div>
            <div
              className={`w-7 h-7 rounded-full ${themeLight} flex items-center justify-center relative pl-0.5`}
            >
              <div
                className={`w-0 h-0 border-t-4 border-t-transparent border-l-[6px] ${themeBorder} border-b-4 border-b-transparent`}
              ></div>
            </div>
          </a>
        )}

        {/* Main Card */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm mb-6 relative overflow-hidden">
          <div className="flex flex-col items-center mb-5 relative z-10">
            <div className="flex items-center gap-2 text-xl font-bold mb-1.5">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${themeColor} text-white font-sans text-sm font-bold`}
              >
                {IconLetter === "M" ? <Mail className="w-4 h-4" /> : IconLetter}
              </div>
              <span className="text-slate-800 dark:text-white">
                {job.type} Sell
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
              {job.description || `সহজেই ${job.type} সেল করে টাকা আয় করুন`}
            </p>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-700/50 mb-5"></div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/50 text-center relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                Rate
              </p>
              <p
                className={`text-base font-black tracking-tight ${themeLight.split(" ")[1]}`}
              >
                ৳{job.reward?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                Limit
              </p>
              <p className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                {job.allowedCompletions || "Unl."}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                Submit
              </p>
              <p className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                {submissionCount}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Password */}
        {job.todaysPassword && (
          <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-3">
              <span className="font-bold">Today's Password</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(job.todaysPassword);
                  toast.success("Password copied!");
                }}
                className={`${themeColor} text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all outline-none`}
              >
                <Copy className="w-3 h-3" /> Copy Password
              </button>
            </div>
            <div className="flex items-center justify-center p-2">
              <span
                className={`${themeLight.split(" ")[1]} text-[22px] font-black tracking-tight text-center w-full break-all`}
              >
                {job.todaysPassword}
              </span>
            </div>
          </div>
        )}

        {/* Submission Form */}
        {(!job.allowedCompletions ||
            submissionCount < job.allowedCompletions) &&
          (!job.userLimit || submissionCount < job.userLimit) &&
          previousSubmission?.status !== "pending" ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 ml-1">
                {job.type} Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${themeLight.split(" ")[1]}`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={`example@${job.type.toLowerCase().replace(" ", "")}.com`}
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border-none px-4 py-3.5 pl-12 rounded-[16px] text-sm font-bold text-slate-800 dark:text-white focus:ring-2 placeholder:text-slate-400 ${themeRing}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 ml-1">
                Account Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${themeLight.split(" ")[1]} dark:text-slate-400`}
                />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter given password"
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border-none px-4 py-3.5 pl-12 rounded-[16px] text-sm font-bold text-slate-800 dark:text-white focus:ring-2 placeholder:text-slate-400 ${themeRing}`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-bold text-slate-800 dark:text-white">
                  2FA Code / Recovery Key
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all">
                  <input
                    type="checkbox"
                    checked={!has2FA}
                    onChange={(e) => setHas2FA(!e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    No 2FA available
                  </span>
                </label>
              </div>

              {has2FA && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <Key
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${themeLight.split(" ")[1]} dark:text-slate-400`}
                  />
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Paste 2FA code or backup keys"
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border-none px-4 py-3.5 pl-12 rounded-[16px] text-sm font-bold text-slate-800 dark:text-white focus:ring-2 placeholder:text-slate-400 ${themeRing}`}
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                disabled={submitting}
                type="submit"
                className={`w-full ${themeColor} text-white font-black py-4 rounded-[16px] shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70`}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Submit Account"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700/50 p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              Limit Reached
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              You have reached the maximum allowed submissions for this task.
            </p>
          </div>
        )}

        {/* Simplified Confirm Modal for Sell Account */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700/50 w-full max-w-[320px] p-6 animate-fade-in-up text-center">
              <div
                className={`w-14 h-14 ${themeLight} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                Confirm Submit
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Are you sure the account details are correct?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className={`flex-[1.5] ${themeColor} text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2`}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 pb-24">
      <Celebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition text-[#0D47A1] dark:text-blue-400"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-[#0D47A1] dark:text-blue-400">
          Submit Task
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {job.type}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-3 py-1 rounded-full text-sm">
            ৳ {job.reward}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {job.description}
        </p>

        {job.type === "Review" && selectedComment && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" /> আপনার জন্য নির্ধারিত কমেন্ট
              </span>
              <button
                type="button"
                onClick={rotateComment}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg"
              >
                কমেন্ট পরিবর্তন করুন
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm relative pr-12 select-all leading-relaxed">
              {selectedComment}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedComment);
                  toast.success("কমেন্ট কপি হয়েছে!");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold leading-relaxed">
              * গুগল ম্যাপে অবশ্যই <strong className="text-rose-500">৫ স্টার (5 Star)</strong> রেটিং দিয়ে উপরের কমেন্টটি পেস্ট করে সাবমিট করুন। এরপর স্ক্রিনশট এবং যে নাম দিয়ে রিভিউ দিয়েছেন তা নিচে জমা দিন।
            </p>
          </div>
        )}

        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#0D47A1]/10 text-[#0D47A1] dark:bg-blue-900/30 dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-[#0D47A1]/20 transition"
          >
            Open Task Link <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Required Proofs
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {job.requiredProofs?.length || 0} Items
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Posted By
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {job.postedBy || "Admin"}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Total Slots
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {!job.allowedCompletions
                ? "Unlimited"
                : `${job.allowedCompletions} Total`}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Your Limit
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {!job.userLimit
                ? "Unlimited"
                : `${submissionCount} / ${job.userLimit}`}
            </span>
          </div>
          {job.deadline && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
              <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Deadline
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {job.requiredProofs && job.requiredProofs.length > 0 && (
        <div className="bg-blue-50 dark:bg-[#0D47A1]/10 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-5 mb-6">
          <h4 className="font-bold text-[#0D47A1] dark:text-blue-400 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#3b82f6]" /> Verification
            Requirements
          </h4>
          <ul className="space-y-4">
            {job.requiredProofs.includes("text") && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Text Description
                  </strong>
                  Provide a detailed description or specific text as requested
                  by the task instructions.
                </div>
              </li>
            )}
            {job.requiredProofs.includes("screenshot") && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5">
                  <Image className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Screenshot Evidence
                  </strong>
                  Upload a clear, uncropped screenshot or provide a direct image
                  link that proves you completed the task.
                </div>
              </li>
            )}
            {job.requiredProofs.includes("username") && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Registered Username
                  </strong>
                  Enter the exact username or display name you used when
                  completing this task.
                </div>
              </li>
            )}
            {job.requiredProofs.includes("password") && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Password / Identifier
                  </strong>
                  Provide the password or unique identifier created/used during
                  the setup process.
                </div>
              </li>
            )}
            {job.requiredProofs.includes("videoUrl") && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                    Video Output Link
                  </strong>
                  Submit a valid URL (e.g., YouTube, Google Drive) containing a
                  video recording of your task execution.
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {previousSubmission && (
        <>
          <div className="flex items-center gap-2 mb-4 dark:text-white">
            {previousSubmission.status === "approved" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : previousSubmission.status === "rejected" ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500" />
            )}
            <h3 className="font-bold text-slate-800 dark:text-white">
              Your Submission
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Status
                </span>
                {previousSubmission.submittedAt && (
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide">
                    {new Date(
                      previousSubmission.submittedAt?.toDate
                        ? previousSubmission.submittedAt.toDate()
                        : previousSubmission.submittedAt,
                    ).toLocaleString()}
                  </span>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  previousSubmission.status === "approved"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                    : previousSubmission.status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 ring-1 ring-red-500/20"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20"
                }`}
              >
                {previousSubmission.status}
              </span>
            </div>

            {previousSubmission.proofs?.text && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                  Text Proof
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {previousSubmission.proofs.text}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.username && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                  Username
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {previousSubmission.proofs.username}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.password && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                  Password/Identifier
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {previousSubmission.proofs.password}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.twoFactorCode && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                  2FA / Recovery Key
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {previousSubmission.proofs.twoFactorCode}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.videoUrl && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                  Video URL
                </span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <a
                    href={previousSubmission.proofs.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {previousSubmission.proofs.videoUrl}
                  </a>
                </div>
              </div>
            )}

            {previousSubmission.proofs?.screenshot && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                  Screenshot
                </span>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                  <img
                    src={previousSubmission.proofs.screenshot}
                    alt="Proof screenshot"
                    className="w-full object-contain bg-gray-50 dark:bg-slate-700/50"
                  />
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* Submission Form Area */}
      {(!job.allowedCompletions ||
        submissionCount < job.allowedCompletions) &&
        (!job.userLimit || submissionCount < job.userLimit) &&
        previousSubmission?.status !== "pending" ? (
        <div className="mt-8">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">
            {previousSubmission ? "Submit Another Proof" : "Submit Proof"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
              {job.requiredProofs?.includes("text") && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Text Proof / Info *
                  </label>
                  <textarea
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="e.g. Completed from my profile @xyzzz"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                    rows={3}
                    minLength={10}
                    required
                  ></textarea>
                </div>
              )}

              {job.requiredProofs?.includes("screenshot") && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Screenshot Proof *
                  </label>

                  <div className="space-y-3">
                    {/* File Upload Option */}
                    {!imagePreview && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          required={!proofImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-[#0D47A1] mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Tap to upload screenshot
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50 flex flex-col items-center justify-center p-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2 font-medium">
                          {proofFile?.name}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 py-1">
                      <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1"></div>
                      <span className="text-xs text-gray-400 font-medium">
                        OR URL
                      </span>
                      <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1"></div>
                    </div>

                    {/* Fallback URL Input */}
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={proofImage}
                        onChange={(e) => {
                          setProofImage(e.target.value);
                          if (e.target.value) removeImage();
                        }}
                        placeholder="https://imgur.com/... (Image Link)"
                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                        required={!proofFile && !imagePreview}
                      />
                    </div>
                  </div>
                </div>
              )}

              {job.requiredProofs?.includes("username") && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Username Used *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                    minLength={3}
                    required
                  />
                </div>
              )}

              {job.requiredProofs?.includes("password") && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Password Used / Identifier *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
              )}

              {job.requiredProofs?.includes("2facode") && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">
                      2FA Code / Recovery Key *
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all">
                      <input
                        type="checkbox"
                        checked={!has2FA}
                        onChange={(e) => setHas2FA(!e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                      />
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        No 2FA Required
                      </span>
                    </label>
                  </div>

                  {has2FA && (
                    <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Paste 2FA code or backup keys"
                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {job.requiredProofs?.includes("videoUrl") && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Video Output URL *
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://... (Video Link)"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
                    pattern="https?://.+"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="flex items-center gap-2">
                Submit Work for Review <UploadCloud className="w-5 h-5" />
              </span>
            </button>

            {previousSubmission && (
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="w-full mt-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700/50 p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">Limit Reached</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            You have reached the maximum allowed submissions for this task.
          </p>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                Confirm Submission
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Please review your proofs before submitting. You cannot edit them
              after submission until an admin reviews it.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-4 mb-6 ring-1 ring-slate-100 dark:ring-slate-700/50 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {job.requiredProofs?.includes("text") && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
                    Text Proof
                  </span>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {proofText}
                  </div>
                </div>
              )}
              {job.requiredProofs?.includes("screenshot") &&
                (proofFile || proofImage) && (
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                      Screenshot
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                      <img
                        src={imagePreview || proofImage}
                        alt="Proof screenshot"
                        className="w-full object-contain bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              {job.requiredProofs?.includes("username") && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
                    Username
                  </span>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {username}
                  </div>
                </div>
              )}
              {job.requiredProofs?.includes("password") && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
                    Password/Identifier
                  </span>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {password}
                  </div>
                </div>
              )}
              {job.requiredProofs?.includes("videoUrl") && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
                    Video URL
                  </span>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">
                    {videoUrl}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-[2] relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div
                    className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {submitting
                    ? uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading ${uploadProgress}%`
                      : "Submitting..."
                    : "Confirm"}
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
