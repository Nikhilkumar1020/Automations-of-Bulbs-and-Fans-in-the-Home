import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [localColor, setLocalColor] = useState(color);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    setLocalColor(newColor);
  };

  const handleBlur = () => {
    if (/^#[0-9A-F]{6}$/.test(localColor)) {
      onChange(localColor);
    } else {
      setLocalColor(color); // Reset to valid color
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={localColor}
          onChange={(e) => {
            const newColor = e.target.value.toUpperCase();
            setLocalColor(newColor);
            onChange(newColor);
          }}
          className="w-16 h-16 rounded-lg cursor-pointer border-2 border-border bg-transparent"
        />
        <div className="flex-1">
          <Input
            type="text"
            value={localColor}
            onChange={handleColorChange}
            onBlur={handleBlur}
            placeholder="#FFFFFF"
            className="font-mono uppercase"
            maxLength={7}
          />
        </div>
      </div>
      <div
        className="w-full h-12 rounded-lg border-2 border-border transition-all duration-300"
        style={{ backgroundColor: localColor, boxShadow: `0 0 20px ${localColor}40` }}
      />
    </div>
  );
};
