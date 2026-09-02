import { useEffect, useState } from "react";
import { api, type BillingStatus } from "../services/api";

export function TrialBanner() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getBillingStatus()
      .then((data) => {
        if (!cancelled) setBilling(data);
      })
      .catch(() => {
        if (!cancelled) setBilling(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;

  // No billing data means unauthenticated or local dev without Supabase.
  if (!billing || billing.status === "none") return null;

  if (billing.status === "expired") {
    return (
      <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200 md:px-8">
        התקופת ניסיון שלך הסתיימה.{" "}
        <a href="#/billing" className="underline hover:text-white">
          עבור לחיוב
        </a>
      </div>
    );
  }

  const days = billing.daysRemaining ?? 0;
  const label = days > 0 ? `נותרו ${days} ימים` : "מסתיים היום";

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200 md:px-8">
      תקופת ניסיון פעילה: {label}.{" "}
      <a href="#/billing" className="underline hover:text-white">
        עבור לחיוב
      </a>
    </div>
  );
}
