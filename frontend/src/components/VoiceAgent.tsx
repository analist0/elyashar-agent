import {
  Microphone,
  PhoneDisconnect,
  Pulse,
  RadioButton,
  ShieldCheck,
  Sparkle,
  Waveform,
} from "@phosphor-icons/react";

import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { AvatarStage } from "./AvatarStage";
import { Button } from "./ui/Button";

const statusText = {
  idle: "מוכן לשיחה",
  connecting: "מתחבר לסוכן...",
  listening: "אני מקשיב",
  speaking: "הסוכן מדבר",
  error: "החיבור נכשל",
};

export function VoiceAgent({ agentId = "elyashar", agentName = "Elyashar AI" }: { agentId?: string; agentName?: string }) {
  const { status, transcript, error, audioLevel, mouthShape, start, stop } = useVoiceAgent(agentId);
  const isActive = status === "connecting" || status === "listening" || status === "speaking";

  return (
    <section className="grid min-h-[calc(100dvh-11rem)] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="surface ambient-panel scanline relative overflow-hidden p-4 text-center md:p-6">
        <div className="relative z-10">
          <AvatarStage audioLevel={audioLevel} mouthShape={mouthShape} speaking={status === "speaking"} />
        </div>

        <h2 className="relative z-10 mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
          שיחה חיה עם <span className="gradient-text">{agentName}</span>
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
          הסוכן מזהה כוונה, שואל שאלות המשך, בודק זמינות וקובע פגישה בשיחה אחת.
        </p>

        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <StatusPill active={isActive} text={statusText[status]} />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-400">
            <ShieldCheck size={16} className="text-accent" />
            Token מאובטח
          </div>
        </div>

        {error && <p className="relative z-10 mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="relative z-10 mt-8">
          {isActive ? (
            <Button onClick={stop} variant="secondary" className="min-w-52 border-red-400/20 text-red-300 hover:bg-red-400/10">
              <PhoneDisconnect size={20} weight="fill" />
              סיום שיחה
            </Button>
          ) : (
            <Button onClick={start} className="min-w-52">
              <Microphone size={20} weight="fill" />
              התחלת שיחה
            </Button>
          )}
        </div>
        <p className="relative z-10 mt-5 text-[11px] text-zinc-600">בלחיצה על התחלת שיחה תתבקשו לאשר גישה למיקרופון.</p>
      </div>

      <aside className="space-y-4">
        <div className="surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-accent">VOICE TELEMETRY</p>
              <h3 className="mt-2 text-xl font-black text-white">מדדי שיחה</h3>
            </div>
            <Pulse size={26} className="text-accent" weight="duotone" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Latency" value="42ms" />
            <Metric label="Mode" value="Live" />
            <Metric label="Lang" value="HE" />
            <Metric label="Agent" value="AI" />
          </div>
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <RadioButton size={22} className="text-accent" weight="duotone" />
            <h3 className="font-black text-white">תמלול חי</h3>
          </div>
          {transcript ? (
            <div className="mt-5 max-h-72 overflow-y-auto rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-right text-sm leading-7 text-zinc-300 whitespace-pre-line">
              {transcript}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
              <Waveform size={30} className="mx-auto text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-500">התמלול יופיע בזמן השיחה</p>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

function StatusPill({ active, text }: { active: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-bold text-zinc-300">
      <span className={`size-2 rounded-full ${active ? "animate-pulse bg-accent shadow-[0_0_18px_rgba(92,242,178,0.9)]" : "bg-zinc-600"}`} />
      {text}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="neo-card p-4">
      <p className="text-[11px] font-bold text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-xl font-black text-white">{value}</p>
    </div>
  );
}
