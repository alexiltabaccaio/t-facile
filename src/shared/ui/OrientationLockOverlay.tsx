import React from 'react';

export const OrientationLockOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[1000] bg-neutral-900 flex flex-col items-center justify-center p-8 text-center orientation-landscape-overlay">
      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <svg className="w-8 h-8 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Ruota il dispositivo</h2>
      <p className="text-neutral-400 text-sm max-w-[240px]">Questa applicazione è ottimizzata per la visualizzazione in verticale.</p>
    </div>
  );
};
