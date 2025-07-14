import { ResonanceData } from './ResonantBlank';

export class DRRProcessor {
  private sampleRate: number = 44100;
  private windowSize: number = 2048;
  private hopSize: number = 1024;
  private resonanceHistory: ResonanceData[] = [];

  constructor() {
    // Initialize DRR algorithms
  }

  detectResonanceRoots(audioBuffer: Float32Array): ResonanceData {
    // Apply FFT to get frequency domain data
    const frequencies = this.performFFT(audioBuffer);
    
    // Detect dominant frequencies
    const dominantFreq = this.findDominantFrequency(frequencies);
    
    // Calculate harmonics
    const harmonics = this.extractHarmonics(frequencies, dominantFreq);
    
    // Measure amplitude and phase
    const amplitude = this.calculateAmplitude(frequencies);
    const phase = this.calculatePhase(audioBuffer);
    
    // Calculate coherence with previous measurements
    const coherence = this.calculateCoherence(dominantFreq, amplitude, harmonics);

    const resonanceData: ResonanceData = {
      frequency: dominantFreq,
      amplitude,
      harmonics,
      phase,
      coherence,
      timestamp: Date.now()
    };

    // Store in history for coherence calculations
    this.resonanceHistory.push(resonanceData);
    if (this.resonanceHistory.length > 20) {
      this.resonanceHistory.shift();
    }

    return resonanceData;
  }

  private performFFT(buffer: Float32Array): Float32Array {
    // Simplified FFT implementation for frequency analysis
    const N = buffer.length;
    const frequencies = new Float32Array(N / 2);
    
    for (let k = 0; k < N / 2; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += buffer[n] * Math.cos(angle);
        imag += buffer[n] * Math.sin(angle);
      }
      
      frequencies[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return frequencies;
  }

  private findDominantFrequency(frequencies: Float32Array): number {
    let maxIndex = 0;
    let maxValue = 0;
    
    // Skip DC component and very low frequencies
    for (let i = 10; i < frequencies.length; i++) {
      if (frequencies[i] > maxValue) {
        maxValue = frequencies[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    return (maxIndex * this.sampleRate) / (frequencies.length * 2);
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