import { useEffect, useRef } from 'react';

interface TouchInteractionProps {
  onGesture: (gestureData: { type: string; intensity: number; frequency: number }) => void;
  isActive: boolean;
}

export const TouchInteraction = ({ onGesture, isActive }: TouchInteractionProps) => {
  const touchAreaRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!isActive || !touchAreaRef.current) return;

    const touchArea = touchAreaRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      lastTouchRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!lastTouchRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchRef.current.x;
      const deltaY = touch.clientY - lastTouchRef.current.y;
      const deltaTime = Date.now() - lastTouchRef.current.time;
      
      if (deltaTime > 0) {
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
        const direction = Math.atan2(deltaY, deltaX);
        
        // Map touch gestures to audio-like parameters
        const frequency = 200 + (touch.clientY / window.innerHeight) * 800; // 200-1000 Hz
        const intensity = Math.min(velocity * 100, 1); // Normalize intensity
        
        onGesture({
          type: 'touch-move',
          intensity,
          frequency
        });

        lastTouchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      lastTouchRef.current = null;
    };

    // Add touch event listeners
    touchArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    touchArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    touchArea.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      touchArea.removeEventListener('touchstart', handleTouchStart);
      touchArea.removeEventListener('touchmove', handleTouchMove);
      touchArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, onGesture]);

  if (!isActive) return null;

  return (
    <div
      ref={touchAreaRef}
      className="absolute inset-0 z-10 touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* Visual feedback for touch interaction */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-foreground/50 bg-quantum-field/40 px-2 py-1 rounded backdrop-blur-sm">
        Touch and drag to generate resonance
      </div>
    </div>
  );
};