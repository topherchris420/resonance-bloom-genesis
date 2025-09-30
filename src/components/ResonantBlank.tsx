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
import { SemanticResonanceEngine } from './SemanticResonanceEngine';
import { InternalStateLabel } from './InternalStateLabel';
import { ShareButton } from './ShareButton';
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
  signalSource: 'audio' | 'multi-spectrum' | 'semantic';
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

  // Handle semantic resonance data from Vers3Dynamics integration
  const handleSemanticData = useCallback((semanticPattern: any) => {
    if (!drrProcessorRef.current) return;

    const semanticResonance: ResonanceData = {
      frequency: semanticPattern.frequency,
      amplitude: semanticPattern.amplitude,
      harmonics: [
        semanticPattern.frequency * 2,
        semanticPattern.frequency * 3,
        semanticPattern.frequency * 5,
      ],
      phase: semanticPattern.phase,
      coherence: semanticPattern.resonance,
      timestamp: Date.now(),
    };

    setResonanceData(semanticResonance);
    const cognitive = drrProcessorRef.current.analyzeCognitiveState(semanticResonance);
    setCognitiveState(cognitive);

    setSystemState(prev => {
      const newRoots = [...prev.resonanceRoots.slice(-9), semanticResonance];
      const newPhase = determinePhase(semanticResonance, prev.resonanceRoots);
      
      return {
        ...prev,
        resonanceRoots: newRoots,
        phase: newPhase,
        evolutionPath: newPhase !== prev.phase ? [...prev.evolutionPath.slice(-19), {
          timestamp: Date.now(),
          phase: prev.phase,
          resonance: semanticResonance.frequency,
          coherence: semanticResonance.coherence
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

  const handleSignalSourceChange = (source: 'audio' | 'multi-spectrum' | 'semantic') => {
    setSystemState(prev => ({ ...prev, signalSource: source }));
    const sourceName = source === 'semantic' ? 'Semantic Resonance (Vers3Dynamics)' : source;
    toast(`Switched to ${sourceName} signal source`);
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

        <Sidebar side="right" className="w-full md:w-80 bg-quantum-field/95 backdrop-blur-xl border-l border-resonance-gamma/20">
          <SidebarContent className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold text-resonance-gamma mb-2">System Controls</h2>

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
            {/* Mobile-optimized header */}
            <header className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-20">
              <div className="bg-quantum-field/95 backdrop-blur-xl rounded-3xl p-3 md:p-4 border border-resonance-gamma/20 shadow-emergence">
                <div className="flex flex-col gap-3">
                  {/* Top row: Logo and system status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <img
                        src="/lovable-uploads/7ca37a83-809a-4274-b074-ad2d57831ca6.png"
                        alt="Vers3Dynamism Logo"
                        className="h-7 md:h-10 w-auto object-contain flex-shrink-0"
                      />
                      <div className="hidden sm:block min-w-0">
                        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">Resonant Blank</h1>
                        <p className="text-xs text-muted-foreground truncate">Quantum Field Interface</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <div className="text-center px-2 py-1 rounded-lg bg-void/30">
                        <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Phase</div>
                        <span className={`font-bold text-xs md:text-sm ${getPhaseColor(systemState.phase)}`}>
                          {systemState.phase.split('-')[0].toUpperCase()}
                        </span>
                      </div>
                      {resonanceData && (
                        <div className="text-center px-2 py-1 rounded-lg bg-void/30">
                          <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Sync</div>
                          <span className="text-xs md:text-sm font-bold text-resonance-gamma">
                            {(resonanceData.coherence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      <SidebarTrigger className="p-2.5 md:p-3 bg-quantum-field/80 rounded-xl border border-resonance-gamma/30 touch-manipulation hover:bg-resonance-gamma/10 active:scale-95 transition-all" />
                    </div>
                  </div>

                  {/* Bottom row: Controls */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <ModeToggle
                      mode={systemState.mode}
                      onModeChange={handleModeChange}
                    />
                    
                    <button
                      onClick={handleSystemActivation}
                      className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all font-semibold text-sm md:text-base min-h-[44px] touch-manipulation ${
                        isActive
                          ? 'bg-resonance-gamma text-void shadow-resonance scale-105 hover:scale-110'
                          : 'bg-quantum-field text-foreground border-2 border-resonance-gamma/30 hover:border-resonance-gamma/60 hover:bg-resonance-gamma/5 active:scale-95'
                      }`}
                      style={{ transition: 'var(--transition-base)' }}
                    >
                      {isActive ? 'Stop' : 'Start'}
                    </button>
                    
                    <select
                      value={systemState.signalSource}
                      onChange={(e) => handleSignalSourceChange(e.target.value as 'audio' | 'multi-spectrum' | 'semantic')}
                      className="bg-quantum-field/80 text-foreground text-sm md:text-base border-2 border-resonance-gamma/30 rounded-xl px-3 md:px-4 py-2.5 md:py-3 min-h-[44px] touch-manipulation hover:border-resonance-gamma/60 focus:border-resonance-gamma focus:outline-none transition-all"
                      style={{ transition: 'var(--transition-base)' }}
                    >
                      <option value="audio">Audio</option>
                      <option value="multi-spectrum">Multi-Spectrum</option>
                      <option value="semantic">Semantic (V3D)</option>
                    </select>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Canvas Area */}
            <main className="flex-1 relative mt-32 md:mt-36">
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
                <>
                  <ResonanceVisualization
                    resonanceData={resonanceData}
                    systemPhase={systemState.phase}
                  />
                  {cognitiveState && (
                    <>
                      <InternalStateLabel
                        cognitiveState={cognitiveState}
                        resonanceData={resonanceData}
                      />
                      <ShareButton
                        stateLabel={`${cognitiveState.emotionalState} pattern`}
                      />
                    </>
                  )}
                </>
              )}

              {isActive && systemState.signalSource === 'semantic' && (
                <SemanticResonanceEngine
                  onSemanticData={handleSemanticData}
                  isActive={isActive}
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