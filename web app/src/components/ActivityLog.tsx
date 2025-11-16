import { ActivityEvent } from '@/hooks/useMQTT';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Lightbulb, Fan, Palette, Settings, Gauge, Eye } from 'lucide-react';

interface ActivityLogProps {
  events: ActivityEvent[];
}

const getEventIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'motion':
      return <Eye className="w-4 h-4" />;
    case 'bulb':
      return <Lightbulb className="w-4 h-4" />;
    case 'fan':
      return <Fan className="w-4 h-4" />;
    case 'color':
      return <Palette className="w-4 h-4" />;
    case 'mode':
      return <Settings className="w-4 h-4" />;
    case 'speed':
      return <Gauge className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};

export const ActivityLog = ({ events }: ActivityLogProps) => {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity yet
              </p>
            ) : (
              events.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="text-primary mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
