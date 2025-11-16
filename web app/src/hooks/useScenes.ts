import { useState, useEffect, useCallback } from 'react';

export interface Scene {
  id: string;
  name: string;
  icon: string;
  config: {
    bulbOn: boolean;
    fanOn: boolean;
    fanSpeed: number;
    color: string;
    mode: 'AUTO' | 'MANUAL';
  };
}

const DEFAULT_SCENES: Scene[] = [
  {
    id: 'movie',
    name: 'Movie Mode',
    icon: '🎬',
    config: { bulbOn: true, fanOn: false, fanSpeed: 0, color: '#FF0000', mode: 'MANUAL' }
  },
  {
    id: 'sleep',
    name: 'Sleep Mode',
    icon: '😴',
    config: { bulbOn: false, fanOn: true, fanSpeed: 30, color: '#0000FF', mode: 'AUTO' }
  },
  {
    id: 'party',
    name: 'Party Mode',
    icon: '🎉',
    config: { bulbOn: true, fanOn: true, fanSpeed: 100, color: '#FF00FF', mode: 'MANUAL' }
  },
  {
    id: 'work',
    name: 'Work Mode',
    icon: '💼',
    config: { bulbOn: true, fanOn: true, fanSpeed: 50, color: '#FFFFFF', mode: 'MANUAL' }
  }
];

export const useScenes = () => {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem('smart-home-scenes');
    return saved ? JSON.parse(saved) : DEFAULT_SCENES;
  });

  useEffect(() => {
    localStorage.setItem('smart-home-scenes', JSON.stringify(scenes));
  }, [scenes]);

  const addScene = useCallback((scene: Omit<Scene, 'id'>) => {
    const newScene: Scene = {
      ...scene,
      id: Date.now().toString()
    };
    setScenes(prev => [...prev, newScene]);
  }, []);

  const deleteScene = useCallback((id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  return { scenes, addScene, deleteScene, updateScene };
};
