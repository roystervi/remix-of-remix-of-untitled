"use client"

import { Wifi, Monitor, MoreHorizontal, Settings, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import React, { useEffect, useState } from 'react';

export const AccessoriesGrid = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gridView, setGridView] = useState(false);
  const [accessories, setAccessories] = useState([]);

  const getAccessoryIcon = (accessory) => {
    switch (accessory.type) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-primary" />;
      case 'tv':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'router':
        return <div className="w-4 h-3 bg-muted rounded-sm flex flex-col justify-center">
          <div className="h-px bg-muted mx-0.5" />
          <div className="h-px bg-muted mx-0.5 mt-0.5" />
          <div className="h-px bg-muted mx-0.5 mt-0.5" />
        </div>;
      default:
        return <MoreHorizontal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const toggleAccessory = (id) => {
    setAccessories(prev => prev.map(accessory => 
      accessory.id === id ? { ...accessory, active: !accessory.active } : accessory
    ));
  };

  const refreshAccessories = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccessories([
        { id: 'wifi', name: 'Nest Wi-Fi', type: 'wifi', status: 'Running', active: true },
        { id: 'tv', name: 'Sony TV', type: 'tv', status: 'Running', active: true },
        { id: 'router', name: 'Router', type: 'router', status: 'Turned off', active: false },
      ]);
    } catch (error) {
      console.error('Error refreshing accessories:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAccessories();
  }, []);

  return (
    <Card className="border-card-ring">
      <CardHeader>
        <CardTitle className="flex items-center justify-between pb-2">
          Accessories
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">({accessories.length})</span>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isRefreshing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Refreshing...</span>
          </div>
        ) : gridView ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
            {accessories.map((accessory) => (
              <div key={accessory.id} className="border rounded-lg p-3 bg-card">
                <div className="flex items-center justify-center mb-2">
                  {getAccessoryIcon(accessory)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{accessory.name}</p>
                  <p className="text-xs text-muted-foreground">{accessory.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {accessories.map((accessory) => (
              <div key={accessory.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                <div className="flex items-center gap-3">
                  {getAccessoryIcon(accessory)}
                  <div>
                    <p className="font-medium">{accessory.name}</p>
                    <p className="text-sm text-muted-foreground">{accessory.status}</p>
                  </div>
                </div>
                <Switch
                  checked={accessory.active}
                  onCheckedChange={() => toggleAccessory(accessory.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};