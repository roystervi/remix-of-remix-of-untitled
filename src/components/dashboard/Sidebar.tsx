"use client"

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Music,
  Snowflake,
  Moon,
  Smartphone as SmartHome,
  Mic,
  X,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSidebarClass } from '@/lib/dashboard-utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  audioLevels: number[];
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, audioLevels, screenSize }) => {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRoomDialogOpen, setNewRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      setError(null);
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName.trim() }),
      });
      if (!response.ok) throw new Error('Failed to create room');
      setNewRoomName('');
      setNewRoomDialogOpen(false);
      fetchRooms(); // Refetch
    } catch (err) {
      setError(err.message);
    }
  };

  // Find active room (hardcoded for My Workstation)
  const activeRoom = rooms.find(room => room.name === 'My Workstation');

  if (loading) {
    return (
      <div className={getSidebarClass(screenSize, sidebarOpen, cn)}>
        {/* Mobile Close Button */}
        {screenSize !== 'desktop' && (
          <button 
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground mt-4">Loading rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getSidebarClass(screenSize, sidebarOpen, cn)}>
      {/* Mobile Close Button */}
      {screenSize !== 'desktop' && (
        <button 
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Voice Assistance - Moved to Top */}
        <div className="bg-muted rounded-xl p-2 mb-3 relative border border-accent/30 shadow-md">
          <h4 className="text-xs font-semibold mb-1 text-foreground border-b pb-1">Voice assistance</h4>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <Mic className="w-3 h-3 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Hey Javis,</p>
              <p className="text-[10px] text-muted-foreground">turn off all lights</p>
            </div>
          </div>
          
          {/* Audio Visualization - Half size */}
          <div className="flex items-end justify-center gap-0.5 h-12 bg-gradient-to-b from-background to-muted/50 rounded-xl p-2 border border-primary/20 shadow-xl ring-1 ring-primary/30 overflow-hidden" suppressHydrationWarning={true}>
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-primary via-blue-500 to-cyan-400 rounded-full w-2 flex-shrink-0 audio-bar transition-all duration-100 shadow-md relative overflow-hidden"
                style={{
                  height: `${Math.min(level * 3, 35)}px`,
                  animationDelay: `${(i * 0.02).toFixed(2)}s`,
                }}
                title={`Level ${level}%`}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            ))}
            <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground font-mono">Live Audio</span>
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">My Rooms</h3>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-3 animate-pulse">
                  <div className="w-6 h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-destructive text-sm">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  className={cn(
                    "border-2 border-primary/30 bg-card rounded-xl p-3 flex flex-col items-center cursor-pointer hover:bg-accent transition-colors",
                    activeRoom?.id === room.id && "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  <Home className="w-6 h-6 mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{room.name}</p>
                </button>
              ))}
              {rooms.length < 6 && ( // Limit display to 6 including add
                <button 
                  onClick={() => setNewRoomDialogOpen(true)}
                  className="border-2 border-primary/30 border-dashed bg-transparent rounded-xl p-3 flex flex-col items-center hover:border-primary hover:bg-accent transition-colors"
                >
                  <Plus className="w-6 h-6 text-primary/70" />
                  <p className="text-sm font-medium text-primary/70 mt-1">Add new</p>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add Room Dialog */}
        <Dialog open={newRoomDialogOpen} onOpenChange={setNewRoomDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex justify-end space-x-2">
                <DialogClose>Cancel</DialogClose>
                <Button onClick={handleAddRoom}>Add Room</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Set Room Environment Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Set room environment</h3>
          <div className="flex gap-3 pb-2 overflow-x-auto">
            {/* Music Mode */}
            <button className="bg-card border-2 border-primary/30 rounded-xl p-3 flex flex-col items-center hover:bg-accent transition-colors min-w-[60px]">
              <Music className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Music</span>
              <span className="text-xs text-foreground">Mode</span>
            </button>

            {/* Cool */}
            <button className="bg-card border-2 border-primary/30 rounded-xl p-3 flex flex-col items-center hover:bg-accent transition-colors min-w-[60px]">
              <Snowflake className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Cool</span>
            </button>

            {/* Night */}
            <button className="bg-card border-2 border-primary/30 rounded-xl p-3 flex flex-col items-center hover:bg-accent transition-colors min-w-[60px]">
              <Moon className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Night</span>
            </button>

            {/* Smart Home */}
            <button className="bg-card border-2 border-primary/30 rounded-xl p-3 flex flex-col items-center hover:bg-accent transition-colors min-w-[60px]">
              <SmartHome className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Smart</span>
              <span className="text-xs text-foreground">Home</span>
            </button>
          </div>

          {/* Analytics Link - Added */}
          <Link href="/analytics" className="mt-4 flex items-center gap-3 w-full p-3 rounded-xl bg-card border-2 border-primary/30 hover:bg-accent transition-colors">
            <BarChart3 className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Analytics</span>
          </Link>

          {/* Settings Link */}
          <Link href="/settings" className="mt-2 flex items-center gap-3 w-full p-3 rounded-xl bg-card border-2 border-primary/30 hover:bg-accent transition-colors">
            <Settings className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}