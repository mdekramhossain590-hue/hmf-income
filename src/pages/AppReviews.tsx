import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Star, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function AppReviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/mysql-reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return toast.error("Please login to post a review");
    if (!comment.trim()) return toast.error("Comment cannot be empty");

    setSubmitting(true);
    try {
      const res = await fetch("/api/mysql-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: profile.fullName || "User",
          user_photo: profile.photoURL || "",
          rating,
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review posted successfully!");
        setComment("");
        fetchReviews();
      } else {
        toast.error(data.error || "Failed to post review");
      }
    } catch (err: any) {
      console.error(err instanceof Error ? err.message : String(err));
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20 max-w-2xl mx-auto">
      <h2 className="text-2xl font-black mb-6 text-center text-slate-800 dark:text-white flex items-center justify-center gap-2">
        <MessageCircle className="w-6 h-6 text-indigo-500" />
        App Reviews
      </h2>

      {/* Post Review Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8">
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Leave a Review</h3>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(num => (
            <Star 
              key={num} 
              className={`w-6 h-6 cursor-pointer transition ${num <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
              onClick={() => setRating(num)}
            />
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your experience..."
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white mb-3"
          rows={3}
        ></textarea>
        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-500 text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-slate-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                    {r.user_photo ? <img src={r.user_photo} className="w-full h-full object-cover" /> : r.user_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{r.user_name}</p>
                    <p className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
