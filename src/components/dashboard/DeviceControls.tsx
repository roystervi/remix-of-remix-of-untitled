import { Power, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

export const DeviceControls = ({ className }: { className?: string }) => {
  const { devices, updateDevice } = useDashboardData();

  return (
    <div className={cn("border border-border rounded-lg p-4 bg-card", className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Device Controls
      </h3>
      <div className="space-y-3">
        {devices.slice(0, 3).map(device => (
          <div key={device.id} className="flex items-center justify-between">
            <span>{device.name}</span>
            <div className="flex items-center gap-2">
              <Switch 
                checked={device.status} 
                onCheckedChange={(checked) => updateDevice(device.id, { status: checked })}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateDevice(device.id, { status: !device.status })}
              >
                <Power className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};