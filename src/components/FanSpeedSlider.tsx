import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface FanSpeedSliderProps {
  speed: string;
  onChange: (speed: number) => void;
}

export const FanSpeedSlider = ({ speed, onChange }: FanSpeedSliderProps) => {
  const [localSpeed, setLocalSpeed] = useState(parseInt(speed) || 0);

  useEffect(() => {
    const parsed = parseInt(speed);
    if (!isNaN(parsed)) {
      setLocalSpeed(parsed);
    }
  }, [speed]);

  const handleChange = (values: number[]) => {
    setLocalSpeed(values[0]);
  };

  const handleCommit = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Speed</span>
        <span className="text-sm font-bold text-primary">{localSpeed}%</span>
      </div>
      <Slider
        value={[localSpeed]}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
        max={100}
        step={1}
        className="cursor-pointer"
      />
    </div>
  );
};
