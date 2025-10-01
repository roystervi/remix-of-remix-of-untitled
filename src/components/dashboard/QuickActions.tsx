import { Button } from '@/components/ui/button';
import { Lamp, Thermometer, Lock, Wifi } from 'lucide-react';

export const QuickActions = () => (
  <div className="space-y-2">
    <Button variant="outline" className="w-full justify-start">
      <Lamp className="mr-2 h-4 w-4" />
      Toggle Lights
    </Button>
    <Button variant="outline" className="w-full justify-start">
      <Thermometer className="mr-2 h-4 w-4" />
      Set Temperature
    </Button>
    <Button variant="outline" className="w-full justify-start">
      <Lock className="mr-2 h-4 w-4" />
      Lock Doors
    </Button>
    <Button variant="outline" className="w-full justify-start">
      <Wifi className="mr-2 h-4 w-4" />
      Network Status
    </Button>
  </div>
);