import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestFirebaseNotificationPermission } from '../../firebase';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Bell, BellOff } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const NotificationPrompt = () => {
  const { user, enableNotifications, disableNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPermissionGranted = typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted';
  const hasFcmToken = (user?.fcmTokens && user.fcmTokens.length > 0) || isPermissionGranted;

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const isGranted = window.Notification.permission === 'granted';
    const isDenied = window.Notification.permission === 'denied';
    const doNotAskAgain = localStorage.getItem('notificationPromptDoNotAsk') === 'true';

    // Auto-prompt on each session ONLY for logged-in users who haven't enabled notifications yet and haven't selected "Don't ask again"
    if (
      user && 
      !hasFcmToken && 
      !isGranted && 
      !isDenied && 
      !doNotAskAgain
    ) {
      // Use sessionStorage so the prompt re-appears each new browser session if not permanently disabled
      const hasSeenPromptThisSession = sessionStorage.getItem('notificationPromptSeen');
      if (!hasSeenPromptThisSession) {
        // Slight delay so it doesn't interrupt immediate page load
        const timer = setTimeout(() => {
          const recheckGranted = window.Notification?.permission === 'granted';
          const recheckDoNotAsk = localStorage.getItem('notificationPromptDoNotAsk') === 'true';
          if (!recheckGranted && !recheckDoNotAsk) {
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
    // Only store in sessionStorage (resets on browser close) so it re-prompts next session unless "Don't ask again" was selected
    sessionStorage.setItem('notificationPromptSeen', '1');
    setIsOpen(false);
  };

  const handleDoNotAskAgain = () => {
    localStorage.setItem('notificationPromptDoNotAsk', 'true');
    setIsOpen(false);
  };

  const handleToggleNotifications = async () => {
    try {
      setIsLoading(true);
      if (hasFcmToken) {
        // Disable notifications
        await disableNotifications();
        toast.success("Push notifications disabled");
      } else {
        // Enable notifications (Explicit request)
        const success = await enableNotifications();
        if (success) {
          localStorage.setItem('notificationPromptDoNotAsk', 'true');
          toast.success("🎉 Push notifications enabled! You'll get order updates and offers.");
        } else if (Notification.permission === 'denied') {
          toast.error(
            "Notifications are blocked by your browser. Go to browser Settings → Site Settings → Notifications to allow.",
            { duration: 8000 }
          );
        } else {
          toast.error("Please allow notification permissions when prompted by your browser.");
        }
      }
      handleClose(); // Close modal on success
    } catch (err) {
      toast.error("Failed to update notification preferences.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Notification Preferences" size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          {hasFcmToken ? <Bell size={32} /> : <BellOff size={32} />}
        </div>
        
        <h4 className="text-xl font-black text-heading">
          {hasFcmToken ? 'Notifications Enabled' : 'Stay in the loop!'}
        </h4>
        
        <p className="text-body text-sm px-2">
          {hasFcmToken 
            ? "You are currently receiving real-time alerts for your orders and delivery updates." 
            : "Get real-time push notifications about your order status, delivery tracking, and payment updates so you never miss a thing."}
        </p>

        {!hasFcmToken ? (
          <div className="w-full pt-4 flex flex-col items-center gap-2.5">
            <div className="flex gap-3 w-full">
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
              className="text-xs text-body-muted hover:text-primary transition-colors py-1 font-medium underline underline-offset-4"
            >
              Don't Ask Again
            </button>
          </div>
        ) : (
          <div className="w-full pt-4 flex gap-3">
            <Button variant="ghost" className="w-full" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            <Button 
              variant="danger" 
              className="w-full" 
              onClick={handleToggleNotifications}
              loading={isLoading}
            >
              Disable
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationPrompt;
