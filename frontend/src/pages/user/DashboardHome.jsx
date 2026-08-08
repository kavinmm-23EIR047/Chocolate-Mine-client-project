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
        const [ordersRes, addressesRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/users/addresses'),
        ]);

        setStatsData(prev => ({
          ...prev,
          totalOrders: ordersRes.data?.data ? ordersRes.data.data.length : 0,
          savedAddresses: addressesRes.data?.data ? addressesRes.data.data.length : 0,
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
    { title: 'Total Orders', value: statsData.totalOrders.toString(), icon: ShoppingBag, path: '/account/orders', desc: 'Purchases & history' },
    { title: 'Saved Addresses', value: statsData.savedAddresses.toString(), icon: MapPin, path: '/account/addresses', desc: 'Delivery locations' },
    { title: 'Wishlist', value: wishlist.length.toString(), icon: Heart, path: '/account/wishlist', desc: 'Saved treats' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Friendly Banner */}
      <div className="bg-gradient-to-r from-[var(--primary)]/10 via-[var(--card)] to-[var(--card)] border border-[var(--border)] p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest block mb-1">Account Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-xs text-[var(--body)] font-medium mt-1">Manage your orders, addresses, and account details in one place.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          return (
            <Link
              key={index}
              to={stat.path}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs hover:border-[var(--primary)] hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-hover:scale-110">
                    <stat.icon size={20} />
                  </div>
                  <span className="text-xs font-black text-[var(--primary)] group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--heading)] leading-none mb-1">{stat.value}</p>
                <p className="text-xs font-black text-[var(--heading)] uppercase tracking-wider">{stat.title}</p>
              </div>
              <p className="text-[10px] text-[var(--body)] font-medium mt-3 opacity-70">{stat.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Links Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[var(--heading)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-[var(--primary)]" />
              Recent Orders
            </h3>
            <p className="text-xs text-[var(--body)] font-medium leading-relaxed mb-4">
              View order status, track live deliveries, or re-order your favorite treats.
            </p>
          </div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-black text-[var(--primary)] uppercase tracking-widest hover:gap-3 transition-all"
          >
            <span>View Order History</span>
            <span>→</span>
          </Link>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-[var(--heading)]">
              <MapPin size={16} className="text-[var(--primary)]" />
              Delivery Locations
            </h3>
            <p className="text-xs text-[var(--body)] font-medium leading-relaxed mb-4">
              Save home, work, and gift delivery addresses for quick 1-click checkouts.
            </p>
          </div>
          <Link
            to="/account/addresses"
            className="inline-flex items-center gap-2 text-xs font-black text-[var(--primary)] uppercase tracking-widest hover:gap-3 transition-all"
          >
            <span>Manage Address Book</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
