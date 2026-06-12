import { CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react";

import { cn } from "../lib/utils";

type Status = "active" | "pending" | "new" | "scheduled";

const statusMap = {
  active: { label: "פעיל", icon: CheckCircle, className: "bg-emerald-400/10 text-emerald-300" },
  pending: { label: "ממתין", icon: Clock, className: "bg-amber-400/10 text-amber-300" },
  new: { label: "חדש", icon: WarningCircle, className: "bg-sky-400/10 text-sky-300" },
  scheduled: { label: "נקבע", icon: CheckCircle, className: "bg-emerald-400/10 text-emerald-300" },
} satisfies Record<Status, { label: string; icon: typeof CheckCircle; className: string }>;

export function StatusBadge({ status }: { status: Status }) {
  const item = statusMap[status];
  const Icon = item.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", item.className)}>
      <Icon size={14} weight="fill" />
      {item.label}
    </span>
  );
}
