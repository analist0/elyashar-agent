import { Bell, Command } from "@phosphor-icons/react";

import { Button } from "./ui/Button";

export function Header({ title, description }: { title: string; description: string }) {
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.06] px-4 md:px-8">
      <div>
        <h1 className="text-lg font-black tracking-tight text-white md:text-xl">{title}</h1>
        <p className="mt-1 hidden text-xs text-zinc-500 sm:block">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-zinc-500 md:flex">
          <Command size={15} />
          <span>מערכת מכירות חכמה</span>
        </div>
        <Button variant="secondary" size="icon" aria-label="התראות">
          <Bell size={18} />
        </Button>
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-black text-zinc-950">א</span>
      </div>
    </header>
  );
}
