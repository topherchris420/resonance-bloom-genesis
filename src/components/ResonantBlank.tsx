import { useState, useEffect, useRef, useCallback } from 'react';
import { VoidCanvas } from './VoidCanvas';
import { AudioCapture } from './AudioCapture';
import { DRRProcessor } from './DRRProcessor';
import { EvolutionLogger } from './EvolutionLogger';
import { ModeToggle } from './ModeToggle';
import { ResonanceVisualization } from './ResonanceVisualization';
import { toast } from 'sonner';

export interface ResonanceData {
  frequency: number;
  amplitude: number;
  harmonics: number[];
  phase: number;
  coherence: number;
  timestamp: number;
}

export interface SystemState {
  mode: 'observer' | 'participant';
  phase: 'void' | 'emergence' | 'coherence' | 'phase-lock';
  resonanceRoots: ResonanceData[];
  structures: any[];
  evolutionPath: any[];
}

export const ResonantBlank = () => {
  const [systemState, setSystemState] = useState<SystemState>({
    mode: 'observer',
    phase: 'void',
    resonanceRoots: [],
    structures: [],
    evolutionPath: []
  });

  const [isActive, setIsActive] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [resonanceData, setResonanceData] = useState<ResonanceData | null>(null);

  const drrProcessorRef = useRef<any>(null);

  // Initialize DRR Processor
  useEffect(() => {
    drrProcessorRef.current = new DRRProcessor();
    toast("Resonant Blank initialized - System in void state");
  }, []);

  // Process audio data through DRR algorithms
  const processAudioData = useCallback((audioBuffer: Float32Array) => {
    if (!drrProcessorRef.current) return;

    const resonance = drrProcessorRef.current.detectResonanceRoots(audioBuffer);
    setResonanceData(resonance);

    // Update system state based on resonance
    setSystemState(prev => ({
      ...prev,
      resonanceRoots: [...prev.resonanceRoots.slice(-10), resonance], // Keep last 10
      phase: determinePhase(resonance, prev.resonanceRoots),
      evolutionPath: [...prev.evolutionPath, {
        timestamp: Date.now(),
        phase: prev.phase,
        resonance: resonance.frequency,
        coherence: resonance.coherence
      }]
    }));
  }, []);

  // Determine system phase based on resonance patterns
  const determinePhase = (current: ResonanceData, history: ResonanceData[]): SystemState['phase'] => {
    if (history.length < 3) return 'void';
    
    const coherenceAvg = history.slice(-3).reduce((sum, r) => sum + r.coherence, 0) / 3;
    
    if (coherenceAvg > 0.8) return 'phase-lock';
    if (coherenceAvg > 0.6) return 'coherence';
    if (coherenceAvg > 0.3) return 'emergence';
    return 'void';
  };

  const handleModeChange = (mode: 'observer' | 'participant') => {
    setSystemState(prev => ({ ...prev, mode }));
    toast(`Switched to ${mode} mode`);
  };

  const handleSystemActivation = () => {
    setIsActive(!isActive);
    toast(isActive ? "System deactivated" : "System activated - Beginning resonance capture");
  };

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Quantum Field Background */}
      <div className="absolute inset-0 bg-field-gradient animate-quantum-field opacity-30" />
      
      {/* Main Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header Controls */}
        <div className="absolute top-4 left-4 z-20 flex gap-4">
          <ModeToggle
            mode={systemState.mode}
            onModeChange={handleModeChange}
          />
          <button
            onClick={handleSystemActivation}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'bg-resonance-gamma text-void shadow-resonance' 
                : 'bg-quantum-field text-foreground border border-resonance-gamma/30 hover:border-resonance-gamma/60'
            }`}
          >
            {isActive ? 'Deactivate' : 'Activate System'}
          </button>
        </div>

        {/* System Status */}
        <div className="absolute top-4 right-4 z-20 text-right">
          <div className="text-sm text-foreground/70 mb-1">Phase: {systemState.phase}</div>
          <div className="text-xs text-foreground/50">
            Resonance Roots: {systemState.resonanceRoots.length}
          </div>
          {resonanceData && (
            <div className="text-xs text-resonance-gamma">
              Coherence: {(resonanceData.coherence * 100).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <VoidCanvas
            systemState={systemState}
            resonanceData={resonanceData}
            isActive={isActive}
          />
          
          {/* Resonance Visualization Overlay */}
          {resonanceData && isActive && (
            <ResonanceVisualization
              resonanceData={resonanceData}
              systemPhase={systemState.phase}
            />
          )}
        </div>

        {/* Evolution Logger */}
        <div className="absolute bottom-4 left-4 z-20">
          <EvolutionLogger evolutionPath={systemState.evolutionPath} />
        </div>

        {/* Audio Capture */}
        {isActive && (
          <AudioCapture
            onAudioData={setAudioData}
            onProcessedData={processAudioData}
          />
        )}
      </div>
    </div>
  );
};