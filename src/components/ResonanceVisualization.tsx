import { useEffect, useRef } from 'react';
import { ResonanceData, SystemState } from './ResonantBlank';

interface ResonanceVisualizationProps {
  resonanceData: ResonanceData;
  systemPhase: SystemState['phase'];
}

export const ResonanceVisualization = ({ resonanceData, systemPhase }: ResonanceVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map frequency to visual parameters
  const getVisualizationParams = () => {
    const { frequency, amplitude, coherence, harmonics } = resonanceData;
    
    return {
      hue: (frequency % 1000) / 1000 * 360,
      saturation: Math.min(amplitude * 100 + 50, 100),
      lightness: Math.min(coherence * 70 + 30, 80),
      scale: 0.5 + amplitude * 1.5,
      rotation: (frequency % 360),
      complexity: Math.min(harmonics.length, 6),
      pulseSpeed: Math.max(0.5, 3 - coherence * 2)
    };
  };

  const params = getVisualizationParams();

  // Generate cymatic pattern based on frequency
  const generateCymaticPattern = () => {
    const { frequency, harmonics } = resonanceData;
    const sides = Math.floor(frequency / 50) % 12 + 3;
    const layers = Math.min(harmonics.length + 1, 5);
    
    return { sides, layers };
  };

  const pattern = generateCymaticPattern();

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Central Resonance Visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="relative animate-cymatic-formation"
          style={{
            transform: `scale(${params.scale}) rotate(${params.rotation}deg)`,
            filter: `hue-rotate(${params.hue}deg) saturate(${params.saturation}%) brightness(${params.lightness}%)`,
            animationDuration: `${params.pulseSpeed}s`
          }}
        >
          {/* Main cymatic form */}
          <div 
            className="w-32 h-32 border-2 rounded-full animate-pulse-resonance"
            style={{
              borderColor: `hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%)`,
              boxShadow: `0 0 ${20 + resonanceData.coherence * 30}px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.6)`
            }}
          />
          
          {/* Harmonic layers */}
          {Array.from({ length: pattern.layers }, (_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border rounded-full animate-phase-shift"
              style={{
                width: `${(i + 1) * 40 + 32}px`,
                height: `${(i + 1) * 40 + 32}px`,
                borderColor: `hsl(${(params.hue + i * 30) % 360}, ${params.saturation}%, ${params.lightness}%, ${0.6 - i * 0.1})`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
          
          {/* Geometric pattern based on frequency */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              clipPath: `polygon(${Array.from({ length: pattern.sides }, (_, i) => {
                const angle = (i / pattern.sides) * 2 * Math.PI;
                const x = 50 + 30 * Math.cos(angle);
                const y = 50 + 30 * Math.sin(angle);
                return `${x}% ${y}%`;
              }).join(', ')})`
            }}
          >
            <div 
              className="w-20 h-20 animate-harmonic-glow"
              style={{
                background: `linear-gradient(45deg, 
                  hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.3),
                  hsl(${(params.hue + 60) % 360}, ${params.saturation}%, ${params.lightness}%, 0.1)
                )`
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase State Indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className={`
          px-4 py-2 rounded-full backdrop-blur-sm border text-sm font-medium transition-all duration-500
          ${systemPhase === 'void' ? 'bg-void/80 border-void-glow text-void-glow' :
            systemPhase === 'emergence' ? 'bg-emergence/20 border-emergence text-emergence animate-emergence' :
            systemPhase === 'coherence' ? 'bg-coherence/20 border-coherence text-coherence animate-harmonic-glow' :
            'bg-phase-lock/20 border-phase-lock text-phase-lock animate-pulse-resonance shadow-phase-lock'
          }
        `}>
          {systemPhase.toUpperCase().replace('-', ' ')}
        </div>
      </div>

      {/* Frequency Spectrum Bars */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-end gap-1">
        {resonanceData.harmonics.slice(0, 8).map((harmonic, i) => (
          <div
            key={i}
            className="animate-frequency-wave"
            style={{
              width: '4px',
              height: `${Math.min(harmonic / 1000 * 50 + 10, 60)}px`,
              backgroundColor: `hsl(${(params.hue + i * 20) % 360}, ${params.saturation}%, ${params.lightness}%)`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Coherence Ring */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="absolute rounded-full border animate-phase-shift"
          style={{
            width: `${200 + resonanceData.coherence * 100}px`,
            height: `${200 + resonanceData.coherence * 100}px`,
            top: `${-100 - resonanceData.coherence * 50}px`,
            left: `${-100 - resonanceData.coherence * 50}px`,
            borderColor: `hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, ${resonanceData.coherence * 0.4})`,
            borderWidth: `${Math.max(1, resonanceData.coherence * 3)}px`
          }}
        />
      </div>

      {/* Resonance Particles */}
      {Array.from({ length: Math.floor(resonanceData.amplitude * 10) }, (_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-emergence"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${(params.hue + i * 40) % 360}, ${params.saturation}%, ${params.lightness}%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
};