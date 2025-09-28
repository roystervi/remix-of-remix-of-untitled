"use client"

import { useState, useEffect } from 'react';

export type AudioLevels = number[]; // Array of normalized audio levels (0-1)

export function useAudioLevels(): AudioLevels {
  const [audioLevels, setAudioLevels] = useState<AudioLevels>([0, 0, 0, 0, 0]);

  useEffect(() => {
    // Simulate real-time audio visualization with mock data
    const simulateAudio = () => {
      const newLevels = Array.from({ length: 5 }, () => Math.random());
      setAudioLevels(newLevels);
    };

    // Update every 100ms for smooth visualization
    const interval = setInterval(simulateAudio, 100);

    return () => clearInterval(interval);
  }, []);

  return audioLevels;
}