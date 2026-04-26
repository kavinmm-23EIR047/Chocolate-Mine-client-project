import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, PieChart, Calendar, 
  ArrowUpRight, ArrowDownRight, IndianRupee, Users, ShoppingBag 
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';
import { TableSkeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getDashboard();
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-8"><TableSkeleton rows={10} cols={4} /></div>;

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.revenue || 0), icon: IndianRupee, trend: '+12.5%', isUp: true },
    { label: 'Total Orders', value: data?.ordersCount || 0, icon: ShoppingBag, trend: '+8.2%', isUp: true },
    { label: 'Active Users', value: data?.usersCount || 0, icon: Users, trend: '-2.4%', isUp: false },
    { label: 'Avg Order Value', value: formatCurrency(data?.avgOrderValue || 0), icon: TrendingUp, trend: '+5.1%', isUp: true },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-heading">Analytics Dashboard</h2>
          <p className="text-sm text-muted">Deep dive into your business performance</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
           <Calendar size={16} className="text-muted" />
           <span className="text-xs font-black text-heading uppercase tracking-widest">Last 30 Days</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium p-6"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                  <stat.icon size={24} />
               </div>
               <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-success' : 'text-error'}`}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
               </div>
            </div>
            <p className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-heading">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Popular Products */}
         <div className="lg:col-span-2 card-premium overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
               <h3 className="font-black text-heading uppercase tracking-widest text-sm">Top Selling Products</h3>
               <BarChart3 size={18} className="text-muted" />
            </div>
            <div className="p-0">
               <table className="w-full">
                  <thead className="bg-border/20">
                     <tr>
                        <th className="text-left px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Product</th>
                        <th className="text-left px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Category</th>
                        <th className="text-left px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Sales</th>
                        <th className="text-right px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Revenue</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {(data?.topProducts || []).map((p, i) => (
                       <tr key={i} className="hover:bg-border/10 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-border flex items-center justify-center text-xs">🍰</div>
                                <span className="font-bold text-heading text-sm">{p.name}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-muted uppercase">{p.category}</td>
                          <td className="px-6 py-4 font-black text-sm">{p.salesCount}</td>
                          <td className="px-6 py-4 text-right font-black text-primary">{formatCurrency(p.revenue)}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Sales by Category */}
         <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-heading uppercase tracking-widest text-sm">Category Split</h3>
               <PieChart size={18} className="text-muted" />
            </div>
            <div className="space-y-6">
               {(data?.categorySplit || []).map((cat, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                       <span className="text-heading">{cat.name}</span>
                       <span className="text-muted">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${cat.percentage}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className="h-full bg-secondary"
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
