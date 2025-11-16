import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2 } from 'lucide-react';
import { NotificationHistoryItem } from '@/hooks/useNotifications';

interface NotificationHistoryProps {
  history: NotificationHistoryItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onClear: () => void;
}

export const NotificationHistory = ({ history, unreadCount, onMarkAsRead, onClear }: NotificationHistoryProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const typeColors = {
    motion: 'bg-blue-500/20 text-blue-500',
    temperature: 'bg-orange-500/20 text-orange-500',
    device: 'bg-green-500/20 text-green-500'
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            Notification History
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {history.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent ${
                    notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeColors[notification.type]} variant="secondary">
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.body}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
