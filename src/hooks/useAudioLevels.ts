import { useEffect, useState } from 'react';
import { generateAudioLevels } from '@/lib/dashboard-utils';

export const useAudioLevels = () => {
  const [audioLevels, setAudioLevels] = useState([25, 45, 35, 55, 65]); // Fixed initial levels for hydration consistency

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevels(generateAudioLevels());
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return audioLevels;
};