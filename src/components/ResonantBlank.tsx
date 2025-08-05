import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { VoidCanvas } from './VoidCanvas';
import { AudioCapture } from './AudioCapture';
import { DRRProcessor } from './DRRProcessor';
import { EvolutionLogger } from './EvolutionLogger';
import { ModeToggle } from './ModeToggle';
import { ResonanceVisualization } from './ResonanceVisualization';
import { TouchInteraction } from './TouchInteraction';
import { MultiSpectrumEngine, SignalData } from './MultiSpectrumEngine';
import { CognitiveDashboard, CognitiveState } from './CognitiveDashboard';
import { SteganographyModule } from './SteganographyModule';
import { VoiceprintAuth } from './VoiceprintAuth';
import { PerformanceMonitor } from './PerformanceMonitor';
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
  signalSource: 'audio' | 'multi-spectrum';
}

export const ResonantBlank = () => {
  const [systemState, setSystemState] = useState<SystemState>({
    mode: 'observer',
    phase: 'void',
    resonanceRoots: [],
    structures: [],
    evolutionPath: [],
    signalSource: 'audio',
  });

  const [isActive, setIsActive] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [resonanceData, setResonanceData] = useState<ResonanceData | null>(null);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null);
  const [extractedMessage, setExtractedMessage] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const drrProcessorRef = useRef<any>(null);

  // Initialize DRR Processor with memoization
  useEffect(() => {
    if (!drrProcessorRef.current) {
      drrProcessorRef.current = new DRRProcessor();
      toast("Resonant Blank initialized - System in void state");
    }
  }, []);

  // Process audio data through DRR algorithms
  const processAudioData = useCallback((audioBuffer: Float32Array) => {
    if (!drrProcessorRef.current) return;

    const resonance = drrProcessorRef.current.detectResonanceRoots(audioBuffer);
    setResonanceData(resonance);
    const cognitive = drrProcessorRef.current.analyzeCognitiveState(resonance);
    setCognitiveState(cognitive);

    // Update system state based on resonance (optimized)
    setSystemState(prev => {
      const newRoots = [...prev.resonanceRoots.slice(-9), resonance]; // Keep last 10
      const newPhase = determinePhase(resonance, prev.resonanceRoots);
      
      // Only update evolution path if phase changed or significant coherence change
      const shouldUpdateEvolution = newPhase !== prev.phase || 
        Math.abs(resonance.coherence - (prev.resonanceRoots[prev.resonanceRoots.length - 1]?.coherence || 0)) > 0.1;
      
      return {
        ...prev,
        resonanceRoots: newRoots,
        phase: newPhase,
        evolutionPath: shouldUpdateEvolution ? [...prev.evolutionPath.slice(-19), {
          timestamp: Date.now(),
          phase: prev.phase,
          resonance: resonance.frequency,
          coherence: resonance.coherence
        }] : prev.evolutionPath
      };
    });
  }, []);

  const handleSignalData = useCallback((signal: SignalData) => {
    if (!drrProcessorRef.current) return;

    // Convert signal data to resonance data
    const syntheticResonance: ResonanceData = {
      frequency: signal.frequency,
      amplitude: signal.amplitude,
      harmonics: [signal.frequency * 2, signal.frequency * 3],
      phase: Math.random() * Math.PI * 2,
      coherence: Math.random(),
      timestamp: signal.timestamp,
    };

    setResonanceData(syntheticResonance);
    const cognitive = drrProcessorRef.current.analyzeCognitiveState(syntheticResonance);
    setCognitiveState(cognitive);

    setSystemState(prev => {
      const newRoots = [...prev.resonanceRoots.slice(-9), syntheticResonance];
      const newPhase = determinePhase(syntheticResonance, prev.resonanceRoots);
      
      return {
        ...prev,
        resonanceRoots: newRoots,
        phase: newPhase,
        evolutionPath: newPhase !== prev.phase ? [...prev.evolutionPath.slice(-19), {
          timestamp: Date.now(),
          phase: prev.phase,
          resonance: syntheticResonance.frequency,
          coherence: syntheticResonance.coherence
        }] : prev.evolutionPath
      };
    });
  }, []);

  // Handle touch gestures (mobile input simulation)
  const handleGesture = useCallback((gestureData: { type: string; intensity: number; frequency: number }) => {
    if (!drrProcessorRef.current || systemState.mode !== 'participant') return;

    console.log("Touch gesture detected:", gestureData);

    // Convert gesture to synthetic resonance data
    const syntheticResonance: ResonanceData = {
      frequency: gestureData.frequency,
      amplitude: gestureData.intensity,
      harmonics: [gestureData.frequency * 2, gestureData.frequency * 3], // Basic harmonics
      phase: Math.random() * Math.PI * 2,
      coherence: gestureData.intensity,
      timestamp: Date.now()
    };

    setResonanceData(syntheticResonance);

    setSystemState(prev => {
      const newRoots = [...prev.resonanceRoots.slice(-9), syntheticResonance];
      const newPhase = determinePhase(syntheticResonance, prev.resonanceRoots);
      
      return {
        ...prev,
        resonanceRoots: newRoots,
        phase: newPhase,
        evolutionPath: newPhase !== prev.phase ? [...prev.evolutionPath.slice(-19), {
          timestamp: Date.now(),
          phase: prev.phase,
          resonance: syntheticResonance.frequency,
          coherence: syntheticResonance.coherence
        }] : prev.evolutionPath
      };
    });
  }, [systemState.mode]);

  // Memoized phase determination for performance
  const determinePhase = useCallback((current: ResonanceData, history: ResonanceData[]): SystemState['phase'] => {
    if (history.length < 3) return 'void';
    
    const coherenceAvg = history.slice(-3).reduce((sum, r) => sum + r.coherence, 0) / 3;
    
    if (coherenceAvg > 0.8) return 'phase-lock';
    if (coherenceAvg > 0.6) return 'coherence';
    if (coherenceAvg > 0.3) return 'emergence';
    return 'void';
  }, []);

  const handleModeChange = (mode: 'observer' | 'participant') => {
    setSystemState(prev => ({ ...prev, mode }));
    toast(`Switched to ${mode} mode`);
  };

  const handleSignalSourceChange = (source: 'audio' | 'multi-spectrum') => {
    setSystemState(prev => ({ ...prev, signalSource: source }));
    toast(`Switched to ${source} signal source`);
  };

  const handleSystemActivation = () => {
    setIsActive(!isActive);
    toast(isActive ? "System deactivated" : "System activated - Beginning resonance capture");
  };

  const handleEmbedMessage = (message: string) => {
    if (!drrProcessorRef.current) return;
    const modifiedResonance = drrProcessorRef.current.embedMessage(message, systemState.resonanceRoots);
    setSystemState(prev => ({ ...prev, resonanceRoots: modifiedResonance }));
    toast('Message embedded in resonance data');
  };

  const handleExtractMessage = () => {
    if (!drrProcessorRef.current) return;
    const message = drrProcessorRef.current.extractMessage(systemState.resonanceRoots);
    setExtractedMessage(message);
    toast('Message extracted from resonance data');
  };

  const handleEnrollVoiceprint = () => {
    if (!drrProcessorRef.current) return;
    drrProcessorRef.current.createVoiceprint(systemState.resonanceRoots);
    setIsEnrolled(true);
    toast('Voiceprint enrolled');
  };

  const handleAuthenticateVoiceprint = () => {
    if (!drrProcessorRef.current) return;
    const isAuthenticated = drrProcessorRef.current.authenticateVoiceprint(systemState.resonanceRoots);
    setIsAuthenticated(isAuthenticated);
    toast(isAuthenticated ? 'Authentication successful' : 'Authentication failed');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-void relative overflow-hidden">
        {/* Quantum Field Background */}
        <div className="absolute inset-0 bg-field-gradient animate-quantum-field opacity-30" />

        <Sidebar side="right" className="w-72 md:w-80 bg-quantum-field/50 backdrop-blur-sm">
          <SidebarContent className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-resonance-gamma">System Controls</h2>

            <CognitiveDashboard cognitiveState={cognitiveState} />
            <SteganographyModule
              onEmbed={handleEmbedMessage}
              onExtract={handleExtractMessage}
              extractedMessage={extractedMessage}
            />
            <VoiceprintAuth
              onEnroll={handleEnrollVoiceprint}
              onAuthenticate={handleAuthenticateVoiceprint}
              isEnrolled={isEnrolled}
              isAuthenticated={isAuthenticated}
            />

            <div className="pt-4 mt-auto">
              <EvolutionLogger evolutionPath={systemState.evolutionPath} />
            </div>

          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          {/* Main Interface */}
          <div className="relative z-10 flex flex-col h-screen">
            {/* Header Controls */}
            <header className="absolute top-2 left-2 right-2 z-20 flex flex-col sm:flex-row items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <img
                  src="/lovable-uploads/7ca37a83-809a-4274-b074-ad2d57831ca6.png"
                  alt="Vers3Dynamism Logo"
                  className="h-6 sm:h-8 md:h-10 w-auto object-contain"
                />
                <ModeToggle
                  mode={systemState.mode}
                  onModeChange={handleModeChange}
                />
                <button
                  onClick={handleSystemActivation}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium touch-manipulation ${
                    isActive
                      ? 'bg-resonance-gamma text-void shadow-resonance'
                      : 'bg-quantum-field text-foreground border border-resonance-gamma/30 hover:border-resonance-gamma/60 active:scale-95'
                  }`}
                >
                  {isActive ? 'Stop' : 'Start'}
                </button>
                <select
                  value={systemState.signalSource}
                  onChange={(e) => handleSignalSourceChange(e.target.value as 'audio' | 'multi-spectrum')}
                  className="bg-quantum-field text-foreground border border-resonance-gamma/30 rounded-lg px-1.5 sm:px-2 py-1 text-xs sm:text-sm touch-manipulation"
                >
                  <option value="audio">Audio</option>
                  <option value="multi-spectrum">Multi-Spectrum</option>
                </select>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* System Status */}
                <div className="text-right">
                  <div className="text-xs text-foreground/70 mb-1">
                    <span className="hidden sm:inline">Phase: </span>
                    <span className={`font-medium text-xs ${getPhaseColor(systemState.phase)}`}>
                      {systemState.phase.split('-')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-foreground/50">
                    <span className="hidden sm:inline">Roots: </span>{systemState.resonanceRoots.length}
                    {resonanceData && (
                      <span className="ml-1 sm:ml-2 text-resonance-gamma">
                        {(resonanceData.coherence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <SidebarTrigger className="p-2 touch-manipulation active:scale-95" />
              </div>

            </header>

            {/* Main Canvas Area */}
            <main className="flex-1 relative mt-20 sm:mt-16 md:mt-20">
              <VoidCanvas
                systemState={systemState}
                resonanceData={resonanceData}
                isActive={isActive}
              />

              <TouchInteraction
                onGesture={handleGesture}
                isActive={isActive && systemState.mode === 'participant'}
              />

              {resonanceData && isActive && (
                <ResonanceVisualization
                  resonanceData={resonanceData}
                  systemPhase={systemState.phase}
                />
              )}
            </main>

            {/* Audio Capture & Multi-Spectrum Engine */}
            {isActive && systemState.signalSource === 'audio' && (
              <AudioCapture
                onAudioData={setAudioData}
                onProcessedData={processAudioData}
              />
            )}
            {isActive && systemState.signalSource === 'multi-spectrum' && (
              <MultiSpectrumEngine
                onSignalData={handleSignalData}
                isActive={isActive}
              />
            )}
          </div>
        </SidebarInset>

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </SidebarProvider>
  );

  // Helper function for phase colors
  function getPhaseColor(phase: SystemState['phase']): string {
    const colors = {
      void: 'text-void-glow',
      emergence: 'text-emergence',
      coherence: 'text-coherence',
      'phase-lock': 'text-phase-lock'
    };
    return colors[phase] || 'text-foreground';
  }
};