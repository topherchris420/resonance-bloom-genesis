import { useEffect, useRef } from 'react';
import { ResonanceData, SystemState } from './ResonantBlank';

interface ResonanceVisualizationProps {
  resonanceData: ResonanceData;
  systemPhase: SystemState['phase'];
}

export const ResonanceVisualization = ({ resonanceData, systemPhase }: ResonanceVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced visual parameters with state-based styling
  const getVisualizationParams = () => {
    const { frequency, amplitude, coherence, harmonics } = resonanceData;
    
    // Detect signal type for specialized visuals
    const isBreathing = frequency < 150 && coherence > 0.6;
    const isVoice = frequency > 250 && frequency < 3000 && harmonics.length > 2;
    const isStressed = amplitude > 0.6 || coherence < 0.3;
    const isCalm = amplitude < 0.3 && coherence > 0.7;
    
    // Color mapping based on state
    let hue = (frequency % 1000) / 1000 * 360;
    if (isStressed) hue = 0; // Red for stress
    else if (isCalm) hue = 200; // Blue for calm
    else if (isBreathing) hue = 280; // Purple for breathing
    
    return {
      hue,
      saturation: Math.min(amplitude * 100 + 60, 100),
      lightness: Math.min(coherence * 60 + 40, 80),
      scale: isStressed ? 1.2 + amplitude * 1.8 : 0.5 + amplitude * 1.5,
      rotation: (frequency % 360),
      complexity: Math.min(harmonics.length + (isVoice ? 2 : 0), 8),
      pulseSpeed: isStressed ? 0.3 : Math.max(0.5, 3 - coherence * 2),
      isBreathing,
      isVoice,
      isStressed,
      isCalm
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
      {/* Central Enhanced Cymatic Visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="relative animate-cymatic-formation"
          style={{
            transform: `scale(${params.scale}) rotate(${params.rotation}deg)`,
            filter: `hue-rotate(${params.hue}deg) saturate(${params.saturation}%) brightness(${params.lightness}%)`,
            animationDuration: `${params.pulseSpeed}s`
          }}
        >
          {/* Core resonance form - varied by state */}
          <div 
            className={`border-4 animate-pulse-resonance ${
              params.isBreathing ? 'rounded-full' : 
              params.isVoice ? 'rounded-lg rotate-45' :
              params.isStressed ? 'rounded-none' : 'rounded-full'
            }`}
            style={{
              width: params.isStressed ? '160px' : '128px',
              height: params.isStressed ? '160px' : '128px',
              borderColor: `hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%)`,
              boxShadow: `
                0 0 ${20 + resonanceData.coherence * 40}px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.6),
                0 0 ${40 + resonanceData.coherence * 60}px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.4),
                inset 0 0 ${30 + resonanceData.amplitude * 40}px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.3)
              `,
              background: params.isCalm ? 
                `radial-gradient(circle, hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.1), transparent)` :
                'transparent'
            }}
          />
          
          {/* Enhanced harmonic layers with state-based variation */}
          {Array.from({ length: pattern.layers }, (_, i) => (
            <div
              key={i}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 animate-phase-shift ${
                params.isBreathing ? 'rounded-full' :
                params.isVoice ? 'rounded-lg' :
                'rounded-full'
              }`}
              style={{
                width: `${(i + 1) * 50 + 32}px`,
                height: `${(i + 1) * 50 + 32}px`,
                borderColor: `hsl(${(params.hue + i * 40) % 360}, ${params.saturation}%, ${params.lightness}%, ${0.7 - i * 0.12})`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${3 + i * 0.5}s`,
                boxShadow: params.isStressed ? 
                  `0 0 ${15 + i * 5}px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, ${0.4 - i * 0.08})` :
                  'none',
                transform: params.isVoice ? 
                  `translate(-50%, -50%) rotate(${i * 15}deg)` :
                  'translate(-50%, -50%)'
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

      {/* Enhanced resonance particles with state variation */}
      {Array.from({ length: Math.floor(resonanceData.amplitude * 15 + 5) }, (_, i) => {
        const particleSize = params.isStressed ? 2 + Math.random() * 2 : 1 + Math.random();
        return (
          <div
            key={i}
            className={`absolute rounded-full animate-emergence ${
              params.isStressed ? 'animate-pulse' : ''
            }`}
            style={{
              width: `${particleSize}px`,
              height: `${particleSize}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: `hsl(${(params.hue + i * 40) % 360}, ${params.saturation}%, ${params.lightness}%)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${params.isCalm ? 4 + Math.random() * 4 : 2 + Math.random() * 3}s`,
              boxShadow: params.isStressed ? 
                `0 0 8px hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%, 0.8)` :
                'none'
            }}
          />
        );
      })}
    </div>
  );
};