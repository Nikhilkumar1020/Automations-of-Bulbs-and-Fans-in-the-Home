import { DeviceState } from '@/hooks/useMQTT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

interface OLEDPreviewProps {
  state: DeviceState;
}

export const OLEDPreview = ({ state }: OLEDPreviewProps) => {
  const getMotionText = () => {
    if (state.motion === 'DETECTED') {
      return 'Motion: DETECTED';
    }
    const secondsAgo = Math.floor((Date.now() - state.lastMotionTime) / 1000);
    return `Motion: NONE (${secondsAgo}s ago)`;
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-border/50 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Monitor className="w-4 h-4" />
          </div>
          Device OLED Display
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="bg-background/50 backdrop-blur-sm border-2 border-primary/40 rounded-lg p-4 font-mono text-xs space-y-1 shadow-inner">
          <div className="text-primary font-bold text-sm mb-2 text-center border-b border-primary/40 pb-1 animate-pulse">
            Nikhil's Home IoT
          </div>
          <div className="text-foreground/90">Temp: <span className="text-primary">{state.temperature}</span> °C</div>
          <div className="text-foreground/90">Hum: <span className="text-primary">{state.humidity}</span> %</div>
          <div className="text-foreground/90">
            Bulb: <span className={`font-semibold ${state.bulbOn ? 'text-success' : 'text-destructive'}`}>{state.bulbOn ? 'ON' : 'OFF'}</span>
          </div>
          <div className="text-foreground/90">
            Fan: <span className={`font-semibold ${state.fanOn ? 'text-success' : 'text-destructive'}`}>{state.fanOn ? 'ON' : 'OFF'}</span>
          </div>
          <div className="text-foreground/90">
            Mode: <span className={`font-semibold ${state.mode === 'AUTO' ? 'text-warning' : 'text-success'}`}>{state.mode}</span>
          </div>
          <div className="text-foreground/90">Speed: <span className="text-primary">{state.fanSpeed}</span>%</div>
          <div className="text-foreground/90 border-t border-primary/40 pt-1 mt-1">
            {getMotionText()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
