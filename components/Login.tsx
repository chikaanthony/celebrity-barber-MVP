
import React, { useState } from 'react';
import { Logo, GoldButton } from './CommonUI';
import { Lock, Mail, X, User, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { registerUser, loginUser, logoutUser } from '../services/firebase';

interface LoginProps {
  initialView?: 'login' | 'signup';
  onLogin: (email: string, password?: string) => void;
  onClose: () => void;
  onSignupComplete?: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

const Login: React.FC<LoginProps> = ({ initialView = 'login', onLogin, onClose, onSignupComplete }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        if (view === 'signup') {
          console.log('Starting signup process...');
          await registerUser(email, password, name);
          console.log('Registration successful, signing out so user must login manually...');
          
          // Sign out immediately so user must login manually
          await logoutUser();
          
          // Clear fields
          setPassword('');
          setName('');
          
          // Show success dialog
          alert('Registration Successful!\n\nYour profile has been created.\nPlease log in with your credentials.');
          
          // Notify parent to close modal and reopen with login view
          if (onSignupComplete) {
            onSignupComplete();
          } else {
            // Fallback: switch to login view in modal
            setView('login');
          }
        } else if (view === 'login') {
          console.log('🔐 Starting login process with email:', email);
          const user = await loginUser(email, password);
          console.log('✅ Login response received:', user);
          console.log('📞 Calling onLogin callback...');
          onLogin(user.email || email, password);
          console.log('✅ onLogin callback completed');
        } else if (view === 'forgot') {
          setIsRecovering(true);
          setTimeout(() => {
            setIsRecovering(false);
            setView('login');
            alert('Recovery transmission sent to your encrypted mail.');
          }, 2000);
        }
      } catch (err: any) {
        console.error('❌ Auth error:', err);
        console.error('Error details:', {
          message: err?.message,
          code: err?.code,
          stack: err?.stack
        });
        const errorMessage = err?.message || err?.code || 'Authentication failed';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderView = () => {
    switch (view) {
      case 'signup':
        return (
          <div className="animate-slideUp space-y-6">
            <div className="text-center space-y-3 mb-8">
              <Logo size="md" />
              <h2 className="text-2xl font-luxury gold-text uppercase tracking-widest mt-4">
                Join the Elite
              </h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Establish your premium identity</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="Create Secure PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <GoldButton className="w-full py-5 mt-4" disabled={!email || !name || loading}>
                {loading ? 'Creating...' : 'Create Profile'}
              </GoldButton>

              {error && (
                <p className="text-red-400 text-[11px] text-center mt-3">{error}</p>
              )}

              {success && (
                <p className="text-green-400 text-[11px] text-center mt-3 font-semibold">{success}</p>
              )}

              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="text-[9px] text-zinc-500 hover:gold-text transition-colors uppercase tracking-[0.2em] font-black"
                >
                  Already a client? <span className="gold-text">Log In</span>
                </button>
              </div>
            </form>
          </div>
        );

      case 'forgot':
        return (
          <div className="animate-slideUp space-y-6">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                <ShieldCheck className={`w-8 h-8 ${isRecovering ? 'gold-text animate-pulse' : 'text-zinc-500'}`} />
              </div>
              <h2 className="text-2xl font-luxury gold-text uppercase tracking-widest">
                Identity Recovery
              </h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Restore access to your profile</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-600 ml-4">Authorized Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <GoldButton className="w-full py-5" disabled={!email || isRecovering}>
                {isRecovering ? 'Initializing Transmission...' : 'Initialize Recovery'}
              </GoldButton>

              <button 
                type="button" 
                onClick={() => setView('login')}
                className="w-full flex items-center justify-center gap-2 text-[9px] text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em] font-black"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Entrance
              </button>
            </form>
          </div>
        );

      default: // Login view
        return (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center space-y-3 mb-8">
              <Logo size="md" />
              <h2 className="text-2xl font-luxury gold-text uppercase tracking-widest mt-4">
                Client Entrance
              </h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Access your premium profile</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:gold-text transition-colors" />
                    <input
                      type="password"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all text-sm"
                      placeholder="Security PIN"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end px-2">
                    <button 
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[8px] text-zinc-600 hover:gold-text uppercase tracking-widest font-black transition-colors"
                    >
                      Forgot identity?
                    </button>
                  </div>
                </div>
              </div>

              <GoldButton className="w-full py-5 mt-2" disabled={!email || !password || loading}>
                {loading ? 'Authenticating...' : 'Authenticate'}
              </GoldButton>

              {error && (
                <p className="text-red-400 text-[11px] text-center mt-3">{error}</p>
              )}

              {success && (
                <p className="text-green-400 text-[11px] text-center mt-3 font-semibold">{success}</p>
              )}

              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => setView('signup')}
                  className="text-[9px] text-zinc-500 hover:gold-text transition-colors uppercase tracking-[0.2em] font-black"
                >
                  New client? <span className="gold-text">Sign Up</span>
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border gold-border rounded-[3rem] p-10 relative shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles className="w-32 h-32 rotate-12 gold-text" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all hover:rotate-90 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {renderView()}

        <p className="text-center text-zinc-700 text-[7px] uppercase tracking-[0.4em] font-black mt-10">
          Secure Premium Access &copy; Celebrity Barber
        </p>
      </div>
    </div>
  );
};

export default Login;
