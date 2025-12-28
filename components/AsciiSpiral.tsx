import React, { useRef, useEffect } from 'react';

const AsciiSpiral: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Characters sorted by density for the spiral effect
        // Dark to Bright
        const chars = " ...:::---===+++***###%%%@@@"; 

        const draw = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            
            // Set actual size in memory (scaled to account for extra pixel density)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Normalize coordinate system to use css pixels
            ctx.scale(dpr, dpr);
            
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const w = rect.width;
            const h = rect.height;
            const cx = w / 2;
            const cy = h / 2;

            // Fill Background
            ctx.fillStyle = '#050505'; 
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#e5e5e5';
            const fontSize = Math.max(8, w / 60); // Dynamic font size based on width
            ctx.font = `${fontSize}px monospace`;
            
            const colSpacing = fontSize * 0.6;
            const rowSpacing = fontSize;

            const cols = Math.ceil(w / colSpacing);
            const rows = Math.ceil(h / rowSpacing);

            // Generate Spiral ASCII
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const x = j * colSpacing;
                    const y = i * rowSpacing + fontSize;

                    const dx = x - cx;
                    const dy = y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx); // -PI to PI

                    // Spiral Logic
                    // Twist factor: how much the stairs curve. 
                    const twist = dist * 0.015; 
                    const numSteps = 14;
                    
                    let spiralAngle = angle + twist;
                    
                    // Calculate step progress (0 to 1)
                    const stepSize = (Math.PI * 2) / numSteps;
                    let segment = (spiralAngle % (Math.PI * 2));
                    if (segment < 0) segment += Math.PI * 2;
                    
                    const stepProgress = (segment % stepSize) / stepSize;

                    // Brightness logic to simulate stair edge and depth
                    // Edge is bright (0), fading into dark (1)
                    let brightness = 1 - Math.pow(stepProgress, 0.5); 
                    
                    // Darken as we go further out to create depth/vignette
                    brightness *= Math.max(0, 1 - dist / (w * 0.8));

                    // Random noise for gritty texture
                    brightness += (Math.random() - 0.5) * 0.15;

                    // Center hole
                    if (dist < w * 0.15) brightness = 0;

                    const charIndex = Math.floor(brightness * (chars.length - 1));
                    const safeIndex = Math.max(0, Math.min(chars.length - 1, charIndex));
                    
                    if (brightness > 0.1) {
                         ctx.fillText(chars[safeIndex], x, y);
                    }
                }
            }
            
            // Draw Center Logo "רשף"
            ctx.save();
            ctx.translate(cx, cy);
            
            // Logo Background Circle
            const logoRadius = w * 0.18;
            ctx.beginPath();
            ctx.arc(0, 0, logoRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner styling for logo
            ctx.beginPath();
            ctx.moveTo(-logoRadius*0.7, logoRadius*0.4);
            ctx.lineTo(logoRadius*0.7, logoRadius*0.4);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hebrew Logo Text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Use Karantina for Hebrew logo
            ctx.font = `700 ${logoRadius}px "Karantina", sans-serif`;
            // Add a slight glitch offset effect
            ctx.fillStyle = 'red';
            ctx.fillText('רשף', 2, 2);
            ctx.fillStyle = 'cyan';
            ctx.fillText('רשף', -2, -2);
            ctx.fillStyle = 'white';
            ctx.fillText('רשף', 0, 0);
            
            ctx.restore();

            // Bottom Text: "את הנזק סופרים במדרגות"
            ctx.save();
            const bottomText = "את הנזק סופרים במדרגות";
            const textScale = Math.max(24, w * 0.06); // Increased slightly for condensed font
            ctx.font = `700 ${textScale}px "Karantina", sans-serif`;
            ctx.textAlign = 'center';
            
            const textY = h - (textScale * 1.5);
            const measure = ctx.measureText(bottomText);
            
            // Background box for text
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(cx - measure.width/2 - 20, textY - textScale, measure.width + 40, textScale * 1.5);
            
            ctx.fillStyle = '#e5e5e5';
            ctx.fillText(bottomText, cx, textY);
            ctx.restore();
        };

        // Render loop or single render? Single render is enough for "background" usually, 
        // but let's add a slow rotation effect if we wanted. 
        // For now, static to match "background" request, but let's re-draw on resize.
        draw();
        
        window.addEventListener('resize', draw);
        return () => window.removeEventListener('resize', draw);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full bg-[#050505] overflow-hidden">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
};

export default AsciiSpiral;