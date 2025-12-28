import React, { useState } from 'react';
import AsciiHeader from './AsciiHeader';
import { TRACKLIST, ALBUM_TITLE } from '../constants';

interface MusicPlayerViewProps {
    onBack?: () => void;
}

const MusicPlayerView: React.FC<MusicPlayerViewProps> = ({ onBack }) => {
    const [currentTrackId, setCurrentTrackId] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(75);

    const currentTrack = TRACKLIST.find(t => t.id === currentTrackId) || TRACKLIST[0];

    // Placeholder Lyrics Data 
    const getLyrics = (id: number) => {
        return `LYRICS_DATA_FILE_${id}.DAT LOADED...\n\nRunning analysis on track audio...\n\n[VERSE 1]\nSystem initialized.\nPulse detected in sector 7G.\nThe signal is weak but present.\nTranslating binary to emotion...\n\n[CHORUS]\n${currentTrack.title.toUpperCase()}\n${currentTrack.title.toUpperCase()}\n\n[VERSE 2]\nStatic noise fills the void.\nConnecting to host...\nUpload complete.\n\n[END_TRANSMISSION]`;
    };

    const handleNext = () => {
        const nextId = currentTrackId === TRACKLIST.length ? 1 : currentTrackId + 1;
        setCurrentTrackId(nextId);
    };

    const handlePrev = () => {
        const prevId = currentTrackId === 1 ? TRACKLIST.length : currentTrackId - 1;
        setCurrentTrackId(prevId);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col font-mono animate-fade-in">
            {/* TOP PANEL - ASCII ANIMATION */}
            <div className="h-[35vh] w-full border-b-2 border-white relative overflow-hidden bg-black">
                <AsciiHeader />
                <div className="absolute top-4 right-4 z-20">
                     <div className="text-[10px] text-green-500 animate-pulse">SYSTEM_MONITORING: ACTIVE</div>
                </div>
            </div>

            {/* MIDDLE PANEL - SPLIT LEFT/RIGHT */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Lyrics / Info (Matrix Style) */}
                <div className="w-1/2 border-r-2 border-white p-4 md:p-8 bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                    <h2 className="text-green-500 text-xl mb-4 tracking-widest border-b border-gray-800 pb-2 font-['VT323']">
                        > TRACK_DATA // {currentTrack.title}
                    </h2>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-['VT323'] text-lg md:text-2xl text-green-400 opacity-90 leading-relaxed whitespace-pre-wrap">
                        {getLyrics(currentTrackId)}
                    </div>
                </div>

                {/* Right: Tracklist */}
                <div className="w-1/2 p-4 md:p-8 bg-black overflow-y-auto custom-scrollbar">
                    <h2 className="text-white text-xl mb-6 tracking-widest border-b-2 border-white pb-2 font-['Karantina']">
                        SELECT_TRACK
                    </h2>
                    <ul className="space-y-1">
                        {TRACKLIST.map((track) => (
                            <li 
                                key={track.id} 
                                onClick={() => {
                                    setCurrentTrackId(track.id);
                                    setIsPlaying(true);
                                }}
                                className={`cursor-pointer p-3 border-l-4 transition-all duration-200 flex justify-between items-center group
                                    ${currentTrackId === track.id 
                                        ? 'border-red-600 bg-white/10 text-white' 
                                        : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs opacity-50">
                                        {track.id.toString().padStart(2, '0')}
                                    </span>
                                    <span className="font-bold tracking-wider font-['Karantina'] text-xl md:text-2xl">
                                        {track.title}
                                    </span>
                                </div>
                                {currentTrackId === track.id && (
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* BOTTOM PANEL - CONTROLS & LOGO */}
            <div className="h-[20vh] min-h-[120px] border-t-2 border-white bg-[#050505] flex items-center justify-between px-4 md:px-12 relative">
                
                {/* Logo Area */}
                <div className="flex flex-col">
                     <h1 className="text-4xl md:text-6xl font-bold font-['Karantina'] leading-none tracking-tighter" style={{ textShadow: '2px 2px 0px #333' }}>
                        רשף
                     </h1>
                     <span className="text-[10px] text-gray-500 tracking-[0.5em] mt-1">AUDIO_INTERFACE_V2.0</span>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-4 w-1/2 max-w-md">
                    
                    {/* Progress Bar (Visual) */}
                    <div className="w-full h-1 bg-gray-800 relative group cursor-pointer">
                        <div className="absolute left-0 top-0 h-full bg-red-600 w-1/3 group-hover:bg-red-500 transition-colors"></div>
                        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10">
                         {/* Prev */}
                         <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                            </svg>
                         </button>

                         {/* Play/Pause */}
                         <button 
                            onClick={togglePlay}
                            className="w-12 h-12 md:w-16 md:h-16 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-95"
                         >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                         </button>

                         {/* Next */}
                         <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                            </svg>
                         </button>
                    </div>
                </div>

                {/* Volume & Extras */}
                <div className="hidden md:flex flex-col items-end gap-2 w-32">
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                             <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={volume} 
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{currentTrack.title}</div>
                </div>

            </div>
            
            {/* Scanline Overlay for entire player */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]"></div>
        </div>
    );
};

export default MusicPlayerView;