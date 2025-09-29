import { Plus, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

export const QuickActions = ({ className }: { className?: string }) => {
  const { updateDevice } = useDashboardData();

  const actions = [
    { icon: Plus, label: 'Add Device', onClick: () => console.log('Add device') },
    { icon: RefreshCw, label: 'Refresh', onClick: () => console.log('Refresh') },
    { icon: Settings, label: 'Settings', onClick: () => console.log('Settings') },
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      {actions.map((action, i) => (
        <Button 
          key={i} 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="flex items-center gap-1"
        >
          <action.icon className="w-3 h-3" />
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};