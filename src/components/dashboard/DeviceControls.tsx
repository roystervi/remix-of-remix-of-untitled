import { Lightbulb, Thermometer, Lock, Volume2, Wifi, Settings, LightbulbOff, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';

export function DeviceControls() {
  const { devices, updateDevice, loading } = useDashboardData();

  const lights = devices?.filter(d => d.type === 'light') || [];
  const updateLight = updateDevice;

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
          <TabsContent value="thermostat" className="mt-0 p-4 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                        <div className="h-3 bg-muted/60 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                      <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {thermostats.map((thermostat) => (
                  <div key={thermostat.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Thermometer className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{thermostat.name}</h3>
                        <p className="text-sm text-muted-foreground">{thermostat.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{thermostat.temperature}°</div>
                      <Switch
                        checked={thermostat.mode === 'cool'}
                        onCheckedChange={(checked) => updateThermostat(thermostat.id, { mode: checked ? 'cool' : 'heat' })}
                      />
                    </div>
                    <Slider
                      value={[thermostat.setpoint]}
                      onValueChange={(value) => updateThermostat(thermostat.id, { setpoint: value[0] })}
                      max={85}
                      min={60}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
                {thermostats.length === 0 && (
                  <div className="text-center py-8">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No thermostats found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="security" className="mt-0 p-4 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                      <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
                    </div>
                    <div className="h-5 w-10 bg-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {securityDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">{device.type}</p>
                      </div>
                    </div>
                    <Switch
                      checked={device.armed}
                      onCheckedChange={(checked) => updateSecurity(device.id, { armed: checked })}
                    />
                  </div>
                ))}
                {securityDevices.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No security devices found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="appliances" className="mt-0 p-4 space-y-4">
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
            ) : (
              <div className="space-y-4">
                {appliances.map((appliance) => (
                  <div key={appliance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Wifi className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{appliance.name}</h3>
                        <p className="text-sm text-muted-foreground">Power: {appliance.power}W</p>
                      </div>
                    </div>
                    <Switch
                      checked={appliance.on}
                      onCheckedChange={(checked) => updateAppliance(appliance.id, { on: checked })}
                    />
                  </div>
                ))}
                {appliances.length === 0 && (
                  <div className="text-center py-8">
                    <Wifi className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No appliances found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}