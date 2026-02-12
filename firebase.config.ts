/// <reference types="vite/client" />

// Firebase Configuration
// This file reads values from Vite environment variables. Create a
// `.env.local` (or `.env`) at the project root with your Firebase values:
//
// VITE_FIREBASE_API_KEY=your_api_key
// VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=your-project-id
// VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
// VITE_FIREBASE_APP_ID=your_app_id
//
// Vite exposes env vars as `import.meta.env.VITE_*` in the browser.
// If env vars are not provided this file falls back to placeholder strings.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
};

// Debug helper: show whether the API key is loaded (masked)
(() => {
  const rawKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const mask = (k?: string) => {
    if (!k) return 'undefined';
    if (k.includes('YOUR_API_KEY')) return k;
    if (k.length <= 8) return '****';
    return k.slice(0, 4) + '...' + k.slice(-4);
  };
  // eslint-disable-next-line no-console
  console.info('Firebase config loaded — apiKey:', mask(rawKey));
  if (!rawKey || rawKey === 'YOUR_API_KEY') {
    // eslint-disable-next-line no-console
    console.error('Firebase API key not provided. Create a .env.local with VITE_FIREBASE_API_KEY and restart dev server.');
  }
})();
