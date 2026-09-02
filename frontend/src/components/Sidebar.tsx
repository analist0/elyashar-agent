import { CalendarCheck, ChartDonut, ChatCircleDots, Flask, Robot, UserPlus } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

import { cn } from "../lib/utils";

const items = [
  { to: "/voice", label: "סוכן AI", icon: ChatCircleDots },
  { to: "/booking", label: "קביעת פגישה", icon: CalendarCheck },
  { to: "/dashboard", label: "לוח בקרה", icon: ChartDonut },
  { to: "/agents", label: "סוכנים", icon: Robot },
  { to: "/register", label: "הרשמה", icon: UserPlus },
];

export function Sidebar() {
  return (
      <aside className="fixed inset-y-3 right-3 z-30 flex w-14 flex-col rounded-[1.4rem] border border-white/[0.09] bg-[#0b0e12]/78 px-2 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl lg:inset-y-4 lg:right-4 lg:w-64 lg:px-4 lg:py-5">
        <Brand />
        <nav className="mt-8 space-y-1.5 lg:mt-10">
          {items.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="scanline mt-auto hidden overflow-hidden rounded-3xl border border-accent/15 bg-accent/[0.07] p-4 lg:block">
          <p className="text-xs font-bold text-accent">Realtime engine</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">הסוכן מחובר, מאזין ומוכן לקליטת ליד חדש.</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-zinc-500">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            XAI VOICE READY
          </div>
        </div>
      </aside>
  );
}

function Brand() {
  return (
    <div className="flex items-center justify-center gap-3 px-0 lg:justify-start lg:px-2">
      <span className="grid size-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
        <Flask size={22} weight="duotone" />
      </span>
      <div className="hidden lg:block">
        <p className="text-sm font-black tracking-tight text-white">ELYASHAR LABS</p>
        <p className="text-[11px] text-zinc-500">AI SALES OS</p>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: typeof items[number]) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-xl text-sm font-semibold transition",
        "justify-center px-0 py-3 lg:justify-start lg:px-3",
        isActive ? "bg-accent text-zinc-950 shadow-[0_12px_35px_rgba(92,242,178,0.16)]" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
      )}
      title={label}
    >
      <Icon size={20} weight="duotone" />
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  );
}
