import { useState } from 'react';
import { Camera, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  stateLabel: string;
}

export const ShareButton = ({ stateLabel }: ShareButtonProps) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // Use html2canvas to capture the canvas
      const html2canvas = (await import('html2canvas')).default;
      const element = document.body;
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: window.devicePixelRatio || 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to capture image');
          return;
        }
        
        const file = new File([blob], 'my-resonance.png', { type: 'image/png' });
        
        // Try native share if available
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: stateLabel,
              text: `Check out my inner state visualization: ${stateLabel}`,
            });
            toast.success('Shared successfully!');
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              // User cancelled, fallback to download
              downloadImage(canvas);
            }
          }
        } else {
          // Fallback to download
          downloadImage(canvas);
        }
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error('Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  };
  
  const downloadImage = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `my-resonance-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-20">
      <Button
        onClick={captureScreenshot}
        disabled={isCapturing}
        size="lg"
        className="bg-resonance-gamma hover:bg-resonance-gamma/90 text-void shadow-resonance rounded-2xl min-h-[52px] md:min-h-[56px] px-5 md:px-6 touch-manipulation active:scale-95 transition-transform"
      >
        {isCapturing ? (
          <>
            <Camera className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-pulse" />
            <span className="text-sm md:text-base font-semibold">Capturing...</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <span className="text-sm md:text-base font-semibold">Share</span>
          </>
        )}
      </Button>
    </div>
  );
};
