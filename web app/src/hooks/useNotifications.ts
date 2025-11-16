import { useState, useEffect, useCallback } from 'react';

export interface NotificationPreferences {
  motion: boolean;
  temperatureHigh: boolean;
  temperatureHighThreshold: number;
  temperatureLow: boolean;
  temperatureLowThreshold: number;
  deviceStateChanges: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  body: string;
  type: 'motion' | 'temperature' | 'device';
  read: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  motion: true,
  temperatureHigh: true,
  temperatureHighThreshold: 30,
  temperatureLow: true,
  temperatureLowThreshold: 15,
  deviceStateChanges: true
};

export const useNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('notification-preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [history, setHistory] = useState<NotificationHistoryItem[]>(() => {
    const saved = localStorage.getItem('notification-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('notification-history', JSON.stringify(history));
  }, [history]);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const addNotification = useCallback((title: string, body: string, type: NotificationHistoryItem['type']) => {
    const notification: NotificationHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title,
      body,
      type,
      read: false
    };
    
    setHistory(prev => [notification, ...prev.slice(0, 49)]);
    
    // Send browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const unreadCount = history.filter(n => !n.read).length;

  return {
    preferences,
    updatePreferences,
    history,
    addNotification,
    markAsRead,
    clearHistory,
    unreadCount
  };
};
