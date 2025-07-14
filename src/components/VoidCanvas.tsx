import { useEffect, useRef } from 'react';
import { SystemState, ResonanceData } from './ResonantBlank';

interface VoidCanvasProps {
  systemState: SystemState;
  resonanceData: ResonanceData | null;
  isActive: boolean;
}

export const VoidCanvas = ({ systemState, resonanceData, isActive }: VoidCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive && resonanceData) {
        drawResonanceField(ctx, canvas, resonanceData, systemState);
      } else {
        drawVoidState(ctx, canvas);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [systemState, resonanceData, isActive]);

  const drawVoidState = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Pure void - minimal quantum field fluctuations
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const alpha = Math.sin(time + i) * 0.1 + 0.05;
      
      ctx.fillStyle = `hsla(260, 40%, 8%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawResonanceField = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    resonance: ResonanceData,
    state: SystemState
  ) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Map frequency to color
    const hue = (resonance.frequency % 1000) / 1000 * 360;
    
    // Draw cymatic patterns based on frequency
    const numRings = Math.floor(resonance.amplitude * 10) + 3;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    for (let i = 0; i < numRings; i++) {
      const radius = (i / numRings) * maxRadius * resonance.coherence;
      const alpha = (1 - i / numRings) * resonance.amplitude * 0.6;
      
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Create interference patterns
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        const wave = Math.sin(angle * resonance.harmonics[0] + time * 2) * 0.1;
        const r = radius + wave * radius * 0.2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw resonance roots as geometric forms
    state.resonanceRoots.slice(-5).forEach((root, index) => {
      const rootHue = (root.frequency % 1000) / 1000 * 360;
      const age = (Date.now() - root.timestamp) / 1000;
      const decay = Math.exp(-age * 0.5);
      
      const x = centerX + Math.cos(index * Math.PI * 0.4) * 100;
      const y = centerY + Math.sin(index * Math.PI * 0.4) * 100;
      
      ctx.fillStyle = `hsla(${rootHue}, 90%, 70%, ${decay * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, root.coherence * 20 * decay, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw phase indicators
    drawPhaseIndicator(ctx, canvas, state.phase, time);
  };

  const drawPhaseIndicator = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    phase: SystemState['phase'],
    time: number
  ) => {
    const x = 50;
    const y = canvas.height - 50;
    
    const phaseColors = {
      void: '0, 0%, 0%',
      emergence: '270, 80%, 40%',
      coherence: '180, 90%, 50%',
      'phase-lock': '60, 100%, 80%'
    };

    ctx.fillStyle = `hsl(${phaseColors[phase]})`;
    ctx.fillRect(x - 20, y - 20, 40, 40);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(phase.toUpperCase(), x, y + 50);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};