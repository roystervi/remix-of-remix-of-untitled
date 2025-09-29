import { 
  Home, 
  Moon, 
  Shield, 
  Thermometer, 
  Music, 
  Lightbulb,
  Lock,
  Coffee,
  Zap,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <Card className="border-card-ring">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </CardTitle>
        <CardDescription>One-tap controls for common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "h-20 w-full flex-col gap-2 justify-center p-0 group-hover:bg-accent",
                action.active && "border-primary/50 bg-primary/5 text-primary",
                action.loading && "animate-pulse opacity-50"
              )}
              onClick={() => handleQuickAction(action.id)}
              disabled={action.loading}
            >
              <action.icon className={cn("h-5 w-5", {
                "text-primary group-hover:text-primary/80": action.active,
                "text-muted-foreground group-hover:text-primary": !action.active
              })} />
              <span className="text-xs font-medium">{action.label}</span>
              {action.loading && (
                <Loader2 className="h-3 w-3 absolute top-1 right-1 animate-spin" />
              )}
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}