import { ResonanceData } from './ResonantBlank';
import { CognitiveState } from './CognitiveDashboard';
import Sentiment from 'sentiment';

export class DRRProcessor {
  private sampleRate: number = 44100;
  private windowSize: number = 1024; // Reduced for mobile performance
  private hopSize: number = 512;
  private resonanceHistory: ResonanceData[] = [];
  private sentiment: Sentiment;
  private voiceprint: number[] | null = null;
  private fftCache: Map<string, Float32Array> = new Map();
  private lastProcessTime: number = 0;
  private readonly processInterval: number = 50; // Throttle to 20fps

  constructor() {
    // Initialize DRR algorithms
    this.sentiment = new Sentiment();
  }

  detectResonanceRoots(audioBuffer: Float32Array): ResonanceData {
    // Throttle processing for performance
    const now = Date.now();
    if (now - this.lastProcessTime < this.processInterval) {
      return this.getLastResonanceData();
    }
    this.lastProcessTime = now;

    // Log actual audio input for debugging
    const rms = this.calculateRMS(audioBuffer);
    console.log("DRR Processing - RMS:", rms, "Buffer length:", audioBuffer.length);

    // Apply optimized FFT with caching
    const frequencies = this.performOptimizedFFT(audioBuffer);
    
    // Detect dominant frequencies
    const dominantFreq = this.findDominantFrequency(frequencies);
    console.log("Dominant frequency detected:", dominantFreq, "Hz");
    
    // Calculate harmonics
    const harmonics = this.extractHarmonics(frequencies, dominantFreq);
    
    // Measure amplitude and phase
    const amplitude = this.calculateAmplitude(frequencies);
    const phase = this.calculatePhase(audioBuffer);
    
    // Calculate coherence with previous measurements
    const coherence = this.calculateCoherence(dominantFreq, amplitude, harmonics);

    const resonanceData: ResonanceData = {
      frequency: dominantFreq,
      amplitude: Math.max(amplitude, rms * 0.1), // Ensure some response to audio
      harmonics,
      phase,
      coherence,
      timestamp: Date.now()
    };

    // Store in history for coherence calculations (optimized size)
    this.resonanceHistory.push(resonanceData);
    if (this.resonanceHistory.length > 10) {
      this.resonanceHistory.shift();
    }

    console.log("Resonance data:", resonanceData);
    return resonanceData;
  }

  analyzeCognitiveState(resonanceData: ResonanceData): CognitiveState {
    const { frequency, amplitude, coherence, harmonics } = resonanceData;
    
    // Analyze breathing pattern (low frequency, rhythmic = breathing)
    const isBreathing = frequency < 150 && coherence > 0.6;
    
    // Analyze voice pattern (250-3000Hz range with harmonics)
    const isVoice = frequency > 250 && frequency < 3000 && harmonics.length > 2;
    
    // Enhanced emotional state analysis
    let emotionalState: CognitiveState['emotionalState'] = 'calm';
    
    if (isBreathing) {
      // Breathing pattern analysis
      const breathRate = frequency / 60; // Convert to breaths per minute
      if (breathRate > 20) {
        emotionalState = 'agitated'; // Fast breathing = stress/anxiety
      } else if (amplitude > 0.6) {
        emotionalState = 'agitated'; // Heavy breathing
      } else if (coherence > 0.8) {
        emotionalState = 'calm'; // Steady, slow breathing
      } else {
        emotionalState = 'distracted';
      }
    } else if (isVoice) {
      // Voice pattern analysis
      const pitchVariation = this.calculatePitchVariation();
      if (amplitude > 0.6 && pitchVariation > 0.5) {
        emotionalState = 'agitated'; // High energy, variable pitch = stressed
      } else if (coherence > 0.7) {
        emotionalState = 'focused'; // Stable voice = focused
      } else {
        emotionalState = 'distracted';
      }
    } else {
      // General audio analysis
      if (amplitude > 0.5) {
        emotionalState = coherence > 0.7 ? 'focused' : 'agitated';
      } else {
        emotionalState = coherence < 0.3 ? 'distracted' : 'calm';
      }
    }

    // Enhanced mental state
    let mentalState: CognitiveState['mentalState'] = 'receptive';
    const complexityScore = harmonics.length * coherence;
    
    if (complexityScore > 4) {
      mentalState = 'analytical'; // Complex, coherent patterns
    } else if (coherence < 0.2) {
      mentalState = 'resistant'; // Chaotic
    } else if (isBreathing && coherence > 0.8) {
      mentalState = 'receptive'; // Deep, calm breathing
    } else if (frequency > 1000) {
      mentalState = 'analytical'; // High frequency activity
    } else {
      mentalState = 'suggestible';
    }

    // Enhanced sentiment
    const textEquivalent = `freq:${frequency.toFixed(0)} amp:${amplitude.toFixed(2)} coh:${coherence.toFixed(2)}`;
    const sentimentResult = this.sentiment.analyze(textEquivalent);

    return {
      emotionalState,
      mentalState,
      sentiment: {
        score: sentimentResult.score,
        label: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral',
      },
    };
  }
  
  private calculatePitchVariation(): number {
    if (this.resonanceHistory.length < 3) return 0;
    const recentFreqs = this.resonanceHistory.slice(-5).map(r => r.frequency);
    const mean = recentFreqs.reduce((sum, f) => sum + f, 0) / recentFreqs.length;
    const variance = recentFreqs.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / recentFreqs.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  private performOptimizedFFT(buffer: Float32Array): Float32Array {
    // Use cached result if buffer hasn't changed significantly
    const bufferHash = this.hashBuffer(buffer);
    if (this.fftCache.has(bufferHash)) {
      return this.fftCache.get(bufferHash)!;
    }

    // Optimized FFT for mobile performance
    const N = Math.min(buffer.length, this.windowSize); // Limit size for performance
    const frequencies = new Float32Array(N / 2);
    
    // Use decimation for better performance on mobile
    const step = Math.max(1, Math.floor(buffer.length / N));
    
    for (let k = 0; k < N / 2; k += 2) { // Process every other bin for speed
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n += step) {
        const angle = -2 * Math.PI * k * n / N;
        const sample = buffer[n] || 0;
        real += sample * Math.cos(angle);
        imag += sample * Math.sin(angle);
      }
      
      const magnitude = Math.sqrt(real * real + imag * imag);
      frequencies[k] = magnitude;
      if (k + 1 < N / 2) frequencies[k + 1] = magnitude; // Fill gaps
    }
    
    // Cache result with size limit
    if (this.fftCache.size > 5) {
      const firstKey = this.fftCache.keys().next().value;
      this.fftCache.delete(firstKey);
    }
    this.fftCache.set(bufferHash, frequencies);
    
    return frequencies;
  }

  private hashBuffer(buffer: Float32Array): string {
    // Simple hash for caching - sample every 10th element
    let hash = '';
    for (let i = 0; i < buffer.length; i += 10) {
      hash += Math.floor(buffer[i] * 1000).toString();
    }
    return hash.substring(0, 20); // Limit hash length
  }

  private getLastResonanceData(): ResonanceData {
    return this.resonanceHistory[this.resonanceHistory.length - 1] || {
      frequency: 440,
      amplitude: 0,
      harmonics: [],
      phase: 0,
      coherence: 0,
      timestamp: Date.now()
    };
  }

  private findDominantFrequency(frequencies: Float32Array): number {
    let maxIndex = 0;
    let maxValue = -Infinity;
    
    // Skip DC component and very low frequencies, focus on audible range
    const startBin = Math.floor(50 * frequencies.length * 2 / this.sampleRate); // 50Hz
    const endBin = Math.floor(4000 * frequencies.length * 2 / this.sampleRate); // 4kHz
    
    for (let i = startBin; i < Math.min(endBin, frequencies.length); i++) {
      if (frequencies[i] > maxValue) {
        maxValue = frequencies[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    const frequency = (maxIndex * this.sampleRate) / (frequencies.length * 2);
    console.log("Frequency analysis - Max value:", maxValue, "at", frequency, "Hz");
    
    // Return a reasonable frequency even if no strong peak is found
    return frequency > 20 ? frequency : 440; // Default to A4 if no clear signal
  }

  private extractHarmonics(frequencies: Float32Array, fundamental: number): number[] {
    const harmonics: number[] = [];
    const fundamentalBin = Math.round((fundamental * frequencies.length * 2) / this.sampleRate);
    
    // Find up to 5 harmonics
    for (let h = 2; h <= 6; h++) {
      const harmonicBin = fundamentalBin * h;
      if (harmonicBin < frequencies.length) {
        const harmonicFreq = (harmonicBin * this.sampleRate) / (frequencies.length * 2);
        if (frequencies[harmonicBin] > frequencies[fundamentalBin] * 0.1) {
          harmonics.push(harmonicFreq);
        }
      }
    }
    
    return harmonics;
  }

  private calculateAmplitude(frequencies: Float32Array): number {
    // RMS amplitude calculation
    let sum = 0;
    for (let i = 0; i < frequencies.length; i++) {
      sum += frequencies[i] * frequencies[i];
    }
    return Math.sqrt(sum / frequencies.length) / 1000; // Normalize
  }

  private calculatePhase(buffer: Float32Array): number {
    // Simple phase calculation using zero crossings
    let crossings = 0;
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i-1] >= 0) !== (buffer[i] >= 0)) {
        crossings++;
      }
    }
    return (crossings / buffer.length) * Math.PI;
  }

  private calculateCoherence(frequency: number, amplitude: number, harmonics: number[]): number {
    if (this.resonanceHistory.length < 3) return 0;

    // Calculate stability metrics
    const recentHistory = this.resonanceHistory.slice(-5);
    
    // Frequency stability
    const freqVariance = this.calculateVariance(recentHistory.map(r => r.frequency));
    const freqStability = Math.exp(-freqVariance / 1000);
    
    // Amplitude stability
    const ampVariance = this.calculateVariance(recentHistory.map(r => r.amplitude));
    const ampStability = Math.exp(-ampVariance);
    
    // Harmonic consistency
    const harmonicConsistency = this.calculateHarmonicConsistency(harmonics, recentHistory);
    
    // Overall coherence
    return (freqStability + ampStability + harmonicConsistency) / 3;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  private calculateHarmonicConsistency(currentHarmonics: number[], history: ResonanceData[]): number {
    if (history.length === 0 || currentHarmonics.length === 0) return 0;
    
    let totalConsistency = 0;
    let count = 0;
    
    for (const record of history) {
      if (record.harmonics.length > 0) {
        const similarity = this.calculateHarmonicSimilarity(currentHarmonics, record.harmonics);
        totalConsistency += similarity;
        count++;
      }
    }
    
    return count > 0 ? totalConsistency / count : 0;
  }

  private calculateHarmonicSimilarity(harmonics1: number[], harmonics2: number[]): number {
    if (harmonics1.length === 0 || harmonics2.length === 0) return 0;
    
    let matches = 0;
    const tolerance = 50; // Hz tolerance
    
    for (const h1 of harmonics1) {
      for (const h2 of harmonics2) {
        if (Math.abs(h1 - h2) < tolerance) {
          matches++;
          break;
        }
      }
    }
    
    return matches / Math.max(harmonics1.length, harmonics2.length);
  }

  embedMessage(message: string, resonanceData: ResonanceData[]): ResonanceData[] {
    const binaryMessage = this.stringToBinary(message);
    let messageIndex = 0;

    const modifiedResonanceData = resonanceData.map(data => {
      if (messageIndex < binaryMessage.length) {
        const bit = parseInt(binaryMessage[messageIndex], 2);
        const newFreq = this.embedBit(data.frequency, bit);
        messageIndex++;
        return { ...data, frequency: newFreq };
      }
      return data;
    });

    return modifiedResonanceData;
  }

  extractMessage(resonanceData: ResonanceData[]): string {
    const binaryMessage = resonanceData.map(data => this.extractBit(data.frequency)).join('');
    return this.binaryToString(binaryMessage);
  }

  private stringToBinary(str: string): string {
    return str.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
  }

  private binaryToString(binary: string): string {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  }

  private embedBit(value: number, bit: number): number {
    const intValue = Math.floor(value);
    return (intValue & ~1) | bit;
  }

  private extractBit(value: number): number {
    const intValue = Math.floor(value);
    return intValue & 1;
  }

  createVoiceprint(resonanceData: ResonanceData[]): void {
    if (resonanceData.length < 5) {
      console.error("Not enough resonance data to create a voiceprint.");
      return;
    }
    const features = resonanceData.map(d => [d.frequency, d.amplitude, d.coherence]);
    this.voiceprint = features.flat();
  }

  authenticateVoiceprint(resonanceData: ResonanceData[]): boolean {
    if (!this.voiceprint || resonanceData.length < 5) {
      return false;
    }
    const currentFeatures = resonanceData.map(d => [d.frequency, d.amplitude, d.coherence]).flat();

    // Simple Euclidean distance for comparison
    let distance = 0;
    for (let i = 0; i < this.voiceprint.length; i++) {
      distance += Math.pow(this.voiceprint[i] - currentFeatures[i], 2);
    }
    const similarity = Math.sqrt(distance);

    // This threshold would need to be determined empirically
    return similarity < 1000;
  }

  // Generate structures based on resonance patterns
  generateStructures(resonanceData: ResonanceData): any[] {
    const structures = [];
    
    // Map frequency to geometric forms
    const frequency = resonanceData.frequency;
    const amplitude = resonanceData.amplitude;
    const coherence = resonanceData.coherence;
    
    if (frequency > 100 && amplitude > 0.1) {
      structures.push({
        type: 'cymatic-circle',
        frequency,
        amplitude,
        coherence,
        geometry: this.generateCymaticGeometry(frequency, amplitude)
      });
    }
    
    if (resonanceData.harmonics.length > 2 && coherence > 0.5) {
      structures.push({
        type: 'harmonic-matrix',
        harmonics: resonanceData.harmonics,
        coherence,
        geometry: this.generateHarmonicGeometry(resonanceData.harmonics)
      });
    }
    
    return structures;
  }

  private generateCymaticGeometry(frequency: number, amplitude: number) {
    const sides = Math.floor(frequency / 100) % 12 + 3;
    const radius = amplitude * 100;
    
    return {
      sides,
      radius,
      rotation: (frequency % 360) * Math.PI / 180
    };
  }

  private generateHarmonicGeometry(harmonics: number[]) {
    return {
      layers: harmonics.length,
      frequencies: harmonics,
      phase_relationships: harmonics.map((h, i) => (h / harmonics[0]) * Math.PI)
    };
  }
}