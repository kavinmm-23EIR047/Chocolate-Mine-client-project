import React from 'react'; // VERSION 1.1
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';
import StaffLayout from './components/layouts/StaffLayout';

// Guards
import { ProtectedRoute, AdminRoute, StaffRoute, GuestRoute } from './routes/Guards';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import OccasionProducts from './pages/OccasionProducts';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ForgotPassword from './pages/ForgotPassword';
import OAuthCallback from './pages/OAuthCallback';
import ReviewPage from './pages/ReviewPage';

// Premium User Dashboard Layout
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/user/DashboardHome';
import ProfileDetails from './pages/user/ProfileDetails';
import AddressManager from './pages/user/AddressManager';
import AccountSettings from './pages/user/AccountSettings';
import OrderHistory from './pages/user/OrderHistory';
import OrderDetails from './pages/user/OrderDetails';
import Wishlist from './pages/user/Wishlist';
import MyReviews from './pages/user/Reviews';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Import socket service for initialization
import socketService from './services/socketService';
import { useAuth } from './context/AuthContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// Socket Initializer Component
const SocketInitializer = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = sessionStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        
        // Join appropriate room based on user role
        if (user.role === 'admin') {
          socketService.joinAdminRoom();
          console.log('Admin joined admin room');
        } else if (user.role === 'staff') {
          socketService.joinStaffRoom(user._id);
          console.log('Staff joined staff room:', user._id);
        } else {
          socketService.joinUserRoom(user._id);
          console.log('User joined user room:', user._id);
        }
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  return <>{children}</>;
};

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStaff from './pages/admin/AdminStaff';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CategoryManager from './pages/admin/CategoryManager';
import OccasionManager from './pages/admin/OccasionManager';
import StaffDashboard from './pages/staff/StaffDashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <LocationProvider>
          <CartProvider>
            <WishlistProvider>
              <ThemeProvider>
                <Router>
                  <ScrollToTop />
                  <SocketInitializer />
                  <Toaster
                    position="bottom-center"
                    toastOptions={{
                      className: 'glass-toast',
                      duration: 4000,
                      style: {
                        background: 'rgba(59, 26, 15, 0.9)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px 24px',
                        fontWeight: '900',
                        fontSize: '14px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                  <Routes>
                    {/* Public/User Routes */}
                    <Route element={<UserLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Home />} />
                      <Route path="/product/:slug" element={<ProductDetails />} />
                      <Route path="/occasion/:name" element={<OccasionProducts />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/track/:orderId?" element={<OrderTracking />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/oauth-callback" element={<OAuthCallback />} />

                      {/* Guest only */}
                      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* Protected User */}
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/review/:orderId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

                      {/* Legacy Redirects */}
                      <Route path="/profile" element={<Navigate to="/account/dashboard" replace />} />
                      <Route path="/orders" element={<Navigate to="/account/orders" replace />} />

                      {/* Premium Dashboard */}
                      <Route path="/account" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="profile" element={<ProfileDetails />} />
                        <Route path="addresses" element={<AddressManager />} />
                        <Route path="settings" element={<AccountSettings />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="orders/:id" element={<OrderDetails />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="reviews" element={<MyReviews />} />
                      </Route>
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/create" element={<ProductForm />} />
                      <Route path="products/edit/:id" element={<ProductForm />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="staff" element={<AdminStaff />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="categories" element={<CategoryManager />} />
                      <Route path="occasions" element={<OccasionManager />} />
                      <Route path="settings" element={<AdminDashboard />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
                      <Route index element={<Navigate to="/staff/dashboard" replace />} />
                      <Route path="dashboard" element={<StaffDashboard />} />
                      <Route path="orders/new" element={<StaffDashboard />} />
                      <Route path="orders/out-for-delivery" element={<StaffDashboard />} />
                      <Route path="orders/delivered" element={<StaffDashboard />} />
                      <Route path="orders/history" element={<StaffDashboard />} />
                    </Route>
                  </Routes>
                </Router>
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </LocationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;