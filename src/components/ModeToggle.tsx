import { Eye, Hand } from 'lucide-react';

interface ModeToggleProps {
  mode: 'observer' | 'participant';
  onModeChange: (mode: 'observer' | 'participant') => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex bg-quantum-field/60 backdrop-blur-sm border border-foreground/20 rounded-lg p-1">
      <button
        onClick={() => onModeChange('observer')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300
          ${mode === 'observer' 
            ? 'bg-resonance-beta text-foreground shadow-sm' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
          }
        `}
      >
        <Eye size={16} />
        <span className="text-sm font-medium">Observer</span>
      </button>
      
      <button
        onClick={() => onModeChange('participant')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300
          ${mode === 'participant' 
            ? 'bg-resonance-gamma text-void shadow-sm' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
          }
        `}
      >
        <Hand size={16} />
        <span className="text-sm font-medium">Participant</span>
      </button>
    </div>
  );
};