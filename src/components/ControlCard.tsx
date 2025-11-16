import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ControlCardProps {
  title: string;
  icon: ReactNode;
  isOn: boolean;
  onToggle: (on: boolean) => void;
  children?: ReactNode;
}

export const ControlCard = ({ title, icon, isOn, onToggle, children }: ControlCardProps) => {
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
      <CardContent className="space-y-4 relative">
        <div className="flex gap-2">
          <Button
            onClick={() => onToggle(true)}
            variant={isOn ? 'default' : 'outline'}
            className={`flex-1 transition-all duration-300 ${
              isOn ? 'bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/20' : ''
            }`}
          >
            ON
          </Button>
          <Button
            onClick={() => onToggle(false)}
            variant={!isOn ? 'default' : 'outline'}
            className={`flex-1 transition-all duration-300 ${
              !isOn ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20' : ''
            }`}
          >
            OFF
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
