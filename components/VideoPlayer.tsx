import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Attempt to play immediately on mount to ensure autoplay works
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn("Auto-play was prevented. Interaction might be required.", error);
                });
            }
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 group flex items-center gap-2 text-white font-mono text-xl hover:text-red-500 transition-colors z-50 cursor-pointer"
            >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm">[ESC]</span>
                <span>[CLOSE_TERMINAL]</span>
            </button>
            
            {/* Video Container */}
            <div className="w-full max-w-7xl aspect-video relative bg-[#050505] border-y-2 border-[#333] shadow-[0_0_100px_rgba(255,0,0,0.1)]">
                <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    src="retro-visions-recording-17766853062707.mp4"
                >
                    Your browser does not support the video tag.
                </video>
                
                {/* CRT Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500 opacity-50"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500 opacity-50"></div>
            </div>

            <div className="mt-8 text-gray-500 font-mono text-xs tracking-widest animate-pulse">
                PLAYING: RETRO_VISIONS_REC_17766853062707.MP4
            </div>
        </div>
    );
};

export default VideoPlayer;