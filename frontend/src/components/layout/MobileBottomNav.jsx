import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, Heart, ShoppingBag, Cake } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBottomNav = () => {
  const { cart } = useCart();
  const location = useLocation();
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.qty, 0) || 0;
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Observe footer to hide bottom nav when footer is in view
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [location.pathname]);

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Shop', icon: ShoppingBag, path: '/shop' },
    { label: 'Custom', icon: Cake, path: '/custom-cake' },
    { label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { label: 'Profile', icon: User, path: '/account/dashboard' },
  ];

  // Hide on checkout and product details pages only
  const hideOn = ['/product', '/checkout'];
  if (hideOn.some(path => location.pathname.startsWith(path))) return null;

  return (
    <AnimatePresence>
      {!isFooterVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:hidden fixed bottom-6 left-0 right-0 z-[100] px-4 pointer-events-none"
        >
          <nav className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-premium flex items-center justify-around p-1.5 pointer-events-auto max-w-md mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex flex-col items-center gap-1 py-2.5 px-3 rounded-[1.5rem] transition-all duration-500 relative group ${
                    isActive ? 'text-primary' : 'text-muted/50 hover:text-primary/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabGlow"
                        className="absolute inset-0 bg-primary/5 rounded-[1.5rem] -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative">
                      <item.icon 
                        size={20} 
                        className={`transition-all duration-500 ${isActive ? 'scale-110 translate-y-[-1px]' : 'group-hover:scale-110'}`} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-accent text-primary text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border-2 border-card">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                      isActive ? 'opacity-100 scale-100 h-auto' : 'opacity-0 scale-50 h-0 overflow-hidden'
                    }`}>
                      {item.label}
                    </span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full shadow-soft"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomNav;
