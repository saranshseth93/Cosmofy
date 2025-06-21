import { useEffect, useRef, useState } from 'react';

interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  decay: number;
  color: string;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
}

export function CosmicCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<StarParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const colors = [
      'rgba(147, 197, 253, 1)', // blue-300
      'rgba(196, 181, 253, 1)', // purple-300
      'rgba(252, 211, 77, 1)',  // amber-300
      'rgba(167, 243, 208, 1)', // emerald-300
      'rgba(251, 207, 232, 1)', // pink-300
      'rgba(255, 255, 255, 1)'  // white
    ];

    const createParticle = (x: number, y: number) => {
      const particle: StarParticle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        size: Math.random() * 3 + 1,
        opacity: 1,
        decay: Math.random() * 0.02 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: Math.random() * 60 + 40
      };
      particlesRef.current.push(particle);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsActive(true);
      
      // Create particles on mouse movement
      if (Math.random() < 0.7) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const drawParticle = (particle: StarParticle) => {
      ctx.save();
      
      // Create a glowing effect
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      
      // Draw the main star
      ctx.fillStyle = particle.color.replace('1)', `${particle.opacity})`);
      ctx.beginPath();
      
      // Create a star shape
      const spikes = 5;
      const outerRadius = particle.size;
      const innerRadius = outerRadius * 0.4;
      
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.angle);
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add a bright center
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const updateParticle = (particle: StarParticle) => {
      particle.life++;
      
      // Move particle
      particle.x += Math.cos(particle.angle) * particle.speed;
      particle.y += Math.sin(particle.angle) * particle.speed;
      
      // Fade out over time
      const lifeRatio = particle.life / particle.maxLife;
      particle.opacity = 1 - lifeRatio;
      
      // Slight rotation
      particle.angle += 0.01;
      
      // Slow down over time
      particle.speed *= 0.995;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        updateParticle(particle);
        drawParticle(particle);
        
        // Remove particles that have faded out
        if (particle.opacity <= 0 || particle.life >= particle.maxLife) {
          particlesRef.current.splice(index, 1);
        }
      });
      
      // Draw cursor glow when particles are present
      if (particlesRef.current.length > 0) {
        const glowSize = 20;
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, glowSize
        );
        gradient.addColorStop(0, 'rgba(147, 197, 253, 0.3)');
        gradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.1)');
        gradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ 
          background: 'transparent',
          mixBlendMode: 'screen'
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          * {
            cursor: none !important;
          }
          
          button, a, input, textarea, select {
            cursor: none !important;
          }
          
          button:hover, a:hover {
            cursor: none !important;
          }
        `
      }} />
    </>
  );
}