"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI, Modality, Session, Type, FunctionDeclaration } from "@google/genai";
import { buildPrompt, PromptConfig } from "@/prompts";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Tool definitions for function calling
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResult {
  id: string;
  result: any;
}

export interface ToolHandlers {
  visit_location?: (args: { location_name: string }) => Promise<{ success: boolean; xp_earned: number; message: string }>;
  learn_phrase?: (args: { phrase: string; meaning: string }) => Promise<{ success: boolean; xp_earned: number; message: string }>;
  start_quest?: (args: { quest_name: string }) => Promise<{ success: boolean; message: string }>;
  complete_quest_step?: (args: { quest_name: string; step_number: number }) => Promise<{ success: boolean; xp_earned: number; message: string }>;
  get_user_progress?: () => Promise<{ level: number; xp: number; rank: string; locations_visited: number }>;
}

interface UseGeminiLiveOptions {
  apiKey: string;
  promptConfig?: PromptConfig;
  customSystemInstruction?: string;
  toolHandlers?: ToolHandlers;
  onMessage?: (message: Message) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

// Utility functions
function createBlob(pcmData: Float32Array): { data: string; mimeType: string } {
  // Convert Float32 to Int16
  const int16Array = new Int16Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Convert to base64
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: "audio/pcm;rate=16000",
  };
}

function decode(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function decodeAudioData(
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext,
  sampleRate: number,
  channels: number
): Promise<AudioBuffer> {
  // Convert ArrayBuffer (Int16) to AudioBuffer (Float32)
  const int16Array = new Int16Array(arrayBuffer);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }

  const audioBuffer = audioContext.createBuffer(channels, float32Array.length, sampleRate);
  audioBuffer.copyToChannel(float32Array, 0);
  
  return audioBuffer;
}

// Define the tools the AI can call
const GAME_TOOLS: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: "visit_location",
      description: "Record that the user has visited a specific location in Poti. Call this when the user says they visited, arrived at, are at, or checked into a location. This awards XP and updates their progress.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          location_name: {
            type: Type.STRING,
            description: "The name of the location visited (e.g., 'Poti Lighthouse', 'Argonauts Monument', 'Paliastomi Lake', 'Restaurant Kolkheti')"
          }
        },
        required: ["location_name"]
      }
    },
    {
      name: "learn_phrase",
      description: "Record that the user has learned a Georgian phrase. Call this when the user successfully repeats or acknowledges learning a Georgian phrase.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          phrase: {
            type: Type.STRING,
            description: "The Georgian phrase in Georgian script (e.g., 'გამარჯობა', 'მადლობა')"
          },
          meaning: {
            type: Type.STRING,
            description: "The English meaning of the phrase"
          }
        },
        required: ["phrase", "meaning"]
      }
    },
    {
      name: "start_quest",
      description: "Start a quest for the user. Call this when the user wants to begin a new adventure or quest.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          quest_name: {
            type: Type.STRING,
            description: "The name of the quest to start (e.g., 'The Argonaut\\'s Journey', 'Taste of Colchis')"
          }
        },
        required: ["quest_name"]
      }
    },
    {
      name: "complete_quest_step",
      description: "Mark a quest step as completed. Call this when the user has completed a specific step in their active quest.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          quest_name: {
            type: Type.STRING,
            description: "The name of the quest"
          },
          step_number: {
            type: Type.NUMBER,
            description: "The step number that was completed (1-based)"
          }
        },
        required: ["quest_name", "step_number"]
      }
    },
    {
      name: "get_user_progress",
      description: "Get the user's current game progress including level, XP, rank, and statistics. Call this when the user asks about their progress or stats.",
      parameters: {
        type: Type.OBJECT,
        properties: {}
      }
    }
  ]
};

export function useGeminiLive(options: UseGeminiLiveOptions) {
  const { apiKey, promptConfig, customSystemInstruction, toolHandlers, onMessage, onToolCall, onError, onStatusChange } = options;
  
  // Build the system prompt from modular components
  const systemPrompt = customSystemInstruction || buildPrompt(promptConfig);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Refs
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Audio refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!apiKey || isConnecting || isConnected) return;

    const connectStartTime = performance.now();
    console.log("[TIMING] 🚀 Connection process started at:", new Date().toISOString());

    setIsConnecting(true);
    onStatusChange?.("Requesting camera and microphone access...");

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support media devices. Please use a modern browser like Chrome or Firefox.");
      }

      const mediaStartTime = performance.now();
      console.log("[TIMING] 📹 Requesting media devices...");

      // First try to get both audio and video
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
        console.log("[TIMING] ✅ Got audio+video in", (performance.now() - mediaStartTime).toFixed(2), "ms");
      } catch (videoError) {
        console.warn("[TIMING] ⚠️ Video failed after", (performance.now() - mediaStartTime).toFixed(2), "ms:", videoError);
        // If video fails, try audio only
        const audioOnlyStartTime = performance.now();
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          console.log("[TIMING] ✅ Got audio-only in", (performance.now() - audioOnlyStartTime).toFixed(2), "ms");
        } catch (audioError) {
          console.error("[TIMING] ❌ Audio also failed after", (performance.now() - audioOnlyStartTime).toFixed(2), "ms:", audioError);
          throw new Error("Could not access microphone. Please check your browser permissions and make sure a microphone is connected.");
        }
      }

      mediaStreamRef.current = stream;
      setMediaStream(stream);

      console.log("[DEVICES] 🎤🎥 Media stream obtained:", {
        audioTracks: stream.getAudioTracks().map(t => ({ label: t.label, enabled: t.enabled, muted: t.muted })),
        videoTracks: stream.getVideoTracks().map(t => ({ label: t.label, enabled: t.enabled, muted: t.muted })),
      });

      onStatusChange?.("Initializing audio...");

      // Create audio contexts
      console.log("[TIMING] 🔊 Creating audio contexts...");
      const audioContextStartTime = performance.now();
      // @ts-ignore - webkitAudioContext for Safari support
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      // Initialize next start time
      nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
      console.log("[TIMING] ✅ Audio contexts created in", (performance.now() - audioContextStartTime).toFixed(2), "ms");
      console.log("[AUDIO] Input context sample rate:", inputAudioContextRef.current.sampleRate);
      console.log("[AUDIO] Output context sample rate:", outputAudioContextRef.current.sampleRate);

      onStatusChange?.("Connecting to Gemini...");

      // Initialize client
      console.log("[TIMING] 🌐 Initializing Gemini client...");
      clientRef.current = new GoogleGenAI({ apiKey });

      // Connect to live session
      const model = "gemini-2.5-flash-native-audio-preview-09-2025";
      console.log("[TIMING] 📡 Connecting to Gemini Live API with model:", model);
      const geminiConnectStartTime = performance.now();
      
      let firstResponseTime: number | null = null;
      let audioChunkCount = 0;
      let totalAudioBytes = 0;
      
      const session = await clientRef.current.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            const connectionTime = performance.now() - geminiConnectStartTime;
            console.log("[TIMING] ✅ Session opened! Connection took", connectionTime.toFixed(2), "ms");
            console.log("[TIMING] 📊 Total connect time:", (performance.now() - connectStartTime).toFixed(2), "ms");
            onStatusChange?.("Connected!");
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture(stream);
          },
          onmessage: async (message: any) => {
            const receiveTime = performance.now();
            
            // Handle audio response
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (audio && outputAudioContextRef.current) {
              audioChunkCount++;
              const audioBytes = audio.data ? Math.ceil(audio.data.length * 0.75) : 0; // Base64 to bytes estimate
              totalAudioBytes += audioBytes;
              
              if (firstResponseTime === null) {
                firstResponseTime = receiveTime;
                console.log("[TIMING] 🎵 First audio response received!");
                console.log("[TIMING] Time since connect:", (receiveTime - geminiConnectStartTime).toFixed(2), "ms");
              }
              
              console.log(`[AUDIO] 📥 Chunk #${audioChunkCount} received | Size: ${audioBytes} bytes | Total: ${totalAudioBytes} bytes`);
              
              const outputCtx = outputAudioContextRef.current;
              
              // Ensure we don't fall behind
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime
              );

              try {
                const decodeStartTime = performance.now();
                const audioBuffer = await decodeAudioData(
                  decode(audio.data),
                  outputCtx,
                  24000,
                  1
                );
                console.log(`[AUDIO] 🔄 Decoded in ${(performance.now() - decodeStartTime).toFixed(2)}ms | Duration: ${audioBuffer.duration.toFixed(3)}s`);

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                
                source.addEventListener("ended", () => {
                  sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                console.log(`[AUDIO] ▶️ Playing at: ${nextStartTimeRef.current.toFixed(3)}s | Context time: ${outputCtx.currentTime.toFixed(3)}s`);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (e) {
                console.error("[AUDIO] ❌ Error playing audio:", e);
              }
            }

            // Handle text response
            const text = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (text) {
              console.log("[MESSAGE] 💬 Text response received:", text.substring(0, 100) + (text.length > 100 ? "..." : ""));
              const newMessage: Message = {
                id: Date.now().toString() + Math.random(),
                role: "assistant",
                content: text,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, newMessage]);
              onMessage?.(newMessage);
            }

            // Handle function/tool calls
            const toolCallPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.functionCall);
            if (toolCallPart?.functionCall && toolHandlers) {
              const { name, args } = toolCallPart.functionCall;
              console.log("[TOOL] 🔧 Function call received:", name, args);
              
              const toolCall: ToolCall = {
                id: Date.now().toString(),
                name,
                args: args || {},
              };
              onToolCall?.(toolCall);

              // Execute the tool handler
              let result: any = { success: false, message: "Tool not implemented" };
              
              try {
                switch (name) {
                  case "visit_location":
                    if (toolHandlers.visit_location) {
                      result = await toolHandlers.visit_location(args);
                    }
                    break;
                  case "learn_phrase":
                    if (toolHandlers.learn_phrase) {
                      result = await toolHandlers.learn_phrase(args);
                    }
                    break;
                  case "start_quest":
                    if (toolHandlers.start_quest) {
                      result = await toolHandlers.start_quest(args);
                    }
                    break;
                  case "complete_quest_step":
                    if (toolHandlers.complete_quest_step) {
                      result = await toolHandlers.complete_quest_step(args);
                    }
                    break;
                  case "get_user_progress":
                    if (toolHandlers.get_user_progress) {
                      result = await toolHandlers.get_user_progress();
                    }
                    break;
                }
                console.log("[TOOL] ✅ Function result:", result);
              } catch (err) {
                console.error("[TOOL] ❌ Function error:", err);
                result = { success: false, message: "Error executing function" };
              }

              // Send the tool response back to the AI
              if (sessionRef.current) {
                sessionRef.current.sendToolResponse({
                  functionResponses: [{
                    id: toolCallPart.functionCall.id || toolCall.id,
                    name: name,
                    response: result,
                  }],
                });
                console.log("[TOOL] 📤 Sent tool response to AI");
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              console.log("[EVENT] ⚡ Interrupted! Stopping all audio playback.");
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
            
            // Handle turn complete
            if (message.serverContent?.turnComplete) {
              console.log("[EVENT] ✅ Turn complete | Total audio chunks:", audioChunkCount, "| Total bytes:", totalAudioBytes);
            }
          },
          onerror: (e: any) => {
            console.error("[ERROR] ❌ Session error:", e);
            onError?.(new Error(e.message || "Connection error"));
            cleanup();
          },
          onclose: (e: any) => {
            console.log("[EVENT] 🔌 Session closed:", e?.reason || "No reason provided");
            console.log("[STATS] 📊 Session stats - Audio chunks received:", audioChunkCount, "| Total bytes:", totalAudioBytes);
            if (isConnected) {
              onStatusChange?.("Disconnected");
            }
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" },
            },
          },
          systemInstruction: systemPrompt,
          tools: toolHandlers ? [GAME_TOOLS] : undefined,
        },
      });

      sessionRef.current = session;
      console.log("[TIMING] ✅ Session reference stored");

    } catch (error) {
      console.error("Failed to connect:", error);
      onError?.(error as Error);
      cleanup();
    }
  }, [apiKey, isConnecting, isConnected, onError, onStatusChange, onMessage]);

  const startAudioCapture = useCallback((stream: MediaStream) => {
    if (!inputAudioContextRef.current || !sessionRef.current) return;

    console.log("[CAPTURE] 🎤 Starting audio capture...");
    
    // Check audio track status
    const audioTracks = stream.getAudioTracks();
    console.log("[CAPTURE] Audio tracks:", audioTracks.length);
    audioTracks.forEach((track, i) => {
      console.log(`[CAPTURE] Track ${i}: label="${track.label}", enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
    });
    
    if (audioTracks.length === 0) {
      console.error("[CAPTURE] ❌ No audio tracks in stream!");
      return;
    }

    let audioChunksSent = 0;
    let totalBytesSent = 0;
    let lastLogTime = performance.now();
    let maxVolume = 0;
    let silentChunks = 0;

    try {
      const inputCtx = inputAudioContextRef.current;
      
      // Resume audio context (required for Chrome)
      console.log("[CAPTURE] Audio context state before resume:", inputCtx.state);
      inputCtx.resume().then(() => {
        console.log("[CAPTURE] Audio context state after resume:", inputCtx.state);
      });

      const sourceNode = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const bufferSize = 4096;
      const scriptProcessor = inputCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      console.log("[CAPTURE] Script processor created with buffer size:", bufferSize);

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        // Use refs for current state values
        if (!isRecordingRef.current || isMutedRef.current) return;

        const pcmData = audioProcessingEvent.inputBuffer.getChannelData(0);
        
        // Calculate audio level (RMS)
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < pcmData.length; i++) {
          const absVal = Math.abs(pcmData[i]);
          sum += pcmData[i] * pcmData[i];
          if (absVal > peak) peak = absVal;
        }
        const rms = Math.sqrt(sum / pcmData.length);
        const volume = Math.round(rms * 1000); // Scale for readability
        
        if (peak > maxVolume) maxVolume = peak;
        
        // Track silent chunks
        if (volume < 1) {
          silentChunks++;
        } else {
          silentChunks = 0;
        }
        
        if (sessionRef.current) {
          const blob = createBlob(pcmData);
          sessionRef.current.sendRealtimeInput({
            media: blob,
          });
          
          audioChunksSent++;
          const chunkBytes = Math.ceil(blob.data.length * 0.75);
          totalBytesSent += chunkBytes;
          
          // Log every 2 seconds
          const now = performance.now();
          if (now - lastLogTime > 2000) {
            const volumeBar = "█".repeat(Math.min(Math.round(volume / 2), 20)) || "░";
            console.log(`[CAPTURE] 📤 Chunks: ${audioChunksSent} | Vol: ${volume} ${volumeBar} | Peak: ${(maxVolume * 100).toFixed(1)}% | Silent: ${silentChunks}`);
            
            if (silentChunks > 10) {
              console.warn("[CAPTURE] ⚠️ Audio appears silent! Check microphone.");
            }
            
            lastLogTime = now;
            totalBytesSent = 0;
            maxVolume = 0;
          }
        }
      };

      sourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
      
      isRecordingRef.current = true;
      console.log("[CAPTURE] ✅ Audio capture pipeline connected");

    } catch (error) {
      console.error("[CAPTURE] ❌ Error starting audio capture:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  const sendVideoFrame = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (!sessionRef.current || !isVideoEnabled) return;

      try {
        const startTime = performance.now();
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          const imageSize = Math.ceil(base64Image.length * 0.75);

          sessionRef.current.sendRealtimeInput({
            media: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
          });
          
          console.log(`[VIDEO] 📸 Frame sent | Size: ${(imageSize / 1024).toFixed(1)} KB | Process time: ${(performance.now() - startTime).toFixed(1)}ms`);
        }
      } catch (error) {
        console.error("[VIDEO] ❌ Error sending video frame:", error);
      }
    },
    [isVideoEnabled]
  );

  const sendTextMessage = useCallback((text: string) => {
    if (!sessionRef.current) return;

    console.log("[MESSAGE] 📝 Sending text message:", text);
    const sendTime = performance.now();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    sessionRef.current.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });
    
    console.log("[MESSAGE] ✅ Text message sent in", (performance.now() - sendTime).toFixed(2), "ms");
  }, []);

  const cleanup = useCallback(() => {
    console.log("[CLEANUP] 🧹 Starting cleanup...");
    isRecordingRef.current = false;

    // Stop media tracks
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      console.log("[CLEANUP] Stopping", tracks.length, "media tracks");
      tracks.forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setMediaStream(null);
    }

    // Disconnect audio nodes
    if (scriptProcessorRef.current) {
      console.log("[CLEANUP] Disconnecting script processor");
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (sourceNodeRef.current) {
      console.log("[CLEANUP] Disconnecting source node");
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    // Stop all playing audio
    const sourcesToStop = sourcesRef.current.size;
    for (const source of sourcesRef.current.values()) {
      try {
        source.stop();
      } catch (e) {}
    }
    sourcesRef.current.clear();
    console.log("[CLEANUP] Stopped", sourcesToStop, "audio sources");

    // Close audio contexts
    if (inputAudioContextRef.current?.state !== "closed") {
      console.log("[CLEANUP] Closing input audio context");
      inputAudioContextRef.current?.close();
      inputAudioContextRef.current = null;
    }

    if (outputAudioContextRef.current?.state !== "closed") {
      console.log("[CLEANUP] Closing output audio context");
      outputAudioContextRef.current?.close();
      outputAudioContextRef.current = null;
    }

    nextStartTimeRef.current = 0;
    setIsConnected(false);
    setIsConnecting(false);
    console.log("[CLEANUP] ✅ Cleanup complete");
  }, []);

  const disconnect = useCallback(() => {
    console.log("[DISCONNECT] 🔌 Disconnecting...");
    // Close session
    if (sessionRef.current) {
      console.log("[DISCONNECT] Closing session");
      sessionRef.current.close();
      sessionRef.current = null;
    }

    cleanup();
    setMessages([]);
    console.log("[DISCONNECT] ✅ Disconnected");
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      isMutedRef.current = newMuted; // Update ref for audio processor
      console.log("[CONTROL] 🎤 Microphone", newMuted ? "MUTED" : "UNMUTED");
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
      console.log("[CONTROL] 📹 Video", newEnabled ? "ENABLED" : "DISABLED");
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
