"use client"

import { useEffect, useState } from 'react';
import { DashboardProvider } from '@/context/DashboardContext'
import { MainContent } from '@/components/dashboard/MainContent'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useScreenSize } from '@/hooks/useScreenSize';
import { useAudioLevels } from '@/hooks/useAudioLevels';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audioLevels = useAudioLevels();
  const screenSize = useScreenSize();

  useEffect(() => {
    setSidebarOpen(screenSize === 'desktop');
  }, [screenSize]);

  // New useEffect to load and apply appearance settings
  useEffect(() => {
    const loadAppearanceSettings = async () => {
      try {
        const response = await fetch('/api/appearance-settings');
        if (response.ok) {
          const settings = await response.json();
          const root = document.documentElement;
          root.style.setProperty('--background', settings.backgroundColor || 'rgb(92, 113, 132)');
          root.style.setProperty('--primary', settings.primaryColor || '#3b82f6');
          root.style.setProperty('--muted-foreground', settings.cardPlaceholderColor || '#9ca3af');
          root.style.setProperty('--secondary-foreground', settings.cardPlaceholderColor || '#9ca3af');
          root.style.setProperty('--sidebar', settings.navbarBackgroundColor || '#f8fafc');
          // Calculate primary-foreground based on luminance
          const hexToRgb = (hex) => {
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
            }
            return { r, g, b };
          };
          const getLuminance = (hex) => {
            const rgb = hexToRgb(hex);
            const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c => {
              if (c <= 0.03928) return c / 12.92;
              return Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const primaryColor = settings.primaryColor || '#3b82f6';
          const luminance = getLuminance(primaryColor);
          root.style.setProperty('--primary-foreground', luminance < 0.5 ? '#ffffff' : '#000000');
        }
      } catch (error) {
        console.error('Failed to load appearance settings:', error);
      }
    };

    loadAppearanceSettings();
  }, []);

  return (
    <DashboardProvider>
      <main className="min-h-screen bg-background flex relative">
        {/* Mobile Overlay */}
        {(screenSize !== 'desktop') && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          audioLevels={audioLevels}
          screenSize={screenSize}
        />
        
        <div className="flex-1">
          <MainContent setSidebarOpen={setSidebarOpen} />
        </div>
      </main>
    </DashboardProvider>
  )
}