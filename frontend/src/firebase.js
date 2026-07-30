import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config exists
let app;
let auth;
let messaging;
const googleProvider = new GoogleAuthProvider();

// Use default scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase not initialized. Missing VITE_FIREBASE_API_KEY in .env");
  }
} catch (err) {
  console.error("Firebase init error:", err);
}

// Auth Helper Functions
export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutGoogle = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out from Google:", error);
    throw error;
  }
};

export { auth, onAuthStateChanged };

// Messaging Helper Functions
export const getExistingFcmToken = async () => {
  if (!messaging) return null;

  // Only proceed if permission is already granted. Avoids prompting.
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const currentToken = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: registration
    });
    return currentToken || null;
  } catch (err) {
    console.warn('Silent FCM token fetch failed:', err);
    return null;
  }
};

export const requestFirebaseNotificationPermission = async () => {
  if (!messaging) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("❌ VITE_FIREBASE_VAPID_KEY is missing! Browser notifications cannot be enabled.");
    return null;
  }

  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications, or you are not on a secure HTTPS connection.');
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Notification permission not granted.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};
console.log("Firebase Config:", firebaseConfig);

export const onMessageListener = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
