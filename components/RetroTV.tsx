import React, { useEffect, useState } from 'react';

interface RetroTVProps {
  onComplete: () => void;
}

const RetroTV: React.FC<RetroTVProps> = ({ onComplete }) => {
  const [turnOff, setTurnOff] = useState(false);

  useEffect(() => {
    // Simulate boot up sequence length
    const timer = setTimeout(() => {
      setTurnOff(true);
      setTimeout(onComplete, 600); // Wait for turn off animation
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050505] transition-opacity duration-1000 ${turnOff ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* TV Bezel / Container */}
      <div className={`relative w-[90vw] max-w-4xl aspect-[4/3] bg-[#222] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border-8 border-[#333] p-4 sm:p-8 transition-transform duration-500 ${turnOff ? 'scale-y-0 scale-x-150' : 'scale-100'}`}>
        
        {/* Screen Bezel Inner */}
        <div className="w-full h-full bg-black rounded overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]">
          
          {/* CRT Effects */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] animate-scanlines" />
          <div className="absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
          
          {/* Content inside TV */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
             
             {/* Static Noise Background */}
             <div className="absolute inset-0 opacity-10 animate-pulse">
                <div className="w-full h-full bg-repeat opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`}}></div>
             </div>

             {/* Glitching Logo */}
             <div className="relative z-10 flex flex-col items-center">
               <h1 className="text-6xl md:text-9xl font-bold tracking-wider text-white animate-glitch font-['Karantina']" style={{ textShadow: '2px 0 red, -2px 0 blue' }}>
                 רשף
               </h1>
               <div className="mt-4 w-32 h-2 bg-white animate-pulse" />
               <p className="mt-8 font-mono text-xs text-green-500 opacity-70">LOADING_SYSTEM_CORE... 99%</p>
             </div>
          </div>

          {/* Screen turn off white dot effect */}
          {turnOff && <div className="absolute inset-0 bg-white z-50 animate-tv-off"></div>}
          
        </div>

        {/* TV Buttons (Visual only) */}
        <div className="absolute bottom-2 right-8 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-900 animate-pulse"></div>
            <div className="w-8 h-1 bg-[#111] rounded"></div>
            <div className="w-8 h-1 bg-[#111] rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default RetroTV;