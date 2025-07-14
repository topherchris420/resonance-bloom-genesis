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
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });
      
      mediaStreamRef.current = stream;

      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Create analyser node
      analyserRef.current = audioContext.createAnalyser();
      const analyser = analyserRef.current;
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.1;
      
      // Connect audio source to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create data array for frequency analysis
      dataArrayRef.current = new Float32Array(analyser.frequencyBinCount);

      setIsRecording(true);
      startAnalysis();
      
      toast("Audio capture initialized - Listening for resonance patterns");
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize audio: ${message}`);
      toast.error("Failed to access microphone");
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

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive/20 border border-destructive/50 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-destructive">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            initializeAudio();
          }}
          className="mt-2 text-xs text-destructive hover:text-destructive/80"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm
        ${isRecording 
          ? 'bg-resonance-gamma/20 border border-resonance-gamma/40' 
          : 'bg-quantum-field/60 border border-foreground/20'
        }
      `}>
        <div className={`
          w-2 h-2 rounded-full
          ${isRecording ? 'bg-resonance-gamma animate-pulse-resonance' : 'bg-foreground/40'}
        `} />
        <span className="text-xs text-foreground/70">
          {isRecording ? 'Capturing audio' : 'Audio inactive'}
        </span>
      </div>
    </div>
  );
};