import { Link } from "react-router-dom";

const audiences = ["מוסכים", "קוסמטיקאיות", "קליניקות", "רואי חשבון", "יועצים", "נותני שירות"];
const benefits = [
  "עונה ללקוחות בעברית",
  "מסביר שירותים ומחירים",
  "קובע פגישות ומעדכן אותך",
  "ניסיון חינם ל־7 ימים",
];

export function LandingPage() {
  return (
    <main className="min-h-[100dvh] text-right" dir="rtl">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-bold text-accent">פקידת קבלה קולית AI לעסקים</p>
          <h1 className="mt-4 text-5xl font-black leading-tight text-white">
            סוכן קולי שעונה ללקוחות, מסביר מחירים וקובע תורים בעברית
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            פתח ניסיון חינם ל־7 ימים, בנה בוט קולי לעסק שלך, חבר מחירון, יומן וטלגרם — ותן ל־AI לענות במקוםך.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-white px-6 py-3 font-bold text-black" to="/register">
              נסה חינם
            </Link>
            <Link className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white" to="/login">
              כניסה
            </Link>
          </div>
        </div>

        <div className="surface p-8">
          <h2 className="text-2xl font-black text-white">מה הבוט עושה?</h2>
          <ul className="mt-5 space-y-3 text-zinc-300">
            {benefits.map((benefit) => (
              <li key={benefit}>✓ {benefit}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl font-black text-white">למי זה מתאים?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {audiences.map((audience) => (
            <div key={audience} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-zinc-200">
              {audience}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
