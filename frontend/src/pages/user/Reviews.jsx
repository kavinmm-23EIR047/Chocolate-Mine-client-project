import React, { useState, useEffect } from 'react';
import { Star, Calendar, ShoppingBag, Package } from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const res = await api.get('/reviews/my');
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight uppercase">My Reviews</h1>
        <p className="text-sm text-muted font-bold mt-1 uppercase tracking-widest">Feedback you've shared</p>
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="card-premium p-6 bg-card border border-border/50 group hover:shadow-xl transition-all duration-500 rounded-[2rem]">

              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border/50 shrink-0 shadow-sm">
                  <img src={review.productId?.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={review.productId?.name} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-black text-heading uppercase tracking-tight text-xl mb-1 leading-tight">{review.productId?.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.15em]">
                        <Calendar size={12} className="text-secondary" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < review.rating ? "#D4A017" : "none"} 
                          className={i < review.rating ? "text-[#D4A017]" : "text-border"} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-card-soft p-5 rounded-2xl border border-border/30 relative">

                    <div className="absolute top-2 right-4 opacity-5 pointer-events-none">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-sm font-medium text-muted leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-card rounded-[3rem] border-2 border-dashed border-border/50">
          <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-secondary opacity-20" />
          </div>
          <h3 className="text-xl font-black text-heading uppercase tracking-tighter mb-2">No Reviews Yet</h3>
          <p className="text-xs font-bold text-muted uppercase tracking-widest">You haven't shared your experience with any products yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
