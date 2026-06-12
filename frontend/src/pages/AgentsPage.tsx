import { Check, Copy, Plus, Robot, TelegramLogo } from "@phosphor-icons/react";
import { type FormEvent, useEffect, useState } from "react";

import { api, type Agent } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const initialForm = {
  name: "",
  instructions: "",
  services: "",
  telegram_bot_token: "",
  telegram_chat_id: "",
};

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const result = await api.listAgents();
    setAgents(result.agents);
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createAgent(form);
      setForm(initialForm);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "לא ניתן ליצור סוכן");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={create} className="surface h-fit p-5 md:p-6">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent"><Plus size={22} /></span><div><h2 className="font-black">יצירת סוכן</h2><p className="mt-1 text-xs text-zinc-500">הגדירו סוכן וקבלו קוד הטמעה</p></div></div>
        <div className="mt-6 space-y-4">
          <Field label="שם הסוכן"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="למשל: דנה - קליניקה" /></Field>
          <Field label="הוראות לסוכן"><textarea className="field min-h-28 py-3" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} placeholder="קבע פגישות ייעוץ, דבר בקצרה, שאל..." /></Field>
          <Field label="שירותים"><Input value={form.services} onChange={(event) => setForm({ ...form, services: event.target.value })} placeholder="ייעוץ, טיפול, פגישת היכרות" /></Field>
          <Field label="Telegram Bot Token"><Input type="password" value={form.telegram_bot_token} onChange={(event) => setForm({ ...form, telegram_bot_token: event.target.value })} placeholder="נשמר בשרת בלבד" /></Field>
          <Field label="Telegram Chat ID"><Input value={form.telegram_chat_id} onChange={(event) => setForm({ ...form, telegram_chat_id: event.target.value })} placeholder="123456789" /></Field>
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <Button className="mt-6 w-full" disabled={saving}>{saving ? "יוצר סוכן..." : "צור סוכן"}</Button>
      </form>

      <section className="space-y-4">
        {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
      </section>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/voice-booking/${agent.id}`;
  const embedCode = `<iframe src="${publicUrl}" title="${agent.name}" allow="microphone" style="width:100%;height:760px;border:0;border-radius:16px"></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white/[0.05] text-accent"><Robot size={23} weight="duotone" /></span><div><h3 className="font-black text-white">{agent.name}</h3><p className="mt-1 font-mono text-[11px] text-zinc-600">ID: {agent.id}</p></div></div>
        <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${agent.telegram_configured ? "bg-sky-400/10 text-sky-300" : "bg-white/5 text-zinc-500"}`}><TelegramLogo size={15} weight="fill" />{agent.telegram_configured ? `Telegram: ${agent.telegram_chat_id}` : "Telegram לא מוגדר"}</span>
      </div>
      <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-400">{agent.instructions}</p>
      <div className="mt-4 flex flex-wrap gap-2">{agent.services.map((service) => <span key={service} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-400">{service}</span>)}</div>
      <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-[11px] leading-5 text-zinc-500 break-all">{embedCode}</div>
      <div className="mt-4 flex gap-2"><Button onClick={copy} size="sm">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "הועתק" : "העתק קוד"}</Button><a href={publicUrl} target="_blank" rel="noreferrer"><Button type="button" size="sm" variant="secondary">פתח סוכן</Button></a></div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="label">{label}</span>{children}</label>;
}
