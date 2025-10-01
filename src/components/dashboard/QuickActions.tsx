"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Home, Shield } from 'lucide-react';

const actions = [
  { icon: Lightbulb, label: 'All Lights On', onClick: () => console.log('Lights on') },
  { icon: Home, label: 'Home Mode', onClick: () => console.log('Home mode') },
  { icon: Shield, label: 'Away Mode', onClick: () => console.log('Away mode') },
  { icon: Lightbulb, label: 'All Off', onClick: () => console.log('All off') },
];

export const QuickActions = () => (
  <Card>
    <CardContent className="p-0 pt-6">
      <div className="grid grid-cols-2 gap-4 p-6">
        {actions.map((action, i) => (
          <Button key={i} variant="outline" className="flex flex-col gap-2 h-auto p-4" onClick={action.onClick}>
            <action.icon className="h-6 w-6" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);