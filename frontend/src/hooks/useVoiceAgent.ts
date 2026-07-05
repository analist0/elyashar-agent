import { useCallback, useRef, useState } from "react";

type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

export function useVoiceAgent(agentId = "elyashar") {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isStartingRef = useRef(false);
  const isInterruptedRef = useRef(false);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextPlayTimeRef = useRef(0);

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
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (isStartingRef.current || socketRef.current) return;
    isStartingRef.current = true;
    setStatus("connecting");
    setError("");
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const fallbackWsBaseUrl = `${protocol}//${window.location.host}`;
      const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL ?? fallbackWsBaseUrl;
      const clientId = getVoiceClientId();
      const query = new URLSearchParams({
        client_id: clientId,
        agent_id: agentId,
      });
      const socket = new WebSocket(`${wsBaseUrl}/xai/realtime?${query.toString()}`);
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
          setTranscript((current) => current + event.delta);
        } else if (event.type === "response.done") {
          setStatus("listening");
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
  }

  return { status, transcript, error, start, stop };
}

function getVoiceClientId() {
  const storageKey = "elyashar-voice-client-id";
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const clientId = crypto.randomUUID();
  sessionStorage.setItem(storageKey, clientId);
  return clientId;
}

function resampleToPcm16(input: Float32Array, inputRate: number, outputRate: number) {
  const ratio = inputRate / outputRate;
  const output = new Int16Array(Math.round(input.length / ratio));

  for (let index = 0; index < output.length; index += 1) {
    const sample = input[Math.floor(index * ratio)] ?? 0;
    output[index] = Math.max(-1, Math.min(1, sample)) * 32767;
  }

  return output;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
