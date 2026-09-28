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
    <div className="pt-6 px-4 pb-20 max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-black mb-6 text-center text-white flex items-center justify-center gap-2">
        <MessageCircle className="w-6 h-6 text-[#FACC15]" />
        App Reviews
      </h2>

      {/* Post Review Form */}
      <form onSubmit={handleSubmit} className="bg-[#151515] p-5 rounded-2xl shadow-sm border border-[#3D3215] mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 blur-2xl pointer-events-none rounded-full"></div>
        <h3 className="font-bold text-sm text-[#FFE082] mb-3">Leave a Review</h3>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(num => (
            <Star 
              key={num} 
              className={`w-6 h-6 cursor-pointer transition ${num <= rating ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#3D3215]'}`}
              onClick={() => setRating(num)}
            />
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your experience..."
          className="w-full bg-[#101010] border border-[#3D3215] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-white mb-3"
          rows={3}
        ></textarea>
        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-95 shadow-lg"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-[#A3A3A3] text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-[#737373] text-sm">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="bg-[#151515] p-4 rounded-xl shadow-sm border border-[#3D3215]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] rounded-full flex items-center justify-center font-bold overflow-hidden">
                    {r.user_photo ? <img src={r.user_photo} className="w-full h-full object-cover" /> : r.user_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{r.user_name}</p>
                    <p className="text-[10px] text-[#A3A3A3]">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex text-[#FACC15]">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
              </div>
              <p className="text-sm text-[#A3A3A3] mt-2">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
