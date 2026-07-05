import { CalendarCheck, ChartDonut, ChatCircleDots, CreditCard, Flask, PhoneCall, Robot } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

import { cn } from "../lib/utils";

const items = [
  { to: "/", label: "AI", icon: ChatCircleDots },
  { to: "/booking", label: "Booking", icon: CalendarCheck },
  { to: "/dashboard", label: "Dashboard", icon: ChartDonut },
  { to: "/agents", label: "Agents", icon: Robot },
  { to: "/billing", label: "Plans", icon: CreditCard },
  { to: "/telephony", label: "Calls", icon: PhoneCall },
];

export function Sidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l border-white/[0.07] bg-[#0b0e12]/95 px-4 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <Brand />
        <nav className="mt-10 space-y-1.5">
          {items.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="mt-auto rounded-2xl border border-accent/15 bg-accent/[0.06] p-4">
          <p className="text-xs font-bold text-accent">System active</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Your voice agent is ready to receive new leads.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl border border-white/10 bg-[#101318]/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        {items.map((item) => <NavItem key={item.to} {...item} mobile />)}
      </nav>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="grid size-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
        <Flask size={22} weight="duotone" />
      </span>
      <div>
        <p className="text-sm font-black tracking-tight text-white">ELYASHAR LABS</p>
        <p className="text-[11px] text-zinc-500">AI SALES OS</p>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, mobile = false }: typeof items[number] & { mobile?: boolean }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-xl text-sm font-semibold transition",
        mobile ? "min-w-[88px] flex-col gap-1 px-2 py-2 text-[11px]" : "px-3 py-3",
        isActive ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
      )}
    >
      <Icon size={mobile ? 20 : 19} weight="duotone" />
      {label}
    </NavLink>
  );
}
