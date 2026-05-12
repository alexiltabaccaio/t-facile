import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VerticalSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  label: string;
  unit?: string;
  className?: string;
  color?: string;
  disabled?: boolean;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  unit = '',
  className = '',
  color = 'bg-blue-500 dark:bg-blue-600',
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const handlePointerMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!isDragging || !containerRef.current || disabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let percentage = 1 - (y / rect.height);
    percentage = Math.max(0, Math.min(1, percentage));

    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round((rawValue - min) / step) * step + min;
    const finalValue = parseFloat(steppedValue.toFixed(2));
    const clampedValue = Math.max(min, Math.min(max, finalValue));

    setLocalValue(clampedValue);
    onChange(clampedValue);
  }, [isDragging, min, max, step, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointerMove(e);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col items-center select-none ${className} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <div className="mb-1 text-center">
        <h4 className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-0.5">
          {label}
        </h4>
        <div className="text-[10px] font-bold text-light-text dark:text-dark-text-primary">
          {localValue === max && label.toLowerCase() === 'max' ? 'MAX' : `${localValue}${unit}`}
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className={`relative w-5 h-24 bg-neutral-100 dark:bg-neutral-800/50 rounded-full touch-none shadow-inner overflow-hidden border border-neutral-200 dark:border-neutral-700/30 ${disabled ? '' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 w-full rounded-full transition-all duration-75 origin-bottom ${color}`}
          style={{ height: `${percentage}%` }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-md border border-neutral-200 flex items-center justify-center transition-all duration-75"
          style={{ bottom: `calc(${percentage}% - 8px)` }}
        >
          <div className="w-2 h-[1px] rounded-full bg-neutral-400" />
        </div>
      </div>
    </div>
  );
};
