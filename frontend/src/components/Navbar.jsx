import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, User, Menu, X, Sun, Moon, 
  MapPin, Heart, ChevronDown, ShoppingBag, Truck, LogIn,
  Box
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeliveryLocation } from '../context/LocationContext';
import Logo from './Logo';
import SearchOverlay from './search/SearchOverlay';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { cart } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const { location: deliveryCity, setLocation: setDeliveryCity } = useDeliveryLocation();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.items ? cart.items.reduce((acc, item) => acc + (item.qty || item.quantity), 0) : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav 
        className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled 
            ? 'bg-navbar shadow-lg py-2' 
            : 'bg-navbar py-3'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-10">
            
            {/* 1. LOGO */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
              <Logo className="w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-md p-1 shadow-sm border border-border/50" />

              <div className="flex flex-col">
                <span className="text-[12px] sm:text-[15px] font-black text-[#2D1816] dark:text-[#FFF9F5] tracking-tight leading-none uppercase transition-colors">THE CHOCOLATE</span>
                <span className="text-[9px] sm:text-[11px] font-black text-[#2D1816] dark:text-[#D4A017] tracking-[0.3em] uppercase mt-0.5 transition-colors">Mine</span>
              </div>
            </Link>

            {/* 2. SEARCH BAR */}
            <div 
              className="flex-1 max-w-2xl cursor-pointer flex justify-end sm:block"
              onClick={() => setIsSearchOverlayOpen(true)}
            >
              <div className="relative group w-auto sm:w-full">
                {/* Desktop Input */}
                <input
                  type="text"
                  readOnly
                  placeholder="Search for cakes, desserts and more"
                  className="hidden sm:block w-full bg-card text-heading pl-4 pr-12 py-2.5 rounded-sm shadow-sm border border-border/50 outline-none placeholder:text-muted font-medium text-sm transition-all group-hover:shadow-md"
                />

                <div className="hidden sm:flex absolute right-0 top-0 h-full px-4 items-center bg-transparent">
                  <Search size={18} className="text-primary font-bold" />
                </div>

                {/* Mobile Icon Button */}
                <div className="sm:hidden w-11 h-9 bg-card rounded-md flex items-center justify-center shadow-sm ml-auto border border-border/50">
                  <Search size={18} className="text-navbar-text" />
                </div>

              </div>
            </div>

            {/* 3. ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-8 text-navbar-text">
              
              <div className="hidden lg:relative lg:flex items-center gap-2 cursor-pointer group py-2 px-3 rounded-sm hover:bg-black/10 transition-all"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
              >
                <MapPin size={18} className="text-navbar-text" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-navbar-text/80 leading-none">Deliver to</span>
                  <span className="text-xs font-black flex items-center gap-1 group-hover:text-accent transition-colors uppercase">
                    {deliveryCity || 'Select Location'} <ChevronDown size={14} className={isLocationOpen ? 'rotate-180' : ''} />
                  </span>
                </div>

                {isLocationOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-card border border-border shadow-2xl rounded-sm py-2 z-[110]"
                  >
                    {['coimbatore', 'chennai', 'bangalore', 'hyderabad'].map(city => (
                      <button
                        key={city}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeliveryCity(city);
                          setIsLocationOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-black uppercase hover:bg-primary hover:text-white transition-colors ${deliveryCity === city ? 'text-primary' : 'text-heading'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {user ? (
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : '/account/dashboard'} 
                  className="hidden sm:flex items-center gap-2 group py-2 px-3 rounded-sm hover:bg-black/10 transition-all"
                >
                  <User size={20} />
                  <span className="text-sm font-black uppercase tracking-tight group-hover:text-secondary transition-colors">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 group py-2 px-3 rounded-sm hover:bg-black/10 transition-all">
                  <User size={20} />
                  <span className="text-sm font-black uppercase tracking-tight group-hover:text-secondary transition-colors">Login</span>
                </Link>
              )}

              <Link 
                to="/cart" 
                className="relative flex items-center gap-2 group py-2 px-3 rounded-sm hover:bg-black/10 transition-all"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline text-sm font-black uppercase tracking-tight group-hover:text-secondary transition-colors">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 right-0 bg-secondary text-button-text text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-primary">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link 
                to="/account/orders" 
                className="hidden xl:flex items-center gap-2 group py-2 px-3 rounded-sm hover:bg-black/10 transition-all"
              >
                <Box size={20} />
                <span className="text-sm font-black uppercase tracking-tight group-hover:text-secondary transition-colors">Orders</span>
              </Link>

              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-sm hover:bg-black/10 transition-all"
              >
                {isDark ? <Sun size={20} className="text-star" /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-navbar-text hover:bg-black/10 rounded-sm transition-all"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[280px] bg-card z-[120] shadow-2xl p-0 flex flex-col overflow-hidden"
            >
              <div className="bg-navbar p-6 text-navbar-text">
                <div className="flex justify-between items-center mb-6">
                  <Logo className="w-10 h-10 bg-card rounded-sm p-1 border border-border/50" />

                  <button onClick={() => setIsMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm font-black uppercase tracking-widest">The Chocolate Mine</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { label: 'All Categories', icon: Menu, path: '/shop' },
                  { label: 'My Orders', icon: Box, path: '/account/orders' },
                  { label: 'My Cart', icon: ShoppingCart, path: '/cart' },
                  { label: 'Track Delivery', icon: Truck, path: '/track' },
                  { label: 'Wishlist', icon: Heart, path: '/account/dashboard' },
                  { label: 'Login / Register', icon: User, path: '/login' },
                ].map((item, i) => (
                  <Link 
                    key={i}
                    to={item.path} 
                    className="flex items-center gap-4 p-4 rounded-sm hover:bg-muted/10 transition-all border-b border-border/30 last:border-0"
                  >
                    <item.icon size={18} className="text-primary" />
                    <span className="font-black text-heading text-xs uppercase tracking-wide">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOverlayOpen} 
        onClose={() => setIsSearchOverlayOpen(false)} 
      />
    </>
  );
};

export default Navbar;
