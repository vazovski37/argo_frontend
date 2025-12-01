"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseGeminiLiveOptions {
  apiKey: string;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions) {
  const { apiKey, onMessage, onError, onStatusChange } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // For capturing audio
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio Playback Refs
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!apiKey || isConnecting || isConnected) return;

    setIsConnecting(true);
    onStatusChange?.("Requesting camera and microphone access...");

    try {
      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Ideal for speech
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      mediaStreamRef.current = stream;
      setMediaStream(stream);

      onStatusChange?.("Connecting to Gemini...");

      // Connect via WebSocket
      const model = "gemini-2.5-flash-native-audio-preview-09-2025";
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        onStatusChange?.("Configuring session...");

        const setupMessage = {
          setup: {
            model: `models/${model}`,
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: "Aoede",
                  },
                },
              },
            },
            system_instruction: {
              parts: [
                {
                  text: "You are a helpful, friendly AI assistant. Respond naturally in conversation. Keep responses concise but informative.",
                },
              ],
            },
          },
        };

        ws.send(JSON.stringify(setupMessage));
      };

      let setupDone = false;

      ws.onmessage = async (event) => {
        try {
          // Handle binary data (audio)
          if (event.data instanceof Blob) {
            const arrayBuffer = await event.data.arrayBuffer();
            
            // Fix byte length alignment
            let byteLength = arrayBuffer.byteLength;
            if (byteLength % 2 !== 0) {
              byteLength = byteLength - 1;
            }
            
            if (byteLength < 2) return;

            // If setup wasn't marked complete yet, do it now
            if (!setupDone) {
              setupDone = true;
              setIsConnected(true);
              setIsConnecting(false);
              onStatusChange?.("Connected!");
              startAudioCapture(stream);
            }

            // Convert to base64 to reuse existing playback logic
            const int16Array = new Int16Array(arrayBuffer.slice(0, byteLength));
            const uint8Array = new Uint8Array(int16Array.buffer);
            let binary = "";
            for (let i = 0; i < uint8Array.length; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64Audio = btoa(binary);

            playAudioChunk(base64Audio);
            return;
          }

          // Handle JSON data
          const data = JSON.parse(event.data);
          
          if (data.setupComplete || data.setup_complete) {
            if (!setupDone) {
              setupDone = true;
              setIsConnected(true);
              setIsConnecting(false);
              onStatusChange?.("Connected!");
              startAudioCapture(stream);
            }
            return;
          }

          const serverContent = data.serverContent || data.server_content;
          if (serverContent) {
            const modelTurn = serverContent.modelTurn || serverContent.model_turn;

            if (modelTurn?.parts) {
              for (const part of modelTurn.parts) {
                if (part.text) {
                  const newMessage: Message = {
                    id: Date.now().toString() + Math.random(),
                    role: "assistant",
                    content: part.text,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, newMessage]);
                  onMessage?.(newMessage);
                }

                const inlineData = part.inlineData || part.inline_data;
                if (inlineData) {
                  const mimeType = inlineData.mimeType || inlineData.mime_type;
                  if (mimeType?.startsWith("audio/")) {
                    playAudioChunk(inlineData.data);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error handling message:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(new Error("Connection error"));
        cleanup();
      };

      ws.onclose = () => {
        if (isConnected) onStatusChange?.("Disconnected");
        cleanup();
      };
    } catch (error) {
      onError?.(error as Error);
      cleanup();
    }
  }, [apiKey, isConnecting, isConnected, onError, onStatusChange, onMessage]);

  const startAudioCapture = useCallback((stream: MediaStream) => {
    try {
      // Input context MUST be 16kHz for Gemini
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isMuted) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        const uint8Array = new Uint8Array(int16Array.buffer);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Audio = btoa(binary);

        const audioMessage = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: "audio/pcm;rate=16000",
                data: base64Audio,
              },
            ],
          },
        };

        wsRef.current.send(JSON.stringify(audioMessage));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (error) {
      onError?.(error as Error);
    }
  }, [isMuted, onError]);

  // Optimized Audio Playback with Seamless Scheduling
  const playAudioChunk = useCallback((base64Audio: string) => {
    try {
      // 1. Init AudioContext with default system options (prevents pitch distortion)
      if (!playbackContextRef.current || playbackContextRef.current.state === "closed") {
        playbackContextRef.current = new AudioContext();
      }
      const audioContext = playbackContextRef.current;

      // Resume context if browser suspended it (autoplay policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      // 2. Decode Base64
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);

      // 3. Convert Int16 -> Float32
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      // 4. Create Buffer - Mark as 24kHz (Gemini Native Rate)
      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      // 5. Schedule Playback
      const currentTime = audioContext.currentTime;
      
      // If our scheduled time is behind current time (latency/gap), reset to now
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Play immediately at the specific scheduled time
      source.start(nextPlayTimeRef.current);

      // Advance time for next chunk
      nextPlayTimeRef.current += audioBuffer.duration;

    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, []);

  const sendVideoFrame = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !isVideoEnabled) {
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

          const videoMessage = {
            realtime_input: {
              media_chunks: [
                {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              ],
            },
          };

          wsRef.current.send(JSON.stringify(videoMessage));
        }
      } catch (error) {
        console.error("Error sending video frame:", error);
      }
    },
    [isVideoEnabled]
  );

  const sendTextMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const textMessage = {
        client_content: {
          turns: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          turn_complete: true,
        },
      };

      wsRef.current.send(JSON.stringify(textMessage));
    },
    []
  );

  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setMediaStream(null);
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current?.state !== "closed") {
      playbackContextRef.current?.close();
      playbackContextRef.current = null;
    }

    nextPlayTimeRef.current = 0;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cleanup();
    setMessages([]);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !newMuted;
        });
      }
      return newMuted;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((prev) => {
      const newEnabled = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = newEnabled;
        });
      }
      return newEnabled;
    });
  }, []);

  return {
    isConnected,
    isConnecting,
    isMuted,
    isVideoEnabled,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendTextMessage,
    sendVideoFrame,
    toggleMute,
    toggleVideo,
  };
}