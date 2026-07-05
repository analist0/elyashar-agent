import { useEffect, useState } from "react";

import { api, type AccessState, type Plan } from "../services/api";

export function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [access, setAccess] = useState<AccessState | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getPlans().then((result) => setPlans(result.plans));
    api.getSubscription().then((result) => setAccess(result.access)).catch(() => null);
  }, []);

  async function activate(plan: string) {
    setMessage("");
    try {
      const result = await api.manualActivate(plan);
      setAccess(result.access);
      setMessage("המסלול הופעל לחודש. בהמשך נחבר ספק סליקה אמיתי.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "לא ניתן לעדכן מסלול כרגע");
    }
  }

  return (
    <main className="min-h-[100dvh] p-6 text-right" dir="rtl">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black text-white">מסלולים</h1>
        <p className="mt-3 leading-7 text-zinc-300">
          כל משתמש מקבל ניסיון חינם ל־7 ימים. לאחר מכן יש לבחור מסלול כדי להמשיך להשתמש בסוכן.
        </p>

        {access && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-zinc-200">
            סטטוס: <strong>{access.status}</strong>
            {access.daysRemaining > 0 && <span> · נשארו {access.daysRemaining} ימים לניסיון</span>}
          </div>
        )}

        {message && <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-200">{message}</p>}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="surface p-6">
              <h2 className="text-2xl font-black text-white">{plan.name}</h2>
              <p className="mt-3 text-3xl font-black text-white">
                ₪{plan.price_ils_monthly}<span className="text-sm text-zinc-400">/חודש</span>
              </p>
              <ul className="mt-5 space-y-2 text-zinc-300">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button onClick={() => activate(plan.id)} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-black">
                הפעל מסלול
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
