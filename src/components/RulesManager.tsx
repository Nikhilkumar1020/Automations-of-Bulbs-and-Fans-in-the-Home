import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Trash2, Settings } from 'lucide-react';
import { useAutomation, AutomationRule } from '@/hooks/useAutomation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const RulesManager = () => {
  const { rules, addRule, deleteRule, toggleRule } = useAutomation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [triggerType, setTriggerType] = useState<'temperature' | 'motion' | 'time' | 'humidity'>('temperature');
  const [triggerCondition, setTriggerCondition] = useState<'>' | '<' | '='>('>');
  const [triggerValue, setTriggerValue] = useState('25');
  const [actionType, setActionType] = useState<'bulb' | 'fan' | 'color' | 'fanSpeed' | 'mode'>('bulb');
  const [actionValue, setActionValue] = useState<string>('true');

  const handleCreateRule = () => {
    if (!newRuleName.trim()) return;

    const triggers: AutomationRule['triggers'] = [];
    const actions: AutomationRule['actions'] = [];

    if (triggerType === 'motion') {
      triggers.push({ type: 'motion' });
    } else {
      triggers.push({
        type: triggerType,
        condition: triggerCondition,
        value: parseFloat(triggerValue)
      });
    }

    if (actionType === 'bulb' || actionType === 'fan') {
      actions.push({ type: actionType, value: actionValue === 'true' });
    } else if (actionType === 'fanSpeed') {
      actions.push({ type: actionType, value: parseInt(actionValue) });
    } else {
      actions.push({ type: actionType, value: actionValue });
    }

    addRule({
      name: newRuleName,
      enabled: true,
      triggers,
      actions
    });

    setNewRuleName('');
    setDialogOpen(false);
  };

  const formatTrigger = (rule: AutomationRule) => {
    const trigger = rule.triggers[0];
    if (!trigger) return 'No trigger';
    
    if (trigger.type === 'motion') return 'Motion detected';
    return `${trigger.type} ${trigger.condition} ${trigger.value}`;
  };

  const formatAction = (rule: AutomationRule) => {
    const action = rule.actions[0];
    if (!action) return 'No action';
    
    return `${action.type}: ${action.value}`;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          Automation Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[300px] pr-2">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No rules created yet</p>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{rule.name}</p>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When: {formatTrigger(rule)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Then: {formatAction(rule)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleRule(rule.id)}
                        className="h-8 w-8"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                    className="ml-auto"
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rule Name</label>
                <Input
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g., Turn on fan when hot"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trigger</label>
                <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="motion">Motion</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                  </SelectContent>
                </Select>

                {triggerType !== 'motion' && (
                  <div className="flex gap-2">
                    <Select value={triggerCondition} onValueChange={(v: any) => setTriggerCondition(v)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">{'>'}</SelectItem>
                        <SelectItem value="<">{'<'}</SelectItem>
                        <SelectItem value="=">{'='}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulb">Control Bulb</SelectItem>
                    <SelectItem value="fan">Control Fan</SelectItem>
                    <SelectItem value="fanSpeed">Set Fan Speed</SelectItem>
                    <SelectItem value="color">Change Color</SelectItem>
                    <SelectItem value="mode">Change Mode</SelectItem>
                  </SelectContent>
                </Select>

                {(actionType === 'bulb' || actionType === 'fan') && (
                  <Select value={actionValue} onValueChange={setActionValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Turn ON</SelectItem>
                      <SelectItem value="false">Turn OFF</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {actionType === 'fanSpeed' && (
                  <Input
                    type="number"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    placeholder="Speed (0-100)"
                    min="0"
                    max="100"
                  />
                )}

                {actionType === 'color' && (
                  <Input
                    type="color"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                )}

                {actionType === 'mode' && (
                  <Select value={actionValue} onValueChange={setActionValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">AUTO</SelectItem>
                      <SelectItem value="MANUAL">MANUAL</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button onClick={handleCreateRule} className="w-full">
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
