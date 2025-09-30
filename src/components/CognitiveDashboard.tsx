import React from 'react';
import { ResonanceData } from './ResonantBlank';

export interface CognitiveState {
  emotionalState: 'calm' | 'agitated' | 'focused' | 'distracted';
  mentalState: 'receptive' | 'resistant' | 'suggestible' | 'analytical';
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
}

interface CognitiveDashboardProps {
  cognitiveState: CognitiveState | null;
}

export const CognitiveDashboard: React.FC<CognitiveDashboardProps> = ({ cognitiveState }) => {
  if (!cognitiveState) {
    return (
      <div className="p-3 md:p-4 bg-quantum-field/60 backdrop-blur-sm rounded-xl border border-resonance-gamma/20">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Internal State</h3>
        <p className="text-xs md:text-sm text-muted-foreground">Waiting for signal...</p>
      </div>
    );
  }

  const { emotionalState, mentalState, sentiment } = cognitiveState;
  
  const getEmotionalColor = () => {
    const colors = {
      calm: 'text-blue-400',
      agitated: 'text-red-400',
      focused: 'text-purple-400',
      distracted: 'text-yellow-400'
    };
    return colors[emotionalState];
  };

  return (
    <div className="p-3 md:p-4 bg-quantum-field/60 backdrop-blur-sm rounded-xl border border-resonance-gamma/20">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-3">Internal State</h3>
      <div className="space-y-2 md:space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Emotional</p>
          <p className={`text-sm md:text-base font-semibold capitalize ${getEmotionalColor()}`}>
            {emotionalState}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mental</p>
          <p className="text-sm md:text-base font-semibold capitalize text-foreground">
            {mentalState}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
          <p className="text-sm md:text-base font-semibold capitalize text-foreground">
            {sentiment.label} <span className="text-xs text-muted-foreground">({sentiment.score.toFixed(1)})</span>
          </p>
        </div>
      </div>
    </div>
  );
};
