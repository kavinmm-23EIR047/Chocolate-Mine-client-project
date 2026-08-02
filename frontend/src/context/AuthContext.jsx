import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { requestFirebaseNotificationPermission, getExistingFcmToken, auth, onAuthStateChanged, logoutGoogle } from '../firebase';

// Safe storage helpers
const safeGet = (storage, key) => { try { return storage.getItem(key); } catch(e) { return null; } };
const safeSet = (storage, key, val) => { try { storage.setItem(key, val); } catch(e) {} };
const safeRemove = (storage, key) => { try { storage.removeItem(key); } catch(e) {} };
const safeClear = (storage) => { try { storage.clear(); } catch(e) {} };

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detect device name for FCM token registration
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android Mobile';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device';
    if (/Windows/.test(ua)) return 'Windows Desktop';
    if (/Mac/.test(ua)) return 'Mac Desktop';
    if (/Linux/.test(ua)) return 'Linux Desktop';
    return 'Web Browser';
  };

  // Register FCM token with backend
  const syncFcmToken = async () => {
    try {
      const token = await getExistingFcmToken();
      if (token) {
        const deviceName = getDeviceName();
        await api.put('/users/fcm-token', {
          fcmToken: token,
          deviceName
        });
        console.log('🔔 FCM token synced successfully');
        
        // Update user fcmTokens array locally
        setUser(prev => {
          if (!prev) return prev;
          const updatedTokens = prev.fcmTokens ? [...prev.fcmTokens] : [];
          const idx = updatedTokens.findIndex(t => t.token === token);
          if (idx >= 0) {
            updatedTokens[idx].deviceName = deviceName;
            updatedTokens[idx].createdAt = new Date();
          } else {
            updatedTokens.push({ token, deviceName, createdAt: new Date() });
          }
          const updatedUser = { ...prev, fcmTokens: updatedTokens };
          safeSet(sessionStorage, 'user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.error('FCM sync failed:', err.message);
    }
  };

  // Explicitly request permission and register token (called by user action)
  const enableNotifications = async () => {
    try {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        const deviceName = getDeviceName();
        await api.put('/users/fcm-token', {
          fcmToken: token,
          deviceName
        });
        console.log('🔔 FCM token enabled successfully');
        
        // Update user fcmTokens array locally
        setUser(prev => {
          if (!prev) return prev;
          const updatedTokens = prev.fcmTokens ? [...prev.fcmTokens] : [];
          const idx = updatedTokens.findIndex(t => t.token === token);
          if (idx >= 0) {
            updatedTokens[idx].deviceName = deviceName;
            updatedTokens[idx].createdAt = new Date();
          } else {
            updatedTokens.push({ token, deviceName, createdAt: new Date() });
          }
          const updatedUser = { ...prev, fcmTokens: updatedTokens };
          safeSet(sessionStorage, 'user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to enable notifications:', err.message);
      return false;
    }
  };

  // Disable/remove FCM token
  const disableNotifications = async () => {
    try {
      let token = null;
      try {
        token = await requestFirebaseNotificationPermission();
      } catch (e) {}

      if (token) {
        await api.put('/users/fcm-token', { fcmToken: token, remove: true });
        setUser(prev => {
          if (!prev) return prev;
          const updatedTokens = (prev.fcmTokens || []).filter(t => t.token !== token);
          const updatedUser = { ...prev, fcmTokens: updatedTokens };
          safeSet(sessionStorage, 'user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      } else {
        // Fallback: clear all if no token is accessible
        await api.put('/users/fcm-token', { fcmToken: null });
        setUser(prev => {
          if (!prev) return prev;
          const updatedUser = { ...prev, fcmTokens: [] };
          safeSet(sessionStorage, 'user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      console.log('🔔 FCM notifications disabled successfully');
    } catch (err) {
      console.error('Disable notifications failed:', err.message);
      throw err;
    }
  };

  // Initialize auth state - auto-login via Firebase & Bearer token / HttpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = safeGet(sessionStorage, 'user') || safeGet(localStorage, 'user');
      const token = safeGet(sessionStorage, 'token') || safeGet(localStorage, 'token');

      // We used to have a fast-path here to skip network auth check if storage was empty, 
      // but this breaks session restoration on browsers where storage is blocked (Safari Private Mode).
      // We must ALWAYS verify with the server to check for HttpOnly cookies.

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (err) {
          console.error('🔐 Failed to parse stored user', err);
          setUser(null);
          safeRemove(sessionStorage, 'user');
          safeRemove(localStorage, 'user');
        }
      }

      // Verify session with server if token or stored user existed
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.user;
        setUser(userData);
        safeSet(sessionStorage, 'user', JSON.stringify(userData));
        safeSet(localStorage, 'user', JSON.stringify(userData));

        // Sync FCM token in background
        syncFcmToken();
      } catch (err) {
        // Quietly clear stale session data if token expired/invalid
        if (!auth?.currentUser) {
          setUser(null);
          safeRemove(sessionStorage, 'user');
          safeRemove(sessionStorage, 'token');
          safeRemove(localStorage, 'user');
          safeRemove(localStorage, 'token');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Firebase onAuthStateChanged listener
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // If a standard email/password user is already logged in, ignore Firebase's cached session
        const storedUser = safeGet(sessionStorage, 'user') || safeGet(localStorage, 'user');
        if (storedUser) {
           try {
              const parsed = JSON.parse(storedUser);
              if (!parsed.isFirebase) {
                  return; // Don't override standard login
              }
           } catch(e) {}
        }

        if (firebaseUser) {
          try {
            // Get a standard backend session via Firebase Login route
            const response = await api.post('/auth/firebase-login', {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              avatar: firebaseUser.photoURL
            });
            const { user: userData, token } = response.data;
            if (userData) {
              userData.isFirebase = true;
              setUser(userData);
              safeSet(sessionStorage, 'user', JSON.stringify(userData));
              safeSet(localStorage, 'user', JSON.stringify(userData));
            }
            if (token) {
              safeSet(sessionStorage, 'token', token);
              safeSet(localStorage, 'token', token);
            }
            
            // Sync FCM token in background
            syncFcmToken();
          } catch (err) {
            console.error('Backend Firebase Auth failed', err);
          } finally {
            setLoading(false);
          }
        } else {
          // Only clear if standard user is also not present
          const storedUser = safeGet(sessionStorage, 'user') || safeGet(localStorage, 'user');
          if (storedUser) {
             try {
                const parsed = JSON.parse(storedUser);
                if (parsed.isFirebase) {
                    setUser(null);
                    safeRemove(sessionStorage, 'user');
                    safeRemove(sessionStorage, 'token');
                    safeRemove(localStorage, 'user');
                    safeRemove(localStorage, 'token');
                }
             } catch(e) {}
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Listen for auth-expired events from the API interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn('🔐 Auth expired event received, logging out locally');
      setUser(null);
      try {
        safeClear(sessionStorage);
        safeRemove(localStorage, 'user');
        safeRemove(localStorage, 'token');
        safeRemove(localStorage, 'auth_user');
      } catch (e) {}
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async ({ email, password }) => {
    console.log('🔐 Logging in:', email);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;
      
      setUser(userData);
      safeSet(sessionStorage, 'user', JSON.stringify(userData));
      safeSet(localStorage, 'user', JSON.stringify(userData));
      
      if (token) {
        safeSet(sessionStorage, 'token', token);
        safeSet(localStorage, 'token', token);
      }
      
      // Sync FCM token after login
      syncFcmToken();

      return response.data;
    } catch (err) {
      console.error('🔐 Login failed:', err.message);
      throw err;
    }
  };

  const logout = async () => {
    // 1. Instant local state wipe for ultra-fast response
    setUser(null);
    try {
      safeClear(sessionStorage);
      safeRemove(localStorage, 'user');
      safeRemove(localStorage, 'token');
      safeRemove(localStorage, 'auth_user');
    } catch (e) {}

    // 2. Perform network cleanups concurrently with safety fallback timeout
    try {
      await Promise.race([
        Promise.allSettled([
          api.post('/auth/logout').catch(() => {}),
          logoutGoogle().catch(() => {})
        ]),
        new Promise((res) => setTimeout(res, 400)) // Max 400ms fallback timeout
      ]);
    } catch (e) {
      // ignore
    }

    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    safeSet(sessionStorage, 'user', JSON.stringify(userData));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, 
      login, 
      logout, 
      updateUser,
      syncFcmToken,
      enableNotifications,
      disableNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
