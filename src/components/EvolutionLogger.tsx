import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';

interface EvolutionEntry {
  timestamp: number;
  phase: string;
  resonance: number;
  coherence: number;
}

interface EvolutionLoggerProps {
  evolutionPath: EvolutionEntry[];
}

export const EvolutionLogger = ({ evolutionPath }: EvolutionLoggerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedEntries, setDisplayedEntries] = useState<EvolutionEntry[]>([]);

  useEffect(() => {
    // Keep only last 50 entries for performance
    setDisplayedEntries(evolutionPath.slice(-50));
  }, [evolutionPath]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getPhaseColor = (phase: string): string => {
    const colors = {
      void: 'text-void-glow',
      emergence: 'text-emergence',
      coherence: 'text-coherence',
      'phase-lock': 'text-phase-lock'
    };
    return colors[phase as keyof typeof colors] || 'text-foreground';
  };

  const exportLog = () => {
    const data = JSON.stringify(evolutionPath, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resonant-evolution-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculatePhaseDistribution = () => {
    const phases = { void: 0, emergence: 0, coherence: 0, 'phase-lock': 0 };
    evolutionPath.forEach(entry => {
      phases[entry.phase as keyof typeof phases]++;
    });
    return phases;
  };

  const phaseDistribution = calculatePhaseDistribution();
  const totalEntries = evolutionPath.length;

  return (
    <div className="bg-quantum-field/80 backdrop-blur-sm border border-foreground/20 rounded-lg overflow-hidden max-w-md">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-quantum-field/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-resonance-gamma rounded-full animate-pulse-resonance" />
          <span className="text-sm font-medium text-foreground">Evolution Log</span>
          <span className="text-xs text-foreground/60">({totalEntries})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              exportLog();
            }}
            className="p-1 hover:bg-foreground/10 rounded transition-colors"
            title="Export log"
          >
            <Download size={14} className="text-foreground/70" />
          </button>
          {isExpanded ? (
            <ChevronUp size={16} className="text-foreground/70" />
          ) : (
            <ChevronDown size={16} className="text-foreground/70" />
          )}
        </div>
      </div>

      {/* Phase Distribution Summary */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-4 gap-1 text-xs">
          {Object.entries(phaseDistribution).map(([phase, count]) => (
            <div key={phase} className="text-center">
              <div className={`text-xs ${getPhaseColor(phase)}`}>
                {phase.slice(0, 3).toUpperCase()}
              </div>
              <div className="text-foreground/60">
                {totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Log */}
      {isExpanded && (
        <div className="border-t border-foreground/20 max-h-64 overflow-y-auto">
          {displayedEntries.length === 0 ? (
            <div className="p-4 text-center text-foreground/50 text-sm">
              No evolution data yet
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {displayedEntries.slice().reverse().map((entry, index) => (
                <div 
                  key={`${entry.timestamp}-${index}`}
                  className="flex items-center justify-between text-xs p-2 hover:bg-foreground/5 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/60 font-mono">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <span className={`font-medium ${getPhaseColor(entry.phase)}`}>
                      {entry.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <span title="Frequency">
                      {entry.resonance.toFixed(0)}Hz
                    </span>
                    <span 
                      title="Coherence"
                      className={`font-medium ${
                        entry.coherence > 0.8 ? 'text-phase-lock' :
                        entry.coherence > 0.6 ? 'text-coherence' :
                        entry.coherence > 0.3 ? 'text-emergence' :
                        'text-foreground/50'
                      }`}
                    >
                      {(entry.coherence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
