import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export function GasStations({ className, defaultFuelType = 'all', initialZip = '32277' }: { className?: string; defaultFuelType?: string; initialZip?: string }) {
  const [zip, setZip] = useState(initialZip);
  const [selectedFuel, setSelectedFuel] = useState(defaultFuelType);
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      if (!zip.trim()) return;
      
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          zip: zip,
          fuel: selectedFuel
        });
        const response = await fetch(`/api/gas-stations?${params}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const { stations, location, message } = await response.json();
        
        setStations(stations || []);
        if (message) toast.info(message);
      } catch (err) {
        console.error(err);
        setError('Failed to load gas stations for ZIP ' + zip);
        toast.error('No stations found - try another ZIP');
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [zip, selectedFuel]);

  const handleSearch = () => {
    if (!zip || zip.length !== 5) {
      setError('Enter a valid 5-digit ZIP code');
      toast.error('Invalid ZIP');
      return;
    }
    // Triggers useEffect
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className={cn("min-h-[300px]", className)}>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          Gas Stations in ZIP {zip || 'Enter ZIP'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter 5-digit ZIP (e.g., 32277)"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0"
            />
            <Button onClick={handleSearch} disabled={!zip || zip.length !== 5 || loading}>
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">Fuel Type (Filters results)</Label>
            <Select value={selectedFuel} onValueChange={setSelectedFuel} disabled={loading}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg w-3/4" />
          </div>
        ) : stations.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stations.map((station) => (
              <div key={station.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-md border">
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{station.name}</span>
                    {station.brand && <span className="text-xs bg-primary px-2 py-0.5 rounded-full text-primary-foreground">{station.brand}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{station.address}</p>
                  <p className="text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {station.distance.toFixed(1)} miles • {station.fuelType}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-green-600">${station.price}</div>
                  {station.price === 'N/A' && <span className="text-xs text-muted-foreground block">Price N/A</span>}
                  <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                    <Star className="h-3 w-3 fill-current" />
                    {station.rating.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-2 border-t">
              Showing all {stations.length} stations in ZIP {zip} • Sorted by distance
            </p>
          </div>
        ) : zip && zip.length === 5 && !loading ? (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              No gas stations found exactly in ZIP {zip}. Showing nearby stations automatically.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Enter a ZIP code to view all gas stations in that area.</p>
        )}
      </CardContent>
    </Card>
  );
}