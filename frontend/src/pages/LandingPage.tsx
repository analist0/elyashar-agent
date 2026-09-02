import {
  ArrowLeft,
  CalendarCheck,
  ChartLineUp,
  CheckCircle,
  ChatCircleDots,
  MicrophoneStage,
  Robot,
  ShieldCheck,
  Sparkle,
  TelegramLogo,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { AvatarStage } from "../components/AvatarStage";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";

const metrics = [
  { value: "24/7", label: "מענה ללידים" },
  { value: "60s", label: "פתיחת שיחה קולית" },
  { value: "14", label: "ימי ניסיון" },
];

const flow = [
  { title: "הסוכן עונה", text: "שיחה קולית טבעית בעברית עם לקוחות חדשים.", icon: MicrophoneStage },
  { title: "בודק זמינות", text: "בדיקת תאריכים ושעות לפי השירות המבוקש.", icon: CalendarCheck },
  { title: "סוגר פגישה", text: "שמירת פרטים, תיעוד ליד ושליחת התראה לטלגרם.", icon: TelegramLogo },
];

const capabilities = [
  "ניהול כמה סוכנים ממסך אחד",
  "דף הזמנה ציבורי להטמעה באתר",
  "מעקב שיחות, פגישות ולידים",
  "חיבור xAI Realtime לשיחה קולית",
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-canvas text-white">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Robot size={23} weight="duotone" />
          </span>
          <span>
            <span className="block text-sm font-black tracking-tight">ELYASHAR AGENT</span>
            <span className="block text-[11px] text-zinc-500">AI VOICE SALES OS</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-400 md:flex">
          <a href="#workflow" className="hover:text-white">איך זה עובד</a>
          <a href="#control" className="hover:text-white">שליטה ובקרה</a>
          <Link to="/voice" className="hover:text-white">בדיקת סוכן</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/register">
            <Button size="sm">הרשמה</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-10 px-4 pb-12 pt-8 md:px-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">
              <Sparkle size={15} weight="fill" />
              סוכן קולי שממיר שיחות לפגישות
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              מערכת מכירות קולית <span className="gradient-text">שסוגרת פגישות</span> בזמן אמת
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
              סוכן AI עונה ללידים, בודק זמינות, קובע פגישה ושולח התראה לצוות.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="h-12 px-6">התחל עכשיו <ArrowLeft size={18} /></Button>
              </Link>
              <Link to="/voice">
                <Button className="h-12 px-6" variant="secondary">נסה סוכן קולי</Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-x-reverse divide-white/10 rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              {metrics.map((metric) => (
                <div key={metric.label} className="p-4">
                  <p className="text-2xl font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <AvatarStage audioLevel={0.32} mouthShape="aa" speaking />
          </div>
        </section>

        <section id="workflow" className="border-y border-white/[0.06] bg-white/[0.025] px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">מהרגע שליד נכנס ועד שהיומן מתמלא</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {flow.map((item, index) => (
                <article key={item.title} className="group rounded-2xl border border-white/[0.08] bg-panel/80 p-6 transition hover:-translate-y-1 hover:border-accent/25">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent">
                      <item.icon size={24} weight="duotone" />
                    </span>
                    <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="control" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ControlPanel />
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">בקרה עסקית בלי לאבד את השיחה האנושית</h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">
              הגדירו סוכנים לפי שירות, עקבו אחרי פגישות, והטמיעו דף קול באתר או בקמפיין.
            </p>
            <div className="mt-7 grid gap-3">
              {capabilities.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <CheckCircle size={20} className="text-accent" weight="fill" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/agents">
                <Button variant="secondary">פתח ניהול סוכנים</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-accent/20 bg-accent/[0.08] p-6 md:grid-cols-[1fr_auto] md:p-9">
            <div>
              <h2 className="text-2xl font-black md:text-4xl">מוכנים לתת לסוכן לענות לליד הבא?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">פתחו חשבון, בדקו שיחה קולית, והטמיעו את דף ההזמנות באתר.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/register">
                <Button className="h-12 px-6">הרשמה</Button>
              </Link>
              <Link to="/voice-booking/elyashar">
                <Button className="h-12 px-6" variant="secondary">דף ציבורי</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroConsole() {
  return (
      <div className="float-slow relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl" />
      <div className="scanline relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f141b] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-400/80" />
            <span className="size-3 rounded-full bg-amber-300/80" />
            <span className="size-3 rounded-full bg-accent/80" />
          </div>
          <span className="text-xs font-bold text-zinc-500">LIVE VOICE SESSION</span>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-zinc-950">
                <ChatCircleDots size={28} weight="fill" />
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">מקשיב עכשיו</span>
            </div>
            <div className="mt-8 flex h-28 items-end gap-2">
              {[34, 68, 44, 92, 56, 78, 38, 70, 50, 86, 42, 64].map((height, index) => (
                <span
                  key={index}
                  className="w-full rounded-full bg-accent/70"
                  style={{ height: `${height}%`, opacity: 0.35 + index * 0.035 }}
                />
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-zinc-300">“בשמחה, מצאתי לך חלון פנוי ביום שלישי ב־10:00.”</p>
          </div>
          <div className="space-y-3">
            <MiniCard icon={CalendarCheck} title="פגישה נקבעה" value="שלישי, 10:00" />
            <MiniCard icon={ChartLineUp} title="סטטוס ליד" value="חם" />
            <MiniCard icon={ShieldCheck} title="אימות" value="Token מאובטח" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, title, value }: { icon: typeof CalendarCheck; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
      <Icon size={20} className="text-accent" weight="duotone" />
      <p className="mt-4 text-xs text-zinc-500">{title}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ControlPanel() {
  return (
    <div className="rounded-[2rem] border border-white/[0.08] bg-panel/90 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-accent p-5 text-zinc-950 md:row-span-2">
          <p className="text-sm font-bold">פגישות שנקבעו</p>
          <p className="mt-5 text-5xl font-black">38</p>
          <p className="mt-2 text-sm font-semibold opacity-70">עלייה של 22% השבוע</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <p className="text-sm font-bold text-white">סוכן פעיל</p>
          <p className="mt-4 text-2xl font-black text-accent">Elyashar AI</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <p className="text-sm font-bold text-white">שיחות היום</p>
          <p className="mt-4 text-2xl font-black text-white">126</p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
        {["נועה לוי - ייעוץ AI", "דניאל כהן - פיתוח אפליקציה", "מאיה רז - אוטומציה עסקית"].map((item) => (
          <div key={item} className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
            <span className="text-sm font-semibold text-zinc-300">{item}</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">נקבע</span>
          </div>
        ))}
      </div>
    </div>
  );
}
