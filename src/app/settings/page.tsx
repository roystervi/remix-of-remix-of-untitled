"use client"

import React, { useState, useRef } from 'react';
import { 
  Settings2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Tv,
  ArrowLeft,
  Database,  // Added
  Download,  // Added
  Upload,    // Added
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud } from 'lucide-react';
import { toast } from 'sonner'; // Assuming sonner is available as per project
import { X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { GasStations } from '@/components/dashboard/GasStations'; // Added import

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Add these utility functions after the imports, before useHAConnection
function hexToRgb(hex) {
  if (typeof hex !== 'string' || !hex) {
    return { r: 59, g: 130, b: 246 }; // Default to #3b82f6 RGB values
  }
  let resultHex = hex.replace(/^#/, '');
  let r, g, b;
  if (resultHex.length === 3) {
    r = parseInt(resultHex[0] + resultHex[0], 16);
    g = parseInt(resultHex[1] + resultHex[1], 16);
    b = parseInt(resultHex[2] + resultHex[2], 16);
  } else if (resultHex.length === 6) {
    r = parseInt(resultHex.substring(0, 2), 16);
    g = parseInt(resultHex.substring(2, 4), 16);
    b = parseInt(resultHex.substring(4, 6), 16);
  } else {
    return { r: 59, g: 130, b: 246 }; // Invalid hex, default
  }
  return { r, g, b };
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c => {
    if (c <= 0.03928) return c / 12.92;
    return Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function formatDate(isoString) {
  if (!isoString || typeof isoString !== 'string') return isoString;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    timeZoneName: 'short' 
  });
}

// Mock hooks for settings functionality
const useResponsiveDesign = (initialMode: 'auto' | 'manual', initialScreenSize: string, initialDimensions: {width: number, height: number}) => {
  const [screenSize, setScreenSize] = useState(initialScreenSize);
  const [dimensions, setDimensions] = useState(initialDimensions);
  const [mode, setMode] = useState(initialMode);
  const [manualDimensions, setManualDimensions] = useState(initialDimensions);

  React.useEffect(() => {
    if (mode === 'manual') return;

    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      if (width >= 1920) setScreenSize('tv');
      else if (width >= 1200) setScreenSize('desktop');
      else if (width >= 768) setScreenSize('tablet');
      else setScreenSize('mobile');
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, [mode]);

  const updateManual = (width, height) => {
    setManualDimensions({ width: parseInt(width) || 1200, height: parseInt(height) || 800 });
    setDimensions({ width: parseInt(width) || 1200, height: parseInt(height) || 800 });
    
    if (parseInt(width) >= 1920) setScreenSize('tv');
    else if (parseInt(width) >= 1200) setScreenSize('desktop');
    else if (parseInt(width) >= 768) setScreenSize('tablet');
    else setScreenSize('mobile');
  };

  const setAutoMode = () => {
    setMode('auto');
    const width = window.innerWidth;
    const height = window.innerHeight;
    setDimensions({ width, height });
    if (width >= 1920) setScreenSize('tv');
    else if (width >= 1200) setScreenSize('desktop');
    else if (width >= 768) setScreenSize('tablet');
    else setScreenSize('mobile');
  };

  const selectBreakpoint = (breakpoint) => {
    const presets = {
      tv: { width: 1920, height: 1080 },
      desktop: { width: 1440, height: 900 },
      tablet: { width: 1024, height: 768 },
      mobile: { width: 375, height: 667 }
    };
    const dims = presets[breakpoint];
    setMode('manual');
    updateManual(dims.width.toString(), dims.height.toString());
  };

  const getBreakpointInfo = () => {
    const breakpoints = {
      tv: { min: 1920, max: Infinity, label: 'TV Display' },
      desktop: { min: 1200, max: 1919, label: 'Desktop Monitor' },
      tablet: { min: 768, max: 1199, label: 'Tablet' },
      mobile: { min: 320, max: 767, label: 'Mobile Phone' }
    };
    
    return breakpoints[screenSize];
  };

  return {
    screenSize,
    dimensions,
    breakpointInfo: getBreakpointInfo(),
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isTV: screenSize === 'tv',
    mode,
    setMode,
    manualDimensions,
    updateManual,
    setAutoMode,
    selectBreakpoint
  };
};

// UI Components
const Card = ({ className = '', children, ...props }) => (
  <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={cn('p-6 pb-2', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={cn('font-semibold leading-none text-lg', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className = '', children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ className = '', children, ...props }) => (
  <div className={cn('p-6 pt-2', className)} {...props}>
    {children}
  </div>
);

const Button = ({ className = '', variant = 'default', size = 'default', disabled = false, children, ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent hover:bg-accent text-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };
  
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1 text-sm',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
      className
    )}
    {...props}
  />
);

const Label = ({ className = '', children, ...props }) => (
  <label className={cn('text-sm font-medium leading-none text-foreground', className)} {...props}>
    {children}
  </label>
);

const Badge = ({ className = '', variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-muted-foreground bg-transparent',
    destructive: 'bg-destructive text-destructive-foreground'
  };
  
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

const Alert = ({ className = '', variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary/10 border-primary/20 text-primary-foreground',
    destructive: 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
  };
  
  return (
    <div className={cn('rounded-lg border p-4 flex items-start gap-3', variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

// Tabs Components
const Tabs = ({ defaultValue = 'appearance', className = '', children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

const TabsList = ({ className = '', children, activeTab, setActiveTab }) => (
  <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab, className = '' }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
      activeTab === value 
        ? 'bg-background text-foreground shadow-sm' 
        : 'text-muted-foreground hover:text-foreground',
      className
    )}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab, className = '' }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  );
};

// Main Settings Component
const SettingsPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ url: '', token: '' }); // Remove if no longer needed
  const [entityState, setEntityState] = useState(null as any); // Remove
  const [isLoadingHa, setIsLoadingHa] = useState(true); // Remove
  
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [weatherProvider, setWeatherProvider] = useState("openweathermap");
  const [weatherApiKey, setWeatherApiKey] = useState("");
  const [weatherUnits, setWeatherUnits] = useState("imperial");
  const [weatherLocation, setWeatherLocation] = useState({ lat: 0, lon: 0, city: '', country: '', zip: '32225' });
  const [fetchedWeather, setFetchedWeather] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [dbSize, setDbSize] = useState(0);        // Added
  const [lastBackup, setLastBackup] = useState(null);  // Added
  const [isLoadingBackup, setIsLoadingBackup] = useState(true);  // Added
  const [file, setFile] = useState(null);         // Added
  const [isImporting, setIsImporting] = useState(false); // Added
  const [isFetchingWeather, setIsFetchingWeather] = useState(false); // Added
  const [lastSaves, setLastSaves] = useState({
    appearance: null as string | null,
    // connections: null as string | null, // Remove
    general: null as string | null,
    notifications: null as string | null,
    weather: null as string | null,
    zipcode: null as string | null,
    backup: null as string | null,
    database: null as string | null  // Added
  });

  // Add database settings state
  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: false,
    queryLogging: false,
    schemaValidation: true,
    performanceMonitoring: false,
    localPath: '/app/data/backups',
    cloudPath: '',
    preset: 'balanced'
  });

  // Add MCP settings state
  const [mcpUrl, setMcpUrl] = useState('http://homeassistant.local:8123');
  const [mcpToken, setMcpToken] = useState('');
  const [isMcpConnected, setIsMcpConnected] = useState(false);
  const [isLoadingMcp, setIsLoadingMcp] = useState(false);
  const [isSavingMcp, setIsSavingMcp] = useState(false);
  const [exposedEntities, setExposedEntities] = useState([]);

  // Move the hooks inside the component
  const [appearanceSettings, setAppearanceSettings] = useState({
    mode: 'auto' as 'auto' | 'manual',
    screenSize: 'desktop' as 'mobile' | 'tablet' | 'desktop' | 'tv',
    width: 1200,
    height: 800,
    backgroundColor: "#ffffff",
    primaryColor: "#3b82f6",
    cardPlaceholderColor: "#9ca3af",
    themePreset: "default"
  });

  // Initialize responsive with default values to avoid TDZ
  const responsive = useResponsiveDesign('auto', 'desktop', { width: 1200, height: 800 });

  // Move these here
  const timers = useRef({ 
    primaryColor: null, 
    backgroundColor: null,
    cardPlaceholderColor: null
  });
  const [originalColors, setOriginalColors] = useState(null);

  // Add loadDatabaseSettings function
  const loadDatabaseSettings = async () => {
    try {
      const response = await fetch('/api/database-settings');
      if (response.ok) {
        const data = await response.json();
        setDatabaseSettings({
          autoBackup: data.autoBackup ?? false,
          queryLogging: data.queryLogging ?? false,
          schemaValidation: data.schemaValidation ?? true,
          performanceMonitoring: data.performanceMonitoring ?? false,
          localPath: data.localPath ?? '/app/data/backups',
          cloudPath: data.cloudPath ?? '',
          preset: data.preset ?? 'balanced'
        });
      }
    } catch (error) {
      console.error('Failed to load database settings:', error);
    }
  };

  // Add saveDatabaseFeatures function
  const saveDatabaseFeatures = async () => {
    try {
      const response = await fetch('/api/database-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(databaseSettings)
      });

      if (response.ok) {
        toast.success('Database features saved successfully!');
        setLastSaves(prev => ({ ...prev, database: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save database features');
      }
    } catch (error) {
      toast.error('Save failed: ' + error.message);
    }
  };

  // Add saveDatabasePaths function
  const saveDatabasePaths = async () => {
    try {
      const { autoBackup, ...settingsToSave } = databaseSettings;
      const response = await fetch('/api/database-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      if (response.ok) {
        toast.success('Backup paths saved successfully!');
        setLastSaves(prev => ({ ...prev, database: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save paths');
      }
    } catch (error) {
      toast.error('Save failed: ' + error.message);
    }
  };

  // Add applyPreset function
  const applyPreset = async () => {
    const presets = {
      performance: { autoBackup: false, queryLogging: false, schemaValidation: true, performanceMonitoring: true, localPath: '/app/data/backups', cloudPath: '', preset: 'performance' },
      balanced: { autoBackup: true, queryLogging: true, schemaValidation: true, performanceMonitoring: false, localPath: '/app/data/backups', cloudPath: '', preset: 'balanced' },
      storage: { autoBackup: true, queryLogging: false, schemaValidation: true, performanceMonitoring: false, localPath: '/app/data/backups', cloudPath: '', preset: 'storage' },
      secure: { autoBackup: true, queryLogging: true, schemaValidation: true, performanceMonitoring: true, localPath: '/app/data/backups', cloudPath: '', preset: 'secure' }
    };
    
    const currentPreset = presets[databaseSettings.preset];
    setDatabaseSettings(currentPreset);
    
    try {
      const response = await fetch('/api/database-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPreset)
      });

      if (response.ok) {
        toast.success(`Applied ${databaseSettings.preset} preset!`);
        setLastSaves(prev => ({ ...prev, database: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to apply preset');
      }
    } catch (error) {
      toast.error('Apply preset failed: ' + error.message);
    }
  };

  // Add loadMcpSettings function
  const loadMcpSettings = async () => {
    try {
      const response = await fetch('/api/mcp-settings');
      if (response.ok) {
        const data = await response.json();
        setMcpUrl(data.url || 'http://homeassistant.local:8123');
        setMcpToken(data.token || '');
        setIsMcpConnected(data.connected ?? false);
        if (data.entities) {
          setExposedEntities(data.entities);
        }
      }
    } catch (error) {
      console.error('Failed to load MCP settings:', error);
    }
  };

  // Add testMcpConnection function
  const testMcpConnection = async () => {
    if (!mcpUrl || !mcpToken) {
      toast.error('Enter Home Assistant URL and token');
      return;
    }

    setIsLoadingMcp(true);
    try {
      const response = await fetch('/api/test-mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mcpUrl, token: mcpToken })
      });

      if (response.ok) {
        const data = await response.json();
        setIsMcpConnected(true);
        setExposedEntities(data.entities || []);
        toast.success('MCP connection successful! Connected to Home Assistant.');
        
        // Auto-save connected status and entities after successful test
        await saveMcpSettings(true);
        
        // Reload to ensure consistency
        await loadMcpSettings();
      } else {
        const errorData = await response.json();
        setIsMcpConnected(false);
        toast.error(errorData.error || 'Connection failed');
      }
    } catch (error) {
      setIsMcpConnected(false);
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsLoadingMcp(false);
    }
  };

  // Add saveMcpSettings function
  const saveMcpSettings = async (fullSave = false) => {
    setIsSavingMcp(true);
    try {
      const bodyData = {
        url: mcpUrl,
        token: mcpToken,
        ...(fullSave && { connected: isMcpConnected, entities: exposedEntities })
      };
      
      const response = await fetch('/api/mcp-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        toast.success('MCP settings saved!');
        setLastSaves(prev => ({ ...prev, mcp: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Save failed');
      }
    } catch (error) {
      toast.error('Save failed: ' + error.message);
    } finally {
      setIsSavingMcp(false);
    }
  };

  // Sync responsive when appearanceSettings changes
  React.useEffect(() => {
    responsive.setMode(appearanceSettings.mode);
    if (appearanceSettings.mode === 'auto') {
      responsive.setAutoMode();
    } else {
      responsive.updateManual(appearanceSettings.width.toString(), appearanceSettings.height.toString());
    }
  }, [appearanceSettings]);

  // Remove useEffect for HA connection data

  // Added: Fetch backup data
  const fetchBackupData = async () => {
    try {
      setIsLoadingBackup(true);
      const [sizeRes, backupRes] = await Promise.all([
        fetch('/api/db-size'),
        fetch('/api/last-backup')
      ]);
      if (sizeRes.ok) {
        setDbSize((await sizeRes.json()).size);
      }
      if (backupRes.ok) {
        setLastBackup((await backupRes.json()).lastBackup);
      }
    } catch (error) {
      console.error('Failed to fetch backup data:', error);
    } finally {
      setIsLoadingBackup(false);
    }
  };

  React.useEffect(() => {
    fetchBackupData();  // Added
  }, []);

  // Add useEffect to load database settings
  React.useEffect(() => {
    loadDatabaseSettings();
  }, []);

  // Add useEffect to load MCP settings
  React.useEffect(() => {
    loadMcpSettings();
  }, []);

  const updateMode = (value: 'auto' | 'manual') => {
    setAppearanceSettings(prev => ({ ...prev, mode: value }));
    // The useEffect will handle syncing responsive
  };

  const onWidthChange = (width: string) => {
    const newWidth = parseInt(width) || 1200;
    responsive.updateManual(width, responsive.manualDimensions.height.toString());
    setAppearanceSettings(prev => ({ ...prev, width: newWidth }));
  };

  const onHeightChange = (height: string) => {
    const newHeight = parseInt(height) || 800;
    responsive.updateManual(responsive.manualDimensions.width.toString(), height);
    setAppearanceSettings(prev => ({ ...prev, height: newHeight }));
  };

  const onBreakpointChange = (breakpoint: string) => {
    responsive.selectBreakpoint(breakpoint);
    setAppearanceSettings(prev => ({ ...prev, screenSize: breakpoint as 'mobile' | 'tablet' | 'desktop' | 'tv' }));
  };

  const onBackgroundChange = (color: string) => {
    setBackgroundColor(color);
    setAppearanceSettings(prev => ({ ...prev, backgroundColor: color }));
  };

  const handleSaveAppearance = async () => {
    let saveData = { ...appearanceSettings };
    
    if (appearanceSettings.mode === 'auto') {
      // For auto, capture current real dimensions
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      let currentScreenSize: 'mobile' | 'tablet' | 'desktop' | 'tv';
      if (currentWidth >= 1920) currentScreenSize = 'tv';
      else if (currentWidth >= 1200) currentScreenSize = 'desktop';
      else if (currentWidth >= 768) currentScreenSize = 'tablet';
      else currentScreenSize = 'mobile';
      
      saveData = {
        ...saveData,
        screenSize: currentScreenSize,
        width: currentWidth,
        height: currentHeight
      };
    }

    setIsSavingAppearance(true);
    try {
      const response = await fetch('/api/appearance-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        toast.success("Appearance settings saved! Changes are live across the dashboard.");
        setLastSaves(prev => ({ ...prev, appearance: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        if (errorData.code) {
          const errorMap = {
            INVALID_MODE: "Invalid detection mode",
            INVALID_SCREEN_SIZE: "Invalid screen size",
            INVALID_WIDTH: "Width must be positive",
            INVALID_HEIGHT: "Height must be positive",
            INVALID_BACKGROUND_COLOR: "Invalid background color"
          };
          toast.error(errorMap[errorData.code] || errorData.error || "Failed to save");
        } else {
          toast.error("Failed to save appearance settings");
        }
      }
    } catch (error) {
      toast.error("Save failed: " + error.message);
    } finally {
      setIsSavingAppearance(false);
    }
  };

  // Update the useEffect for loading to sync responsive after setting appearanceSettings
  React.useEffect(() => {
    const loadAllSettings = async () => {
      try {
        setIsLoadingSettings(true);
        
        // Load appearance settings
        const appearanceResponse = await fetch('/api/appearance-settings');
        if (appearanceResponse.ok) {
          const appData = await appearanceResponse.json();
          const appDataWithDefaults = {
            ...appData,
            mode: appData.mode || 'auto',
            screenSize: appData.screenSize || 'desktop',
            width: appData.width || 1200,
            height: appData.height || 800,
            backgroundColor: appData.backgroundColor || "#ffffff",
            primaryColor: appData.primaryColor || "#3b82f6",
            cardPlaceholderColor: appData.cardPlaceholderColor || "#9ca3af",
            themePreset: appData.themePreset || "default"
          };
          setAppearanceSettings(appDataWithDefaults);
          setBackgroundColor(appDataWithDefaults.backgroundColor);
          
          // Sync responsive after load (this will trigger the other useEffect)
          toast.success("Loaded appearance settings!");
          setOriginalColors({ ...appDataWithDefaults });
        }
        
        // Load weather settings (keep existing logic)
        const weatherResponse = await fetch('/api/weather-settings');
        if (weatherResponse.ok) {
          const settings = await weatherResponse.json();
          if (settings) {
            setWeatherProvider(settings.provider || "openweathermap");
            setWeatherApiKey(settings.apiKey || "");
            setWeatherUnits(settings.units || "imperial");
            setWeatherLocation({
              lat: settings.latitude || 0,
              lon: settings.longitude || 0,
              city: settings.city || '',
              country: settings.country || '',
              zip: settings.zip || '32225'
            });
            setDefaultFuelType(settings.defaultFuelType || 'all');
          }
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadAllSettings();
  }, []);

  // Function to fetch weather preview
  const fetchWeatherPreview = async () => {
    if (!weatherApiKey || !weatherLocation.lat || !weatherLocation.lon) {
      setFetchedWeather(null);
      return;
    }

    setIsFetchingWeather(true);
    try {
      const response = await fetch('/api/test-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: weatherProvider,
          apiKey: weatherApiKey,
          lat: weatherLocation.lat,
          lon: weatherLocation.lon,
          units: weatherUnits
        })
      });

      if (response.ok) {
        const { data } = await response.json();
        setFetchedWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity
        });
      } else {
        const errorData = await response.json();
        console.error('Weather fetch failed:', errorData.error || "Weather API failed");
        setFetchedWeather(null);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setFetchedWeather(null);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleSaveWeatherSettingsWithFuel = async () => {
    if (!weatherLocation.lat || !weatherLocation.lon) {
      toast.error("Set a valid location (via coordinates, ZIP, or detection) before saving");
      return;
    }

    setIsSavingSettings(true);
    try {
      const response = await fetch('/api/weather-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: weatherProvider,
          apiKey: weatherApiKey,
          latitude: weatherLocation.lat,
          longitude: weatherLocation.lon,
          units: weatherUnits,
          city: weatherLocation.city,
          country: weatherLocation.country,
          zip: weatherLocation.zip,
          defaultFuelType: defaultFuelType
        })
      });

      if (response.ok) {
        const saved = await response.json();
        toast.success("Weather settings saved successfully!");
        setLastSaves(prev => ({ ...prev, weather: new Date().toISOString(), zipcode: new Date().toISOString() }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Save failed: " + error.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Added: Handle export
  const handleExport = async () => {
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) {
        throw new Error('Export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup exported successfully!');
      fetchBackupData();  // Update last backup
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  // Added: Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Added: Handle import
  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        toast.success(`Import successful! ${JSON.stringify(result.importedCounts)}`);
        setFile(null);
        // Clear file input
        const input = document.querySelector('input[type="file"]');
        if (input) input.value = '';
        fetchBackupData();  // Update data
        setLastSaves(prev => ({ ...prev, backup: new Date().toISOString() }));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Import failed');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON file');
      } else {
        toast.error('Import failed: ' + error.message);
      }
    } finally {
      setIsImporting(false);
    }
  };

  React.useEffect(() => {
    const root = document.documentElement;
    const primaryColorValue = appearanceSettings.primaryColor || '#3b82f6';
    const backgroundColorValue = appearanceSettings.backgroundColor || '#ffffff';
    const cardPlaceholderValue = appearanceSettings.cardPlaceholderColor || '#9ca3af';
    root.style.setProperty('--background', backgroundColorValue);
    root.style.setProperty('--primary', primaryColorValue);
    root.style.setProperty('--muted-foreground', cardPlaceholderValue);
    root.style.setProperty('--secondary-foreground', cardPlaceholderValue);
    const luminance = getLuminance(primaryColorValue);
    root.style.setProperty('--primary-foreground', luminance < 0.5 ? '#ffffff' : '#000000');
  }, [appearanceSettings.backgroundColor, appearanceSettings.primaryColor, appearanceSettings.cardPlaceholderColor]);

  // Add these states in the SettingsPage component, after existing states
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSQLModalOpen, setIsSQLModalOpen] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isExecutingSQL, setIsExecutingSQL] = useState(false);
  const [sqlResults, setSqlResults] = useState(null);
  const [sqlError, setSqlError] = useState('');
  const [isDrizzleModalOpen, setIsDrizzleModalOpen] = useState(false);
  const [migrations, setMigrations] = useState([]);
  const [isLoadingMigrations, setIsLoadingMigrations] = useState(false);
  const [isRunningMigrations, setIsRunningMigrations] = useState(false);
  const [pendingMigrations, setPendingMigrations] = useState([]);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [studioSearchTerm, setStudioSearchTerm] = useState('');
  const [studioFilteredTables, setStudioFilteredTables] = useState([]);
  const [isLoadingStudioTables, setIsLoadingStudioTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [tableSchema, setTableSchema] = useState([]);
  const [tableData, setTableData] = useState({ data: [], pagination: {} });

  // Add activeTab state for Tabs component
  const [activeTab, setActiveTab] = useState('database');

  // Add these functions after existing functions

  // Fetch tables
  const fetchTables = async () => {
    setIsLoadingTables(true);
    try {
      const response = await fetch('/api/database-studio/tables');
      if (response.ok) {
        const { tables: fetchedTables } = await response.json();
        setTables(fetchedTables);
        setFilteredTables(fetchedTables);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Filter tables for search
  React.useEffect(() => {
    const filtered = tables.filter(table => 
      table.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTables(filtered);
  }, [searchTerm, tables]);

  // Fetch tables on mount for database tab
  React.useEffect(() => {
    if (activeTab === 'database') {
      fetchTables();
    }
  }, [activeTab]);

  // SQL Query execution
  const executeSQLQuery = async () => {
    setIsExecutingSQL(true);
    setSqlError('');
    setSqlResults(null);
    try {
      const response = await fetch('/api/sql-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      if (response.ok) {
        const data = await response.json();
        setSqlResults(data);
        if (data.rowCount > 0) {
          toast.success(`Query executed: ${data.rowCount} rows returned`);
        } else {
          toast.info('Query executed: No results');
        }
      } else {
        const errorData = await response.json();
        setSqlError(errorData.error || 'Execution failed');
        toast.error(errorData.error || 'Query execution failed');
      }
    } catch (error) {
      setSqlError('Network error');
      toast.error('Network error during query execution');
    } finally {
      setIsExecutingSQL(false);
    }
  };

  // Drizzle migrations
  const fetchMigrations = async () => {
    setIsLoadingMigrations(true);
    try {
      const response = await fetch('/api/drizzle-runner');
      if (response.ok) {
        const data = await response.json();
        setMigrations(data.migrations || []);
        setPendingMigrations(data.migrations.filter(m => m.status === 'pending') || []);
      }
    } catch (error) {
      console.error('Failed to fetch migrations:', error);
      toast.error('Failed to load migrations');
    } finally {
      setIsLoadingMigrations(false);
    }
  };

  React.useEffect(() => {
    if (isDrizzleModalOpen) {
      fetchMigrations();
    }
  }, [isDrizzleModalOpen]);

  const runAllMigrations = async () => {
    setIsRunningMigrations(true);
    try {
      const response = await fetch('/api/drizzle-runner?action=run-all', {
        method: 'PUT'
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'All migrations executed');
        fetchMigrations(); // Refresh list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to run migrations');
      }
    } catch (error) {
      toast.error('Network error during migration');
    } finally {
      setIsRunningMigrations(false);
    }
  };

  // Studio tables
  const fetchStudioTables = async () => {
    setIsLoadingStudioTables(true);
    try {
      const response = await fetch('/api/database-studio/tables');
      if (response.ok) {
        const { tables: fetchedTables } = await response.json();
        setStudioFilteredTables(fetchedTables);
      }
    } catch (error) {
      console.error('Failed to fetch studio tables:', error);
      toast.error('Failed to load studio tables');
    } finally {
      setIsLoadingStudioTables(false);
    }
  };

  React.useEffect(() => {
    if (isStudioModalOpen) {
      fetchStudioTables();
    }
  }, [isStudioModalOpen]);

  // Filter studio tables
  React.useEffect(() => {
    const filtered = studioFilteredTables.filter(table => 
      table.name.toLowerCase().includes(studioSearchTerm.toLowerCase())
    );
    setStudioFilteredTables(filtered);
  }, [studioSearchTerm]);

  // Fetch table schema and data
  const fetchTableSchema = async (tableName) => {
    setIsLoadingSchema(true);
    try {
      const response = await fetch(`/api/database-studio/table/${tableName}?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTableSchema(data.schema || []);
        setTableData({ data: data.data || [], pagination: data.pagination || {} });
      } else {
        toast.error('Failed to load table schema');
      }
    } catch (error) {
      console.error('Failed to fetch table schema:', error);
      toast.error('Network error loading schema');
    } finally {
      setIsLoadingSchema(false);
    }
  };

  // Add state for fuel type
  const [defaultFuelType, setDefaultFuelType] = useState('all');

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="zipcode">Zip Code</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="mcp">AI Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize colors and display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Current Screen Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Detection Mode</Label>
                    <Select value={appearanceSettings.mode} onValueChange={updateMode}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Device-based)</SelectItem>
                        <SelectItem value="manual">Manual (Test)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {responsive.mode === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manual-width">Simulate Width (px)</Label>
                        <Input
                          id="manual-width"
                          type="number"
                          value={responsive.manualDimensions.width}
                          onChange={(e) => onWidthChange(e.target.value)}
                          placeholder="1200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-height">Simulate Height (px)</Label>
                        <Input
                          id="manual-height"
                          type="number"
                          value={responsive.manualDimensions.height}
                          onChange={(e) => onHeightChange(e.target.value)}
                          placeholder="800"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-accent">
                    <div className="flex items-center gap-3">
                      {responsive.isTV && <Tv className="h-5 w-5 text-primary" />}
                      {responsive.isDesktop && <Monitor className="h-5 w-5 text-primary" />}
                      {responsive.isTablet && <Tablet className="h-5 w-5 text-primary" />}
                      {responsive.isMobile && <Smartphone className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="font-medium text-foreground">{responsive.breakpointInfo.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {responsive.dimensions.width}px × {responsive.dimensions.height}px
                          {responsive.mode === 'manual' && ' (Manual)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {responsive.mode === 'auto' ? 'AUTO' : 'MANUAL'}
                        <br />
                        {responsive.screenSize.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Screen Size Breakpoints</h4>
                  <Select value={responsive.screenSize} onValueChange={onBreakpointChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select to simulate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop Monitor</SelectItem>
                      <SelectItem value="tv">TV Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Tv, name: 'TV Display', range: '≥1920px', desc: 'Expanded layout with larger elements' },
                    { icon: Monitor, name: 'Desktop Monitor', range: '1200px - 1919px', desc: 'Standard desktop layout' },
                    { icon: Tablet, name: 'Tablet', range: '768px - 1199px', desc: 'Collapsible sidebar, stacked layout' },
                    { icon: Smartphone, name: 'Mobile Phone', range: '≤767px', desc: 'Overlay sidebar, single column' }
                  ].map((item) => {
                    const isCurrent = responsive.breakpointInfo.label === item.name;
                    return (
                      <div key={item.name} className={cn("flex flex-col items-start p-3 rounded-lg min-w-0", isCurrent ? "bg-accent border-accent" : "bg-muted")}>
                        <div className="flex items-center gap-3 mb-2 flex-1 min-w-0">
                          <item.icon className={cn("h-5 w-5 flex-shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                          <div className="min-w-0 flex-1">
                            <p className={cn("font-medium truncate", isCurrent ? "text-foreground" : "")}>{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.range}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground w-full">
                          {item.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Theme Colors</h4>
                <div className="space-y-4">
                  <Label>Theme Preset</Label>
                  <Select value={appearanceSettings.themePreset || 'default'} onValueChange={(value) => {
                    const presets = [
                      { name: 'Default', primary: '#3b82f6', background: '#ffffff', cardPlaceholder: '#9ca3af' },
                      { name: 'Green', primary: '#10b981', background: '#f0fdf4', cardPlaceholder: '#6ee7b7' },
                      { name: 'Purple', primary: '#8b5cf6', background: '#faf5ff', cardPlaceholder: '#c4b5fd' },
                      { name: 'Red', primary: '#ef4444', background: '#fef2f2', cardPlaceholder: '#fca5a5' },
                      { name: 'Orange', primary: '#f59e0b', background: '#fff7ed', cardPlaceholder: '#fdba74' }
                    ];
                    const preset = presets.find(p => p.name.toLowerCase() === value.toLowerCase());
                    if (preset) {
                      setAppearanceSettings(prev => ({
                        ...prev,
                        themePreset: value,
                        primaryColor: preset.primary,
                        backgroundColor: preset.background,
                        cardPlaceholderColor: preset.cardPlaceholder
                      }));
                      // Update CSS vars
                      const root = document.documentElement;
                      root.style.setProperty('--primary', preset.primary);
                      root.style.setProperty('--background', preset.background);
                      root.style.setProperty('--muted-foreground', preset.cardPlaceholder);
                      root.style.setProperty('--secondary-foreground', preset.cardPlaceholder);
                      const l = getLuminance(preset.primary);
                      root.style.setProperty('--primary-foreground', l < 0.5 ? '#ffffff' : '#000000');
                    }
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { name: 'Default', primary: '#3b82f6', background: '#ffffff', cardPlaceholder: '#9ca3af' },
                        { name: 'Green', primary: '#10b981', background: '#f0fdf4', cardPlaceholder: '#6ee7b7' },
                        { name: 'Purple', primary: '#8b5cf6', background: '#faf5ff', cardPlaceholder: '#c4b5fd' },
                        { name: 'Red', primary: '#ef4444', background: '#fef2f2', cardPlaceholder: '#fca5a5' },
                        { name: 'Orange', primary: '#f59e0b', background: '#fff7ed', cardPlaceholder: '#fdba74' }
                      ].map(p => (
                        <SelectItem key={p.name} value={p.name.toLowerCase()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Select a pre-made theme to quickly customize colors</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <Input
                      type="color"
                      value={appearanceSettings.primaryColor || '#3b82f6'}
                      onChange={(e) => {
                        const color = e.target.value;
                        setAppearanceSettings(prev => ({ ...prev, primaryColor: color }));
                        const root = document.documentElement;
                        root.style.setProperty('--primary', color);
                        const l = getLuminance(color);
                        root.style.setProperty('--primary-foreground', l < 0.5 ? '#ffffff' : '#000000');
                        
                        if (originalColors && e.target.value !== originalColors.primaryColor) {
                          if (timers.current.primaryColor) clearTimeout(timers.current.primaryColor);
                          timers.current.primaryColor = setTimeout(() => {
                            setAppearanceSettings(prev => ({ ...prev, primaryColor: originalColors.primaryColor }));
                          }, 30000);
                        }
                      }}
                      className="w-full h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={appearanceSettings.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        const color = e.target.value;
                        setAppearanceSettings(prev => ({ ...prev, backgroundColor: color }));
                        document.documentElement.style.setProperty('--background', color);
                        
                        if (originalColors && e.target.value !== originalColors.backgroundColor) {
                          if (timers.current.backgroundColor) clearTimeout(timers.current.backgroundColor);
                          timers.current.backgroundColor = setTimeout(() => {
                            setAppearanceSettings(prev => ({ ...prev, backgroundColor: originalColors.backgroundColor }));
                          }, 30000);
                        }
                      }}
                      className="w-full h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card Placeholder Color</Label>
                    <Input
                      type="color"
                      value={appearanceSettings.cardPlaceholderColor || '#9ca3af'}
                      onChange={(e) => {
                        const color = e.target.value;
                        setAppearanceSettings(prev => ({ ...prev, cardPlaceholderColor: color }));
                        document.documentElement.style.setProperty('--muted-foreground', color);
                        document.documentElement.style.setProperty('--secondary-foreground', color);
                        
                        if (originalColors && e.target.value !== originalColors.cardPlaceholderColor) {
                          if (timers.current.cardPlaceholderColor) clearTimeout(timers.current.cardPlaceholderColor);
                          timers.current.cardPlaceholderColor = setTimeout(() => {
                            setAppearanceSettings(prev => ({ ...prev, cardPlaceholderColor: originalColors.cardPlaceholderColor }));
                          }, 30000);
                        }
                      }}
                      className="w-full h-12"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ backgroundColor: appearanceSettings.backgroundColor || '#ffffff' }}>
                  <p className="text-sm font-medium mb-2">Theme Preview</p>
                  <div className={cn("p-4 rounded-md border")} style={{ 
                    backgroundColor: appearanceSettings.backgroundColor || '#ffffff' 
                  }}>
                    <button 
                      className="px-4 py-2 rounded-md font-medium" 
                      style={{ 
                        backgroundColor: appearanceSettings.primaryColor || '#3b82f6', 
                        color: getLuminance(appearanceSettings.primaryColor || '#3b82f6') < 0.5 ? '#ffffff' : '#000000' 
                      }}
                    >
                      Sample Button
                    </button>
                    <p className="text-sm text-[var(--muted-foreground)] mt-2">Sample card text</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Responsive Features</h4>
                <div className="space-y-3">
                  {[
                    'Automatic layout adaptation',
                    'Touch-friendly controls on mobile',
                    'Collapsible navigation for tablets',
                    'Overlay navigation for mobile',
                    'Optimized text and button sizes',
                    'Portrait and landscape mode support'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveAppearance} 
                    disabled={isSavingAppearance}
                    className="flex-1"
                  >
                    {isSavingAppearance ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Appearance Settings"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAppearanceSettings({
                        mode: 'auto',
                        screenSize: 'desktop',
                        width: 1200,
                        height: 800,
                        backgroundColor: "#ffffff",
                        primaryColor: "#3b82f6",
                        cardPlaceholderColor: "#9ca3af",
                        themePreset: "default"
                      });
                      setBackgroundColor("#ffffff");
                      const root = document.documentElement;
                      root.style.setProperty('--background', '#ffffff');
                      root.style.setProperty('--card', '#ffffff');
                      root.style.setProperty('--primary', '#3b82f6');
                      root.style.setProperty('--muted-foreground', '#9ca3af');
                      root.style.setProperty('--secondary-foreground', '#9ca3af');
                      const luminance = getLuminance('#3b82f6');
                      root.style.setProperty('--primary-foreground', luminance < 0.5 ? '#ffffff' : '#000000');
                      Object.values(timers.current).forEach(timer => { if (timer) clearTimeout(timer); });
                      timers.current = { primaryColor: null, backgroundColor: null, cardPlaceholderColor: null };  // Reset timers
                      setOriginalColors({
                        mode: 'auto',
                        screenSize: 'desktop',
                        width: 1200,
                        height: 800,
                        backgroundColor: "#ffffff",
                        primaryColor: "#3b82f6",
                        cardPlaceholderColor: "#9ca3af",
                        themePreset: "default"
                      });
                      toast.success("Appearance reset to defaults!");
                    }}
                    className="flex-1"
                  >
                    Reset to Default
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <p><strong>Appearance Last Backup Last saved file:</strong> {lastSaves.appearance ? formatDate(lastSaves.appearance) : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general dashboard preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings will be available in future updates.</p>
              <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                <p><strong>General Last Backup Last saved file:</strong> {lastSaves.general ? formatDate(lastSaves.general) : 'Never'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available in future updates.</p>
              <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                <p><strong>Notifications Last Backup Last saved file:</strong> {lastSaves.notifications ? formatDate(lastSaves.notifications) : 'Never'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Weather API Configuration
                </CardTitle>
                <CardDescription>
                  Configure weather data source for your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading saved settings...
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="weather-provider">Weather Provider</Label>
                      <Select value={weatherProvider} onValueChange={setWeatherProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openweathermap">OpenWeatherMap</SelectItem>
                          <SelectItem value="weatherapi">WeatherAPI</SelectItem>
                          <SelectItem value="accuweather">AccuWeather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="weather-api-key">API Key</Label>
                      <Input
                        id="weather-api-key"
                        type="password"
                        placeholder="Enter your weather API key"
                        value={weatherApiKey}
                        onChange={(e) => setWeatherApiKey(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Units</Label>
                      <Select value={weatherUnits} onValueChange={setWeatherUnits}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imperial">Imperial (°F)</SelectItem>
                          <SelectItem value="metric">Metric (°C)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={fetchWeatherPreview}
                      disabled={!weatherApiKey || !weatherLocation.lat || !weatherLocation.lon || isFetchingWeather}
                      className="w-full"
                    >
                      {isFetchingWeather ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Cloud className="h-4 w-4 mr-2" />
                          Test Weather API
                        </>
                      )}
                    </Button>

                    {(isFetchingWeather || fetchedWeather) && (
                      <Card className={cn("bg-green-50 border-green-200", isFetchingWeather && "bg-muted")}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {isFetchingWeather ? "Fetching Weather..." : "Current Weather Preview"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {isFetchingWeather ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading weather...
                            </div>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-green-900">
                                {fetchedWeather.temperature}°{weatherUnits === "imperial" ? "F" : "C"}
                              </div>
                              <p className="text-sm capitalize text-green-800">{fetchedWeather.condition}</p>
                              {fetchedWeather.feelsLike && (
                                <p className="text-xs text-green-700">Feels like: {fetchedWeather.feelsLike}°</p>
                              )}
                              {fetchedWeather.humidity && (
                                <p className="text-xs text-green-700">Humidity: {fetchedWeather.humidity}%</p>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={handleSaveWeatherSettingsWithFuel}
                      disabled={isSavingSettings || !weatherLocation.lat || !weatherLocation.lon}
                      className="w-full"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save Weather Settings
                        </>
                      )}
                    </Button>

                    <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                      <p><strong>Weather Last saved:</strong> {lastSaves.weather ? formatDate(lastSaves.weather) : 'Never'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zipcode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Zip Code Location
              </CardTitle>
              <CardDescription>
                Enter your zip code to automatically detect location coordinates for weather and other location-based services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weatherLocation.city && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Location:</strong> {weatherLocation.city}, {weatherLocation.country}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {weatherLocation.lat.toFixed(4)}, {weatherLocation.lon.toFixed(4)}
                  </p>
                  {weatherLocation.zip && (
                    <p className="text-xs text-muted-foreground">ZIP: {weatherLocation.zip}</p>
                  )}
                </div>
              )}
              <div className="space-y-4">
                <h4 className="font-medium">Manual Coordinates (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip-lat">Latitude</Label>
                    <Input
                      id="zip-lat"
                      type="number"
                      step="any"
                      placeholder="e.g., 37.7749"
                      value={weatherLocation.lat || ""}
                      onChange={(e) => setWeatherLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip-lon">Longitude</Label>
                    <Input
                      id="zip-lon"
                      type="number"
                      step="any"
                      placeholder="e.g., -122.4194"
                      value={weatherLocation.lon || ""}
                      onChange={(e) => setWeatherLocation(prev => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4">
                <div>
                  <Label htmlFor="weather-zip">5-Digit ZIP Code</Label>
                  <Input
                    id="weather-zip"
                    placeholder="90210"
                    maxLength={5}
                    value={weatherLocation.zip || ""}
                    onChange={(e) => setWeatherLocation(prev => ({ ...prev, zip: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    onClick={async () => {
                      const zip = weatherLocation.zip?.trim();
                      if (!zip || zip.length !== 5) {
                        toast.error("Enter a valid 5-digit ZIP code");
                        return;
                      }
                      toast.loading("Looking up ZIP code...");
                      try {
                        const response = await fetch(`/api/zip-lookup?zip=${zip}`);
                        if (!response.ok) {
                          throw new Error("ZIP lookup failed");
                        }
                        const data = await response.json();
                        if (data.error) {
                          throw new Error(data.error);
                        }
                        setWeatherLocation(prev => ({ 
                          ...prev, 
                          lat: data.latitude, 
                          lon: data.longitude, 
                          city: data.city, 
                          country: data.country,
                          zip: data.zip
                        }));
                        toast.success(`Location set via ZIP: ${data.city}, ${data.country}`);
                      } catch (error) {
                        console.error("ZIP lookup error:", error);
                        toast.error("ZIP lookup failed");
                        // Fallback to Jacksonville if ZIP is 32225
                        if (zip === '32225') {
                          setWeatherLocation(prev => ({ 
                            ...prev, 
                            lat: 30.3322, 
                            lon: -81.6557, 
                            city: "Jacksonville", 
                            country: "US",
                            zip: '32225'
                          }));
                          toast.success("Using fallback coordinates for Jacksonville, FL");
                        }
                      }
                    }}
                    disabled={!weatherLocation.zip || weatherLocation.zip.length !== 5}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Lookup by ZIP Code
                  </Button>
                </div>
              </div>
              <div className="space-y-4 mt-4 pt-4 border-t border-border">
                <h4 className="font-medium">Gas Station Preferences</h4>
                <div className="space-y-2">
                  <Label>Default Fuel Type</Label>
                  <Select value={defaultFuelType} onValueChange={setDefaultFuelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose your preferred gas type for searches in the dashboard.</p>
                </div>
                <Button
                  onClick={handleSaveWeatherSettingsWithFuel}
                  disabled={isSavingSettings || !weatherLocation.lat || !weatherLocation.lon}
                  className="w-full"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Location & Gas Preferences
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setWeatherLocation({
                          lat: position.coords.latitude,
                          lon: position.coords.longitude,
                          city: '',
                          country: '',
                          zip: ''
                        });
                        toast.success("Location detected!");
                      },
                      (error) => toast.error("Location detection failed")
                    );
                  }
                }}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Detect My Location
              </Button>
              <Button
                onClick={handleSaveWeatherSettingsWithFuel}
                disabled={isSavingSettings || !weatherLocation.lat || !weatherLocation.lon}
                className="w-full"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Location Settings
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                <p><strong>Zip Code Last Backup Last saved file:</strong> {lastSaves.zipcode ? formatDate(lastSaves.zipcode) : 'Never'}</p>
              </div>
            </CardContent>
          </Card>

          <GasStations className="min-h-[300px]" defaultFuelType={defaultFuelType} initialZip={weatherLocation.zip || '32277'} />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Configure database features, backup paths, and optimize settings. View and manage your Turso database console.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sidebar-like navigation for console sections */}
              <div className="flex gap-4">
                <div className="w-1/4 space-y-2 bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-sm">Console Tools</h4>
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start w-full text-left" 
                      onClick={() => setIsSQLModalOpen(true)}
                    >
                      <Database className="h-3 w-3 mr-2" />
                      SQL Console
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start w-full text-left" 
                      onClick={() => setIsDrizzleModalOpen(true)}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Drizzle Runner
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start w-full text-left" 
                      onClick={() => setIsStudioModalOpen(true)}
                    >
                      <Settings2 className="h-3 w-3 mr-2" />
                      Database Studio
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <Input 
                      placeholder="Search tables..." 
                      className="text-xs" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Main console area with tables and features */}
                <div className="w-3/4 space-y-6">
                  {/* Database Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Database Information</h4>
                    {isLoadingBackup ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p><strong>Current Size:</strong> {dbSize.toFixed(2)} MB</p>
                        <p><strong>Last Backup:</strong> {lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={fetchBackupData} disabled={isLoadingBackup} variant="outline" size="sm">
                        {isLoadingBackup ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Refresh'}
                      </Button>
                      <Button onClick={handleExport} disabled={isLoadingBackup}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Backup
                      </Button>
                    </div>
                  </div>

                  {/* Import Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Import Backup</h4>
                    <div className="space-y-2">
                      <Label htmlFor="backup-file">Choose backup file</Label>
                      <Input
                        id="backup-file"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                    </div>
                    <Button
                      onClick={handleImport}
                      disabled={!file || isImporting}
                      className="w-full"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import from File
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Database Features */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Database Features</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Auto-Backup Enabled</Label>
                        <Select value={databaseSettings.autoBackup ? 'yes' : 'no'} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, autoBackup: value === 'yes' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Query Logging</Label>
                        <Select value={databaseSettings.queryLogging ? 'yes' : 'no'} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, queryLogging: value === 'yes' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Schema Validation</Label>
                        <Select value={databaseSettings.schemaValidation ? 'yes' : 'no'} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, schemaValidation: value === 'yes' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Performance Monitoring</Label>
                        <Select value={databaseSettings.performanceMonitoring ? 'yes' : 'no'} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, performanceMonitoring: value === 'yes' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={saveDatabaseFeatures} className="w-full">Save Database Features</Button>
                  </div>

                  {/* Path to Archives */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Backup Archives Path</h4>
                    <div className="space-y-2">
                      <Label>Local Path for Exports</Label>
                      <Input 
                        placeholder="/path/to/backups" 
                        value={databaseSettings.localPath}
                        onChange={(e) => setDatabaseSettings(prev => ({ ...prev, localPath: e.target.value }))}
                      />
                      <p className="text-sm text-muted-foreground">Specify a directory for automatic backup archives. Defaults to app data folder.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Cloud Sync Path (Optional)</Label>
                      <Input 
                        placeholder="gs://your-bucket/backups" 
                        value={databaseSettings.cloudPath || ''}
                        onChange={(e) => setDatabaseSettings(prev => ({ ...prev, cloudPath: e.target.value }))}
                      />
                      <p className="text-sm text-muted-foreground">Integrate with cloud storage for remote backups (e.g., Google Cloud, S3).</p>
                    </div>
                    <Button variant="outline" className="w-full" disabled>Browse Directory</Button>
                    <Button onClick={saveDatabasePaths} className="w-full">Save Paths</Button>
                  </div>

                  {/* Best Options Presets */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Best Options (Presets)</h4>
                    <div className="space-y-2">
                      <Label>Optimization Preset</Label>
                      <Select value={databaseSettings.preset} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, preset: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">High Performance</SelectItem>
                          <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                          <SelectItem value="storage">Storage Efficient</SelectItem>
                          <SelectItem value="secure">Maximum Security</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Balanced: Optimal for most smart home setups with reliable backups and moderate logging. 
                        High Performance: Faster queries, less logging. Storage Efficient: Minimal storage use.
                      </p>
                    </div>
                    <Button onClick={applyPreset} className="w-full">Apply Preset</Button>
                  </div>

                  {/* Dynamic Tables List */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center justify-between">
                      Tables <Badge variant="secondary">{tables.length} tables</Badge>
                    </h4>
                    <div className="space-y-2">
                      {filteredTables.map((table) => (
                        <div key={table.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📊</span>
                            <div>
                              <p className="font-medium">{table.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {table.rowCount} rows, {table.columnCount} columns
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedTable(table.name);
                              fetchTableSchema(table.name);
                              setIsSchemaModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                      {isLoadingTables && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading tables...
                        </div>
                      )}
                      {tables.length === 0 && !isLoadingTables && (
                        <p className="text-sm text-muted-foreground text-center py-4">No tables found</p>
                      )}
                    </div>
                    <div className="pt-4 border-t text-xs text-muted-foreground">
                      <p><strong>Database Last saved:</strong> {lastSaves.database ? formatDate(lastSaves.database) : 'Never'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SQL Console Modal */}
              {isSQLModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">SQL Console</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsSQLModalOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>SQL Query (SELECT only)</Label>
                        <Textarea
                          value={sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          placeholder="Enter your SELECT query here..."
                          className="min-h-[200px] font-mono"
                        />
                      </div>
                      <Button 
                        onClick={executeSQLQuery} 
                        disabled={isExecutingSQL || !sqlQuery.trim()}
                        className="w-full"
                      >
                        {isExecutingSQL ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          'Execute Query'
                        )}
                      </Button>
                      {sqlResults && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Results ({sqlResults.rowCount} rows)</h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                {Object.keys(sqlResults.results[0] || {}).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableHeader>
                              <TableBody>
                                {sqlResults.results.map((row, index) => (
                                  <TableRow key={index}>
                                    {Object.values(row).map((value, i) => (
                                      <TableCell key={i}>{value}</TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                      {sqlError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <p>{sqlError}</p>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Drizzle Runner Modal */}
              {isDrizzleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Drizzle Runner</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsDrizzleModalOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {isLoadingMigrations ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading migrations...
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Pending: {migrations.filter(m => m.status === 'pending').length} | Applied: {migrations.filter(m => m.status === 'applied').length}
                            </p>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {migrations.map((migration) => (
                              <div key={migration.id} className="flex items-center justify-between p-3 bg-muted rounded">
                                <span className="font-medium">{migration.name}</span>
                                <Badge variant={migration.status === 'applied' ? 'default' : 'secondary'}>
                                  {migration.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={runAllMigrations} 
                              disabled={isRunningMigrations || pendingMigrations.length === 0}
                              className="flex-1"
                              variant="outline"
                            >
                              {isRunningMigrations ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Running All...
                                </>
                              ) : (
                                `Run All Pending (${pendingMigrations.length})`
                              )}
                            </Button>
                            <Button 
                              onClick={() => setIsDrizzleModalOpen(false)} 
                              variant="outline"
                            >
                              Close
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Database Studio Modal */}
              {isStudioModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Database Studio</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsStudioModalOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {isLoadingStudioTables ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading tables...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Input 
                            placeholder="Search in studio..." 
                            value={studioSearchTerm}
                            onChange={(e) => setStudioSearchTerm(e.target.value)}
                            className="w-full"
                          />
                          <div className="grid gap-2">
                            {studioFilteredTables.map((table) => (
                              <Button 
                                key={table.name} 
                                variant="outline" 
                                className="justify-start" 
                                onClick={() => {
                                  setSelectedTable(table.name);
                                  fetchTableSchema(table.name);
                                  setIsSchemaModalOpen(true);
                                }}
                              >
                                <Database className="h-4 w-4 mr-2" />
                                {table.name} ({table.rowCount} rows)
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Table Schema Modal */}
              {isSchemaModalOpen && selectedTable && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-background rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Table: {selectedTable}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setIsSchemaModalOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {isLoadingSchema ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading schema...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Column</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Null</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Default</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableSchema.map((col) => (
                                <TableRow key={col.name}>
                                  <TableCell>{col.name}</TableCell>
                                  <TableCell>{col.type}</TableCell>
                                  <TableCell>{col.nullable ? 'Yes' : 'No'}</TableCell>
                                  <TableCell>{col.primaryKey ? 'PRI' : ''}</TableCell>
                                  <TableCell>{col.defaultValue || ''}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Total rows: {tableData.pagination?.total || 0}</p>
                          <p>Preview limit: {tableData.pagination?.limit || 50}</p>
                        </div>
                        {tableData.data && tableData.data.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Data Preview</h4>
                            <div className="overflow-x-auto max-h-40 overflow-auto">
                              <Table>
                                <TableHeader>
                                  {Object.keys(tableData.data[0]).map((key) => (
                                    <TableHead key={key}>{key}</TableHead>
                                  ))}
                                </TableHeader>
                                <TableBody>
                                  {tableData.data.slice(0, 5).map((row, index) => (
                                    <TableRow key={index}>
                                      {Object.values(row).map((value, i) => (
                                        <TableCell key={i}>{String(value)}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                AI Connections (MCP)
              </CardTitle>
              <CardDescription>
                Configure Model Context Protocol integration for AI automation with Home Assistant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Home Assistant MCP Server</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mcp-url">Home Assistant URL</Label>
                    <Input
                      id="mcp-url"
                      type="url"
                      placeholder="http://homeassistant.local:8123"
                      value={mcpUrl}
                      onChange={(e) => setMcpUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mcp-token">Long-Lived Access Token</Label>
                    <Input
                      id="mcp-token"
                      type="password"
                      placeholder="Your HA long-lived access token"
                      value={mcpToken}
                      onChange={(e) => setMcpToken(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={testMcpConnection}
                    disabled={isLoadingMcp || !mcpUrl || !mcpToken}
                    className="w-full"
                  >
                    {isLoadingMcp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Test MCP Connection
                      </>
                    )}
                  </Button>
                  {isMcpConnected && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Connected Successfully!</p>
                        <p className="text-sm text-green-700">
                          Exposed Entities: {exposedEntities.length} available for AI control.
                        </p>
                        {exposedEntities.length > 0 && (
                          <ul className="mt-1 text-xs text-green-600">
                            {exposedEntities.slice(0, 5).map((entity, i) => (
                              <li key={i}>{entity.entity_id}</li>
                            ))}
                            {exposedEntities.length > 5 && <li>...</li>}
                          </ul>
                        )}
                      </div>
                    </Alert>
                  )}
                  {!isMcpConnected && mcpUrl && mcpToken && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm">Connection not established. Check URL and token.</p>
                    </Alert>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Once connected, AI agents (like Claude Desktop) can query and control your Home Assistant entities via MCP.</p>
                  <p className="mt-1">See <a href="https://www.home-assistant.io/integrations/mcp_server/" target="_blank" className="text-primary hover:underline">Home Assistant MCP Docs</a> for setup.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => saveMcpSettings(true)}
                    disabled={isSavingMcp || !mcpUrl || !mcpToken}
                    className="flex-1"
                  >
                    {isSavingMcp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save MCP Settings
                      </>
                    )}
                  </Button>
                  {isMcpConnected && (
                    <Button
                      variant="outline"
                      onClick={testMcpConnection}
                      disabled={isLoadingMcp}
                      className="flex-1"
                    >
                      {isLoadingMcp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Re-test
                        </>
                      ) : (
                        'Re-test Connection'
                      )}
                    </Button>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <p><strong>MCP Last saved:</strong> {lastSaves.mcp ? formatDate(lastSaves.mcp) : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;