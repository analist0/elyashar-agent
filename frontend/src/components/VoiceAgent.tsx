import { Microphone, PhoneDisconnect, Sparkle, Waveform } from "@phosphor-icons/react";

import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { Button } from "./ui/Button";

const statusText = {
  idle: "מוכן לשיחה",
  connecting: "מתחבר לסוכן...",
  listening: "אני מקשיב",
  speaking: "הסוכן מדבר",
  error: "החיבור נכשל",
};

export function VoiceAgent({ agentId = "elyashar", agentName = "Elyashar AI" }: { agentId?: string; agentName?: string }) {
  const { status, transcript, error, start, stop } = useVoiceAgent(agentId);
  const isActive = status === "connecting" || status === "listening" || status === "speaking";

  return (
    <section className="surface mx-auto flex min-h-[calc(100dvh-11rem)] max-w-3xl flex-col items-center justify-center overflow-hidden p-6 text-center md:p-12">
      <div className="relative">
        {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-accent/15" />}
        <span className="relative grid size-28 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent md:size-36">
          {status === "speaking" ? <Waveform size={54} weight="duotone" /> : <Sparkle size={48} weight="fill" />}
        </span>
      </div>

      <h2 className="mt-8 text-3xl font-black tracking-tight text-white md:text-4xl">קביעת פגישה עם {agentName}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">הסוכן הקולי יעזור לכם לבחור מועד ולקבוע פגישה קצרה.</p>

      <div className="mt-7 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-zinc-300">
        <span className={`size-2 rounded-full ${isActive ? "animate-pulse bg-accent" : "bg-zinc-600"}`} />
        {statusText[status]}
      </div>

      {error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {transcript && (
        <div className="mt-7 max-h-36 w-full overflow-y-auto rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-right text-sm leading-7 text-zinc-300 whitespace-pre-line">
          {transcript}
        </div>
      )}

      <div className="mt-8">
        {isActive ? (
          <Button onClick={stop} variant="secondary" className="min-w-48 border-red-400/20 text-red-300 hover:bg-red-400/10">
            <PhoneDisconnect size={20} weight="fill" />
            סיום שיחה
          </Button>
        ) : (
          <Button onClick={start} className="min-w-48">
            <Microphone size={20} weight="fill" />
            התחלת שיחה
          </Button>
        )}
      </div>
      <p className="mt-5 text-[11px] text-zinc-600">בלחיצה על התחלת שיחה תתבקשו לאשר גישה למיקרופון.</p>
    </section>
  );
}
