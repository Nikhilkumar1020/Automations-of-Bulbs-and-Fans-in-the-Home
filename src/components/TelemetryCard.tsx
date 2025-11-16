import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TelemetryCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  subtitle?: string;
}

export const TelemetryCard = ({ title, value, unit, icon, subtitle }: TelemetryCardProps) => {
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-border/50 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
          {value}
          {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};
