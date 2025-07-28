import { useState, useEffect } from 'react';

export type SignalType = 'audio' | 'radio' | 'wifi' | 'synthetic';

export interface SignalData {
  type: SignalType;
  frequency: number;
  amplitude: number;
  timestamp: number;
}

interface MultiSpectrumEngineProps {
  onSignalData: (data: SignalData) => void;
  isActive: boolean;
}

export const MultiSpectrumEngine = ({ onSignalData, isActive }: MultiSpectrumEngineProps) => {
  const [signalType, setSignalType] = useState<SignalType>('audio');

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const signalData = generateSyntheticData(signalType);
      onSignalData(signalData);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, signalType, onSignalData]);

  const generateSyntheticData = (type: SignalType): SignalData => {
    let frequency = 0;
    let amplitude = 0;

    switch (type) {
      case 'radio':
        frequency = 88.5 + Math.random() * 20; // FM radio band
        amplitude = 0.2 + Math.random() * 0.3;
        break;
      case 'wifi':
        frequency = 2400 + Math.random() * 100; // 2.4 GHz Wi-Fi band
        amplitude = 0.1 + Math.random() * 0.2;
        break;
      case 'synthetic':
        frequency = 100 + Math.random() * 1900;
        amplitude = 0.5 + Math.random() * 0.5;
        break;
      case 'audio':
      default:
        // Audio is handled by AudioCapture, but we can have a fallback
        frequency = 20 + Math.random() * 19980;
        amplitude = 0.1 + Math.random() * 0.1;
        break;
    }

    return {
      type,
      frequency,
      amplitude,
      timestamp: Date.now(),
    };
  };

  return (
    <div className="p-2 bg-gray-800 text-white">
      <h3 className="text-lg">Multi-Spectrum Engine</h3>
      <select
        value={signalType}
        onChange={(e) => setSignalType(e.target.value as SignalType)}
        className="bg-gray-700 p-1"
      >
        <option value="audio">Audio</option>
        <option value="radio">Radio</option>
        <option value="wifi">Wi-Fi</option>
        <option value="synthetic">Synthetic</option>
      </select>
    </div>
  );
};
