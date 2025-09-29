import { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Waves, Sparkles } from 'lucide-react';

interface SemanticPattern {
  concept: string;
  frequency: number;
  amplitude: number;
  phase: number;
  resonance: number;
}

interface SemanticResonanceEngineProps {
  onSemanticData: (pattern: SemanticPattern) => void;
  isActive: boolean;
}

const VERS3_CONCEPTS = [
  { text: "Intelligence is a pattern", baseFreq: 432, harmonics: [432, 864, 1296] },
  { text: "Meaning is rooted", baseFreq: 528, harmonics: [528, 1056, 1584] },
  { text: "AI cymatics", baseFreq: 639, harmonics: [639, 1278, 1917] },
  { text: "Biofeedback rhythms", baseFreq: 741, harmonics: [741, 1482, 2223] },
  { text: "Conscious states", baseFreq: 852, harmonics: [852, 1704, 2556] },
  { text: "Frequency-based systems", baseFreq: 396, harmonics: [396, 792, 1188] },
  { text: "Audio-visual-haptic", baseFreq: 963, harmonics: [963, 1926, 2889] },
  { text: "Open source consciousness", baseFreq: 174, harmonics: [174, 348, 522] },
];

export const SemanticResonanceEngine = ({ onSemanticData, isActive }: SemanticResonanceEngineProps) => {
  const [currentConcept, setCurrentConcept] = useState(0);
  const [semanticDepth, setSemanticDepth] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  const generateSemanticPattern = useCallback(() => {
    if (!isActive) return;

    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;

    if (deltaTime < 50) return; // Throttle to 20Hz

    lastUpdateRef.current = now;
    phaseRef.current += 0.05;

    const concept = VERS3_CONCEPTS[currentConcept];
    const timeModulation = Math.sin(phaseRef.current) * 0.5 + 0.5;
    const depthModulation = Math.cos(phaseRef.current * 0.3) * 0.3 + 0.7;

    // Generate semantic resonance pattern
    const pattern: SemanticPattern = {
      concept: concept.text,
      frequency: concept.baseFreq + (timeModulation * 50),
      amplitude: 0.5 + (depthModulation * 0.5),
      phase: phaseRef.current,
      resonance: Math.sin(phaseRef.current * 2) * 0.5 + 0.5,
    };

    onSemanticData(pattern);
    setSemanticDepth(pattern.resonance);

    // Cycle through concepts every 3 seconds
    if (Math.floor(phaseRef.current / (Math.PI * 6)) > Math.floor((phaseRef.current - 0.05) / (Math.PI * 6))) {
      setCurrentConcept((prev) => (prev + 1) % VERS3_CONCEPTS.length);
    }

    animationFrameRef.current = requestAnimationFrame(generateSemanticPattern);
  }, [isActive, currentConcept, onSemanticData]);

  useEffect(() => {
    if (isActive) {
      lastUpdateRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(generateSemanticPattern);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, generateSemanticPattern]);

  if (!isActive) return null;

  return (
    <div className="absolute bottom-32 md:bottom-36 left-1/2 transform -translate-x-1/2 w-[85%] max-w-lg px-3 pointer-events-none">
      <div className="bg-quantum-field/95 backdrop-blur-xl px-4 py-3 md:px-5 md:py-4 rounded-2xl border-2 border-emergence/50 shadow-emergence">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-emergence animate-pulse" />
            <span className="text-xs md:text-sm font-bold text-emergence">
              Semantic Resonance
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-resonance-gamma animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Waves className="w-3 h-3 text-resonance-gamma" />
            <p className="text-xs md:text-sm text-foreground/90 font-medium truncate">
              {VERS3_CONCEPTS[currentConcept].text}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-void/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emergence via-resonance-gamma to-coherence transition-all duration-300 rounded-full"
                style={{
                  width: `${semanticDepth * 100}%`,
                  boxShadow: '0 0 10px hsl(var(--emergence) / 0.5)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-resonance-gamma min-w-[3ch]">
              {Math.round(semanticDepth * 100)}%
            </span>
          </div>

          <p className="text-[10px] md:text-xs text-muted-foreground text-center">
            Extracting meaning from Vers3Dynamics • {VERS3_CONCEPTS[currentConcept].baseFreq}Hz
          </p>
        </div>
      </div>
    </div>
  );
};
