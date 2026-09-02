import { CalendarCheck, ChatCircleDots, TrendUp, UsersThree, Waveform } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { AppointmentCard, type DashboardAppointment } from "../components/AppointmentCard";
import { LeadCard, type Lead } from "../components/LeadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { api, type Conversation } from "../services/api";

const leads: Lead[] = [
  { name: "נועה לוי", phone: "052-4421180", service: "אוטומציה עסקית", source: "סוכן AI", status: "new" },
  { name: "דניאל כהן", phone: "054-7312290", service: "פיתוח אפליקציה", source: "אתר", status: "active" },
  { name: "מאיה רז", phone: "050-8894102", service: "ייעוץ AI", source: "סוכן AI", status: "pending" },
];

const fallbackAppointments: DashboardAppointment[] = [
  { name: "דניאל כהן", service: "פיתוח אפליקציה", date: "15.06.2026", time: "10:00" },
  { name: "מאיה רז", service: "ייעוץ AI", date: "16.06.2026", time: "14:00" },
  { name: "יונתן בר", service: "סוכן AI", date: "18.06.2026", time: "11:00" },
];

export function DashboardPage() {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    api.listAppointments()
      .then(({ appointments: saved }) => {
        setAppointments(saved.map((appointment) => ({
          name: appointment.fullName ?? appointment.name ?? "לקוח",
          service: appointment.service,
          date: appointment.date,
          time: appointment.time,
        })));
      })
      .catch(() => setAppointments(fallbackAppointments))
      .finally(() => setLoadingAppointments(false));
  }, []);

  useEffect(() => {
    api.listConversations().then(({ conversations }) => setConversations(conversations)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface ambient-panel relative overflow-hidden p-5 md:p-7">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold text-accent">COMMAND CENTER</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">תמונת מצב מכירות חיה</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">לידים, שיחות ופגישות מתרכזים במקום אחד כדי שתראו מה עובד בזמן אמת.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/[0.08] bg-black/20 p-2 text-center">
              <PulseBlock label="Live" value="38" />
              <PulseBlock label="Booked" value={String(appointments.length)} />
              <PulseBlock label="Rate" value="31%" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={UsersThree} label="לידים חדשים" value="24" change="+18%" />
          <Metric icon={CalendarCheck} label="פגישות" value={String(appointments.length)} change="Live" />
          <Metric icon={ChatCircleDots} label="שיחות" value="38" change="+22%" />
          <Metric icon={TrendUp} label="המרה" value="31%" change="+7%" />
        </div>
      </section>

      <section className="surface p-3 md:p-5">
        <Tabs defaultValue="leads" dir="rtl">
          <TabsList>
            <TabsTrigger value="leads">לידים</TabsTrigger>
            <TabsTrigger value="appointments">פגישות</TabsTrigger>
            <TabsTrigger value="conversations">שיחות</TabsTrigger>
          </TabsList>
          <TabsContent value="leads" className="space-y-3 pt-4">
            {leads.map((lead) => <LeadCard key={lead.phone} lead={lead} />)}
          </TabsContent>
          <TabsContent value="appointments" className="pt-4">
            {loadingAppointments ? (
              <SkeletonGrid />
            ) : appointments.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {appointments.map((item) => <AppointmentCard key={`${item.name}-${item.date}-${item.time}`} appointment={item} />)}
              </div>
            ) : (
              <EmptyState title="עדיין לא נקבעו פגישות" text="כשסוכן יקבע פגישה חדשה היא תופיע כאן." />
            )}
          </TabsContent>
          <TabsContent value="conversations" className="pt-4">
            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="neo-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">{conversation.agent_name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{new Date(conversation.started_at).toLocaleString("he-IL")}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${conversation.status === "active" ? "bg-accent/10 text-accent" : "bg-white/5 text-zinc-400"}`}>
                      {conversation.status === "active" ? "פעילה" : "הסתיימה"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="עדיין אין שיחות" text="שיחות קוליות חדשות יופיעו כאן עם זמן התחלה וסטטוס." />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, change }: { icon: typeof UsersThree; label: string; value: string; change: string }) {
  return (
    <article className="neo-card min-h-36 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-2xl bg-accent/10 text-accent"><Icon size={20} weight="duotone" /></span>
        <span className="text-xs font-bold text-accent">{change}</span>
      </div>
      <p className="mt-6 font-mono text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </article>
  );
}

function PulseBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-2xl bg-white/[0.04] px-3 py-4">
      <p className="font-mono text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-zinc-500">{label}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="neo-card min-h-32 animate-pulse p-4">
          <div className="h-4 w-2/3 rounded-full bg-white/10" />
          <div className="mt-4 h-3 w-1/2 rounded-full bg-white/10" />
          <div className="mt-8 h-3 w-full rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.025] px-4 py-14 text-center">
      <Waveform size={34} className="mx-auto text-zinc-600" />
      <p className="mt-4 font-black text-zinc-200">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}
