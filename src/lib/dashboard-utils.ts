import { cn } from '@/lib/utils';

export const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getDeviceState = (domain: string, state: string): { icon: string; color: string } => {
  const icons = {
    light: state === 'on' ? { icon: '💡', color: 'text-yellow-400' } : { icon: '💡', color: 'text-gray-400' },
    switch: state === 'on' ? { icon: '🔌', color: 'text-green-400' } : { icon: '🔌', color: 'text-gray-400' },
  };
  return icons[domain as keyof typeof icons] || { icon: '⚪', color: 'text-gray-400' };
};

export const calculateEnergyUsage = (rawData: number[]): { labels: string; data: number }[] => {
  const now = new Date();
  const result: { labels: string; data: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
    const label = `${hour}:00`;
    result.unshift({ labels: label, data: rawData[i] || 0 });
  }
  return result;
};

export const generateAudioLevels = (): number[] => {
  return Array.from({ length: 5 }, () => Math.random() * 100);
};

export const getSidebarClass = (isActive: boolean, screenSize: string): string => {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  );
};