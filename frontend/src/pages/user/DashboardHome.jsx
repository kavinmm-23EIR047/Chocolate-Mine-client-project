import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useWishlist } from '../../context/WishlistContext';
import Button from '../../components/ui/Button';

const DashboardHome = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();

  const [statsData, setStatsData] = useState({
    totalOrders: 0,
    savedAddresses: user?.addresses?.length || 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, addressesRes, reviewsRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/users/addresses'),
          api.get('/reviews/my')
        ]);

        setStatsData(prev => ({
          ...prev,
          totalOrders: ordersRes.data?.data ? ordersRes.data.data.length : 0,
          savedAddresses: addressesRes.data?.data ? addressesRes.data.data.length : 0,
          totalReviews: reviewsRes.data?.results || 0
        }));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const stats = [
    { title: 'Total Orders', value: statsData.totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-600' },
    { title: 'Saved Addresses', value: statsData.savedAddresses.toString(), icon: MapPin, color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Wishlist', value: wishlist.length.toString(), icon: Heart, color: 'bg-rose-500/10 text-rose-600' },
    { title: 'My Reviews', value: statsData.totalReviews.toString(), icon: Heart, color: 'bg-amber-500/10 text-amber-600' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-heading tracking-tighter uppercase">Overview</h1>
          <p className="text-[11px] text-muted font-black mt-1 uppercase tracking-widest">Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}!</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.title === 'Wishlist' ? '/account/wishlist' : stat.title === 'Total Orders' ? '/account/orders' : stat.title === 'My Reviews' ? '/account/reviews' : '/account/addresses'}
            className="p-5 rounded-2xl border border-border/50 bg-[#FAF9F6] hover:bg-white hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <p className="text-3xl font-black text-heading leading-none mb-2">{stat.value}</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.title}</p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <div className="card-premium p-6 border border-border/50 bg-white">
          <h3 className="text-sm font-black text-heading uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-secondary" />
            Recent Orders
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center bg-[#FAF9F6] rounded-xl border border-dashed border-border">
            <p className="text-xs font-bold text-muted mb-4">View your recent purchases and track deliveries.</p>
            <Link to="/account/orders" className="text-xs font-black text-secondary hover:underline uppercase tracking-widest">
              View All Orders
            </Link>
          </div>
        </div>

        <div className="card-premium p-6 border border-border/50 bg-white">
          <h3 className="text-sm font-black text-heading uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-secondary" />
            Default Address
          </h3>
          <div className="p-5 bg-[#FAF9F6] rounded-xl border border-border/50">
            <p className="text-sm font-black text-heading mb-1">{user?.name}</p>
            <p className="text-xs text-muted font-bold line-clamp-2 leading-relaxed mb-4">
              Manage your saved addresses for quicker checkout.
            </p>
            <Link to="/account/addresses">
              <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest px-8">Manage Addresses</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
