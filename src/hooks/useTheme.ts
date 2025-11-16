import { useEffect, useState } from 'react';

export type Theme = 'cyber' | 'ocean' | 'sunset' | 'forest' | 'purple';

const themes = {
  cyber: {
    primary: '189 100% 50%', // cyan
    'primary-foreground': '0 0% 0%',
    background: '220 26% 6%',
    card: '217 23% 11%',
  },
  ocean: {
    primary: '210 100% 60%', // blue
    'primary-foreground': '0 0% 100%',
    background: '220 20% 8%',
    card: '217 20% 13%',
  },
  sunset: {
    primary: '14 100% 60%', // orange
    'primary-foreground': '0 0% 0%',
    background: '240 10% 8%',
    card: '240 10% 13%',
  },
  forest: {
    primary: '142 76% 45%', // green
    'primary-foreground': '0 0% 0%',
    background: '150 10% 7%',
    card: '150 10% 12%',
  },
  purple: {
    primary: '270 100% 65%', // purple
    'primary-foreground': '0 0% 100%',
    background: '260 20% 8%',
    card: '260 20% 13%',
  },
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('smart-home-theme');
    return (stored as Theme) || 'cyber';
  });

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[theme];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem('smart-home-theme', theme);
  }, [theme]);

  return { theme, setTheme, themes: Object.keys(themes) as Theme[] };
};
