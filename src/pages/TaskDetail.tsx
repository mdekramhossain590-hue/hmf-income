import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Image, UploadCloud, Loader2, X, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { doc, getDoc, setDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { FullPageLoader } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);
  
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState(''); // Stores URL if pasted
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image must be smaller than 5MB. Please choose a smaller file.");
        return;
      }
      setErrorMsg(null);
      setProofFile(file);
      setProofImage(''); // Clear URL if file is selected
      const reader = new FileReader();
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
      fileInputRef.current.value = '';
    }
  };
  
  useEffect(() => {
    if (!id || !auth.currentUser) return;
    
    const fetchJobAndSubmission = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        }
        
        const q = query(
          collection(db, "submissions"),
          where("jobId", "==", id),
          where("userId", "==", auth.currentUser.uid)
        );
        const subSnap = await getDocs(q);
        if (!subSnap.empty) {
          setPreviousSubmission({ id: subSnap.docs[0].id, ...subSnap.docs[0].data() });
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
  if (!job) return <div className="p-10 text-center text-gray-500">Task not found or unavailable</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    // Specific input validation
    if (job.requiredProofs?.includes('text') && proofText.trim().length < 10) {
      toast.error('Text proof must be at least 10 characters long.');
      return;
    }
    
    if (job.requiredProofs?.includes('videoUrl') && !/^https?:\/\/.+/.test(videoUrl)) {
      toast.error('Please provide a valid URL for the video (starting with http:// or https://).');
      return;
    }

    if (job.requiredProofs?.includes('username') && username.trim().length < 3) {
      toast.error('Please provide a valid username.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      let finalImageUrl = proofImage;

      // Handle Image Upload if file is selected
      if (job.requiredProofs?.includes('screenshot') && proofFile) {
        const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary configuration missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.");
        }

        setUploadProgress(10);
        const formData = new FormData();
        formData.append('file', proofFile);
        formData.append('upload_preset', uploadPreset);
        
        setUploadProgress(40);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(80);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || "Failed to upload image");
        }
        
        const data = await res.json();
        finalImageUrl = data.secure_url;
        setUploadProgress(100);
      }

      const proofs: any = {};
      
      if (job.requiredProofs?.includes('text')) proofs.text = proofText;
      if (job.requiredProofs?.includes('screenshot')) proofs.screenshot = finalImageUrl;
      if (job.requiredProofs?.includes('username')) proofs.username = username;
      if (job.requiredProofs?.includes('password')) proofs.password = password;
      if (job.requiredProofs?.includes('videoUrl')) proofs.videoUrl = videoUrl;
      
      const subRef = doc(collection(db, "submissions"));
      
      const subData = {
        jobId: job.id,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || 'Unknown',
        title: job.title,
        jobType: job.type || 'Other',
        reward: job.reward,
        proofs: proofs,
        status: 'pending',
        submittedAt: serverTimestamp()
      };
      
      await setDoc(subRef, subData);
      
      setPreviousSubmission(subData);
      toast.success('Task submitted successfully! Awaiting review.');
    } catch (e: any) {
      console.error(e);
      let errorText = 'An unexpected error occurred while submitting. Please try again.';
      
      if (e.message?.includes('Cloudinary')) {
        errorText = e.message;
      } else if (e.message?.includes('upload image') || e.message?.includes('network')) {
        errorText = 'Network error or image upload failed. Please check your connection and try again.';
      } else if (e.message?.includes('Missing or insufficient permissions')) {
        errorText = 'Permission denied. Make sure you are logged in and authorized to submit this task.';
      } else {
        errorText = e.message || 'Failed to submit task proof.';
      }
      
      toast.error(errorText);
      try {
        handleFirestoreError(e, OperationType.CREATE, 'submissions');
      } catch (err) {
        // Suppress handleFirestoreError throwing again
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="pt-6 px-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition text-[#0D47A1] dark:text-blue-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-[#0D47A1] dark:text-blue-400">Submit Task</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{job.type}</p>
          </div>
          <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-3 py-1 rounded-full text-sm">
            ৳ {job.reward}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{job.description}</p>
        
        <a 
          href={job.link}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#0D47A1]/10 text-[#0D47A1] dark:bg-blue-900/30 dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-[#0D47A1]/20 transition"
        >
          Open Task Link <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {job.requiredProofs && job.requiredProofs.length > 0 && (
        <div className="bg-blue-50 dark:bg-[#0D47A1]/10 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-5 mb-6">
          <h4 className="font-bold text-[#0D47A1] dark:text-blue-400 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#3b82f6]" /> Verification Requirements
          </h4>
          <ul className="space-y-4">
            {job.requiredProofs.includes('text') && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5"><CheckCircle className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Text Description</strong>
                  Provide a detailed description or specific text as requested by the task instructions.
                </div>
              </li>
            )}
            {job.requiredProofs.includes('screenshot') && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5"><Image className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Screenshot Evidence</strong>
                  Upload a clear, uncropped screenshot or provide a direct image link that proves you completed the task.
                </div>
              </li>
            )}
            {job.requiredProofs.includes('username') && (
               <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                <div className="mt-0.5"><CheckCircle className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Registered Username</strong>
                  Enter the exact username or display name you used when completing this task.
                </div>
              </li>
            )}
            {job.requiredProofs.includes('password') && (
              <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                 <div className="mt-0.5"><CheckCircle className="w-4 h-4 text-blue-500" /></div>
                 <div>
                   <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Password / Identifier</strong>
                   Provide the password or unique identifier created/used during the setup process.
                 </div>
              </li>
            )}
            {job.requiredProofs.includes('videoUrl') && (
               <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/50 dark:border-slate-700">
                  <div className="mt-0.5"><ExternalLink className="w-4 h-4 text-blue-500" /></div>
                  <div>
                    <strong className="block text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Video Output Link</strong>
                    Submit a valid URL (e.g., YouTube, Google Drive) containing a video recording of your task execution.
                  </div>
               </li>
            )}
          </ul>
        </div>
      )}

      {previousSubmission ? (
        <>
          <div className="flex items-center gap-2 mb-4 dark:text-white">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-gray-800 dark:text-white">You have submitted this task</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                previousSubmission.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                previousSubmission.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
              }`}>
                {previousSubmission.status}
              </span>
            </div>

            {previousSubmission.proofs?.text && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Text Proof</span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {previousSubmission.proofs.text}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.username && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Username</span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {previousSubmission.proofs.username}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.password && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Password/Identifier</span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {previousSubmission.proofs.password}
                </div>
              </div>
            )}

            {previousSubmission.proofs?.videoUrl && (
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Video URL</span>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <a href={previousSubmission.proofs.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                    {previousSubmission.proofs.videoUrl}
                  </a>
                </div>
              </div>
            )}

            {previousSubmission.proofs?.screenshot && (
              <div>
                 <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Screenshot</span>
                 <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                   <img src={previousSubmission.proofs.screenshot} alt="Proof screenshot" className="w-full object-contain bg-gray-50 dark:bg-slate-700/50" />
                 </div>
              </div>
            )}
            
            {previousSubmission.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-center flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="w-4 h-4" /> Wait for an administrator to review your submission.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Submit Proof</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
              
              {job.requiredProofs?.includes('text') && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Text Proof / Info *</label>
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
              
              {job.requiredProofs?.includes('screenshot') && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Screenshot Proof *</label>
                  
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    {!imagePreview && (
                      <div 
                        className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition cursor-pointer relative"
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          required={!proofImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-[#0D47A1] mb-2" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tap to upload screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50 flex flex-col items-center justify-center p-2">
                        <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-lg" />
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition backdrop-blur-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2 font-medium">{proofFile?.name}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 py-1">
                      <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1"></div>
                      <span className="text-xs text-gray-400 font-medium">OR URL</span>
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
              
              {job.requiredProofs?.includes('username') && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Username Used *</label>
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
              
              {job.requiredProofs?.includes('password') && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Password Used / Identifier *</label>
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

              {job.requiredProofs?.includes('videoUrl') && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Video Output URL *</label>
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
              disabled={submitting}
              className="w-full relative overflow-hidden bg-[#0D47A1] dark:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadProgress > 0 && uploadProgress < 100 && (
                 <div 
                   className="absolute top-0 left-0 h-full bg-blue-500/50 transition-all duration-300"
                   style={{ width: `${uploadProgress}%` }}
                 ></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                {submitting ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Submitting...') : 'Submit Work for Review'}
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              </span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
