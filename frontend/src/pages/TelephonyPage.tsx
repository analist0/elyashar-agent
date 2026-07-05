import { useEffect, useState } from "react";

import { api } from "../services/api";

type Provider = {
  id: string;
  name: string;
  status: string;
  type: string;
};

export function TelephonyPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.listTelephonyProviders().then((result) => setProviders(result.providers));
  }, []);

  return (
    <main className="p-6 text-right" dir="rtl">
      <h1 className="text-3xl font-black text-white">ערוצי טלפון</h1>
      <p className="mt-3 text-zinc-300">כאן יחוברו ספקי שיחות ו־SIP לסוכן הקולי.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {providers.map((provider) => (
          <article key={provider.id} className="surface p-6">
            <h2 className="text-xl font-black text-white">{provider.name}</h2>
            <p className="mt-2 text-zinc-400">סטטוס: {provider.status}</p>
            <p className="mt-2 text-zinc-400">סוג: {provider.type}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
