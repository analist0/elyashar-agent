import { CalendarBlank, Clock } from "@phosphor-icons/react";

import { StatusBadge } from "./StatusBadge";

export type DashboardAppointment = { name: string; service: string; date: string; time: string };

export function AppointmentCard({ appointment }: { appointment: DashboardAppointment }) {
  return (
    <article className="neo-card p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{appointment.name}</p><p className="mt-1 text-xs text-zinc-500">{appointment.service}</p></div><StatusBadge status="scheduled" /></div>
      <div className="mt-5 flex gap-4 border-t border-white/[0.06] pt-4 text-xs text-zinc-400"><span className="flex items-center gap-1.5"><CalendarBlank size={15} />{appointment.date}</span><span className="flex items-center gap-1.5"><Clock size={15} />{appointment.time}</span></div>
    </article>
  );
}
