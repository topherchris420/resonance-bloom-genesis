import { Eye, Hand } from 'lucide-react';

interface ModeToggleProps {
  mode: 'observer' | 'participant';
  onModeChange: (mode: 'observer' | 'participant') => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex bg-quantum-field/80 backdrop-blur-md border border-foreground/30 rounded-xl p-1.5 shadow-lg">
      <button
        onClick={() => onModeChange('observer')}
        className={`
          flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-lg transition-all duration-300 min-h-[44px] touch-manipulation
          ${mode === 'observer' 
            ? 'bg-resonance-beta text-foreground shadow-resonance scale-105' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10 active:scale-95'
          }
        `}
      >
        <Eye size={18} />
        <span className="text-sm md:text-base font-medium">Observer</span>
      </button>
      
      <button
        onClick={() => onModeChange('participant')}
        className={`
          flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-lg transition-all duration-300 min-h-[44px] touch-manipulation
          ${mode === 'participant' 
            ? 'bg-resonance-gamma text-void shadow-resonance scale-105' 
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10 active:scale-95'
          }
        `}
      >
        <Hand size={18} />
        <span className="text-sm md:text-base font-medium">Participant</span>
      </button>
    </div>
  );
};