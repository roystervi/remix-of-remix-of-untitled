"use client"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Snowflake, Flame, RefreshCw } from "lucide-react"
import { Slider, SliderTrack, SliderRange, SliderThumb } from "@/components/ui/slider"

export const ThermostatControl = ({ className }: { className?: string }) => {
  const [temperature, setTemperature] = useState(72)
  const [isFahrenheit, setIsFahrenheit] = useState(true)
  const [mode, setMode] = useState('cool')
  const [setpoint, setSetpoint] = useState(72)
  const [fanSpeed, setFanSpeed] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [humidity, setHumidity] = useState(50)

  const toggleUnit = () => {
    setIsFahrenheit(!isFahrenheit)
  }

  return (
    <Card className="border-card-ring">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Thermostat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Temperature Display */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${
            temperature > 72 ? 'text-red-500' : 
            temperature < 68 ? 'text-blue-500' : 'text-primary'
          }`}>
            {temperature}°
            <span className="text-lg font-normal ml-1">{isFahrenheit ? 'F' : 'C'}</span>
          </div>
          <div className="text-sm text-muted-foreground">Current Room Temperature</div>
          <div className={`w-full bg-muted rounded-full h-2`}>
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((temperature - 50) / (90 - 50) * 100).toFixed(0)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Thermostat Controls */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              variant={mode === 'cool' ? 'default' : 'outline'}
              onClick={() => setMode(mode === 'cool' ? 'off' : 'cool')}
              className="flex-1"
            >
              <Snowflake className="h-4 w-4 mr-2" />
              Cool
            </Button>
            <Button
              variant={mode === 'heat' ? 'default' : 'outline'}
              onClick={() => setMode(mode === 'heat' ? 'off' : 'heat')}
              className="flex-1"
            >
              <Flame className="h-4 w-4 mr-2" />
              Heat
            </Button>
            <Button
              variant={mode === 'auto' ? 'default' : 'outline'}
              onClick={() => setMode('auto')}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto
            </Button>
          </div>
          
          {/* Temperature Setpoint */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Target Temperature</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleUnit}
                className="h-6 px-2"
              >
                {isFahrenheit ? '°F' : '°C'}
              </Button>
            </div>
            <Slider
              value={[setpoint]}
              onValueChange={(value) => setSetpoint(value[0])}
              max={isFahrenheit ? 90 : 32}
              min={isFahrenheit ? 50 : 10}
              step={1}
              className="w-full"
            >
              <SliderTrack className="bg-muted">
                <SliderRange className="bg-primary" />
              </SliderTrack>
              <SliderThumb className="ring-primary" />
            </Slider>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>50°F / 10°C</span>
              <span className="font-medium text-foreground">{setpoint}°{isFahrenheit ? 'F' : 'C'}</span>
              <span>90°F / 32°C</span>
            </div>
          </div>
          
          {/* Fan Speed */}
          <div className="px-4">
            <label className="text-sm font-medium mb-2 block">Fan Speed</label>
            <div className="flex items-center justify-between">
              <Slider
                value={[fanSpeed]}
                onValueChange={(value) => setFanSpeed(value[0])}
                max={3}
                step={1}
                className="w-full max-w-md"
              >
                <SliderTrack className="bg-muted">
                  <SliderRange className="bg-primary" />
                </SliderTrack>
                <SliderThumb className="ring-primary" />
              </Slider>
              <span className="text-sm ml-4">{['Auto', 'Low', 'Medium', 'High'][fanSpeed]}</span>
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2 px-4">
          <div className={`text-center p-2 rounded-md text-xs ${
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="font-medium">{mode}</div>
            <div>Mode</div>
          </div>
          <div className={`text-center p-2 rounded-md text-xs ${
            isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="font-medium">{isActive ? 'On' : 'Off'}</div>
            <div>Status</div>
          </div>
          <div className={`text-center p-2 rounded-md text-xs ${
            humidity < 40 || humidity > 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
          }`}>
            <div className="font-medium">{humidity}%</div>
            <div>Humidity</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}