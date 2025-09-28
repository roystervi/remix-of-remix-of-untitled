"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoomPage() {
  const params = useParams();
  const id = params.id;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/rooms?id=${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Room not found');
          return res.json();
        })
        .then(data => setRoom(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-6">Loading room...</div>;
  if (error || !room) return <div className="p-6 text-destructive">Room not found</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            {room.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Room details and controls will go here.</p>
          {/* Placeholder for room-specific content */}
        </CardContent>
      </Card>
    </div>
  );
}