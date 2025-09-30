import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface GasStation {
  id: number;
  name: string;
  brand?: string;
  lat: number;
  lon: number;
  address: string;
  fuelType: string;
  price: string;
  rating: number;
  distance: number;
}

export function GasStations({ className }: { className?: string }) {
  const [zip, setZip] = useState('32277'); // Default to user's specified ZIP
  const [radius, setRadius] = useState(50); // Default 50 miles
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ zip: '32277' });

  const fetchStations = async () => {
    if (!zip || zip.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      setStations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        zip: zip,
        radius: radius.toString(),
        fuel: selectedFuel
      });
      const response = await fetch(`/api/gas-stations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const { stations: fetchedStations, location, error: apiError } = await response.json();
      
      if (apiError) {
        toast.warning(apiError);
        setStations([]);
        return;
      }
      
      setStations(fetchedStations || []);
      setCurrentLocation(location || currentLocation);
      
      // Update ZIP input if geocoded
      if (location && location.zip && location.zip !== zip) setZip(location.zip);
    } catch (err) {
      console.error(err);
      setError('Failed to load gas stations');
      toast.error('No stations found - check ZIP and try again');
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (zip.trim() && zip.length === 5) {
      fetchStations();
    }
  }, [zip, selectedFuel, radius]);

  return (
    <Card className={cn("min-h-[300px]", className)}>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          Nearby Gas Stations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-3">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ZIP (default: 32277)"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <div className="flex items-center gap-2">
            <Label>Radius: {radius} miles</Label>
            <Input
              type="range"
              min={10}
              max={100}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Gas Grade</Label>
          <Select value={selectedFuel} onValueChange={setSelectedFuel}>
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
            {stations.map((station, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div className="flex-1">
                  <h3 className="font-semibold">{station.name}</h3>
                  <p className="text-sm text-muted-foreground">{station.address}</p>
                  <p className="text-xs">{station.fuelType} • {station.distance.toFixed(1)} miles away</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${station.price}</div>
                  {station.price === 'N/A' ? (
                    <span className="text-xs text-muted-foreground">Price unavailable</span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      {station.rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Showing {(stations || []).length} stations near ZIP {zip} ({selectedFuel === 'all' ? 'All Types' : selectedFuel.toUpperCase()})</p>
          </div>
        ) : zip && !loading ? (
          <p className="text-sm text-muted-foreground">No stations found. Try another ZIP or gas type.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a ZIP code to search for nearby gas stations.</p>
        )}
        {!loading && stations.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <p>No stations found in {radius} miles of {zip}. Try a broader radius or different ZIP.</p>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}