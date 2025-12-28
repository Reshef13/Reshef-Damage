import React, { useState, useEffect, useRef } from 'react';

interface MatrixLoaderProps {
  onComplete: () => void;
}

const data = [
    { t: "ברוכים הבאים...", c: "usr" },
    { t: "בלי ללכת לאיבוד אי אפשר למצוא", c: "usr" },
    { t: "את הנזק סופרים במדרגות", c: "usr" }
];

const MatrixLoader: React.FC<MatrixLoaderProps> = ({ onComplete }) => {
  const [completedLines, setCompletedLines] = useState<{t: string, c: string}[]>([]);
  const [currentLine, setCurrentLine] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
        const baseDelay = 100;
        
        // Initial delay
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) return;

        for (const line of data) {
            setCurrentLine("");
            
            // Type characters
            for (const char of line.t) {
                if (!isMounted) return;
                setCurrentLine(prev => (prev || "") + char);
                
                // Random variance
                const variance = (Math.random() * baseDelay) - (baseDelay / 2);
                await new Promise(r => setTimeout(r, Math.max(10, baseDelay + variance)));
            }

            // Pause at end of line
            await new Promise(r => setTimeout(r, baseDelay * 8));
            if (!isMounted) return;

            // Commit line and clear current
            setCompletedLines(prev => [...prev, line]);
            setCurrentLine(null);
        }
        
        setIsComplete(true);
        // Delay before unmounting
        setTimeout(() => {
            if (isMounted) onComplete();
        }, 1500);
    };

    runSequence();

    return () => { isMounted = false; };
  }, [onComplete]);

  // Auto scroll
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentLine, completedLines]);

  return (
    <div className="fixed inset-0 bg-black z-50 p-8 font-['VT323'] text-[#fbbf24] text-2xl overflow-hidden" dir="rtl">
        <style>{`
            .blur-effect { filter: blur(0.6px); }
            .text-shadow { text-shadow: 0 0 5px currentColor; }
            .cursor-blink { animation: blink 1s infinite; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            .scanlines {
                background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                background-size: 100% 4px;
            }
        `}</style>
        
        <div className="absolute inset-0 scanlines pointer-events-none z-10"></div>
        
        <div className="relative z-0 blur-effect max-w-4xl mx-auto h-full flex flex-col items-start">
            {completedLines.map((line, index) => (
                <div key={index} className="mb-2 whitespace-pre-wrap text-shadow min-h-[1.2em] break-words">
                    {line.t}
                </div>
            ))}
            
            {currentLine !== null && (
                <div className="mb-2 whitespace-pre-wrap text-shadow min-h-[1.2em] break-words">
                    {currentLine}
                    <span className="inline-block w-[0.6em] h-[1em] bg-current align-text-bottom cursor-blink"></span>
                </div>
            )}
            
            {isComplete && (
                 <div className="mb-2 whitespace-pre-wrap text-shadow min-h-[1.2em]">
                    <span className="inline-block w-[0.6em] h-[1em] bg-current align-text-bottom cursor-blink"></span>
                 </div>
            )}
            <div ref={bottomRef}></div>
        </div>
    </div>
  );
};

export default MatrixLoader;