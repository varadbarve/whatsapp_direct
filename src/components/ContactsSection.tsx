import React, { useState } from 'react';
import { Users, Search, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Contact {
  name?: { display: string };
  phones?: { number: string }[];
}

interface ContactsSectionProps {
  contacts: Contact[];
  onSelect: (phone: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  onSelect,
  isDarkMode,
  triggerHaptic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name?.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phones?.some(p => p.number.includes(searchTerm))
  ).slice(0, 50); // Limit to 50 for performance

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Users size={10} className="text-emerald-500" /> Device Contacts
        </span>
      </div>

      <div className="relative group">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-2xl border outline-none transition-all text-sm",
            isDarkMode ? "bg-slate-900/40 border-slate-900/50 focus:border-emerald-500/30" : "bg-white border-slate-100"
          )}
        />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredContacts.map((contact, idx) => {
            const phoneNumber = contact.phones?.[0]?.number;
            if (!phoneNumber) return null;

            return (
              <motion.button
                key={phoneNumber + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => {
                  triggerHaptic('light');
                  onSelect(phoneNumber);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                  isDarkMode ? "bg-slate-900/20 border-slate-900/30 hover:bg-slate-900/40" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                    {contact.name?.display[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[150px]">{contact.name?.display}</p>
                    <p className="text-[10px] text-slate-500">{phoneNumber}</p>
                  </div>
                </div>
                <Phone size={14} className="text-emerald-500 opacity-40" />
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filteredContacts.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-8">No contacts found</p>
        )}
      </div>
    </div>
  );
};
