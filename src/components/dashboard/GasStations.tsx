import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GasStation {
  id: number;
  name: string;
  brand?: string;
  lat: number;
  lon: number;
  address: string;
}

export function GasStations({ className }: { className?: string }) {
  const [zip, setZip] = useState('');
  const [fuelType, setFuelType] = useState('all');
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!zip || zip.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ zip });
      if (fuelType !== 'all') {
        params.append('fuel', fuelType);
      }
      const response = await fetch(`/api/gas-stations?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Safe handling for data
      let stationsData = [];
      if (data) {
        if (data.error) {
          setError(data.error);
          setStations([]);
          return;
        }
        stationsData = Array.isArray(data) ? data : (data.stations || []);
      }
      
      // Ensure it's an array
      stationsData = Array.isArray(stationsData) ? stationsData : [];
      setStations(stationsData);
      setError(null);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setStations([]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={cn("min-h-[300px]", className)}>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          Nearby Gas Stations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ZIP code (e.g., 90210)"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={handleKeyDown}
            className="flex-1"
            maxLength={5}
          />
          <Button onClick={handleSearch} size="sm" disabled={loading || !zip}>
            {loading ? <Skeleton className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <div>
          <Label className="text-xs">Gas Grade</Label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (stations || []).length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(stations || []).map((station) => (
              <div key={station.id} className="p-2 border rounded-md bg-muted/50">
                <p className="font-medium text-sm">{station.name}</p>
                {station.brand && <p className="text-xs text-muted-foreground">{station.brand}</p>}
                <p className="text-xs">{station.address || 'No address available'}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Showing {(stations || []).length} stations near ZIP {zip} ({fuelType === 'all' ? 'All Types' : fuelType.toUpperCase()})</p>
          </div>
        ) : zip && !loading ? (
          <p className="text-sm text-muted-foreground">No stations found. Try another ZIP or gas type.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a ZIP code to search for nearby gas stations.</p>
        )}
      </CardContent>
    </Card>
  );
}