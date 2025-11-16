import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { useTheme, Theme } from '@/hooks/useTheme';

const themeNames: Record<Theme, string> = {
  cyber: '🔷 Cyber',
  ocean: '🌊 Ocean',
  sunset: '🌅 Sunset',
  forest: '🌲 Forest',
  purple: '💜 Purple',
};

export const ThemeSelector = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Palette className="w-4 h-4" />
          Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <Button
              key={t}
              onClick={() => setTheme(t)}
              variant={theme === t ? 'default' : 'outline'}
              className="text-xs"
            >
              {themeNames[t]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
