import { Lightbulb, Thermometer, Lock, Volume2, Wifi, Settings, LightbulbOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';

export function DeviceControls() {
  const { devices, updateDevice } = useDashboardData();

  return (
    <Card className="border-card-ring col-span-1 lg:col-span-2 xl:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Device Controls
        </CardTitle>
        <CardDescription>Quick controls for your smart devices</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="lights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lights" className="capitalize">Lights</TabsTrigger>
            <TabsTrigger value="thermostat" className="capitalize">Thermostat</TabsTrigger>
            <TabsTrigger value="security" className="capitalize">Security</TabsTrigger>
            <TabsTrigger value="appliances" className="capitalize">Appliances</TabsTrigger>
          </TabsList>
          <TabsContent value="lights" className="mt-0 p-4 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                        <div className="h-3 bg-muted/60 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-5 w-10 bg-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : lights.length === 0 ? (
              <div className="text-center py-8">
                <LightbulbOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No lights found</p>
              </div>
            ) : (
              lights.map((light) => (
                <div key={light.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${light.isOn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{light.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{light.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[light.brightness]}
                      onValueChange={(value) => updateLight(light.id, { brightness: value[0] })}
                      max={100}
                      step={1}
                      className="w-20 h-2"
                      disabled={!light.isOn}
                    />
                    <Switch
                      checked={light.isOn}
                      onCheckedChange={(checked) => updateLight(light.id, { isOn: checked })}
                    />
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}