import React from 'react';
import { Settings } from 'lucide-react';

const Logo = ({ variant = 'default', className = '' }) => {
  if (variant === 'themed') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          <div className="w-12 h-12 bg-primary rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-primary/20">
            <Settings className="w-7 h-7 text-dark-bg -rotate-12 animate-spin-slow" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-yellow rounded-lg flex items-center justify-center border-2 border-dark-bg">
            <div className="w-1.5 h-1.5 bg-dark-bg rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white tracking-tighter leading-none uppercase">CATOCA</span>
          <span className="text-[10px] font-bold text-primary tracking-[0.2em] leading-none uppercase mt-1">Maintenance</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Settings className="w-6 h-6 text-primary" />
      <span className="text-xl font-bold text-white tracking-tight">CATOCA</span>
    </div>
  );
};

export default Logo;
