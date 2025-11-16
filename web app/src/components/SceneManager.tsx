import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Trash2, Play } from 'lucide-react';
import { useScenes, Scene } from '@/hooks/useScenes';
import { DeviceState } from '@/hooks/useMQTT';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SceneManagerProps {
  deviceState: DeviceState;
  onApplyScene: (scene: Scene) => void;
}

export const SceneManager = ({ deviceState, onApplyScene }: SceneManagerProps) => {
  const { scenes, addScene, deleteScene } = useScenes();
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneIcon, setNewSceneIcon] = useState('⭐');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateScene = () => {
    if (!newSceneName.trim()) return;
    
    addScene({
      name: newSceneName,
      icon: newSceneIcon,
      config: {
        bulbOn: deviceState.bulbOn,
        fanOn: deviceState.fanOn,
        fanSpeed: parseInt(deviceState.fanSpeed) || 0,
        color: deviceState.color,
        mode: deviceState.mode
      }
    });
    
    setNewSceneName('');
    setNewSceneIcon('⭐');
    setDialogOpen(false);
  };

  const commonIcons = ['⭐', '🎬', '😴', '🎉', '💼', '🌅', '🌙', '🎮', '📚', '🍽️'];

  return (
    <Card className="animate-fade-in hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          Scenes & Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {scenes.map(scene => (
            <div key={scene.id} className="group relative">
              <Button
                onClick={() => onApplyScene(scene)}
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-3 hover:bg-primary/10 hover:border-primary/50"
              >
                <span className="text-2xl">{scene.icon}</span>
                <span className="text-xs flex-1 text-left">{scene.name}</span>
                <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteScene(scene.id)}
                className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 hover:bg-destructive"
              >
                <Trash2 className="w-3 h-3 text-destructive-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Scene
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Scene from Current State</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Scene Name</label>
                <Input
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="Enter scene name..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {commonIcons.map(icon => (
                    <Button
                      key={icon}
                      variant={newSceneIcon === icon ? 'default' : 'outline'}
                      className="text-2xl h-12"
                      onClick={() => setNewSceneIcon(icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateScene} className="w-full">
                Save Scene
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
