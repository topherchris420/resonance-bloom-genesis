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
      <div className="p-2 bg-gray-800 text-white">
        <h3 className="text-lg">Cognitive Dashboard</h3>
        <p>No cognitive data available.</p>
      </div>
    );
  }

  const { emotionalState, mentalState, sentiment } = cognitiveState;

  return (
    <div className="p-2 bg-gray-800 text-white">
      <h3 className="text-lg">Cognitive Dashboard</h3>
      <div>
        <p>Emotional State: {emotionalState}</p>
        <p>Mental State: {mentalState}</p>
        <p>Sentiment: {sentiment.label} ({sentiment.score.toFixed(2)})</p>
      </div>
    </div>
  );
};
