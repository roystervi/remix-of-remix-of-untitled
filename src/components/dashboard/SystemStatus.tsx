import { Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

export const SystemStatus = ({ className }: { className?: string }) => {
  const { devices } = useDashboardData();
  const onlineCount = devices.filter(d => d.status).length;
  const total = devices.length;
  const isAllOnline = onlineCount === total;

  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md bg-muted", className)}>
      <Circle className={`w-3 h-3 ${isAllOnline ? 'text-green-500' : 'text-destructive'}`} />
      <span className="text-xs font-medium">
        {isAllOnline ? 'All systems online' : `${onlineCount}/${total} online`}
      </span>
    </div>
  );
};