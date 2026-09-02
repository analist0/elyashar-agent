import { useCallback, useRef, useState } from "react";

import { api, apiBaseUrl } from "../services/api";

type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";
export type MouthShape = "neutral" | "aa" | "ih" | "ou" | "ee" | "oh";

export function useVoiceAgent(agentId = "elyashar") {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [mouthShape, setMouthShape] = useState<MouthShape>("neutral");
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isStartingRef = useRef(false);
  const isInterruptedRef = useRef(false);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextPlayTimeRef = useRef(0);
  const audioDecayRef = useRef<number | null>(null);
  const levelRef = useRef(0);

  const stop = useCallback(() => {
    isStartingRef.current = false;
    stopPlayback();
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void inputContextRef.current?.close();
    void outputContextRef.current?.close();
    inputContextRef.current = null;
    outputContextRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    nextPlayTimeRef.current = 0;
    setAudioLevel(0);
    setMouthShape("neutral");
    if (audioDecayRef.current) {
      window.clearTimeout(audioDecayRef.current);
      audioDecayRef.current = null;
    }
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (isStartingRef.current || socketRef.current) return;
    isStartingRef.current = true;
    setStatus("connecting");
    setError("");
    setTranscript("");

    try {
      // Production flow: obtain a short-lived voice token from the backend.
      const { token } = await api.getVoiceToken(agentId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const realtimeBaseUrl = apiBaseUrl || window.location.origin;
      const protocol = realtimeBaseUrl.startsWith("https:") ? "wss:" : "ws:";
      const host = new URL(realtimeBaseUrl).host;
      const clientId = getVoiceClientId();
      const socket = new WebSocket(
        `${protocol}//${host}/xai/realtime?client_id=${encodeURIComponent(clientId)}&token=${encodeURIComponent(token)}`,
      );
      socketRef.current = socket;

      socket.onmessage = (message) => {
        const event = JSON.parse(message.data);

        if (event.type === "proxy.connected") {
          isStartingRef.current = false;
          startMicrophone(stream, socket);
          setStatus("listening");
        } else if (event.type === "input_audio_buffer.speech_started") {
          isInterruptedRef.current = true;
          stopPlayback();
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "response.cancel" }));
          }
          setStatus("listening");
        } else if (event.type === "response.created") {
          isInterruptedRef.current = false;
        } else if (event.type === "response.output_audio.delta") {
          if (isInterruptedRef.current) return;
          setStatus("speaking");
          playPcm(event.delta);
        } else if (event.type === "response.output_audio_transcript.delta") {
          setMouthShape(inferMouthShape(event.delta));
          setTranscript((current) => current + event.delta);
        } else if (event.type === "response.done") {
          setStatus("listening");
          setMouthShape("neutral");
          setTranscript((current) => `${current}\n`);
        } else if (event.type === "proxy.error" || event.type === "error") {
          setError(event.message ?? "אירעה שגיאה בשיחה הקולית");
          setStatus("error");
        }
      };

      socket.onerror = () => {
        isStartingRef.current = false;
        setError("לא ניתן להתחבר לסוכן הקולי");
        setStatus("error");
      };

      socket.onclose = () => {
        isStartingRef.current = false;
        socketRef.current = null;
        stopPlayback();
        setStatus((current) => current === "error" ? current : "idle");
      };
    } catch (startError) {
      isStartingRef.current = false;
      setError(startError instanceof Error ? startError.message : "לא ניתן לגשת למיקרופון");
      setStatus("error");
    }
  }, [agentId]);

  function startMicrophone(stream: MediaStream, socket: WebSocket) {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    inputContextRef.current = context;
    processorRef.current = processor;

    processor.onaudioprocess = (event) => {
      if (socket.readyState !== WebSocket.OPEN) return;

      const pcm = resampleToPcm16(event.inputBuffer.getChannelData(0), context.sampleRate, 24000);
      socket.send(JSON.stringify({
        type: "input_audio_buffer.append",
        audio: bytesToBase64(new Uint8Array(pcm.buffer)),
      }));
    };

    source.connect(processor);
    processor.connect(context.destination);
  }

  function playPcm(base64: string) {
    const context = outputContextRef.current ?? new AudioContext({ sampleRate: 24000 });
    outputContextRef.current = context;
    const bytes = base64ToBytes(base64);
    const samples = new Int16Array(bytes.buffer);
    const buffer = context.createBuffer(1, samples.length, 24000);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index += 1) {
      channel[index] = samples[index] / 32768;
    }
    const rawLevel = computeRmsLevel(samples);
    const attack = rawLevel > levelRef.current ? 0.72 : 0.24;
    levelRef.current += (rawLevel - levelRef.current) * attack;
    setAudioLevel(levelRef.current);
    if (audioDecayRef.current) {
      window.clearTimeout(audioDecayRef.current);
    }
    audioDecayRef.current = window.setTimeout(() => {
      levelRef.current = 0;
      setAudioLevel(0);
      setMouthShape("neutral");
    }, 180);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime, nextPlayTimeRef.current);
    source.start(startAt);
    audioSourcesRef.current.add(source);
    source.onended = () => audioSourcesRef.current.delete(source);
    nextPlayTimeRef.current = startAt + buffer.duration;
  }

  function stopPlayback() {
    audioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Source already stopped.
      }
    });
    audioSourcesRef.current.clear();
    nextPlayTimeRef.current = 0;
    levelRef.current = 0;
    setAudioLevel(0);
    setMouthShape("neutral");
  }

  return {
    status,
    transcript,
    error,
    audioLevel,
    mouthShape,
    start,
    stop,
  };
}

function getVoiceClientId(): string {
  const key = "voice_client_id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function resampleToPcm16(
  float32Array: Float32Array,
  sourceRate: number,
  targetRate: number,
): Int16Array {
  const ratio = sourceRate / targetRate;
  const length = Math.floor(float32Array.length / ratio);
  const result = new Int16Array(length);

  for (let i = 0; i < length; i++) {
    const index = Math.floor(i * ratio);
    const sample = float32Array[index];
    result[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return result;
}

function computeRmsLevel(samples: Int16Array): number {
  if (samples.length === 0) return 0;

  let sum = 0;
  const stride = Math.max(1, Math.floor(samples.length / 900));
  for (let index = 0; index < samples.length; index += stride) {
    const normalized = samples[index] / 32768;
    sum += normalized * normalized;
  }

  const rms = Math.sqrt(sum / Math.ceil(samples.length / stride));
  return Math.min(1, Math.max(0, rms * 5.8));
}

function inferMouthShape(value: string): MouthShape {
  const chars = value.trim().slice(-3).toLowerCase();
  if (!chars) return "neutral";

  if (/[אוuוֹוּ]/.test(chars) || chars.includes("oo") || chars.includes("ou")) return "ou";
  if (/[איi]/.test(chars) || chars.includes("ee")) return "ee";
  if (/[עהאa]/.test(chars)) return "aa";
  if (/[eי]/.test(chars)) return "ih";
  if (/[o]/.test(chars)) return "oh";
  if (/[במפbmfp]/.test(chars)) return "neutral";
  return "aa";
}
