"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSystemStatus } from '@/data/mockDashboardData';
import { Wifi, Clock, Database } from 'lucide-react';

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Wifi className={`h-4 w-4 ${mockSystemStatus.connected ? 'text-green-500' : 'text-red-500'}`} />
          <Badge variant={mockSystemStatus.connected ? 'default' : 'destructive'}>
            {mockSystemStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4" />
          <span>Exposed: {mockSystemStatus.exposedCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4" />
          <span>Last Sync: {new Date(mockSystemStatus.lastSync).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Load: {(mockSystemStatus.load * 100).toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  );
};