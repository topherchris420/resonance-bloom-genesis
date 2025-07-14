import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AudioCaptureProps {
  onAudioData: (data: Float32Array) => void;
  onProcessedData: (data: Float32Array) => void;
}

export const AudioCapture = ({ onAudioData, onProcessedData }: AudioCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    initializeAudio();
    return cleanup;
  }, []);


  const initializeAudio = async () => {
    try {
      // Enhanced mobile audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          // Mobile-specific constraints
          channelCount: 1
        }
      });
      
      mediaStreamRef.current = stream;

      // Create audio context with mobile compatibility
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const audioContext = audioContextRef.current;

      // Resume audio context if suspended (required on mobile)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create analyser node with optimized settings
      analyserRef.current = audioContext.createAnalyser();
      const analyser = analyserRef.current;
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3; // Increased for mobile stability
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      // Connect audio source to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

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
  };

  const startAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const analyze = () => {
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
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
  };

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