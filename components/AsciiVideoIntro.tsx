import React, { useEffect, useRef, useState } from 'react';

interface AsciiVideoIntroProps {
  onComplete: () => void;
}

const AsciiVideoIntro: React.FC<AsciiVideoIntroProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const pre = preRef.current;
    
    // Create hidden canvas if not using ref
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const W = 100; // Resolution width (characters)
    const CONTRAST = 2.5;
    const CHARS = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

    const processFrame = () => {
      if (!video || !pre || !ctx) return;
      if (video.paused || video.ended) return;

      // Guard: Ensure video dimensions are available and valid
      if (video.videoWidth === 0 || video.videoHeight === 0) {
          animationRef.current = requestAnimationFrame(processFrame);
          return;
      }

      // Calculate Height based on aspect ratio and char aspect ratio (approx 0.55)
      // We use video dimensions here, which we guaranteed are > 0 above
      const aspectRatio = video.videoWidth / video.videoHeight;
      const calculatedH = Math.floor(W / aspectRatio * 0.55);

      // Guard: Ensure calculated height is a valid positive integer
      if (!Number.isFinite(calculatedH) || calculatedH <= 0) {
          animationRef.current = requestAnimationFrame(processFrame);
          return;
      }

      const H = calculatedH;
      
      canvas.width = W;
      canvas.height = H;
      
      try {
          ctx.drawImage(video, 0, 0, W, H);
          
          const imageData = ctx.getImageData(0, 0, W, H);
          const data = imageData.data;
          
          let s = "";
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              // Grayscale luminance
              let b = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
              // Contrast
              b = Math.pow(b, CONTRAST);
              
              const charIndex = Math.floor(b * CHARS.length);
              s += CHARS[Math.min(charIndex, CHARS.length - 1)];
            }
            s += "\n";
          }
          
          pre.innerText = s;
      } catch (error) {
          console.warn("Frame processing error:", error);
      }
      
      animationRef.current = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      processFrame();
    };

    const handleEnded = () => {
      cancelAnimationFrame(animationRef.current);
      onComplete();
    };

    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('ended', handleEnded);
      
      // Attempt autoplay
      video.play().catch(e => {
          console.log("Autoplay failed, waiting for interaction", e);
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('ended', handleEnded);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete]);

  return (
    <div 
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => {
            // Allow user to skip or start play if blocked
            if (!isPlaying && videoRef.current) {
                videoRef.current.play().catch(console.error);
            }
        }}
    >
      <video 
        ref={videoRef} 
        src="retro-visions-recording-17766853062707.mp4" 
        playsInline 
        muted // Muted required for autoplay in most browsers
        crossOrigin="anonymous" 
        className="hidden"
      />
      
      <pre 
        ref={preRef} 
        className="font-bold whitespace-pre text-white leading-[0.6] text-[8px] md:text-[10px] lg:text-[12px] select-none pointer-events-none"
        style={{ textShadow: '0 0 4px #ffffff' }}
      >
        LOADING_SYSTEM...
      </pre>

      {/* Skip Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute bottom-8 right-8 text-xs font-mono text-gray-500 hover:text-white transition-colors"
      >
        [SKIP_INTRO]
      </button>
    </div>
  );
};

export default AsciiVideoIntro;