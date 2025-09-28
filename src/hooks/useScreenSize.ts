import { useEffect, useState } from 'react';

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setScreenSize('desktop');
      else if (width >= 768) setScreenSize('tablet');
      else setScreenSize('mobile');
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return screenSize;
};