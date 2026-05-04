import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = "pk_test_XXXXXXXXXXXXXXXXXXXX";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Initialize GA4
ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send("pageview");

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
