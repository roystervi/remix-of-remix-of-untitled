"use client"

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  handleStop: () => void;
  setVolume: (vol: number) => void;
  handleProgressChange: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      return () => {
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const value = {
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    handleStop,
    setVolume,
    handleProgressChange,
  };

  return (
    <AudioContext.Provider value={value}>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop preload="metadata" />
      {children}
    </AudioContext.Provider>
  );
};