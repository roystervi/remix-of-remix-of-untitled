"use client"

import React from 'react';
import { Mic, MicOff, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useJavis } from '@/hooks/useJavis';

export const JavisAssistant = () => {
  const {
    isListening,
    isActive,
    transcript,
    isProcessing,
    error,
    startListening,
    stopListening,
    isSupported,
  } = useJavis();

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Floating Mic Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        size="icon"
        variant={isActive || isProcessing ? 'default' : 'outline'}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg border-2',
          isListening && 'border-primary bg-primary/10 animate-pulse',
          isActive && 'bg-primary scale-110',
          error && 'border-destructive bg-destructive/10'
        )}
        disabled={isProcessing}
      >
        {isListening ? (
          isActive || isProcessing ? <Volume2 className="h-5 w-5" /> : <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      {/* Transcript Bubble - Shows during active/processing */}
      {(isActive || isProcessing || transcript) && (
        <div className={cn(
          'max-w-[280px] p-3 rounded-2xl shadow-md',
          isActive ? 'bg-primary/10 border border-primary/20' :
          isProcessing ? 'bg-blue-50 border border-blue-200' :
          'bg-muted/80 backdrop-blur-sm'
        )}>
          {isActive && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="text-xs font-medium text-primary">Listening for command...</span>
            </div>
          )}
          {transcript && (
            <p className="text-sm break-words">{transcript}</p>
          )}
          {error && (
            <p className="text-xs text-destructive mt-1">Error: {error}</p>
          )}
        </div>
      )}
    </div>
  );
};