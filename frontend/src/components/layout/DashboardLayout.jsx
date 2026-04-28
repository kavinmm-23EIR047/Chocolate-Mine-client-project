import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  MapPin, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { id: 'dashboard', path: '/account/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', path: '/account/orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', path: '/account/wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'reviews', path: '/account/reviews', label: 'My Reviews', icon: Star },
    { id: 'profile', path: '/account/profile', label: 'Profile Details', icon: User },
    { id: 'addresses', path: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'settings', path: '/account/settings', label: 'Account Settings', icon: Settings },
  ];

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-card p-5 rounded-2xl shadow-premium mb-6 border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-button-text flex items-center justify-center font-black text-sm shadow-lg border-2 border-border/20">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-[10px] text-muted font-black uppercase tracking-widest">Account Overview</p>
              <p className="text-sm font-black text-heading line-clamp-1">{user?.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 bg-surface text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-button-text transition-all shadow-sm border border-border/50"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className={`
            lg:w-[300px] shrink-0 
            ${mobileMenuOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="sticky top-28 bg-card rounded-[2.5rem] p-8 shadow-premium border border-border/50 overflow-hidden relative">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              {/* Desktop User Info */}
              <div className="hidden lg:flex flex-col items-center text-center mb-10 pt-4">
                <div className="w-24 h-24 rounded-full bg-primary text-button-text flex items-center justify-center font-black text-3xl shadow-premium mb-6 border-4 border-card ring-1 ring-border/50">
                  {getInitials(user?.name)}
                </div>
                <h2 className="text-xl font-black text-heading leading-tight">{user?.name}</h2>
                <p className="text-[10px] text-muted font-black mt-1 uppercase tracking-widest">{user?.email}</p>
              </div>

              <nav className="space-y-2 relative z-10">
                {navItems.map((item) => {
                  const isActive = location.pathname.includes(item.path);
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] transition-all group uppercase tracking-widest
                        ${isActive 
                          ? 'bg-primary text-button-text shadow-premium translate-x-1' 
                          : 'text-muted hover:bg-surface hover:text-primary border border-transparent'
                        }
                      `}
                    >
                      <item.icon size={18} className={isActive ? 'text-button-text' : 'text-muted group-hover:text-primary transition-all'} />
                      {item.label}
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                    </NavLink>
                  );
                })}

                <div className="pt-6 mt-6 border-t border-border/50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] text-error hover:bg-error-light transition-all group uppercase tracking-widest"
                  >
                    <LogOut size={18} className="text-error transition-all" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-[2.5rem] p-8 lg:p-12 shadow-premium border border-border/50 min-h-[700px]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
