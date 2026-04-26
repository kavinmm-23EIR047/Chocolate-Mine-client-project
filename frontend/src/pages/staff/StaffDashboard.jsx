import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, ShoppingBag, Clock, CheckCircle, Printer, RefreshCw, Eye, Flame, Truck, Package, X, KeyRound, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import staffService from '../../services/staffService';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// OTP Modal Component
const OtpModal = ({ isOpen, onClose, onVerify, order, loading, onRegenerateOtp }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [];

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    onVerify(otpValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <KeyRound size={20} className="text-secondary" />
              </div>
              <div>
                <h3 className="font-black text-heading text-lg">Verify Delivery OTP</h3>
                <p className="text-xs text-muted">Order #{order?.orderNumber || order?.trackingCode}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-border/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone size={28} className="text-secondary" />
            </div>
            <p className="text-sm text-muted">
              Please ask the customer for the 6-digit OTP sent to their mobile number.
            </p>
            <p className="text-xs text-muted mt-2">
              Customer: <span className="font-bold text-heading">{order?.address?.fullName}</span>
              <br />
              Phone: <span className="font-bold text-heading">{order?.address?.phone}</span>
            </p>
          </div>
          
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-black bg-gray-50 border-2 border-border rounded-xl focus:border-secondary focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            icon={CheckCircle}
            loading={loading}
          >
            VERIFY & COMPLETE DELIVERY
          </Button>
          
          <button 
            onClick={onRegenerateOtp}
            className="w-full text-center text-xs text-secondary hover:underline"
          >
            Resend OTP
          </button>
          
          <p className="text-[10px] text-center text-muted">
            OTP expires in 10 minutes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  const [expandedItems, setExpandedItems] = useState({});
  
  if (!order) return null;

  const toggleItemExpand = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-heading text-xl">Order Details</h3>
              <p className="text-xs text-muted">#{order.orderNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-border/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {/* Customer Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-sm mb-2">Customer Details</h4>
            <p className="text-sm">{order.address?.fullName}</p>
            <p className="text-sm text-muted">{order.address?.phone}</p>
            <p className="text-sm text-muted mt-1">{order.address?.houseNo}, {order.address?.street}</p>
            <p className="text-sm text-muted">{order.address?.city}, {order.address?.pincode}</p>
          </div>
          
          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-bold text-sm mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.formattedItems?.map((item, idx) => (
                <div key={idx} className="border rounded-xl p-3">
                  <div className="flex gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-muted">SKU: {item.sku}</p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Qty: {item.qty}</span>
                        <span className="text-muted">{formatCurrency(item.price)} each</span>
                      </div>
                      {(item.selectedFlavor || item.selectedWeight) && (
                        <div className="text-xs text-muted mt-1">
                          {item.selectedFlavor && <span>Flavor: {item.selectedFlavor}</span>}
                          {item.selectedWeight && <span className="ml-2">Weight: {item.selectedWeight}</span>}
                        </div>
                      )}
                      {item.customDetails && (
                        <button 
                          onClick={() => toggleItemExpand(idx)}
                          className="text-xs text-secondary flex items-center gap-1 mt-2"
                        >
                          {expandedItems[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          Custom Details
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedItems[idx] && item.customDetails && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                      {item.customDetails.flavour && <p><span className="font-medium">Flavor:</span> {item.customDetails.flavour}</p>}
                      {item.customDetails.shape && <p><span className="font-medium">Shape:</span> {item.customDetails.shape}</p>}
                      {item.customDetails.tiers && <p><span className="font-medium">Tiers:</span> {item.customDetails.tiers}</p>}
                      {item.customDetails.eggless && <p><span className="font-medium">Eggless:</span> Yes</p>}
                      {item.customDetails.lessSugar && <p><span className="font-medium">Less Sugar:</span> Yes</p>}
                      {item.customDetails.messageOnCake && <p><span className="font-medium">Message:</span> {item.customDetails.messageOnCake}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-sm mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Delivery Charge</span>
                <span>{formatCurrency(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">GST</span>
                <span>{formatCurrency(order.gst)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted">Payment: {order.paymentMethod}</p>
              <p className="text-xs text-muted">Status: {order.paymentStatus?.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StaffDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ confirmedOrders: 0, outForDeliveryOrders: 0, deliveredToday: 0 });
  const [loading, setLoading] = useState(true);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join_staff_room', sessionStorage.getItem('userId'));
      socketRef.current.emit('join_admin_room');
    });

    socketRef.current.on('assigned_order_updated', (data) => {
      console.log('Order update received:', data);
      fetchData();
    });

    socketRef.current.on('dashboard_needs_refresh', () => {
      fetchData();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Sync activeTab with URL
  const getTabFromPath = (path) => {
    if (path.includes('out-for-delivery')) return 'out_for_delivery';
    if (path.includes('delivered')) return 'delivered';
    if (path.includes('history')) return 'history';
    return 'confirmed'; 
  };

  const activeTab = getTabFromPath(location.pathname);

  const setActiveTab = (tab) => {
    const pathMap = {
      confirmed: '/staff/orders/new',
      out_for_delivery: '/staff/orders/out-for-delivery',
      delivered: '/staff/orders/delivered',
      history: '/staff/orders/history'
    };
    navigate(pathMap[tab]);
  };

  const [pendingStatuses, setPendingStatuses] = useState({});
  const statusOptions = ['confirmed', 'out_for_delivery', 'delivered'];

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'history') {
        const res = await staffService.getAllOrders({ limit: 50 });
        setOrders(res.data.data);
      } else {
        let ordersRes;
        if (activeTab === 'out_for_delivery') {
          ordersRes = await staffService.getOutForDeliveryOrders();
        } else if (activeTab === 'delivered') {
          ordersRes = await staffService.getDeliveredOrders();
        } else {
          ordersRes = await staffService.getNewOrders();
        }
        const statsRes = await staffService.getDashboard();
        
        setOrders(ordersRes.data.data);
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location.pathname]);

  const handleViewOrderDetails = async (orderId) => {
    try {
      const res = await staffService.getOrderDetails(orderId);
      setSelectedOrderDetails(res.data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load order details');
    }
  };

  const handleDeliveryStatusUpdate = async (id, status) => {
    if (status === 'delivered') {
      const order = orders.find(o => o._id === id);
      setSelectedOrder(order);
      setOtpModalOpen(true);
      return;
    }
    
    try {
      const response = await staffService.updateKitchenStatus(id, status);
      toast.success(`Order ${status.replace(/_/g, ' ').toUpperCase()}`);
      if (status === 'out_for_delivery' && response.data.otp) {
        toast.success(`OTP: ${response.data.otp}`, { duration: 10000 });
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (!selectedOrder) return;
    
    setVerifyingOtp(true);
    try {
      await staffService.verifyDeliveryOtp(selectedOrder._id, otp);
      toast.success('Delivery confirmed successfully! 🎉');
      setOtpModalOpen(false);
      setSelectedOrder(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegenerateOtp = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await staffService.generateDeliveryOtp(selectedOrder._id);
      toast.success(`New OTP sent`, { duration: 10000 });
    } catch (err) {
      toast.error('Failed to generate OTP');
    }
  };

  const handleStatusSelect = (orderId, status) => {
    setPendingStatuses(prev => ({ ...prev, [orderId]: status }));
  };

  const handleGlobalStatusUpdate = async (orderId) => {
    const newStatus = pendingStatuses[orderId];
    if (!newStatus) return;
    try {
      await staffService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${newStatus.replace(/_/g, ' ')}`);
      fetchData();
      setPendingStatuses(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const isStatusDisabled = (currentStatus, optionStatus) => {
    if (currentStatus === 'delivered') return true;
    if (currentStatus === 'confirmed' && optionStatus !== 'out_for_delivery') return true;
    if (currentStatus === 'out_for_delivery' && optionStatus !== 'delivered') return true;
    return false;
  };

  const tabs = [
    { id: 'confirmed', label: 'Confirmed', icon: Clock, count: stats.confirmedOrders, color: 'text-secondary' },
    { id: 'out_for_delivery', label: 'Out For Delivery', icon: Truck, count: stats.outForDeliveryOrders, color: 'text-primary' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, count: stats.deliveredToday, color: 'text-success' },
    { id: 'history', label: 'History', icon: ShoppingBag, count: null, color: 'text-heading' },
  ];

  return (
    <div className="space-y-8">
      {/* OTP Modal */}
      <OtpModal 
        isOpen={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false);
          setSelectedOrder(null);
        }}
        onVerify={handleVerifyOtp}
        onRegenerateOtp={handleRegenerateOtp}
        order={selectedOrder}
        loading={verifyingOtp}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrderDetails}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <ChefHat size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-heading tracking-tight">Staff Portal</h2>
              <p className="text-xs text-muted font-bold uppercase tracking-[0.2em]">Delivery Management</p>
           </div>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={fetchData}>Refresh</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-border/20 rounded-2xl w-fit overflow-x-auto">
         {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-black text-sm whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-card text-heading shadow-premium' 
                  : 'text-muted hover:text-heading'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? tab.color : ''} />
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-secondary/10 text-secondary' : 'bg-border/40'}`}>
                  {tab.count}
                </span>
              )}
            </button>
         ))}
      </div>

      {loading ? <TableSkeleton rows={3} cols={1} /> : orders.length === 0 ? (
        <EmptyState 
          icon={ShoppingBag} 
          title="No orders found" 
          message="Relax! There's nothing to do here right now." 
        />
      ) : activeTab === 'history' ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-border/10 border-b border-border">
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Order</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Items</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-border/5">
                    <td className="px-6 py-4 font-bold">#{order.orderNumber || order.trackingCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{order.address?.fullName}</p>
                      <p className="text-[10px] text-muted">{order.address?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{order.items?.length} items</p>
                      <p className="text-[10px] text-muted">{order.items?.reduce((sum, i) => sum + i.qty, 0)} units</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.orderStatus} /></td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewOrderDetails(order._id)}
                        className="p-2 hover:bg-secondary/10 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <motion.div 
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card-premium p-6 border-t-4 border-t-secondary relative"
                >
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <Badge variant="secondary" className="mb-2 text-[10px] tracking-widest">{order.deliverySlot}</Badge>
                         <h3 className="font-black text-xl text-heading">#{order.orderNumber}</h3>
                         {order.trackingCode && (
                           <p className="text-[9px] text-muted font-mono">Track: {order.trackingCode}</p>
                         )}
                      </div>
                      <OrderStatusBadge status={order.orderStatus} />
                   </div>

                   {/* Customer Info */}
                   <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                     <p className="font-bold text-sm">{order.address?.fullName}</p>
                     <p className="text-xs text-muted">{order.address?.phone}</p>
                   </div>

                   {/* Items Preview */}
                   <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {order.formattedItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-border/10 rounded-lg text-sm">
                          <div className="flex-1">
                            <p className="font-bold">{item.name}</p>
                            {item.selectedFlavor && (
                              <p className="text-[10px] text-muted">Flavor: {item.selectedFlavor}</p>
                            )}
                            {item.selectedWeight && (
                              <p className="text-[10px] text-muted">Weight: {item.selectedWeight}</p>
                            )}
                            {item.sku && (
                              <p className="text-[9px] text-muted font-mono">SKU: {item.sku}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{item.qty}x</p>
                            <p className="text-[10px] text-muted">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      ))}
                   </div>

                   {/* Total Amount */}
                   <div className="flex justify-between items-center mb-4 pt-2 border-t border-border">
                     <span className="font-bold">Total</span>
                     <span className="font-black text-primary text-lg">{formatCurrency(order.total)}</span>
                   </div>

                   {/* Action Buttons */}
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleViewOrderDetails(order._id)}
                        className="p-2 bg-border/30 rounded-xl hover:bg-secondary/10 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {activeTab === 'confirmed' && (
                        <Button className="flex-1" icon={Truck} onClick={() => handleDeliveryStatusUpdate(order._id, 'out_for_delivery')}>
                          OUT FOR DELIVERY
                        </Button>
                      )}
                      {activeTab === 'out_for_delivery' && (
                        <Button className="flex-1 bg-success hover:bg-success/90" icon={CheckCircle} onClick={() => handleDeliveryStatusUpdate(order._id, 'delivered')}>
                          VERIFY & DELIVER
                        </Button>
                      )}
                      <button onClick={() => staffService.printKOT(order._id)} className="p-3 bg-border/30 rounded-xl hover:bg-secondary/10 transition-colors">
                        <Printer size={20} />
                      </button>
                   </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;