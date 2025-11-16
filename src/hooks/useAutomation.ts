import { useState, useEffect, useCallback } from 'react';
import { DeviceState } from './useMQTT';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: Array<{
    type: 'temperature' | 'motion' | 'time' | 'humidity';
    condition?: '>' | '<' | '=';
    value?: string | number;
  }>;
  actions: Array<{
    type: 'bulb' | 'fan' | 'color' | 'fanSpeed' | 'mode';
    value: boolean | string | number;
  }>;
}

export const useAutomation = () => {
  const [rules, setRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('automation-rules');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('automation-rules', JSON.stringify(rules));
  }, [rules]);

  const addRule = useCallback((rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: Date.now().toString()
    };
    setRules(prev => [...prev, newRule]);
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<AutomationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const checkRules = useCallback((deviceState: DeviceState): AutomationRule['actions'] => {
    const triggeredActions: AutomationRule['actions'] = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let allTriggersMatch = true;

      for (const trigger of rule.triggers) {
        let triggerMatches = false;

        if (trigger.type === 'temperature') {
          const temp = parseFloat(deviceState.temperature);
          const threshold = typeof trigger.value === 'number' ? trigger.value : parseFloat(String(trigger.value));
          if (!isNaN(temp) && !isNaN(threshold) && trigger.condition) {
            if (trigger.condition === '>' && temp > threshold) triggerMatches = true;
            if (trigger.condition === '<' && temp < threshold) triggerMatches = true;
            if (trigger.condition === '=' && temp === threshold) triggerMatches = true;
          }
        } else if (trigger.type === 'humidity') {
          const hum = parseFloat(deviceState.humidity);
          const threshold = typeof trigger.value === 'number' ? trigger.value : parseFloat(String(trigger.value));
          if (!isNaN(hum) && !isNaN(threshold) && trigger.condition) {
            if (trigger.condition === '>' && hum > threshold) triggerMatches = true;
            if (trigger.condition === '<' && hum < threshold) triggerMatches = true;
            if (trigger.condition === '=' && hum === threshold) triggerMatches = true;
          }
        } else if (trigger.type === 'motion') {
          triggerMatches = deviceState.motion === 'DETECTED';
        } else if (trigger.type === 'time') {
          if (trigger.value) {
            triggerMatches = currentHour === trigger.value;
          }
        }

        if (!triggerMatches) {
          allTriggersMatch = false;
          break;
        }
      }

      if (allTriggersMatch) {
        triggeredActions.push(...rule.actions);
      }
    }

    return triggeredActions;
  }, [rules]);

  return { rules, addRule, deleteRule, toggleRule, updateRule, checkRules };
};
