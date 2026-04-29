import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = "" }) => {
  return (
    <div 
      className={`flex items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-display font-black overflow-hidden shadow-sm ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.7 }}
    >
      T
    </div>
  );
};
