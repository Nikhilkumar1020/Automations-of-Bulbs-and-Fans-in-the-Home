import { useEffect, useState, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface DeviceState {
  temperature: string;
  humidity: string;
  fanSpeed: string;
  bulbOn: boolean;
  fanOn: boolean;
  color: string;
  mode: 'AUTO' | 'MANUAL';
  motion: 'DETECTED' | 'NONE';
  lastMotionTime: number;
  lastSeen: number;
  online: boolean;
}

export interface ActivityEvent {
  timestamp: number;
  type: 'motion' | 'bulb' | 'fan' | 'color' | 'mode' | 'speed';
  message: string;
}

const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const OFFLINE_THRESHOLD = 60000; // 60 seconds

export const useMQTT = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    temperature: '--',
    humidity: '--',
    fanSpeed: '--',
    bulbOn: false,
    fanOn: false,
    color: '#FFFFFF',
    mode: 'AUTO',
    motion: 'NONE',
    lastMotionTime: Date.now(),
    lastSeen: Date.now(),
    online: false,
  });
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const lastSeenTimer = useRef<NodeJS.Timeout | null>(null);

  const addActivity = useCallback((type: ActivityEvent['type'], message: string) => {
    setActivityLog((prev) => [
      { timestamp: Date.now(), type, message },
      ...prev.slice(0, 49), // Keep last 50 events
    ]);
  }, []);

  // Add callback for notifications
  const notificationCallback = useRef<((title: string, body: string, type: 'motion' | 'temperature' | 'device') => void) | null>(null);

  const setNotificationCallback = useCallback((callback: typeof notificationCallback.current) => {
    notificationCallback.current = callback;
  }, []);

  const updateLastSeen = useCallback(() => {
    setDeviceState((prev) => ({ ...prev, lastSeen: Date.now(), online: true }));
  }, []);

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL, {
      keepalive: 30,
      reconnectPeriod: 1000,
      clientId: `webclient_${Math.random().toString(16).substr(2, 8)}`,
    });

    mqttClient.on('connect', () => {
      console.log('✅ Connected to MQTT Broker');
      setConnected(true);

      // Subscribe to all telemetry topics
      const topics = [
        'nikhil/home/temp',
        'nikhil/home/hum',
        'nikhil/home/fan/speed',
        'nikhil/home/bulb',
        'nikhil/home/fan',
        'nikhil/home/color',
        'nikhil/home/mode',
        'nikhil/home/motion',
      ];

      topics.forEach((topic) => {
        mqttClient.subscribe(topic, (err) => {
          if (err) console.error(`Failed to subscribe to ${topic}:`, err);
        });
      });
    });

    mqttClient.on('message', (topic, message) => {
      const msg = message.toString();
      console.log(`📩 ${topic}: ${msg}`);
      updateLastSeen();

      if (topic === 'nikhil/home/temp') {
        setDeviceState((prev) => ({ ...prev, temperature: msg }));
      } else if (topic === 'nikhil/home/hum') {
        setDeviceState((prev) => ({ ...prev, humidity: msg }));
      } else if (topic === 'nikhil/home/fan/speed') {
        setDeviceState((prev) => ({ ...prev, fanSpeed: msg }));
        addActivity('speed', `Fan speed set to ${msg}%`);
      } else if (topic === 'nikhil/home/bulb') {
        const isOn = msg === 'ON';
        setDeviceState((prev) => ({ ...prev, bulbOn: isOn }));
        addActivity('bulb', `Bulb turned ${msg}`);
        notificationCallback.current?.(`Bulb ${msg}`, `RGB bulb has been turned ${msg.toLowerCase()}`, 'device');
      } else if (topic === 'nikhil/home/fan') {
        const isOn = msg === 'ON';
        setDeviceState((prev) => ({ ...prev, fanOn: isOn }));
        addActivity('fan', `Fan turned ${msg}`);
        notificationCallback.current?.(`Fan ${msg}`, `Fan has been turned ${msg.toLowerCase()}`, 'device');
      } else if (topic === 'nikhil/home/color') {
        setDeviceState((prev) => ({ ...prev, color: msg }));
        addActivity('color', `Color changed to ${msg}`);
      } else if (topic === 'nikhil/home/mode') {
        const mode = msg as 'AUTO' | 'MANUAL';
        setDeviceState((prev) => ({ ...prev, mode }));
        addActivity('mode', `Mode changed to ${msg}`);
      } else if (topic === 'nikhil/home/motion') {
        const motion = msg as 'DETECTED' | 'NONE';
        setDeviceState((prev) => ({
          ...prev,
          motion,
          lastMotionTime: motion === 'DETECTED' ? Date.now() : prev.lastMotionTime,
        }));
        if (motion === 'DETECTED') {
          addActivity('motion', 'Motion detected!');
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Motion Detected', {
              body: 'Movement detected in your smart home',
              icon: '/favicon.ico',
            });
          }
        } else {
          addActivity('motion', 'Motion cleared');
        }
      }
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 Reconnecting to MQTT Broker...');
      setConnected(false);
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT Error:', err);
      setConnected(false);
    });

    setClient(mqttClient);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
      if (lastSeenTimer.current) {
        clearInterval(lastSeenTimer.current);
      }
    };
  }, [addActivity, updateLastSeen]);

  // Check for offline status
  useEffect(() => {
    lastSeenTimer.current = setInterval(() => {
      setDeviceState((prev) => {
        const timeSinceLastSeen = Date.now() - prev.lastSeen;
        const isOnline = timeSinceLastSeen < OFFLINE_THRESHOLD;
        if (prev.online && !isOnline) {
          addActivity('motion', 'Device went offline');
        }
        return { ...prev, online: isOnline };
      });
    }, 5000);

    return () => {
      if (lastSeenTimer.current) {
        clearInterval(lastSeenTimer.current);
      }
    };
  }, [addActivity]);

  const publish = useCallback(
    (topic: string, message: string) => {
      console.log(`🔍 Publish called: ${topic} = ${message}, client=${!!client}, connected=${connected}`);
      if (client && connected) {
        client.publish(topic, message);
        console.log(`📤 Published → ${topic} = ${message}`);
      } else {
        console.error('❌ Cannot publish: MQTT client not connected', { client: !!client, connected });
      }
    },
    [client, connected]
  );

  const controlBulb = useCallback(
    (on: boolean) => {
      publish('nikhil/home/control/bulb', on ? 'ON' : 'OFF');
    },
    [publish]
  );

  const controlFan = useCallback(
    (on: boolean) => {
      publish('nikhil/home/control/fan', on ? 'ON' : 'OFF');
    },
    [publish]
  );

  const setFanSpeed = useCallback(
    (speed: number) => {
      const clampedSpeed = Math.max(0, Math.min(100, speed));
      publish('nikhil/home/control/fan/speed', clampedSpeed.toString());
    },
    [publish]
  );

  const setColor = useCallback(
    (color: string) => {
      // Validate hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        publish('nikhil/home/control/color', color.toUpperCase());
      } else {
        console.error('Invalid color format. Expected #RRGGBB');
      }
    },
    [publish]
  );

  const toggleMode = useCallback(() => {
    console.log('🔄 Toggle Mode button clicked');
    publish('nikhil/home/control/mode', 'TOGGLE');
  }, [publish]);

  return {
    connected,
    deviceState,
    activityLog,
    controlBulb,
    controlFan,
    setFanSpeed,
    setColor,
    toggleMode,
    setNotificationCallback,
  };
};
