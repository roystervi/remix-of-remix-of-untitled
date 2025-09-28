"use client"

import { Volume2, Menu, SkipBack, SkipForward, Pause, Music, StopCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sources = ['audio', 'video'] as const;
  const currentType = sources[currentIndex];
  const titles = ['Rainy day relaxing sound', 'Big Buck Bunny Video'];
  const subtitles = ['Currently playing audio', 'Playing video'];
  const barHeights = [25, 60, 45, 80, 35, 70];
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Volume effect
  useEffect(() => {
    [audioRef.current, videoRef.current].forEach(media => {
      if (media) media.volume = volume;
    });
  }, [volume]);

  // Switch media effect
  useEffect(() => {
    if (audioRef.current && currentType !== 'audio') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current && currentType !== 'video') {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setDuration(0);
    const currentMedia = currentType === 'audio' ? audioRef.current : videoRef.current;
    if (currentMedia && isPlaying) {
      currentMedia.play().catch(e => console.log('Play failed', e));
    }
  }, [currentType, volume, isPlaying]);

  // Audio listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (currentType === 'audio') setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      if (currentType === 'audio') setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      if (currentType === 'audio') setIsPlaying(false);
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []); // Attaches once

  // Video listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      if (currentType === 'video') setCurrentTime(video.currentTime);
    };
    const handleLoadedMetadata = () => {
      if (currentType === 'video') setDuration(video.duration || 0);
    };
    const handleEnded = () => {
      if (currentType === 'video') setIsPlaying(false);
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []); // Attaches once

  const togglePlayPause = () => {
    const mediaEl = currentType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaEl) {
      if (isPlaying) {
        mediaEl.pause();
      } else {
        mediaEl.play().catch(e => console.log('Play failed', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    const mediaEl = currentType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaEl) {
      mediaEl.pause();
      mediaEl.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mediaEl = currentType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaEl) {
      mediaEl.currentTime = parseFloat(e.target.value);
      setCurrentTime(mediaEl.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLeft = () => {
    setCurrentIndex(prev => (prev - 1 + sources.length) % sources.length);
  };

  const handleRight = () => {
    setCurrentIndex(prev => (prev + 1) % sources.length);
  };

  return (
    <div className={cn("border-2 border-primary/30 bg-card rounded-xl p-1.5 sm:p-3 flex flex-col min-h-[250px] relative", className)}>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop preload="metadata" />
      <video ref={videoRef} src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" loop preload="metadata" />
      
      <div className="flex items-center gap-1.5 sm:gap-2.5 mb-2 relative">
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-green-500 rounded-lg flex items-center justify-center">
          <Volume2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
        </div>
        <div className="flex-1 flex justify-center items-center gap-1">
          <button 
            className="w-4 h-4 sm:w-5 sm:h-5 bg-background border border-border rounded-none flex items-center justify-center hover:bg-accent hover:border-accent transition-colors cursor-pointer"
            onClick={handleLeft}
          >
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
          </button>
          <button 
            className="w-4 h-4 sm:w-5 sm:h-5 bg-background border border-border rounded-none flex items-center justify-center hover:bg-accent hover:border-accent transition-colors cursor-pointer"
            onClick={handleRight}
          >
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
          </button>
        </div>
        <Menu 
          className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
          onClick={toggleMenu}
        />
      </div>
      
      <div className="mb-2">
        <p className="text-xs sm:text-sm font-medium mb-0.5 text-foreground leading-tight">{titles[currentIndex]}</p>
        <p className="text-xs text-muted-foreground leading-tight">{subtitles[currentIndex]}</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full min-h-18 sm:min-h-30 rounded-lg mb-2 relative overflow-hidden">
          {currentType === 'audio' ? (
            <div className="h-full bg-gradient-to-br from-green-600 to-green-800 relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-14 flex justify-center items-end gap-0.5 p-1.5">
                {barHeights.map((height, i) => (
                  <div key={i} className="bg-white/30 rounded w-0.5" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              loop 
              preload="metadata" 
            />
          )}
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
            <StopCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-destructive hover:text-destructive/80 transition-colors cursor-pointer flex-shrink-0" onClick={handleStop} />
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

      {isMenuOpen && (
        <div className="absolute top-0 right-0 mt-8 mr-2 z-10 bg-card border border-border rounded-md shadow-lg py-2 w-48">
          <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md">Next Track</button>
          <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md">Previous Track</button>
          <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md">Add to Queue</button>
          <button className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md">Clear Queue</button>
          {isMenuOpen && (
            <div 
              className="fixed inset-0"
              onClick={toggleMenu}
            />
          )}
        </div>
      )}
    </div>
  );
};