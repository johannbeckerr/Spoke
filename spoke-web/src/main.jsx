import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import App from './App.jsx';
import './index.css';

// The Android plugin only builds its sign-in client inside initialize(), so
// this has to run once before any signIn() call. The browser never needs it —
// there we use <GoogleLogin>, which the provider below sets up instead.
if (Capacitor.isNativePlatform()) {
  // If this rejects, signIn() later dies on an uninitialized client with a
  // misleading generic error — so make the root cause loud in the log.
  GoogleAuth.initialize().catch((err) =>
    console.error('GoogleAuth.initialize() failed — native Google sign-in will not work:', err)
  );
}

// The provider loads Google's script and hands the client ID to the
// <GoogleLogin> button. The ID is public — it lives in .env, not in a secret.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
