"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface MCPSettings {
  url: string;
  token: string;
  connected: boolean;
  exposedEntities: string[];
}

interface JavisState {
  isListening: boolean;
  isActive: boolean; // After wake word
  transcript: string;
  isProcessing: boolean;
  error: string | null;
}

export const useJavis = () => {
  const [state, setState] = useState<JavisState>({
    isListening: false,
    isActive: false,
    transcript: '',
    isProcessing: false,
    error: null,
  });
  const [mcpSettings, setMcpSettings] = useState<MCPSettings | null>(null);
  const recognitionRef = useRef<SpeechRecognition | webkitSpeechRecognition | null>(null);
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }

    try {
      // Request mic permission if needed
      const permission = await navigator.permissions.query?.({ name: 'microphone' as PermissionName });
      if (permission?.state === 'denied') {
        toast.error('Microphone access denied. Please enable in browser settings.');
        return;
      }

      // Fetch MCP settings
      const mcpRes = await fetch('/api/mcp-settings');
      if (mcpRes.ok) {
        const settings = await mcpRes.json();
        setMcpSettings(settings as MCPSettings);
        if (!settings.connected) {
          toast.error('MCP not connected. Set up in Settings first.');
          return;
        }
      } else {
        toast.error('Failed to load MCP settings.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, isActive: false, error: null }));
        toast.success('Listening... Say "Hey Javis" to activate.');
      };

      recognition.onerror = (event) => {
        setState(prev => ({ ...prev, isListening: false, error: event.error || 'Unknown error' }));
        toast.error(`Recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false, isActive: false }));
        if (state.isActive) {
          // Restart if active
          setTimeout(() => recognition.start(), 500);
        }
      };

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        setState(prev => ({ ...prev, transcript: fullTranscript }));

        // Wake word detection
        if (!state.isActive && fullTranscript.toLowerCase().includes('hey javis')) {
          setState(prev => ({ ...prev, isActive: true }));
          toast.info('Javis activated! Give a command.');
          recognition.continuous = false; // Switch to single for command
          return;
        }

        // If active, process command
        if (state.isActive && !state.isProcessing) {
          setState(prev => ({ ...prev, isProcessing: true }));
          
          // Simple parsing: look for 'turn on/off [entity]'
          const lowerTranscript = fullTranscript.toLowerCase();
          const match = lowerTranscript.match(/(turn (on|off) (.+))/);
          if (match && mcpSettings) {
            const action = match[2] === 'on' ? 'turn_on' : 'turn_off';
            const entityQuery = match[3].trim().toLowerCase();
            
            // Find matching entity from exposed
            const matchedEntity = mcpSettings.exposedEntities.find(entity => 
              entity.toLowerCase().includes(entityQuery)
            );
            
            if (matchedEntity) {
              try {
                // Call HA API - For now, use fetch to new endpoint (to be created)
                const res = await fetch('/api/ha/control', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ entity: matchedEntity, action })
                });
                
                if (res.ok) {
                  toast.success(`Turning ${action.replace('_', ' ')} ${entityQuery}.`);
                } else {
                  const err = await res.text();
                  toast.error(`Failed to control ${entityQuery}: ${err}`);
                }
              } catch (err) {
                toast.error('Network error during command execution.');
              }
            } else {
              toast.error(`Entity "${entityQuery}" not found in your exposed devices.`);
            }
          } else {
            toast.error(\`I didn't understand: "${fullTranscript}". Try "turn on den light".\`);
          }

          // Reset
          setState(prev => ({ ...prev, isActive: false, isProcessing: false, transcript: '' }));
          recognition.continuous = true; // Back to continuous for wake word
        }
      };

      recognition.start();
    } catch (err) {
      toast.error('Failed to start listening: ' + (err as Error).message);
    }
  }, [state, mcpSettings]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState({ isListening: false, isActive: false, transcript: '', isProcessing: false, error: null });
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    isSupported,
    mcpSettings,
  };
};