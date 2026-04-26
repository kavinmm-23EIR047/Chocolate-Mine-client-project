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
    <div className="min-h-screen bg-[#FAF9F6] pt-24 pb-20 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-6 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black text-sm">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-xs text-muted font-bold uppercase tracking-widest">Welcome</p>
              <p className="text-sm font-black text-heading line-clamp-1">{user?.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 bg-secondary/5 text-secondary rounded-xl flex items-center justify-center hover:bg-secondary/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className={`
            lg:w-[280px] shrink-0 
            ${mobileMenuOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="sticky top-28 bg-white rounded-[2rem] p-6 shadow-sm border border-border/50 overflow-hidden relative">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              {/* Desktop User Info */}
              <div className="hidden lg:flex flex-col items-center text-center mb-8 pt-4">
                <div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-secondary/20 mb-4 border-4 border-white ring-1 ring-border/50">
                  {getInitials(user?.name)}
                </div>
                <h2 className="text-lg font-black text-heading leading-tight">{user?.name}</h2>
                <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
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
                        w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-sm transition-all group
                        ${isActive 
                          ? 'bg-secondary text-white shadow-md translate-x-2' 
                          : 'text-muted hover:bg-secondary/5 hover:text-heading'
                        }
                      `}
                    >
                      <item.icon size={18} className={isActive ? 'text-white' : 'text-secondary/70 group-hover:text-secondary transition-colors'} />
                      {item.label}
                      {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
                    </NavLink>
                  );
                })}

                <div className="pt-6 mt-6 border-t border-border/50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-sm text-error hover:bg-error/5 transition-all group"
                  >
                    <LogOut size={18} className="text-error/70 group-hover:text-error transition-colors" />
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
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-sm border border-border/50 min-h-[600px]"
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
