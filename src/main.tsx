import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import App from './App';

// Initialize GA4 - Replace with your actual Measurement ID
ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send("pageview");

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
