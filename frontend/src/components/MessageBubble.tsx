import { Flask, User } from "@phosphor-icons/react";

import type { ChatMessage } from "../hooks/useChat";
import { cn } from "../lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={cn("flex max-w-[88%] gap-3 md:max-w-[72%]", !isAssistant && "mr-auto flex-row-reverse")}>
      <span className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg",
        isAssistant ? "bg-accent/10 text-accent" : "bg-white/10 text-zinc-300",
      )}>
        {isAssistant ? <Flask size={17} weight="duotone" /> : <User size={17} />}
      </span>
      <div className={cn(
        "rounded-2xl px-4 py-3",
        isAssistant ? "rounded-tr-md border border-white/[0.07] bg-white/[0.04]" : "rounded-tl-md bg-accent text-zinc-950",
      )}>
        <p className="text-sm leading-7">{message.content}</p>
        <p className={cn("mt-1 text-[10px]", isAssistant ? "text-zinc-600" : "text-zinc-700")}>{message.time}</p>
      </div>
    </article>
  );
}
