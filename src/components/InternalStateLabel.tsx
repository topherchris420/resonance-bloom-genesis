import { CognitiveState } from './CognitiveDashboard';
import { ResonanceData } from './ResonantBlank';

interface InternalStateLabelProps {
  cognitiveState: CognitiveState;
  resonanceData: ResonanceData;
}

export const InternalStateLabel = ({ cognitiveState, resonanceData }: InternalStateLabelProps) => {
  const getStateDescription = () => {
    const { emotionalState, mentalState } = cognitiveState;
    const { frequency, coherence } = resonanceData;
    
    // Breathing detection
    const isBreathing = frequency < 150 && coherence > 0.6;
    
    // Voice detection
    const isVoice = frequency > 250 && frequency < 3000;
    
    // Generate descriptive labels
    if (emotionalState === 'agitated') {
      if (isBreathing) return "Your Stress Pattern";
      if (isVoice) return "Anxious Energy Flow";
      return "High Intensity State";
    }
    
    if (emotionalState === 'calm') {
      if (isBreathing) return "Deep Relaxation";
      if (coherence > 0.8) return "Perfect Balance";
      return "Peaceful Mind";
    }
    
    if (emotionalState === 'focused') {
      if (mentalState === 'analytical') return "Thoughts Aligning";
      return "Focused Resonance";
    }
    
    if (emotionalState === 'distracted') {
      return "Scattered Energy";
    }
    
    return "Your Inner Pattern";
  };
  
  const getStateEmoji = () => {
    const { emotionalState } = cognitiveState;
    const emojiMap = {
      calm: '🧘',
      agitated: '⚡',
      focused: '🎯',
      distracted: '🌊'
    };
    return emojiMap[emotionalState];
  };
  
  const description = getStateDescription();
  const emoji = getStateEmoji();
  
  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="bg-quantum-field/90 backdrop-blur-xl border-2 border-resonance-gamma/30 rounded-2xl px-6 py-3 shadow-emergence animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-foreground">{description}</h3>
            <p className="text-sm text-muted-foreground">
              {cognitiveState.emotionalState} • {cognitiveState.mentalState}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
