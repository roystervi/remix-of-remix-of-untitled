"use client"

import { Volume2, MoreHorizontal, SkipBack, SkipForward, Pause, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer = ({ className }: MusicPlayerProps) => {
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
        setDuration(audio.duration);
      });
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
      setCurrentTime(audio.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("border-2 border-primary/30 bg-card rounded-xl p-1.5 sm:p-3 flex flex-col min-h-[250px]", className)}>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop preload="metadata" />
      
      <div className="flex items-center gap-1.5 sm:gap-2.5 mb-2">
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-green-500 rounded-lg flex items-center justify-center">
          <Volume2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
        </div>
        <MoreHorizontal className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-muted-foreground ml-auto" />
      </div>
      
      <div className="mb-2">
        <p className="text-xs sm:text-sm font-medium mb-0.5 text-foreground leading-tight">Rainy day relaxing sound</p>
        <p className="text-xs text-muted-foreground leading-tight">Currently playing</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full min-h-18 sm:min-h-30 bg-gradient-to-br from-green-600 to-green-800 rounded-lg mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-14 flex justify-center items-end gap-0.5 p-1.5">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="bg-white/30 rounded w-0.5" style={{height: `${Math.random()*80 + 20}%`}} />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <input
            type="range"
            value={currentTime}
            min={0}
            max={duration || 0}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, primary ${ (currentTime / duration) * 100 }%, muted ${ (currentTime / duration) * 100 }%)`
            }}
          />
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between gap-0.5 sm:gap-2 mt-auto mb-1.5">
          <div className="flex items-center gap-0.5 sm:gap-1.5 flex-1 min-w-0">
            <SkipBack className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0" />
            <button onClick={togglePlayPause} className="w-5 h-5 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0">
              {isPlaying ? <Pause className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary-foreground" /> : <Music className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary-foreground" />}
            </button>
            <SkipForward className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0" />
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            <Volume2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              type="range"
              value={volume * 100}
              min={0}
              max={100}
              onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
              className="w-6 sm:w-10 h-1 bg-muted rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};