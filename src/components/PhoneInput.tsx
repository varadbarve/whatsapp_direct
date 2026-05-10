import React from 'react';
import { Phone, ClipboardPaste } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CODES } from '../constants';
import { CountryCode } from '../types';
import { cn } from '../lib/utils';

interface PhoneInputProps {
  phone: string;
  setPhone: (val: string) => void;
  selectedCountry: CountryCode;
  setSelectedCountry: (val: CountryCode) => void;
  error: string;
  setError: (val: string) => void;
  isDarkMode: boolean;
  onPaste: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phone,
  setPhone,
  selectedCountry,
  setSelectedCountry,
  error,
  setError,
  isDarkMode,
  onPaste,
  triggerHaptic,
}) => {
  return (
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
          onClick={onPaste}
          className={cn(
            "h-14 w-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
            isDarkMode ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
          )}
        >
          <ClipboardPaste size={20} className="text-emerald-500" />
        </button>
      </div>
    </div>
  );
};
