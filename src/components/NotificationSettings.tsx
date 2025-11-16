import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { NotificationPreferences } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onUpdate: (updates: Partial<NotificationPreferences>) => void;
}

export const NotificationSettings = ({ preferences, onUpdate }: NotificationSettingsProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="motion" className="text-sm">Motion Detection</Label>
          <Switch
            id="motion"
            checked={preferences.motion}
            onCheckedChange={(checked) => onUpdate({ motion: checked })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temp-high" className="text-sm">High Temperature Alert</Label>
            <Switch
              id="temp-high"
              checked={preferences.temperatureHigh}
              onCheckedChange={(checked) => onUpdate({ temperatureHigh: checked })}
            />
          </div>
          {preferences.temperatureHigh && (
            <div className="flex items-center gap-2 ml-4">
              <Label className="text-xs text-muted-foreground">Threshold:</Label>
              <Input
                type="number"
                value={preferences.temperatureHighThreshold}
                onChange={(e) => onUpdate({ temperatureHighThreshold: parseFloat(e.target.value) })}
                className="h-8 w-20"
              />
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temp-low" className="text-sm">Low Temperature Alert</Label>
            <Switch
              id="temp-low"
              checked={preferences.temperatureLow}
              onCheckedChange={(checked) => onUpdate({ temperatureLow: checked })}
            />
          </div>
          {preferences.temperatureLow && (
            <div className="flex items-center gap-2 ml-4">
              <Label className="text-xs text-muted-foreground">Threshold:</Label>
              <Input
                type="number"
                value={preferences.temperatureLowThreshold}
                onChange={(e) => onUpdate({ temperatureLowThreshold: parseFloat(e.target.value) })}
                className="h-8 w-20"
              />
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="device-changes" className="text-sm">Device State Changes</Label>
          <Switch
            id="device-changes"
            checked={preferences.deviceStateChanges}
            onCheckedChange={(checked) => onUpdate({ deviceStateChanges: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
