import { Eye, Hand } from 'lucide-react';

interface ModeToggleProps {
  mode: 'observer' | 'participant';
  onModeChange: (mode: 'observer' | 'participant') => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex bg-quantum-field/90 backdrop-blur-xl border-2 border-resonance-gamma/30 rounded-xl p-1 shadow-soft">
      <button
        onClick={() => onModeChange('observer')}
        className={`
          flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all min-h-[44px] touch-manipulation font-semibold text-xs md:text-sm
          ${mode === 'observer' 
            ? 'bg-resonance-beta text-foreground shadow-glow-intense scale-105' 
            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5 active:scale-95'
          }
        `}
        style={{ transition: 'var(--transition-base)' }}
      >
        <Eye size={16} className="md:w-[18px] md:h-[18px]" />
        <span>Observer</span>
      </button>
      
      <button
        onClick={() => onModeChange('participant')}
        className={`
          flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all min-h-[44px] touch-manipulation font-semibold text-xs md:text-sm
          ${mode === 'participant' 
            ? 'bg-resonance-gamma text-void shadow-glow-intense scale-105' 
            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5 active:scale-95'
          }
        `}
        style={{ transition: 'var(--transition-base)' }}
      >
        <Hand size={16} className="md:w-[18px] md:h-[18px]" />
        <span>Participant</span>
      </button>
    </div>
  );
};