import { Clock } from "@phosphor-icons/react";

import { cn } from "../lib/utils";

export function SlotSelector({
  slots,
  selected,
  onSelect,
}: {
  slots: string[];
  selected: string;
  onSelect: (slot: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-white">שעות זמינות</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold transition duration-300 active:scale-[0.98]",
              selected === slot
                ? "border-accent bg-accent text-zinc-950"
                : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-accent/30",
            )}
          >
            <Clock size={16} />
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
