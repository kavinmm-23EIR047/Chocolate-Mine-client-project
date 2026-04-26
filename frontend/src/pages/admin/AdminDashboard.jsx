import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../../services/adminService';
import analyticsService from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const statCards = [
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, color: 'from-blue-500 to-blue-600' },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', isCurrency: true },
  { key: 'pendingOrders', label: 'Pending', icon: Clock, color: 'from-amber-500 to-amber-600' },
  { key: 'deliveredOrders', label: 'Delivered', icon: CheckCircle, color: 'from-green-500 to-green-600' },
  { key: 'totalUsers', label: 'Customers', icon: Users, color: 'from-purple-500 to-purple-600' },
  { key: 'totalProducts', label: 'Products', icon: Package, color: 'from-rose-500 to-rose-600' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          adminService.getDashboard(),
          analyticsService.getDashboard().catch(() => null),
        ]);
        setStats(dashRes.data.data);
        if (analyticsRes) setAnalytics(analyticsRes.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const chartData = analytics?.salesChart?.map((item) => ({
    date: item._id,
    revenue: item.revenue,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-black text-heading">Dashboard Overview</h2>
        <p className="text-muted text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black text-heading">
              {card.isCurrency ? formatCurrency(stats?.[card.key] || 0) : (stats?.[card.key] || 0)}
            </p>
            <p className="text-xs text-muted font-medium mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-heading">Sales Overview</h3>
              <p className="text-sm text-muted">Revenue trend for the last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm font-bold">
              <TrendingUp size={16} />
              <span>Active</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C47A52" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C47A52" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
                formatter={(value) => [formatCurrency(value), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C47A52" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Payment Stats */}
      {analytics?.payments && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Successful', value: analytics.payments.successful, color: 'text-success' },
            { label: 'Pending', value: analytics.payments.pending, color: 'text-yellow-500' },
            { label: 'Failed', value: analytics.payments.failed, color: 'text-error' },
            { label: 'Refunded', value: analytics.payments.refunded, color: 'text-purple-500' },
          ].map((p) => (
            <div key={p.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className={`text-3xl font-black ${p.color}`}>{p.value}</p>
              <p className="text-xs text-muted font-medium mt-1">{p.label} Payments</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Revenue Summary */}
      {analytics?.revenue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 rounded-2xl p-6">
            <p className="text-sm text-muted font-medium">Total Revenue</p>
            <p className="text-3xl font-black text-heading mt-2">{formatCurrency(analytics.revenue.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-success text-sm">
              <ArrowUpRight size={16} />
              <span className="font-medium">All time earnings</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
            <p className="text-sm text-muted font-medium">Monthly Revenue</p>
            <p className="text-3xl font-black text-heading mt-2">{formatCurrency(analytics.revenue.monthlyRevenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-blue-500 text-sm">
              <ArrowUpRight size={16} />
              <span className="font-medium">This month</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
