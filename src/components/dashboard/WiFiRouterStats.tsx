"use client"

import { Download, Upload, MoreHorizontal, Wifi, Loader2, RefreshCw, Device } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Button as ButtonComponent } from '@/components/ui/button';

export const WiFiRouterStats = () => {
  const [signalStrength, setSignalStrength] = useState(85);
  const [isConnected, setIsConnected] = useState(true);
  const [ssid, setSsid] = useState('Home Network');
  const [mode, setMode] = useState('2.4GHz');
  const [channel, setChannel] = useState(6);
  const [downloadSpeed, setDownloadSpeed] = useState(162.68);
  const [uploadSpeed, setUploadSpeed] = useState(198.53);
  const [ping, setPing] = useState(9);
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [connectedDevices, setConnectedDevices] = useState([
    { mac: '00:11:22:33:44:55', hostname: 'Laptop', ip: '192.168.1.10', type: 'PC' },
    { mac: '66:77:88:99:AA:BB', hostname: 'Phone', ip: '192.168.1.20', type: 'Mobile' },
    { mac: 'CC:DD:EE:FF:00:11', hostname: 'Tablet', ip: '192.168.1.30', type: 'Tablet' },
  ]);
  const [loading, setLoading] = useState(false);

  const refreshDevices = () => {
    setLoading(true);
    setTimeout(() => {
      setConnectedDevices(prev => [...prev, { mac: `00:11:22:33:44:${Math.floor(Math.random() * 99)}`, hostname: 'New Device', ip: '192.168.1.100', type: 'PC' }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <Card className="border-card-ring">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Network Status
        </CardTitle>
        <CardDescription>WiFi router and connection details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="text-center">
            <div className="font-bold text-2xl">{signalStrength}%</div>
            <div className="text-sm text-muted-foreground">Signal Strength</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-4 rounded-sm transition-colors ${
                    i < Math.floor(signalStrength / 25) ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-destructive'
              }`}></div>
              <span className={`font-medium ${isConnected ? '' : 'text-destructive'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>
        
        {/* Network Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="font-medium mb-2">WiFi Network</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>SSID:</span>
                <span className="font-mono">{ssid || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span>{mode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Channel:</span>
                <span>{channel || 'Auto'}</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <div className="font-medium mb-2">Connection Details</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span>{downloadSpeed} / {uploadSpeed} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Ping:</span>
                <span>{ping} ms</span>
              </div>
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="font-mono truncate">{ipAddress || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Connected Devices */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Connected Devices ({connectedDevices.length})</div>
            <Button variant="ghost" size="sm" onClick={refreshDevices} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-2 bg-muted/60 rounded w-16 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : connectedDevices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No devices connected
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {connectedDevices.slice(0, 5).map((device) => (
                <div key={device.mac} className="flex items-center gap-3 p-2 hover:bg-accent rounded">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Device className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{device.hostname || device.ip}</div>
                    <div className="text-xs text-muted-foreground truncate">{device.ip}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {device.type || 'Unknown'}
                  </Badge>
                </div>
              ))}
              {connectedDevices.length > 5 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  +{connectedDevices.length - 5} more devices
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};