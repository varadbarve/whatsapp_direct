import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  History, 
  QrCode, 
  X, 
  Settings,
  Phone,
  Type,
  Trash2,
  ClipboardPaste,
  Cloud,
  Share2,
  Zap,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton, 
  useUser 
} from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RecentContact {
  phone: string;
  timestamp: number;
}

const COUNTRY_CODES = [
  { code: '91', name: 'India', flag: '🇮🇳' },
  { code: '1', name: 'USA', flag: '🇺🇸' },
  { code: '44', name: 'UK', flag: '🇬🇧' },
  { code: '971', name: 'UAE', flag: '🇦🇪' },
  { code: '61', name: 'Australia', flag: '🇦🇺' },
  { code: '49', name: 'Germany', flag: '🇩🇪' },
  { code: '33', name: 'France', flag: '🇫🇷' },
  { code: '81', name: 'Japan', flag: '🇯🇵' },
  { code: '65', name: 'Singapore', flag: '🇸🇬' },
];

const TEMPLATES = [
  "Hi, I'm interested in...",
  "Can you share your location?",
  "Please call me back when free.",
  "Thanks for the help!"
];

const App: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [recent, setRecent] = useState<RecentContact[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Haptic Feedback Utility
  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    if (!window.navigator.vibrate) return;
    
    switch(type) {
      case 'light': window.navigator.vibrate(10); break;
      case 'medium': window.navigator.vibrate(20); break;
      case 'success': window.navigator.vibrate([10, 30, 10]); break;
    }
  };

  // Load recent contacts from localStorage or Clerk
  useEffect(() => {
    if (isLoaded && user) {
      const cloudRecent = user.unsafeMetadata.recent as RecentContact[];
      if (cloudRecent) setRecent(cloudRecent);
    } else {
      const saved = localStorage.getItem('recent_contacts');
      if (saved) setRecent(JSON.parse(saved));
    }
  }, [isLoaded, user]);

  const saveContact = async (num: string) => {
    const updated = [
      { phone: num, timestamp: Date.now() },
      ...recent.filter(c => c.phone !== num)
    ].slice(0, 5);
    
    setRecent(updated);
    localStorage.setItem('recent_contacts', JSON.stringify(updated));

    if (user) {
      await user.update({ unsafeMetadata: { recent: updated } });
    }
  };

  const cleanAndValidate = (input: string) => {
    const found = input.match(/\+?\d[\d\s-]{7,}\d/);
    const target = found ? found[0] : input;
    let cleaned = target.replace(/\D/g, "");

    if (cleaned.length === 10 && !target.startsWith('+')) {
      cleaned = selectedCountry.code + cleaned;
    }

    const phoneNumber = parsePhoneNumberFromString('+' + cleaned);
    if (!phoneNumber?.isValid()) {
      return { cleaned, valid: false, error: "Invalid phone number" };
    }

    return { cleaned: phoneNumber.number.replace('+', ''), valid: true };
  };

  const handlePaste = async () => {
    triggerHaptic('light');
    try {
      const text = await navigator.clipboard.readText();
      const result = cleanAndValidate(text);
      if (result.cleaned) {
        setPhone(result.cleaned);
        if (!result.valid) setError("Format might be off");
      } else {
        setError("No number found in clipboard");
      }
    } catch (err) {
      setError("Clipboard access denied");
    }
  };

  const handleAction = (type: 'message' | 'qr') => {
    triggerHaptic('medium');
    const result = cleanAndValidate(phone);
    if (!result.valid) {
      setError(result.error || "Check the number");
      return;
    }

    const whatsappUrl = `https://wa.me/${result.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (type === 'message') {
      saveContact(result.cleaned);
      triggerHaptic('success');
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowQR(true);
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    const result = cleanAndValidate(phone);
    const url = `https://wa.me/${result.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DirectChat',
          text: `Chat with me on WhatsApp: ${result.cleaned}`,
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
            {/* Phone Input Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 px-1">
                <Phone size={10} className="text-emerald-500" /> Phone Number
              </label>
              <div className="flex gap-2">
                <div className="relative group">
                  <select 
                    value={selectedCountry.code}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setSelectedCountry(COUNTRY_CODES.find(c => c.code === e.target.value) || COUNTRY_CODES[0]);
                    }}
                    className={cn(
                      "h-14 px-4 rounded-2xl border appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-medium",
                      isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="98765 43210"
                    className={cn(
                      "w-full h-14 px-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-medium",
                      isDarkMode ? "bg-slate-900/80 border-slate-800 placeholder:text-slate-700" : "bg-white border-slate-200"
                    )}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-[10px] mt-1.5 absolute left-1 font-semibold"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={handlePaste}
                  className={cn(
                    "h-14 w-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
                    isDarkMode ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <ClipboardPaste size={20} className="text-emerald-500" />
                </button>
              </div>
            </div>

            {/* Message Group */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Type size={10} className="text-emerald-500" /> Message
                </label>
                <span className="text-[10px] text-slate-600 font-mono">{message.length}/500</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello! Let's chat..."
                rows={3}
                maxLength={500}
                className={cn(
                  "w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none font-medium",
                  isDarkMode ? "bg-slate-900/80 border-slate-800 placeholder:text-slate-700" : "bg-white border-slate-200"
                )}
              />
              
              {/* Templates */}
              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
                {TEMPLATES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      triggerHaptic('light');
                      setMessage(t);
                    }}
                    className={cn(
                      "whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-95",
                      isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400" : "bg-slate-100 border-slate-200 text-slate-600"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-6 gap-2 pt-2">
              <button
                onClick={() => handleAction('message')}
                className="col-span-4 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 tap-highlight-none"
              >
                <Send size={18} /> Send Message
              </button>
              <button
                onClick={() => handleAction('qr')}
                title="Generate QR Code"
                className={cn(
                  "h-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
                  isDarkMode ? "border-slate-800 bg-slate-900/80 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <QrCode size={20} className="text-emerald-500" />
              </button>
              <button
                onClick={handleShare}
                title="Share Link"
                className={cn(
                  "h-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
                  isDarkMode ? "border-slate-800 bg-slate-900/80 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <Share2 size={20} className="text-blue-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Section */}
        <AnimatePresence>
          {recent.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 px-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <History size={10} className="text-emerald-500" /> Recent Activity
                </span>
                <button 
                  onClick={() => {
                    triggerHaptic('medium');
                    setRecent([]);
                    localStorage.removeItem('recent_contacts');
                  }}
                  className="text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-2">
                {recent.map((contact, idx) => (
                  <motion.div 
                    key={contact.phone}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-3xl border group transition-all relative overflow-hidden",
                      isDarkMode ? "bg-slate-900/40 border-slate-900/50 hover:border-emerald-500/30" : "bg-white border-slate-100 shadow-sm"
                    )}
                  >
                    <button 
                      onClick={() => {
                        triggerHaptic('light');
                        setPhone(contact.phone);
                      }}
                      className="flex items-center gap-4 flex-1 text-left tap-highlight-none"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                        {contact.phone.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">+{contact.phone}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(contact.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        triggerHaptic('medium');
                        const updated = recent.filter(c => c.phone !== contact.phone);
                        setRecent(updated);
                        localStorage.setItem('recent_contacts', JSON.stringify(updated));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all tap-highlight-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Modern QR Bottom Sheet Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-w-sm w-full space-y-6 text-center relative shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  setShowQR(false);
                }}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors p-2 tap-highlight-none"
              >
                <X size={24} />
              </button>
              
              <div className="space-y-2 pt-2">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <QrCode size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Scan to Chat</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-4">
                  Point your camera at this code to start a chat with <span className="font-bold text-slate-900">+{cleanAndValidate(phone).cleaned}</span>
                </p>
              </div>

              <div className="flex justify-center p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 relative group">
                <QRCodeSVG 
                  value={`https://wa.me/${cleanAndValidate(phone).cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`} 
                  size={200}
                  fgColor="#0f172a"
                  includeMargin={false}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-[2rem]">
                  <Sparkles className="text-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleShare}
                  className="bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm tap-highlight-none"
                >
                  <Share2 size={18} /> Share
                </button>
                <button 
                  onClick={() => setShowQR(false)}
                  className="bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all text-sm tap-highlight-none"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
