import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings,
  Zap,
  Cloud
} from 'lucide-react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton 
} from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';

// Hooks & Utils
import { useWhatsApp } from './hooks/useWhatsApp';
import { cn } from './lib/utils';

// Components
import { PhoneInput } from './components/PhoneInput';
import { MessageInput } from './components/MessageInput';
import { ActionGrid } from './components/ActionGrid';
import { HistorySection } from './components/HistorySection';
import { ContactsSection } from './components/ContactsSection';
import { QRModal } from './components/QRModal';

const App: React.FC = () => {
  const {
    phone,
    setPhone,
    message,
    setMessage,
    error,
    setError,
    selectedCountry,
    setSelectedCountry,
    recent,
    setRecent,
    isDarkMode,
    setIsDarkMode,
    triggerHaptic,
    saveContact,
    validationResult,
    contacts,
    getContacts,
  } = useWhatsApp();

  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'contacts'>('recent');

  // Initialize Native Features (Status Bar & Splash Screen)
  useEffect(() => {
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
        if (window.navigator.userAgent.toLowerCase().includes('android')) {
          await StatusBar.setBackgroundColor({ color: isDarkMode ? '#0f172a' : '#f8fafc' });
        }
        await SplashScreen.hide();
        
        // Fetch contacts if available
        getContacts();
      } catch (e) {
        console.log("Running in browser, skipping native initialization");
      }
    };
    initNative();
  }, [isDarkMode]);

  const handlePaste = async () => {
    triggerHaptic('light');
    try {
      const text = await navigator.clipboard.readText();
      const cleanedNum = text.replace(/\D/g, "");
      if (cleanedNum) {
        setPhone(cleanedNum);
      } else {
        setError("No number found in clipboard");
      }
    } catch (err) {
      setError("Clipboard access denied");
    }
  };

  const handleAction = (type: 'message' | 'qr') => {
    triggerHaptic('medium');
    if (!validationResult.valid) {
      setError(validationResult.error || "Check the number");
      return;
    }

    const whatsappUrl = `https://wa.me/${validationResult.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (type === 'message') {
      saveContact(validationResult.cleaned);
      triggerHaptic('success');
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowQR(true);
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    const url = `https://wa.me/${validationResult.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DirectChat',
          text: `Chat with me on WhatsApp: ${validationResult.cleaned}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className={cn(
      "min-h-[100dvh] transition-colors duration-500 flex items-center justify-center p-4 selection:bg-emerald-500/30",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10"
            >
              <MessageSquare size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">DirectChat</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Ready to sync</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs bg-slate-900/50 border border-slate-800 hover:bg-slate-800 px-3 py-2 rounded-xl transition-all flex items-center gap-2 tap-highlight-none">
                  <Cloud size={14} className="text-emerald-500" />
                  Sync
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="bg-slate-900/50 p-1 rounded-full border border-slate-800">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          layout
          className={cn(
            "glass-card rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden border border-white/5",
            !isDarkMode && "bg-white border-slate-200"
          )}
        >
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="space-y-5 relative">
            <PhoneInput 
              phone={phone}
              setPhone={setPhone}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              error={error}
              setError={setError}
              isDarkMode={isDarkMode}
              onPaste={handlePaste}
              triggerHaptic={triggerHaptic}
            />

            <MessageInput 
              message={message}
              setMessage={setMessage}
              isDarkMode={isDarkMode}
              triggerHaptic={triggerHaptic}
            />

            <ActionGrid 
              onAction={handleAction}
              onShare={handleShare}
              isDarkMode={isDarkMode}
            />
          </div>
        </motion.div>

        {/* Tabs for Recent / Contacts / Calls */}
        <div className="flex gap-2 p-1 bg-slate-900/40 rounded-2xl border border-slate-800/50">
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'calls', label: 'Calls' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { triggerHaptic('light'); setActiveTab(tab.id as any); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div layout>
          {activeTab === 'recent' && (
            <HistorySection 
              recent={recent}
              onSelect={setPhone}
              onDelete={(num) => {
                const updated = recent.filter(c => c.phone !== num);
                setRecent(updated);
                localStorage.setItem('recent_contacts', JSON.stringify(updated));
              }}
              onClearAll={() => {
                setRecent([]);
                localStorage.removeItem('recent_contacts');
              }}
              isDarkMode={isDarkMode}
              triggerHaptic={triggerHaptic}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsSection 
              contacts={contacts}
              onSelect={setPhone}
              isDarkMode={isDarkMode}
              triggerHaptic={triggerHaptic}
            />
          )}
          {activeTab === 'calls' && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <Settings size={32} className="animate-spin-slow" />
              </div>
              <p className="text-sm font-bold">Android Call Log Bridge Required</p>
              <p className="text-xs text-slate-500 px-8 leading-relaxed">
                To see your actual phone calls here, you need to add the native CallLog bridge in Android Studio.
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer Controls */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <button 
            onClick={() => {
              triggerHaptic('light');
              setIsDarkMode(!isDarkMode);
            }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors px-4 py-2 rounded-full border border-transparent hover:border-slate-800 tap-highlight-none"
          >
            <Settings size={14} /> Theme
          </button>
          <div className="w-px h-3 bg-slate-800" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <Zap size={10} className="text-emerald-500" /> Pro Version
          </p>
        </div>
      </motion.div>

      <QRModal 
        show={showQR}
        onClose={() => setShowQR(false)}
        phone={validationResult.cleaned}
        message={message}
        onShare={handleShare}
        triggerHaptic={triggerHaptic}
      />
    </div>
  );

};

export default App;
