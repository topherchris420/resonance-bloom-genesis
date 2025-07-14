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
          flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300
          ${mode === 'observer' 
            ? 'bg-resonance-beta text-foreground shadow-sm' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
          }
        `}
      >
        <Eye size={14} />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Observer</span>
        <span className="text-xs font-medium sm:hidden">Obs</span>
      </button>
      
      <button
        onClick={() => onModeChange('participant')}
        className={`
          flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300
          ${mode === 'participant' 
            ? 'bg-resonance-gamma text-void shadow-sm' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
          }
        `}
      >
        <Hand size={14} />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Participant</span>
        <span className="text-xs font-medium sm:hidden">Part</span>
      </button>
    </div>
  );
};