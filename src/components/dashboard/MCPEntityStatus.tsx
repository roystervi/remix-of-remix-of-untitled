// ... keep existing imports ...
import { Cloud } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mic, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EntityCard {
  entity_id: string;
  friendly_name: string;
  state: string;
  domain: string;
  is_exposed: boolean;
}

interface MCPStatus {
  connected: boolean;
  exposed_count: number;
  last_sync_time: string | null;
  entities_total: number;
  rules_list: any[];
}

export const MCPEntityStatus = () => {
  const [entities, setEntities] = useState<EntityCard[]>([]);
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [entitiesRes, statusRes] = await Promise.all([
        fetch('/api/mcp/entities'),
        fetch('/api/mcp/status')
      ]);

      if (entitiesRes.ok) {
        const data = await entitiesRes.json();
        setEntities(data.entities || []);
      } else {
        toast.error('Failed to load entities');
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus(data);
      } else {
        toast.error('Failed to load status');
      }
    } catch (error) {
      toast.error('Network error loading MCP data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExposure = async (entityId: string, isExposed: boolean) => {
    try {
      const res = await fetch('/api/mcp/expose', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: entityId, is_exposed: isExposed })
      });
      if (res.ok) {
        setEntities(prev => prev.map(ent => 
          ent.entity_id === entityId ? { ...ent, is_exposed: isExposed } : ent
        ));
        toast.success(`${isExposed ? 'Exposed' : 'Hidden'} entity`);
        fetchData(); // Refresh status
      } else {
        toast.error('Failed to update exposure');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const triggerVoiceCommand = (entityId: string) => {
    // Integrate with Javis - trigger voice for specific entity
    const friendlyName = entities.find(e => e.entity_id === entityId)?.friendly_name || entityId.split('.')[1];
    const command = `Hey Javis, turn on ${friendlyName}`;
    // Here, you could programmatically trigger Javis recognition or show a modal
    toast.info(`Voice command ready: "${command}" - Click mic to speak`);
    router.push('/'); // Ensure on dashboard to access Javis
  };

  const syncEntities = async () => {
    try {
      const res = await fetch('/api/mcp/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Synced ${data.synced_count} entities`);
        fetchData();
      } else {
        toast.error('Sync failed');
      }
    } catch (error) {
      toast.error('Network error during sync');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !status) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 mr-2 animate-spin" />
          Loading MCP entities...
        </div>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="bg-muted rounded-xl border p-6">
        <div className="text-center py-8">
          <Cloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">MCP Not Connected</h3>
          <p className="text-sm text-muted-foreground mb-4">Connect in Settings > AI Connections to enable AI control of your Home Assistant devices.</p>
          <Button onClick={() => router.push('/settings?tab=mcp')} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure MCP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI-Controlled Devices ({status.exposed_count})</h3>
        <div className="flex gap-2">
          <Button onClick={syncEntities} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync
          </Button>
          <Button onClick={() => router.push('/settings?tab=mcp')} variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
            Manage
          </Button>
        </div>
      </div>

      {/* Exposed Entities List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {entities
          .filter(e => e.is_exposed)
          .map((entity) => (
            <div key={entity.entity_id} className="bg-card rounded-lg p-3 border flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{entity.friendly_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{entity.entity_id}</p>
                </div>
                <Badge className="ml-auto">{entity.state}</Badge>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerVoiceCommand(entity.entity_id)}
                  title={`Voice control: Hey Javis, ${entity.state === 'on' ? 'turn off' : 'turn on'} ${entity.friendly_name}`}
                >
                  <Mic className="h-3 w-3" />
                </Button>
                <Switch
                  checked={entity.is_exposed}
                  onCheckedChange={(checked) => toggleExposure(entity.entity_id, checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          ))}
      </div>

      {status.exposed_count === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Cloud className="mx-auto h-8 w-8 mb-2" />
          <p>No entities exposed for AI control yet.</p>
          <Button onClick={() => router.push('/settings?tab=mcp')} variant="link" className="mt-2 p-0 h-auto">
            Expose entities in Settings
          </Button>
        </div>
      )}
    </div>
  );
};