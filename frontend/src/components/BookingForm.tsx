import { CalendarCheck, CheckCircle } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";

import { api, type Appointment } from "../services/api";
import { SlotSelector } from "./SlotSelector";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const initialForm = { fullName: "", phone: "", service: "", date: "" };

export function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"slots" | "booking" | "">("");

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function checkAvailability(event: FormEvent) {
    event.preventDefault();
    if (!form.fullName || !form.phone || !form.service || !form.date) {
      setError("יש למלא את כל השדות לפני בדיקת זמינות.");
      return;
    }

    setLoading("slots");
    setError("");
    setSelectedSlot("");
    try {
      const result = await api.checkAvailability(form.date, form.service);
      setSlots(result.slots);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "לא ניתן לבדוק זמינות");
    } finally {
      setLoading("");
    }
  }

  async function book() {
    if (!selectedSlot) return;
    const nextAppointment = { ...form, time: selectedSlot };
    setLoading("booking");
    setError("");
    try {
      await api.bookAppointment(nextAppointment);
      setAppointment(nextAppointment);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "לא ניתן לקבוע פגישה");
    } finally {
      setLoading("");
    }
  }

  if (appointment) {
    return (
      <div className="surface p-5 md:p-7">
        <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent"><CheckCircle size={28} weight="fill" /></span>
        <h2 className="mt-5 text-2xl font-black text-white">הפגישה נקבעה בהצלחה</h2>
        <p className="mt-2 text-sm text-zinc-500">הפרטים נשמרו ואישור יישלח ללקוח.</p>
        <dl className="mt-6 divide-y divide-white/[0.07] rounded-xl border border-white/[0.07] bg-white/[0.02] px-4">
          {[
            ["שם", appointment.fullName],
            ["טלפון", appointment.phone],
            ["שירות", appointment.service],
            ["תאריך", appointment.date],
            ["שעה", appointment.time],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="font-bold text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <Button className="mt-6 w-full" onClick={() => { setAppointment(null); setSlots([]); setForm(initialForm); }}>
          קבע פגישה נוספת
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={checkAvailability} className="surface p-4 md:p-7">
      <div className="mb-7 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent"><CalendarCheck size={23} weight="duotone" /></span>
        <div>
          <h2 className="font-black text-white">פרטי הפגישה</h2>
          <p className="mt-1 text-xs text-zinc-500">מלאו פרטים ובחרו זמן מתאים</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="שם מלא"><Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="ישראל ישראלי" /></Field>
        <Field label="טלפון"><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="050-0000000" inputMode="tel" /></Field>
        <Field label="שירות">
          <Select value={form.service} onChange={(e) => update("service", e.target.value)}>
            <option value="">בחרו שירות</option>
            <option value="סוכן AI">סוכן AI</option>
            <option value="פיתוח אפליקציה">פיתוח אפליקציה</option>
            <option value="אוטומציה עסקית">אוטומציה עסקית</option>
            <option value="ייעוץ AI">ייעוץ AI</option>
          </Select>
        </Field>
        <Field label="תאריך מועדף"><Input value={form.date} onChange={(e) => update("date", e.target.value)} type="date" /></Field>
      </div>
      {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <Button type="submit" className="mt-6 w-full" disabled={Boolean(loading)}>
        {loading === "slots" ? "בודק זמינות..." : "בדוק זמינות"}
      </Button>
      {slots.length > 0 && (
        <div className="mt-7 border-t border-white/[0.07] pt-6">
          <SlotSelector slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
          <Button type="button" className="mt-5 w-full" disabled={!selectedSlot || Boolean(loading)} onClick={book}>
            {loading === "booking" ? "קובע פגישה..." : "קבע פגישה"}
          </Button>
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="label">{label}</span>{children}</label>;
}
