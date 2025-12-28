import React, { useRef, useEffect, useState } from 'react';
import { Particle } from '../types';

interface ParticleLogoProps {
  onReady: () => void;
}

const ParticleLogo: React.FC<ParticleLogoProps> = ({ onReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Function to create text data
  const initParticles = (width: number, height: number) => {
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    if (!tmpCtx) return;

    tmpCanvas.width = width;
    tmpCanvas.height = height;

    // Draw the text "רשף" to the temporary canvas
    tmpCtx.fillStyle = '#ffffff';
    // Use Karantina font, slight increase in size as it is condensed
    tmpCtx.font = '700 22vw "Karantina", sans-serif'; 
    tmpCtx.textAlign = 'center';
    tmpCtx.textBaseline = 'middle';
    tmpCtx.fillText('רשף', width / 2, height / 2);

    // Scan for pixels
    const imageData = tmpCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const particles: Particle[] = [];
    const step = 6; // Check every 6th pixel (density control)

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          particles.push({
            x: Math.random() * width, // Start random
            y: Math.random() * height, // Start random
            originX: x,
            originY: y,
            color: '#e5e5e5',
            size: 2, // Pixel size
            vx: 0,
            vy: 0
          });
        }
      }
    }
    return particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      particlesRef.current = initParticles(canvas.width, canvas.height) || [];
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseLeave = () => {
        mouseRef.current = { x: -1000, y: -1000 };
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouse = mouseRef.current;
      const radius = 100; // Interaction radius

      // Update and draw particles
      particlesRef.current.forEach(p => {
        let targetX = p.originX;
        let targetY = p.originY;

        // Calculate distance from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
            const angle = Math.atan2(dy, dx);
            const force = (radius - distance) / radius;
            const push = force * 60; // Repulsion strength
            
            targetX += Math.cos(angle) * push;
            targetY += Math.sin(angle) * push;
        }

        // Ease positions
        p.x += (targetX - p.x) * 0.1;
        p.y += (targetY - p.y) * 0.1;

        // Draw pixel
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();
    
    // Signal readiness
    setTimeout(onReady, 1500);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [onReady]);

  return (
    <div ref={containerRef} className="w-full h-96 md:h-[60vh] relative overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default ParticleLogo;