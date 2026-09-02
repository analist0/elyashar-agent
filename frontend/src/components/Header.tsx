import { Bell, Command, House, Sparkle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.07] bg-canvas/70 px-4 backdrop-blur-2xl md:px-8">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-accent">
          <Sparkle size={14} weight="fill" />
          LIVE OPERATING SYSTEM
        </div>
        <h1 className="mt-1 text-lg font-black tracking-tight text-white md:text-2xl">{title}</h1>
        <p className="mt-1 hidden text-xs text-zinc-500 sm:block">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-zinc-500 md:flex">
          <Command size={15} />
          <span>מערכת מכירות חכמה</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="דף נחיתה" onClick={() => navigate("/")}>
          <House size={18} />
        </Button>
        <ThemeToggle />
        <Button variant="secondary" size="icon" aria-label="התראות">
          <Bell size={18} />
        </Button>
        <Button variant="secondary" onClick={() => navigate("/register")}>הרשמה</Button>
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-black text-zinc-950">א</span>
      </div>
    </header>
  );
}
