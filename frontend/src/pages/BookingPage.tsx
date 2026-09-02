import { ArrowLeft, CheckCircle, ShieldCheck } from "@phosphor-icons/react";

import { BookingForm } from "../components/BookingForm";

export function BookingPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.7fr)]">
      <BookingForm />
      <aside className="surface ambient-panel relative overflow-hidden p-6 md:p-8">
        <div className="absolute -left-16 -top-16 size-52 rounded-full bg-accent/10 blur-3xl" />
        <p className="relative text-xs font-black text-accent">ELYASHAR LABS</p>
        <h2 className="relative mt-5 max-w-md text-3xl font-black leading-tight text-white md:text-4xl">משיחה ראשונה לפגישה שנקבעה, בלי חיכוך.</h2>
        <p className="relative mt-4 max-w-md text-sm leading-7 text-zinc-400">המערכת בודקת זמינות בזמן אמת ומרכזת את כל פרטי הליד לפני הקביעה.</p>
        <ul className="relative mt-8 space-y-4">
          {["איסוף פרטי לקוח מלאים", "חיבור ישיר ליומן", "אישור פגישה אוטומטי"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
              <CheckCircle size={20} weight="fill" className="text-accent" />{item}
            </li>
          ))}
        </ul>
        <div className="relative mt-10 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <div className="flex items-center gap-3"><ShieldCheck size={24} className="text-accent" /><div><p className="text-sm font-bold">מידע מאובטח</p><p className="text-xs text-zinc-500">פרטי לקוחות נשמרים בבטחה</p></div></div>
          <ArrowLeft size={18} className="text-zinc-600" />
        </div>
      </aside>
    </div>
  );
}
