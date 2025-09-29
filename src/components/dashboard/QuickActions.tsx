import { 
  Home, 
  Moon, 
  Shield, 
  Thermometer, 
  Music, 
  Lightbulb,
  Lock,
  Coffee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickActions = [
  { id: 'good-night', label: 'Good Night', icon: Moon, color: 'bg-blue-500' },
  { id: 'away-mode', label: 'Away Mode', icon: Shield, color: 'bg-red-500' },
  { id: 'movie-time', label: 'Movie Time', icon: Music, color: 'bg-purple-500' },
  { id: 'party-mode', label: 'Party Mode', icon: Lightbulb, color: 'bg-pink-500' },
  { id: 'morning-routine', label: 'Morning', icon: Coffee, color: 'bg-orange-500' },
  { id: 'secure-home', label: 'Lock All', icon: Lock, color: 'bg-green-500' },
];

export function QuickActions() {
  return (
    <Card className="min-h-[200px]">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-2 gap-1 sm:gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-12 sm:h-16 flex flex-col gap-1 sm:gap-2 hover:bg-accent hover:scale-105 transition-all text-xs"
            >
              <div className={`p-1 sm:p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="font-medium leading-tight truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}