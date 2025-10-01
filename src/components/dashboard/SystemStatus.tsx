import { Badge } from '@/components/ui/badge';
import { Shield, Battery, Wifi } from 'lucide-react';

export const SystemStatus = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm">Security</span>
      <Badge variant="default"><Shield className="mr-1 h-3 w-3" /> Armed</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">Battery</span>
      <Badge variant="secondary">85%</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">Connection</span>
      <Badge variant="outline"><Wifi className="mr-1 h-3 w-3" /> Connected</Badge>
    </div>
  </div>
);