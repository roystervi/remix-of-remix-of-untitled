"use client"

import { useEffect, useState } from 'react';

interface AppearanceSettings {
  mode: 'auto' | 'manual';
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'tv';
  width: number;
  height: number;
  backgroundColor: string;
  primaryColor?: string;
}

export function AppearanceWrapper({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);

  // Add hexToRgb and getLuminance functions here
  const hexToRgb = (hex: string) => {
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
  };

  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c => {
      if (c <= 0.03928) return c / 12.92;
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  useEffect(() => {
    fetch('/api/appearance-settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
      })
      .catch(error => console.error('Failed to load appearance settings:', error));
  }, []);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    // Apply background color
    root.style.setProperty('--background', settings.backgroundColor);
    root.style.setProperty('--card', settings.backgroundColor);
    root.style.setProperty('--primary', settings.primaryColor || '#3b82f6');
    // Apply primary-foreground based on luminance
    const luminance = getLuminance(settings.primaryColor || '#3b82f6');
    root.style.setProperty('--primary-foreground', luminance < 0.5 ? '#ffffff' : '#000000');

    // Apply screen class
    root.className = `screen-${settings.screenSize}`;

    // Apply manual mode simulation
    if (settings.mode === 'manual') {
      document.body.style.maxWidth = `${settings.width}px`;
      document.body.style.margin = '0 auto';
      document.body.style.overflowX = 'auto';
    } else {
      document.body.style.maxWidth = '';
      document.body.style.margin = '';
      document.body.style.overflowX = '';
    }

    // Cleanup on unmount
    return () => {
      root.style.setProperty('--background', '');
      root.style.setProperty('--card', '');
      root.style.setProperty('--primary', '');
      root.style.setProperty('--primary-foreground', '');
      root.className = '';
      document.body.style.maxWidth = '';
      document.body.style.margin = '';
      document.body.style.overflowX = '';
    };
  }, [settings]);

  return <>{children}</>;
}