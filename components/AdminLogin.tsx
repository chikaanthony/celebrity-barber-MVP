
import React, { useState } from 'react';
import { Logo, GoldButton } from './CommonUI';
import { ShieldCheck, Lock, Mail, X } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string) => void;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && pin === '123456') { // Updated master pin
      onLogin(email);
    } else if (pin !== '123456') {
      alert('Invalid Master Pin');
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-[2.5rem] p-10 relative shadow-[0_0_80px_rgba(0,0,0,1)]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-zinc-600 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center border border-zinc-800 shadow-2xl relative">
              <ShieldCheck className="w-10 h-10 gold-text" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-pulse border-2 border-zinc-900"></div>
            </div>
          </div>
          <h2 className="text-2xl font-luxury uppercase tracking-[0.2em] text-white">Security Bypass</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Authorized Management Credentials Required</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-5 text-white focus:outline-none focus:border-zinc-500 transition-all text-sm font-medium"
                placeholder="Manager Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-5 text-white focus:outline-none focus:border-zinc-500 transition-all text-sm font-medium tracking-[0.5em]"
                placeholder="Master Pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-[#D4AF37] hover:scale-[1.02] transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95"
            >
              Authenticate Admin
            </button>
          </div>
        </form>

        <div className="mt-12 flex flex-col items-center gap-2 opacity-10">
          <Logo size="sm" />
          <p className="text-[6px] text-zinc-400 font-mono">ENCRYPTED END-TO-END SESSION</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
