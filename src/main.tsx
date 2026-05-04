import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Auth features will not work.");
}

// Initialize GA4
const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID) {
  ReactGA.initialize(GA_ID);
  ReactGA.send("pageview");
}

if (!PUBLISHABLE_KEY) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#10b981' }}>Configuration Required</h1>
        <p>Please add your <b>VITE_CLERK_PUBLISHABLE_KEY</b> to your environment variables.</p>
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: '#1e293b', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          1. Go to Netlify Dashboard <br/>
          2. Site Settings > Environment Variables <br/>
          3. Add <b>VITE_CLERK_PUBLISHABLE_KEY</b>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
          This message will disappear once the key is configured.
        </p>
      </div>
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
