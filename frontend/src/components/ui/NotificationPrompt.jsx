import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, BellOff, LogIn, Lock } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const safeStorageGet = (storage, key) => {
  try { return storage.getItem(key); } catch { return null; }
};
const safeStorageSet = (storage, key, value) => {
  try { storage.setItem(key, value); } catch { /* Private Browsing */ }
};

const NotificationPrompt = () => {
  const { user, enableNotifications, disableNotifications } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPermissionGranted = typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted';
  const hasFcmToken = (user?.fcmTokens && user.fcmTokens.length > 0) || isPermissionGranted;

  useEffect(() => {
    if (hasFcmToken && typeof window !== 'undefined') {
      safeStorageSet(localStorage, 'notificationPromptDoNotAsk', 'true');
    }
  }, [hasFcmToken]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const isGranted = window.Notification.permission === 'granted';
    const isDenied = window.Notification.permission === 'denied';
    const doNotAskAgain = safeStorageGet(localStorage, 'notificationPromptDoNotAsk') === 'true';

    // Auto-prompt on session only for logged-in users who haven't enabled notifications
    if (
      user && 
      !hasFcmToken && 
      !isGranted && 
      !isDenied && 
      !doNotAskAgain
    ) {
      const hasSeenPromptThisSession = safeStorageGet(sessionStorage, 'notificationPromptSeen');
      if (!hasSeenPromptThisSession) {
        const timer = setTimeout(() => {
          const recheckGranted = window.Notification?.permission === 'granted';
          const recheckDoNotAsk = safeStorageGet(localStorage, 'notificationPromptDoNotAsk') === 'true';
          const recheckSeen = safeStorageGet(sessionStorage, 'notificationPromptSeen') === '1';
          const recheckHasToken = user?.fcmTokens && user.fcmTokens.length > 0;

          if (!recheckGranted && !recheckDoNotAsk && !recheckSeen && !recheckHasToken) {
            setIsOpen(true);
          }
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, hasFcmToken]);

  useEffect(() => {
    // Listen for manual triggers (e.g., from Navbar)
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openNotificationPrompt', handleOpen);
    return () => window.removeEventListener('openNotificationPrompt', handleOpen);
  }, []);

  const handleClose = () => {
    safeStorageSet(sessionStorage, 'notificationPromptSeen', '1');
    setIsOpen(false);
  };

  const handleDoNotAskAgain = () => {
    safeStorageSet(localStorage, 'notificationPromptDoNotAsk', 'true');
    setIsOpen(false);
  };

  const handleToggleNotifications = async () => {
    try {
      setIsLoading(true);
      if (hasFcmToken) {
        await disableNotifications();
        toast.success("Push notifications disabled");
      } else {
        const success = await enableNotifications();
        if (success) {
          safeStorageSet(localStorage, 'notificationPromptDoNotAsk', 'true');
          toast.success("🎉 Push notifications enabled! You'll receive real-time order & delivery updates.");
        } else if (typeof window !== 'undefined' && window.Notification?.permission === 'denied') {
          toast.error(
            "Notifications are blocked by your browser settings. Please allow notifications in site settings.",
            { duration: 6000 }
          );
        } else {
          toast.error("Please click 'Allow' on the browser notification prompt.");
        }
      }
      handleClose();
    } catch (err) {
      toast.error("Failed to update notification preferences.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    handleClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={user ? "Notification Preferences" : "Sign In Required"} size="sm">
      <div className="flex flex-col items-center text-center space-y-4 py-1">
        {/* ICON */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-1">
          {!user ? (
            <Lock size={30} />
          ) : hasFcmToken ? (
            <Bell size={30} />
          ) : (
            <BellOff size={30} />
          )}
        </div>
        
        {/* TITLE & DESCRIPTION */}
        {!user ? (
          <>
            <h4 className="text-lg font-black text-heading">
              Please Sign In
            </h4>
            <p className="text-body text-xs sm:text-sm px-2 leading-relaxed">
              You are currently not logged in. Please sign in to enable real-time order tracking, delivery status alerts, and exclusive offer notifications.
            </p>

            <div className="w-full pt-3 flex flex-col gap-2">
              <Button 
                variant="primary" 
                className="w-full flex items-center justify-center gap-2 py-2.5 font-extrabold text-sm shadow-md"
                onClick={handleLoginRedirect}
              >
                <LogIn size={16} />
                <span>Sign In to Enable Alerts</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-xs text-muted" 
                onClick={handleClose}
              >
                Not Now
              </Button>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-lg font-black text-heading">
              {hasFcmToken ? 'Notifications Active' : 'Enable Real-Time Alerts'}
            </h4>
            <p className="text-body text-xs sm:text-sm px-2 leading-relaxed">
              {hasFcmToken 
                ? "You are currently subscribed to real-time order status and delivery updates on this browser." 
                : "Get instant notifications about your cake orders, delivery status, and special offers so you never miss an update."}
            </p>

            {!hasFcmToken ? (
              <div className="w-full pt-3 flex flex-col items-center gap-2.5">
                <div className="flex gap-2.5 w-full">
                  <Button variant="ghost" className="w-1/2" onClick={handleClose} disabled={isLoading}>
                    Not Now
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-1/2" 
                    onClick={handleToggleNotifications}
                    loading={isLoading}
                  >
                    Enable
                  </Button>
                </div>
                <button 
                  type="button"
                  onClick={handleDoNotAskAgain}
                  disabled={isLoading}
                  className="text-xs text-body-muted hover:text-primary transition-colors py-1 font-medium underline underline-offset-4 cursor-pointer"
                >
                  Don't Ask Again
                </button>
              </div>
            ) : (
              <div className="w-full pt-3 flex gap-2.5">
                <Button variant="ghost" className="w-1/2" onClick={handleClose} disabled={isLoading}>
                  Close
                </Button>
                <Button 
                  variant="danger" 
                  className="w-1/2" 
                  onClick={handleToggleNotifications}
                  loading={isLoading}
                >
                  Disable
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default NotificationPrompt;
