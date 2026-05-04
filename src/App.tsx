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
  ClipboardPaste
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  { code: '1', name: 'Canada', flag: '🇨🇦' },
  { code: '49', name: 'Germany', flag: '🇩🇪' },
  { code: '33', name: 'France', flag: '🇫🇷' },
  { code: '81', name: 'Japan', flag: '🇯🇵' },
  { code: '65', name: 'Singapore', flag: '🇸🇬' },
];

const App: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [recent, setRecent] = useState<RecentContact[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load recent contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_contacts');
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  const saveContact = (num: string) => {
    const updated = [
      { phone: num, timestamp: Date.now() },
      ...recent.filter(c => c.phone !== num)
    ].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recent_contacts', JSON.stringify(updated));
  };

  const cleanAndValidate = (input: string) => {
    // Smart Parsing: Extract numbers from text if pasted
    const found = input.match(/\+?\d[\d\s-]{7,}\d/);
    const target = found ? found[0] : input;
    
    let cleaned = target.replace(/\D/g, "");

    // Handle auto-prefixing
    if (cleaned.length === 10 && !target.startsWith('+')) {
      cleaned = selectedCountry.code + cleaned;
    }

    // Advanced validation using libphonenumber
    const phoneNumber = parsePhoneNumberFromString('+' + cleaned);
    if (!phoneNumber?.isValid()) {
      return { cleaned, valid: false, error: "Invalid phone number format" };
    }

    return { cleaned: phoneNumber.number.replace('+', ''), valid: true };
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const result = cleanAndValidate(text);
      if (result.cleaned) {
        setPhone(result.cleaned);
        if (!result.valid) setError("Found number but format might be off");
      } else {
        setError("No phone number found in clipboard");
      }
    } catch (err) {
      setError("Clipboard permission denied");
    }
  };

  const handleAction = (type: 'message' | 'qr') => {
    const result = cleanAndValidate(phone);
    
    if (!result.valid) {
      setError(result.error || "Please check the number");
      return;
    }

    const whatsappUrl = `https://wa.me/${result.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (type === 'message') {
      saveContact(result.cleaned);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowQR(true);
    }
  };

  const deleteRecent = (num: string) => {
    const updated = recent.filter(c => c.phone !== num);
    setRecent(updated);
    localStorage.setItem('recent_contacts', JSON.stringify(updated));
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex items-center justify-center p-4",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DirectChat</h1>
          <p className="text-slate-500 text-sm">Fast WhatsApp messaging without saving contacts</p>
        </div>

        {/* Main Card */}
        <div className={cn(
          "glass-card rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden",
          !isDarkMode && "bg-white border-slate-200"
        )}>
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <div className="space-y-4 relative">
            {/* Country & Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Phone size={12} /> Phone Number
              </label>
              <div className="flex gap-2">
                <select 
                  value={selectedCountry.code}
                  onChange={(e) => setSelectedCountry(COUNTRY_CODES.find(c => c.code === e.target.value) || COUNTRY_CODES[0])}
                  className={cn(
                    "p-3 rounded-xl border appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
                    isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                  )}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                  ))}
                </select>
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
                      "w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
                      isDarkMode ? "bg-slate-900 border-slate-700 placeholder:text-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                  {error && <p className="text-red-500 text-[10px] mt-1 absolute left-1">{error}</p>}
                </div>
                <button
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className={cn(
                    "p-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center",
                    isDarkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <ClipboardPaste size={20} className="text-emerald-500" />
                </button>
              </div>
            </div>

            {/* Message Prefill */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Type size={12} /> Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello, I'd like to..."
                rows={2}
                className={cn(
                  "w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none",
                  isDarkMode ? "bg-slate-900 border-slate-700 placeholder:text-slate-600" : "bg-white border-slate-200"
                )}
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              <button
                onClick={() => handleAction('message')}
                className="col-span-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Send size={18} /> Send on WhatsApp
              </button>
              <button
                onClick={() => handleAction('qr')}
                className={cn(
                  "flex items-center justify-center rounded-xl border transition-all active:scale-95",
                  isDarkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <QrCode size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Section */}
        {recent.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <History size={12} /> Recent Chats
              </span>
              <button 
                onClick={() => {
                  setRecent([]);
                  localStorage.removeItem('recent_contacts');
                }}
                className="text-[10px] hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid gap-2">
              {recent.map((contact) => (
                <div 
                  key={contact.phone}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border group transition-all",
                    isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/50" : "bg-white border-slate-100 hover:border-emerald-500/50"
                  )}
                >
                  <button 
                    onClick={() => setPhone(contact.phone)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs">
                      {contact.phone.slice(-2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">+{contact.phone}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(contact.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <button 
                    onClick={() => deleteRecent(contact.phone)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-center gap-4 text-slate-500 pt-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:text-emerald-500 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 text-center relative shadow-2xl">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Scan to Chat</h3>
              <p className="text-sm text-slate-500">Share this QR code with others to start a chat with +{cleanAndValidate(phone).cleaned}</p>
            </div>
            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <QRCodeSVG 
                value={`https://wa.me/${cleanAndValidate(phone).cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`} 
                size={200}
                fgColor="#0f172a"
              />
            </div>
            <button 
              onClick={() => setShowQR(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
