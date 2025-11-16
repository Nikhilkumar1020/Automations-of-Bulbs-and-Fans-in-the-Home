import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
  online: boolean;
  lastSeen: number;
}

export const ConnectionStatus = ({ connected, online, lastSeen }: ConnectionStatusProps) => {
  const getTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 animate-fade-in shadow-lg shadow-primary/5">
      <div className="flex items-center gap-2">
        {connected ? (
          <Wifi className="w-5 h-5 text-success" />
        ) : (
          <WifiOff className="w-5 h-5 text-destructive animate-pulse" />
        )}
        <span className="text-sm font-medium">
          {connected ? 'Broker Connected' : 'Broker Disconnected'}
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            online ? 'bg-success animate-pulse shadow-lg shadow-success/50' : 'bg-destructive'
          }`}
        />
        <span className="text-sm font-medium">
          {online ? 'Device Online' : 'Device Offline'}
        </span>
        <span className="text-xs text-muted-foreground">
          {getTimeSince(lastSeen)}
        </span>
      </div>
    </div>
  );
};
