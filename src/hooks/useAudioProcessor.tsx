import { useCallback, useRef, useEffect } from 'react';

interface AudioProcessorOptions {
  sampleRate?: number;
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export const useAudioProcessor = (options: AudioProcessorOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const {
    sampleRate = 44100,
    fftSize = 1024, // Optimized for mobile
    smoothingTimeConstant = 0.3,
    minDecibels = -90,
    maxDecibels = -10
  } = options;

  const initializeAudioContext = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate });
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }, [sampleRate]);

  const createAnalyser = useCallback((audioContext: AudioContext) => {
    analyserRef.current = audioContext.createAnalyser();
    analyserRef.current.fftSize = fftSize;
    analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
    analyserRef.current.minDecibels = minDecibels;
    analyserRef.current.maxDecibels = maxDecibels;
    
    return analyserRef.current;
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels]);

  const connectMediaStream = useCallback((stream: MediaStream, audioContext: AudioContext, analyser: AnalyserNode) => {
    sourceRef.current = audioContext.createMediaStreamSource(stream);
    sourceRef.current.connect(analyser);
    return sourceRef.current;
  }, []);

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    initializeAudioContext,
    createAnalyser,
    connectMediaStream,
    cleanup
  };
};