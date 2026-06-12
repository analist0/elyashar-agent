import { CalendarCheck, ChatCircleDots, TrendUp, UsersThree } from "@phosphor-icons/react";
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
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={UsersThree} label="לידים חדשים" value="24" change="+18%" />
        <Metric icon={CalendarCheck} label="פגישות שנקבעו" value={String(appointments.length)} change="Live" />
        <Metric icon={ChatCircleDots} label="שיחות פעילות" value="38" change="+22%" />
        <Metric icon={TrendUp} label="יחס המרה" value="31%" change="+7%" />
      </section>
      <section className="surface p-4 md:p-6">
        <Tabs defaultValue="leads" dir="rtl">
          <TabsList>
            <TabsTrigger value="leads">לידים</TabsTrigger>
            <TabsTrigger value="appointments">פגישות</TabsTrigger>
            <TabsTrigger value="conversations">שיחות</TabsTrigger>
          </TabsList>
          <TabsContent value="leads" className="space-y-3">{leads.map((lead) => <LeadCard key={lead.phone} lead={lead} />)}</TabsContent>
          <TabsContent value="appointments">
            {loadingAppointments ? (
              <p className="py-12 text-center text-sm text-zinc-500">טוען פגישות...</p>
            ) : appointments.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {appointments.map((item) => <AppointmentCard key={`${item.name}-${item.date}-${item.time}`} appointment={item} />)}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-zinc-500">עדיין לא נקבעו פגישות.</p>
            )}
          </TabsContent>
          <TabsContent value="conversations">
            {conversations.length > 0 ? <div className="space-y-3">{conversations.map((conversation) => <div key={conversation.id} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><div><p className="font-bold text-white">{conversation.agent_name}</p><p className="mt-1 text-xs text-zinc-500">{new Date(conversation.started_at).toLocaleString("he-IL")}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${conversation.status === "active" ? "bg-accent/10 text-accent" : "bg-white/5 text-zinc-400"}`}>{conversation.status === "active" ? "פעילה" : "הסתיימה"}</span></div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center"><ChatCircleDots size={32} className="mx-auto text-zinc-600" /><p className="mt-4 font-bold text-zinc-300">עדיין אין שיחות</p></div>}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, change }: { icon: typeof UsersThree; label: string; value: string; change: string }) {
  return <article className="surface p-4 md:p-5"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-white/[0.05] text-accent"><Icon size={19} weight="duotone" /></span><span className="text-xs font-bold text-accent">{change}</span></div><p className="mt-5 text-2xl font-black text-white md:text-3xl">{value}</p><p className="mt-1 text-xs text-zinc-500">{label}</p></article>;
}
