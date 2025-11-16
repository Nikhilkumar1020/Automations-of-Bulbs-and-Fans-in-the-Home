import { useEffect } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
import { useNotifications } from '@/hooks/useNotifications';
import { useAutomation } from '@/hooks/useAutomation';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TelemetryCard } from '@/components/TelemetryCard';
import { ControlCard } from '@/components/ControlCard';
import { FanSpeedSlider } from '@/components/FanSpeedSlider';
import { ColorPicker } from '@/components/ColorPicker';
import { OLEDPreview } from '@/components/OLEDPreview';
import { ActivityLog } from '@/components/ActivityLog';
import { ThemeSelector } from '@/components/ThemeSelector';
import { NotificationSettings } from '@/components/NotificationSettings';
import { NotificationHistory } from '@/components/NotificationHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer, Droplets, Eye, Lightbulb, Fan, Palette, Settings } from 'lucide-react';

const Index = () => {
  const {
    connected,
    deviceState,
    activityLog,
    controlBulb,
    controlFan,
    setFanSpeed,
    setColor,
    toggleMode,
    setNotificationCallback,
  } = useMQTT();

  const {
    preferences,
    updatePreferences,
    history,
    addNotification,
    markAsRead,
    clearHistory,
    unreadCount,
  } = useNotifications();


  // Set up notification callback
  useEffect(() => {
    setNotificationCallback(addNotification);
  }, [setNotificationCallback, addNotification]);


  // Check temperature thresholds
  useEffect(() => {
    const temp = parseFloat(deviceState.temperature);
    if (isNaN(temp)) return;

    if (preferences.temperatureHigh && temp > preferences.temperatureHighThreshold) {
      addNotification(
        'High Temperature Alert',
        `Temperature is ${temp}°C, above threshold of ${preferences.temperatureHighThreshold}°C`,
        'temperature'
      );
    }

    if (preferences.temperatureLow && temp < preferences.temperatureLowThreshold) {
      addNotification(
        'Low Temperature Alert',
        `Temperature is ${temp}°C, below threshold of ${preferences.temperatureLowThreshold}°C`,
        'temperature'
      );
    }
  }, [deviceState.temperature, preferences, addNotification]);


  const getMotionStatus = () => {
    if (deviceState.motion === 'DETECTED') {
      return { text: 'Motion Detected', subtitle: 'Active now' };
    }
    const secondsAgo = Math.floor((Date.now() - deviceState.lastMotionTime) / 1000);
    return { 
      text: 'No Motion', 
      subtitle: `Last seen ${secondsAgo}s ago` 
    };
  };

  const motionStatus = getMotionStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                🏠 Nikhil's Smart Home
              </h1>
              <p className="text-sm text-muted-foreground">ESP32 IoT Dashboard</p>
            </div>
            <ConnectionStatus
              connected={connected}
              online={deviceState.online}
              lastSeen={deviceState.lastSeen}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Telemetry */}
          <div className="lg:col-span-3 space-y-6">
            <TelemetryCard
              title="Temperature"
              value={deviceState.temperature}
              unit="°C"
              icon={<Thermometer className="w-4 h-4" />}
              subtitle="Auto fan at 28°C"
            />
            <TelemetryCard
              title="Humidity"
              value={deviceState.humidity}
              unit="%"
              icon={<Droplets className="w-4 h-4" />}
            />
            <TelemetryCard
              title="Motion Sensor"
              value={motionStatus.text}
              icon={<Eye className={`w-4 h-4 ${deviceState.motion === 'DETECTED' ? 'animate-pulse' : ''}`} />}
              subtitle={motionStatus.subtitle}
            />
          </div>

          {/* Center Column - Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Mode Control */}
            <Card className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-border/50 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  Operation Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <Button
                  onClick={toggleMode}
                  className={`w-full transition-all duration-300 ${
                    deviceState.mode === 'AUTO'
                      ? 'bg-warning hover:bg-warning/90 text-warning-foreground shadow-lg shadow-warning/20'
                      : 'bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/20'
                  }`}
                >
                  Current Mode: {deviceState.mode}
                  <span className="ml-2 text-xs opacity-75">
                    (Click to toggle)
                  </span>
                </Button>
                <p className="text-xs text-muted-foreground">
                  {deviceState.mode === 'AUTO'
                    ? 'Auto mode: Fan activates when temp > 28°C, motion triggers bulb'
                    : 'Manual mode: Full control over all devices'}
                </p>
              </CardContent>
            </Card>

            {/* Bulb Control */}
            <ControlCard
              title="Bulb"
              icon={<Lightbulb className="w-4 h-4" />}
              isOn={deviceState.bulbOn}
              onToggle={controlBulb}
            />

            {/* RGB LED Control */}
            <Card className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-border/50 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Palette className="w-4 h-4" />
                  </div>
                  RGB LED
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <ColorPicker color={deviceState.color} onChange={setColor} />
                <Button
                  onClick={() => setColor('#000000')}
                  variant="outline"
                  className="w-full transition-all duration-300 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                >
                  Turn Off RGB LED (Set to Black)
                </Button>
              </CardContent>
            </Card>

            {/* Fan Control */}
            <ControlCard
              title="Fan"
              icon={<Fan className="w-4 h-4" />}
              isOn={deviceState.fanOn}
              onToggle={controlFan}
            >
              <FanSpeedSlider speed={deviceState.fanSpeed} onChange={setFanSpeed} />
            </ControlCard>
          </div>

          {/* Right Column - Activity & Features */}
          <div className="lg:col-span-3 space-y-6">
            <ThemeSelector />
            <OLEDPreview state={deviceState} />
            
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notif">
                  Notify
                  {unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4">
                <ActivityLog events={activityLog} />
              </TabsContent>

              <TabsContent value="notif" className="mt-4 space-y-4">
                <NotificationSettings
                  preferences={preferences}
                  onUpdate={updatePreferences}
                />
                <NotificationHistory
                  history={history}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onClear={clearHistory}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground">MQTT Broker</p>
              <p className="font-mono text-primary">broker.hivemq.com</p>
            </div>
            <div>
              <p className="text-muted-foreground">Device ID</p>
              <p className="font-mono text-primary">esp32-nikhil</p>
            </div>
            <div>
              <p className="text-muted-foreground">Update Rate</p>
              <p className="font-mono text-primary">~5s</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
