import React from 'react';
import { ALBUM_TITLE, TRACKLIST } from '../constants';

interface AlbumViewProps {
    onListen: () => void;
}

const SocialButton = ({ href, label, children }: { href: string; label: string; children?: React.ReactNode }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group flex flex-col items-center gap-3 cursor-pointer"
    >
        <div className="w-14 h-14 border-2 border-white flex items-center justify-center relative overflow-hidden bg-black group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] group-hover:translate-y-1 group-hover:shadow-none group-active:translate-y-1">
             <div className="relative z-10 w-6 h-6 fill-current">
                 {children}
             </div>
             {/* Icon Scanline Overlay */}
             <div className="absolute inset-0 z-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px] opacity-0 group-hover:opacity-20 pointer-events-none"></div>
        </div>
        <span className="font-mono text-xs tracking-widest text-gray-500 group-hover:text-red-500 transition-colors">
            [{label}]
        </span>
    </a>
);

const NewsItem = ({ date, title, content }: { date: string, title: string, content: string }) => (
    <div className="border-l-2 border-gray-800 pl-4 hover:border-red-500 transition-colors duration-300 group">
        <div className="font-mono text-xs text-red-500 mb-1">{date}</div>
        <h4 className="font-bold text-lg mb-2 group-hover:text-white text-gray-200 transition-colors">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{content}</p>
    </div>
);

const AlbumView: React.FC<AlbumViewProps> = ({ onListen }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 animate-fade-in-up relative">
      
      {/* Background with scanlines specific to this view */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="w-full h-full opacity-5 animate-scanline bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px]"></div>
      </div>

      {/* Brutalist Layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 border-4 border-white bg-black shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        
        {/* Left Panel: Tracklist & Album Info */}
        <div className="p-8 border-b-4 md:border-b-0 md:border-r-4 border-white bg-[#0a0a0a] flex flex-col justify-between min-h-[500px]">
            <div>
                 <div className="mb-8 border-b-2 border-white pb-4">
                     <h3 className="text-xl font-mono text-gray-400">NEW RELEASE // 2026</h3>
                     {/* Album Title with Karantina Font */}
                     <h1 className="text-4xl md:text-6xl font-bold font-['Karantina'] mt-2 leading-none tracking-wide">{ALBUM_TITLE}</h1>
                </div>

                <div className="mb-6 font-mono text-xs text-gray-500 tracking-widest">TRACKLIST_DATA:</div>
                {/* Tracklist with Karantina Font */}
                <ul className="space-y-2 font-['Karantina']">
                    {TRACKLIST.map((track) => (
                        <li key={track.id} className="flex items-baseline text-xl md:text-2xl hover:text-red-500 transition-colors cursor-default group border-b border-gray-900 pb-2 last:border-0">
                            <span className="w-8 font-mono text-gray-600 group-hover:text-red-500 text-sm">0{track.id}</span>
                            <span className="font-bold tracking-wider">{track.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-8">
                 <button 
                    onClick={onListen}
                    className="w-full bg-white text-black font-black text-xl py-4 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest border-2 border-white relative overflow-hidden group"
                 >
                    <span className="relative z-10">Listen Now</span>
                    <div className="absolute inset-0 bg-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
            </div>
        </div>

        {/* Right Panel: News (Visually Left in RTL, Set to LTR for English Content) */}
        <div className="p-8 bg-[#0a0a0a] text-white relative flex flex-col text-left" dir="ltr">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
            
            <div className="mb-8 border-b-2 border-white pb-4 flex justify-between items-end">
                <h3 className="text-xl font-mono text-white">LATEST_NEWS</h3>
                <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
            </div>

            <div className="flex-grow space-y-8 overflow-y-auto max-h-[600px] custom-scrollbar">
                <NewsItem 
                    date="15.04.2026" 
                    title="OFFICIAL ALBUM LAUNCH" 
                    content="The wait is over. 'את הנזק סופרים במדרגות' is now available on all streaming platforms and limited vinyl edition." 
                />
                <NewsItem 
                    date="22.03.2026" 
                    title="TLV RELEASE PARTY" 
                    content="Join us at Barby TLV for an exclusive performance of the entire album. Tickets selling fast." 
                />
                <NewsItem 
                    date="10.02.2026" 
                    title="NEW SINGLE: 'BENZIN'" 
                    content="The second single 'Benzin' drops this Friday. Pre-save now to unlock exclusive digital content." 
                />
                <NewsItem 
                    date="01.01.2026" 
                    title="SYSTEM REBOOT" 
                    content="New year, new era. Creation is endless. Initiating: Awakening Segment" 
                />
            </div>

             {/* Decoration */}
            <div className="mt-8 pt-4 border-t border-gray-800 font-mono text-xs text-gray-600 flex justify-between">
                <span>UPDATED: 24H AGO</span>
                <span>V.2.0.26</span>
            </div>
        </div>
      </div>

      {/* Footer / Socials */}
      <div className="mt-20 text-center relative z-10">
          
          {/* ASCII Divider */}
          <div className="mb-10 text-gray-600 font-mono text-xs overflow-hidden opacity-50 select-none">
              {"+-".repeat(40)}+
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-12">
                {/* Spotify */}
                <SocialButton href="https://spotify.com" label="SPOTIFY">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.299z"/></svg>
                </SocialButton>

                {/* Instagram */}
                <SocialButton href="https://instagram.com" label="INSTAGRAM">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </SocialButton>

                {/* YouTube */}
                <SocialButton href="https://youtube.com" label="YOUTUBE">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </SocialButton>
          </div>

          <p className="font-mono text-sm text-gray-600 tracking-wider">
              © 2026 RESHEF BAND<br/>
              <span className="text-xs">SYSTEM.STATUS: ONLINE</span>
          </p>
      </div>
    </div>
  );
};

export default AlbumView;