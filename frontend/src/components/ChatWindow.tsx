import { ArrowUp, Microphone, Sparkle } from "@phosphor-icons/react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useChat } from "../hooks/useChat";
import { Button } from "./ui/Button";
import { MessageBubble } from "./MessageBubble";

const suggestions = [
  "מה זה Elyashar Labs?",
  "אילו שירותי AI אתם מציעים?",
  "ספר לי על SafePing",
  "אני רוצה לבנות אפליקציה",
  "אני רוצה אוטומציה לעסק",
];

export function ChatWindow() {
  const { messages, isTyping, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function submit(event: FormEvent) {
    event.preventDefault();
    sendMessage(input);
    setInput("");
  }

  return (
    <section className="surface flex min-h-[calc(100dvh-11rem)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <Sparkle size={20} weight="fill" />
            <span className="absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-panel bg-accent" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Elyashar AI</p>
            <p className="text-[11px] text-zinc-500">זמין עכשיו · מענה בעברית</p>
          </div>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">Online</span>
      </div>

      <div className="scrollbar-none flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="flex gap-1 rounded-xl bg-white/[0.04] px-3 py-2">
              <i className="size-1.5 animate-pulse rounded-full bg-accent" />
              <i className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
              <i className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            </span>
            הסוכן מקליד
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/[0.07] p-3 md:p-4">
        <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="whitespace-nowrap rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:border-accent/30 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 p-2 focus-within:border-accent/40">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(event);
              }
            }}
            rows={1}
            placeholder="כתבו הודעה..."
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
          />
          <Button type="button" size="icon" variant="ghost" aria-label="הודעה קולית"><Microphone size={19} /></Button>
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} aria-label="שליחה"><ArrowUp size={18} weight="bold" /></Button>
        </form>
      </div>
    </section>
  );
}
