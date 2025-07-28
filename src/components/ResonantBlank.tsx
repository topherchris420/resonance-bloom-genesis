import { useState, useEffect, useRef, useCallback } from 'react';
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
    const cognitive = drrProcessorRef.current.analyzeCognitiveState(resonance);
    setCognitiveState(cognitive);

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

    setSystemState(prev => ({
      ...prev,
      resonanceRoots: [...prev.resonanceRoots.slice(-10), syntheticResonance],
      phase: determinePhase(syntheticResonance, prev.resonanceRoots),
      evolutionPath: [...prev.evolutionPath, {
        timestamp: Date.now(),
        phase: prev.phase,
        resonance: syntheticResonance.frequency,
        coherence: syntheticResonance.coherence
      }]
    }));
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

    setSystemState(prev => ({
      ...prev,
      resonanceRoots: [...prev.resonanceRoots.slice(-10), syntheticResonance],
      phase: determinePhase(syntheticResonance, prev.resonanceRoots),
      evolutionPath: [...prev.evolutionPath, {
        timestamp: Date.now(),
        phase: prev.phase,
        resonance: syntheticResonance.frequency,
        coherence: syntheticResonance.coherence
      }]
    }));
  }, [systemState.mode]);

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
    <div className="min-h-screen bg-void relative overflow-hidden touch-none">
      {/* Quantum Field Background */}
      <div className="absolute inset-0 bg-field-gradient animate-quantum-field opacity-30" />
      
      {/* Main Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Mobile-Optimized Header Controls */}
        <div className="absolute top-2 left-2 right-2 z-20 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/7ca37a83-809a-4274-b074-ad2d57831ca6.png" 
              alt="Vers3Dynamism Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <ModeToggle
              mode={systemState.mode}
              onModeChange={handleModeChange}
            />
            <button
              onClick={handleSystemActivation}
              className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                isActive 
                  ? 'bg-resonance-gamma text-void shadow-resonance' 
                  : 'bg-quantum-field text-foreground border border-resonance-gamma/30 hover:border-resonance-gamma/60'
              }`}
            >
              {isActive ? 'Stop' : 'Start'}
            </button>
            <select
              value={systemState.signalSource}
              onChange={(e) => handleSignalSourceChange(e.target.value as 'audio' | 'multi-spectrum')}
              className="bg-quantum-field text-foreground border border-resonance-gamma/30 rounded-lg px-2 py-1 text-sm"
            >
              <option value="audio">Audio</option>
              <option value="multi-spectrum">Multi-Spectrum</option>
            </select>
          </div>
          
          {/* Mobile System Status */}
          <div className="flex-1 text-right">
            <div className="text-xs text-foreground/70 mb-1">
              Phase: <span className={`font-medium ${getPhaseColor(systemState.phase)}`}>
                {systemState.phase.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-foreground/50">
              Roots: {systemState.resonanceRoots.length}
              {resonanceData && (
                <span className="ml-2 text-resonance-gamma">
                  {(resonanceData.coherence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Canvas Area - Touch Optimized */}
        <div className="flex-1 relative mt-16 sm:mt-4">
          <VoidCanvas
            systemState={systemState}
            resonanceData={resonanceData}
            isActive={isActive}
          />
          
          {/* Touch Interaction Layer */}
          <TouchInteraction
            onGesture={handleGesture}
            isActive={isActive && systemState.mode === 'participant'}
          />
          
          {/* Resonance Visualization Overlay */}
          {resonanceData && isActive && (
            <ResonanceVisualization
              resonanceData={resonanceData}
              systemPhase={systemState.phase}
            />
          )}
        </div>

        {/* Cognitive Dashboard */}
        <div className="absolute top-24 right-2 z-20">
          <CognitiveDashboard cognitiveState={cognitiveState} />
        </div>

        {/* Steganography Module */}
        <div className="absolute bottom-24 right-2 z-20">
          <SteganographyModule
            onEmbed={handleEmbedMessage}
            onExtract={handleExtractMessage}
            extractedMessage={extractedMessage}
          />
        </div>

        {/* Voiceprint Auth */}
        <div className="absolute bottom-64 right-2 z-20">
          <VoiceprintAuth
            onEnroll={handleEnrollVoiceprint}
            onAuthenticate={handleAuthenticateVoiceprint}
            isEnrolled={isEnrolled}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Mobile-Optimized Evolution Logger */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-auto sm:bottom-4 z-20">
          <EvolutionLogger evolutionPath={systemState.evolutionPath} />
        </div>

        {/* Audio Capture with Mobile Support */}
        {isActive && systemState.signalSource === 'audio' && (
          <AudioCapture
            onAudioData={setAudioData}
            onProcessedData={processAudioData}
          />
        )}

        {/* Multi-Spectrum Engine */}
        {isActive && systemState.signalSource === 'multi-spectrum' && (
          <MultiSpectrumEngine
            onSignalData={handleSignalData}
            isActive={isActive}
          />
        )}
      </div>
    </div>
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