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
          
          // Enhanced parsing: multiple intents
          const lowerTranscript = fullTranscript.toLowerCase();
          
          // Temperature control: "set temperature in [room] to [value]"
          const tempMatch = lowerTranscript.match(/(set temperature in (.+) to (\d+))/);
          if (tempMatch && mcpSettings) {
            const roomQuery = tempMatch[2].trim().toLowerCase();
            const targetTemp = parseInt(tempMatch[3]);
            const matchedEntity = mcpSettings.exposedEntities.find(entity => 
              entity.toLowerCase().includes(roomQuery) && entity.startsWith('climate.')
            );
            if (matchedEntity) {
              try {
                const res = await fetch('/api/ha/control', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ entity: matchedEntity, action: 'set_temperature', value: targetTemp })
                });
                if (res.ok) {
                  toast.success(`Setting ${roomQuery} temperature to ${targetTemp}°F.`);
                } else {
                  const err = await res.text();
                  toast.error(`Failed to set temperature: ${err}`);
                }
              } catch (err) {
                toast.error('Network error during command execution.');
              }
            } else {
              toast.error(`Climate entity for "${roomQuery}" not found. Check exposed devices.`);
            }
          }
          // Media control: "play/pause [media] in [room]"
          else {
            const mediaMatch = lowerTranscript.match(/(play|pause|stop) (.+) in (.+)/);
            if (mediaMatch && mcpSettings) {
              const command = mediaMatch[1];
              const mediaType = mediaMatch[2].trim().toLowerCase();
              const roomQuery = mediaMatch[3].trim().toLowerCase();
              let service = command === 'play' ? 'media_play' : command === 'pause' ? 'media_pause' : 'media_stop';
              const matchedEntity = mcpSettings.exposedEntities.find(entity => 
                entity.toLowerCase().includes(roomQuery) && entity.startsWith('media_player.')
              );
              if (matchedEntity) {
                try {
                  const res = await fetch('/api/ha/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: matchedEntity, action: service, media: mediaType || undefined })
                  });
                  if (res.ok) {
                    toast.success(`${command.charAt(0).toUpperCase() + command.slice(1)}ing ${mediaType || ''} in ${roomQuery}.`);
                  } else {
                    const err = await res.text();
                    toast.error(`Failed to control media: ${err}`);
                  }
                } catch (err) {
                  toast.error('Network error during command execution.');
                }
              } else {
                toast.error(`Media player for "${roomQuery}" not found.`);
              }
            }
            // Sensor query: "what's the [sensor] in [room]?"
            else {
              const sensorMatch = lowerTranscript.match(/what'?s (the )?(temperature|humidity|motion|light level) in (.+)\?/);
              if (sensorMatch && mcpSettings) {
                const sensorType = sensorMatch[2].toLowerCase();
                const roomQuery = sensorMatch[3].trim().toLowerCase();
                const entityPrefix = sensorType === 'temperature' ? 'sensor.' : 
                                    sensorType === 'humidity' ? 'sensor.' :
                                    sensorType === 'motion' ? 'binary_sensor.' :
                                    'sensor.';
                const matchedEntity = mcpSettings.exposedEntities.find(entity => 
                  entity.toLowerCase().includes(roomQuery) && entity.startsWith(entityPrefix) && 
                  (sensorType === 'temperature' ? entity.includes('temp') : 
                   sensorType === 'humidity' ? entity.includes('humidity') :
                   sensorType === 'motion' ? entity.includes('motion') :
                   entity.includes('illuminance'))
                );
                if (matchedEntity) {
                  try {
                    const res = await fetch('/api/ha/control', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ entity: matchedEntity, action: 'get_state' })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      toast.success(`${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} in ${roomQuery}: ${data.state}${data.attributes?.unit_of_measurement || ''}.`);
                    } else {
                      const err = await res.text();
                      toast.error(`Failed to get ${sensorType}: ${err}`);
                    }
                  } catch (err) {
                    toast.error('Network error during query.');
                  }
                } else {
                  toast.error(`Sensor for "${sensorType}" in "${roomQuery}" not found.`);
                }
              }
              // Scene activation: "activate [scene]"
              else {
                const sceneMatch = lowerTranscript.match(/activate (.+) mode/);
                if (sceneMatch && mcpSettings) {
                  const sceneQuery = sceneMatch[1].trim().toLowerCase();
                  const matchedEntity = mcpSettings.exposedEntities.find(entity => 
                    entity.toLowerCase().includes(sceneQuery) && entity.startsWith('scene.')
                  );
                  if (matchedEntity) {
                    try {
                      const res = await fetch('/api/ha/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entity: matchedEntity, action: 'turn_on' })
                      });
                      if (res.ok) {
                        toast.success(`Activating ${sceneQuery} mode.`);
                      } else {
                        const err = await res.text();
                        toast.error(`Failed to activate scene: ${err}`);
                      }
                    } catch (err) {
                      toast.error('Network error during activation.');
                    }
                  } else {
                    toast.error(`Scene "${sceneQuery}" not found.`);
                  }
                }
                // Fallback to basic on/off
                else {
                  const match = lowerTranscript.match(/(turn (on|off) (.+))/);
                  if (match && mcpSettings) {
                    const action = match[2] === 'on' ? 'turn_on' : 'turn_off';
                    const entityQuery = match[3].trim().toLowerCase();
                    
                    // Find matching entity from exposed (prioritize lights/switches)
                    const matchedEntity = mcpSettings.exposedEntities.find(entity => 
                      entity.toLowerCase().includes(entityQuery) && 
                      (entity.startsWith('light.') || entity.startsWith('switch.'))
                    );
                    
                    if (matchedEntity) {
                      try {
                        // Call HA API
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
                    toast.error(`I didn't understand: "${fullTranscript}". Try "turn on den light" or "set temperature in den to 72".`);
                  }
                }
              }
            }
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