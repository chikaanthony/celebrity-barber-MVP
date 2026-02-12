
import React from 'react';
import { Crown } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const containerSizes = {
    sm: 'w-8 h-8 sm:w-10 sm:h-10',
    md: 'w-12 h-12 sm:w-16 sm:h-16',
    lg: 'w-16 h-16 sm:w-24 sm:h-24',
  };

  const crownSizes = {
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-6 sm:h-6',
    lg: 'w-6 h-6 sm:w-10 sm:h-10',
  };

  const textSizes = {
    sm: 'text-[8px] sm:text-[10px] tracking-[0.2em] mt-0.5',
    md: 'text-[10px] sm:text-sm tracking-[0.3em] mt-1.5',
    lg: 'text-lg sm:text-2xl tracking-[0.4em] mt-3',
  };

  const sloganSizes = {
    sm: 'text-[4px] sm:text-[6px]',
    md: 'text-[6px] sm:text-[8px]',
    lg: 'text-[7px] sm:text-[10px]',
  };

  const ClipperIcon = ({ className }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 2h10l1.5 4-1.5 2v12l-2 2H9l-2-2V8L5.5 6 7 2zM9 4l-1 2h8l-1-2H9zm0 4v10h6V8H9z" />
      <rect x="8" y="20" width="8" height="2" rx="1" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
        <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-full blur-lg scale-150 transition-colors duration-500"></div>
        <div className="absolute top-0 z-20 transform -translate-y-1/4">
          <Crown className={`${crownSizes[size]} gold-text fill-[var(--accent)]/20 transition-all duration-500`} />
        </div>
        <div className="relative flex items-center justify-center w-full h-full">
          <ClipperIcon className="absolute w-[70%] h-[70%] gold-text transform -rotate-45 -translate-x-0.5 transition-all duration-500" />
          <ClipperIcon className="absolute w-[70%] h-[70%] gold-text transform rotate-45 translate-x-0.5 transition-all duration-500" />
        </div>
      </div>
      <h1 className={`font-luxury gold-text font-bold uppercase transition-all duration-500 ${textSizes[size]}`}>
        Celebrity Barber
      </h1>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="h-[0.5px] w-2 sm:w-4 bg-zinc-800"></div>
        <p className={`text-zinc-600 uppercase font-black tracking-[0.15em] ${sloganSizes[size]}`}>
          Freshness Delivered
        </p>
        <div className="h-[0.5px] w-2 sm:w-4 bg-zinc-800"></div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl transition-all duration-500 ${className}`}>
    {children}
  </div>
);

export const GoldButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
  variant?: 'solid' | 'outline'
}> = ({ children, onClick, disabled, className = '', variant = 'solid' }) => {
  const baseStyles = "px-4 sm:px-8 py-2 sm:py-4 rounded-lg sm:rounded-2xl font-black transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[9px] sm:text-[11px]";
  const variants = {
    solid: "gold-gradient text-black hover:brightness-110 shadow-lg shadow-[var(--accent-glow)]",
    outline: "border border-[var(--accent)]/50 gold-text hover:bg-[var(--accent)] hover:text-black"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
