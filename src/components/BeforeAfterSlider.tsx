import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MoveHorizontal, Eye, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: number;
  showCheckerboardAfter?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel = 'Processed',
  className = '',
  aspectRatio,
  showCheckerboardAfter = true,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900 group cursor-ew-resize ${className}`}
      style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined, minHeight: '340px' }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* After Image (Background layer) */}
      <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${showCheckerboardAfter ? 'bg-checkerboard' : 'bg-slate-950'}`}>
        <img
          src={afterImage}
          alt="Processed result"
          className="w-full h-full object-contain pointer-events-none"
        />
        {/* After Label */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Foreground layer with clip-path) */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <img
          src={beforeImage}
          alt="Original source"
          className="w-full h-full object-contain pointer-events-none"
        />
        {/* Before Label */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 text-slate-200 text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 pointer-events-none">
          <Eye className="w-3.5 h-3.5" />
          {beforeLabel}
        </div>
      </div>

      {/* Center Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] z-20 pointer-events-none transition-transform"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Circular Drag Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border-2 border-indigo-600 group-hover:scale-110 transition-transform">
          <MoveHorizontal className="w-4 h-4 text-indigo-600" />
        </div>
      </div>

      {/* Helper instruction tooltip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white/90 text-[11px] font-medium backdrop-blur-sm pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
        Drag slider to compare
      </div>
    </div>
  );
};
