import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAudioProcessor } from '../hooks/useAudioProcessor';

interface AudioCaptureProps {
  onAudioData: (data: Float32Array) => void;
  onProcessedData: (data: Float32Array) => void;
}

export const AudioCapture = ({ onAudioData, onProcessedData }: AudioCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number>();
  const lastAnalysisTime = useRef<number>(0);
  
  const { 
    audioContext, 
    analyser, 
    initializeAudioContext, 
    createAnalyser, 
    connectMediaStream, 
    cleanup: cleanupAudio 
  } = useAudioProcessor({
    fftSize: 1024, // Optimized for mobile
    smoothingTimeConstant: 0.3,
    minDecibels: -90,
    maxDecibels: -10
  });

  useEffect(() => {
    initializeAudio();
    return cleanup;
  }, []);


  const initializeAudio = useCallback(async () => {
    try {
      // Enhanced mobile audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      mediaStreamRef.current = stream;

      // Initialize audio context and analyser
      const audioContext = await initializeAudioContext();
      const analyser = createAnalyser(audioContext);
      
      // Connect audio source to analyser
      connectMediaStream(stream, audioContext, analyser);

      // Create data array for frequency analysis
      dataArrayRef.current = new Float32Array(analyser.frequencyBinCount);

      setIsRecording(true);
      startAnalysis();
      
      toast("Audio capture active - Make some noise to see patterns emerge!");
      console.log("Audio initialized successfully", {
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
        fftSize: analyser.fftSize
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error("Audio initialization failed:", err);
      setError(`Audio access denied. Please allow microphone permissions and try again.`);
      toast.error("Microphone access required for resonance detection");
    }
  }, [initializeAudioContext, createAnalyser, connectMediaStream]);

  const startAnalysis = useCallback(() => {
    if (!analyser || !dataArrayRef.current) return;

    const dataArray = dataArrayRef.current;

    const analyze = () => {
      // Throttle analysis to 20fps for better performance
      const now = Date.now();
      if (now - lastAnalysisTime.current < 50) {
        animationFrameRef.current = requestAnimationFrame(analyze);
        return;
      }
      lastAnalysisTime.current = now;

      // Get frequency data
      analyser.getFloatFrequencyData(dataArray);
      
      // Convert to time domain for processing
      const timeData = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(timeData);

      // Log actual audio levels for debugging
      const avgLevel = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      console.log("Audio level:", avgLevel, "dB");

      onAudioData(dataArray);
      onProcessedData(timeData);

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  }, [analyser, onAudioData, onProcessedData]);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    cleanupAudio();
    setIsRecording(false);
  }, [cleanupAudio]);

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-20">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm
        ${isRecording 
          ? 'bg-resonance-gamma/20 border border-resonance-gamma/40' 
          : 'bg-quantum-field/60 border border-foreground/20'
        }
      `}>
        <div className={`
          w-3 h-3 rounded-full
          ${isRecording ? 'bg-resonance-gamma animate-pulse-resonance' : 'bg-foreground/40'}
        `} />
        <span className="text-xs text-foreground/70">
          {isRecording ? 'Listening' : 'Audio off'}
        </span>
        {/* Mobile-friendly retry button */}
        {error && (
          <button 
            onClick={() => {
              setError(null);
              initializeAudio();
            }}
            className="ml-2 text-xs text-resonance-gamma hover:text-resonance-gamma/80 underline"
          >
            Retry
          </button>
        )}
      </div>
      
      {/* Mobile error display */}
      {error && (
        <div className="mt-2 bg-destructive/20 border border-destructive/50 rounded-lg p-3 max-w-xs">
          <p className="text-xs text-destructive mb-2">{error}</p>
          <p className="text-xs text-foreground/60">
            Tap "Retry" and allow microphone access when prompted.
          </p>
        </div>
      )}
    </div>
  );
};