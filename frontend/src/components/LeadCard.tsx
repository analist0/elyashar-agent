import { Phone, UserCircle } from "@phosphor-icons/react";

import { StatusBadge } from "./StatusBadge";

export type Lead = { name: string; phone: string; service: string; source: string; status: "new" | "active" | "pending" };

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-zinc-400"><UserCircle size={24} weight="duotone" /></span>
      <div className="min-w-0 flex-1"><p className="font-bold text-white">{lead.name}</p><p className="mt-1 text-xs text-zinc-500">{lead.service} · {lead.source}</p></div>
      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"><Phone size={16} />{lead.phone}</a>
      <StatusBadge status={lead.status} />
    </article>
  );
}
