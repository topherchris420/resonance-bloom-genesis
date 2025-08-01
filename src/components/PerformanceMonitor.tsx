import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  audioLatency: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    audioLatency: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef(0);

  useEffect(() => {
    let animationId: number;
    
    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Get memory usage if available
        const memory = (performance as any).memory;
        const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        // Calculate render time
        const renderTime = now - renderStartRef.current;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          renderTime: Math.round(renderTime * 100) / 100,
          audioLatency: 0 // Would need AudioContext to measure
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      renderStartRef.current = performance.now();
      animationId = requestAnimationFrame(measurePerformance);
    };
    
    measurePerformance();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-2 right-2 z-50 bg-quantum-field/80 text-foreground/60 px-2 py-1 rounded text-xs"
      >
        Perf
      </button>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-50 bg-quantum-field/90 backdrop-blur-sm text-foreground text-xs p-3 rounded-lg border border-resonance-gamma/30">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-foreground/60 hover:text-foreground"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? 'text-destructive' : metrics.fps < 50 ? 'text-warning' : 'text-resonance-gamma'}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={metrics.memoryUsage > 100 ? 'text-destructive' : 'text-foreground'}>
            {metrics.memoryUsage}MB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Render:</span>
          <span className={metrics.renderTime > 16 ? 'text-warning' : 'text-foreground'}>
            {metrics.renderTime}ms
          </span>
        </div>
        
        {metrics.fps < 30 && (
          <div className="text-destructive text-xs mt-2">
            Low performance detected. Consider:
            <ul className="mt-1 ml-2 text-xs">
              <li>• Reducing audio quality</li>
              <li>• Disabling animations</li>
              <li>• Closing other apps</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};