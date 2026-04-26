import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, LogOut, ExternalLink, ShieldCheck, 
  MapPin, Settings, Bell, CreditCard, ChevronRight, 
  ShoppingBag, Star, Heart, Trash2
} from 'lucide-react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { OrderStatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import MapSelector from '../components/MapSelector';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const res = await api.get('/users/addresses');
      setAddresses(res.data.data);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await api.get('/orders/my');
          setOrders(response.data.data);
        } catch (err) {
          toast.error('Failed to fetch orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }

    if (activeTab === 'addresses') fetchAddresses();
  }, [user, navigate, activeTab]);

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Account Info', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <div className="lg:w-80 shrink-0">
          <div className="card-premium p-8 sticky top-28">
            <div className="text-center mb-10">
              <div className="relative inline-block group">
                <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary mb-4 mx-auto border-2 border-dashed border-secondary/30 group-hover:bg-secondary/20 transition-all">
                  <User size={40} />
                </div>
                <button className="absolute bottom-4 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-transform">
                  <Settings size={14} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-heading leading-tight">{user.name}</h2>
              <p className="text-xs text-muted font-bold mt-1 uppercase tracking-widest">{user.role}</p>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'orders' ? navigate('/orders') : setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-secondary text-white shadow-xl translate-x-2' 
                      : 'text-muted hover:bg-border/20 hover:text-heading'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {(activeTab === tab.id || tab.id === 'orders') && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
              
              <div className="pt-6 mt-6 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-heading">Address Book</h2>
                    <p className="text-sm text-muted font-medium mt-1">Manage your saved delivery locations</p>
                  </div>
                  <Button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>ADD NEW ADDRESS</Button>
                </div>

                {addressLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                ) : addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="No addresses saved"
                    message="Add your home or work address for faster checkouts."
                    action={<Button onClick={() => setShowAddressForm(true)}>ADD ADDRESS</Button>}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`card-premium p-6 border-2 transition-all ${addr.isDefault ? 'border-secondary' : 'border-border'}`}>
                        <div className="flex justify-between items-start mb-4">
                           <Badge variant={addr.isDefault ? 'secondary' : 'outline'}>{addr.type}</Badge>
                           <div className="flex gap-2">
                             <button onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }} className="p-2 hover:bg-secondary/10 rounded-lg text-secondary transition-colors"><Settings size={16} /></button>
                             <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <h4 className="font-black text-heading text-lg mb-1">{addr.fullName}</h4>
                        <p className="text-xs text-muted font-bold mb-4">{addr.phone}</p>
                        <p className="text-sm font-medium text-heading/70 leading-relaxed">
                          {addr.houseNo}, {addr.street}<br />
                          {addr.city}, {addr.pincode}
                        </p>
                        {addr.isDefault && (
                          <div className="mt-6 flex items-center gap-2 text-success">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Default Address</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-black text-heading">Account Information</h2>
                <div className="card-premium p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Full Name</label>
                      <div className="bg-border/10 border border-border p-4 rounded-2xl font-bold text-heading">{user.name}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Email Address</label>
                      <div className="bg-border/10 border border-border p-4 rounded-2xl font-bold text-heading">{user.email}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Phone Number</label>
                      <div className="bg-border/10 border border-border p-4 rounded-2xl font-bold text-heading">{user.phone || 'Not provided'}</div>
                    </div>
                  </div>
                  <div className="mt-10 flex justify-end">
                    <Button variant="secondary">UPDATE PROFILE</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="card-premium p-6 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck size={24} />
                      </div>
                      <p className="font-black text-sm text-heading">Verified Account</p>
                      <p className="text-[10px] text-muted font-medium mt-1">Your identity is secure</p>
                   </div>
                   <div className="card-premium p-6 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                        <Star size={24} />
                      </div>
                      <p className="font-black text-sm text-heading">Gold Member</p>
                      <p className="text-[10px] text-muted font-medium mt-1">12 Orders completed</p>
                   </div>
                   <div className="card-premium p-6 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-4">
                        <CreditCard size={24} />
                      </div>
                      <p className="font-black text-sm text-heading">TCM Wallet</p>
                      <p className="text-[10px] text-muted font-medium mt-1">₹450.00 Balance</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressModal 
          address={editingAddress} 
          onClose={() => setShowAddressForm(false)} 
          onSuccess={() => { setShowAddressForm(false); fetchAddresses(); }}
        />
      )}
    </div>
  );
};

const AddressModal = ({ address, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(address || {
    fullName: '', phone: '', houseNo: '', street: '', pincode: '', type: 'Home', isDefault: false
  });
  const [showMap, setShowMap] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (address) {
        await api.patch(`/users/addresses/${address._id}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/users/addresses', formData);
        toast.success('Address added');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save address');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-8 border-b border-border flex justify-between items-center bg-[#FAF9F6]">
          <h3 className="text-2xl font-black text-heading uppercase tracking-tighter">
            {address ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
            <LogOut size={18} className="rotate-180" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="md:col-span-2 w-full bg-[#FAF9F6] border-2 border-dashed border-secondary/20 rounded-2xl p-6 hover:bg-secondary/5 transition-all group"
            >
              <div className="flex items-center justify-center gap-4">
                <MapPin className="text-secondary" />
                <span className="font-black text-sm uppercase tracking-tight">
                  {formData.lat ? 'Location Captured' : 'Pin location on map'}
                </span>
              </div>
            </button>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Full Name</label>
              <input className="input-field" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Phone Number</label>
              <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">House/Flat No</label>
              <input className="input-field" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Street/Landmark</label>
              <input className="input-field" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Pincode</label>
              <input className="input-field" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Address Type</label>
              <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 accent-secondary" />
            <label htmlFor="isDefault" className="text-xs font-bold text-heading">Make this my default address</label>
          </div>
          
          <div className="mt-10 flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>CANCEL</Button>
            <Button type="submit" className="flex-1 shadow-premium">SAVE ADDRESS</Button>
          </div>
        </form>

        <AnimatePresence>
          {showMap && (
            <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md p-4 flex items-center justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[80vh] overflow-hidden relative shadow-2xl">
                <MapSelector onSelect={(data) => {
                  setFormData({ ...formData, lat: data.position.lat, lng: data.position.lng, street: data.address });
                  setShowMap(false);
                }} />
                <button onClick={() => setShowMap(false)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"><LogOut size={18} className="rotate-180" /></button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Profile;
