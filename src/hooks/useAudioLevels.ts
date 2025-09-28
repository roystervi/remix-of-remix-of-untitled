import { useEffect, useState } from 'react';
import { generateAudioLevels } from '@/lib/dashboard-utils';

export const useAudioLevels = () => {
  const [audioLevels, setAudioLevels] = useState(generateAudioLevels()); // Fixed initial to match generated length

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevels(generateAudioLevels());
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return audioLevels;
};