import { CheckCircle, UserPlus } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { api } from "../services/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.register(email, password);
      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token);
      }
      if (result.refresh_token) {
        localStorage.setItem("refresh_token", result.refresh_token);
      }

      if (result.requiresEmailConfirmation) {
        setMessage("נשלח אימייל אימות. אשרו את החשבון ואז התחברו.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "לא ניתן להשלים הרשמה כרגע");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-9rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
          <CheckCircle size={16} weight="fill" />
          פתיחת חשבון
        </span>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">התחילו לעבוד עם <span className="gradient-text">סוכן המכירות</span></h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            הרשמה יוצרת משתמש, שומרת token מקומי בדפדפן ומפעילה תקופת ניסיון כשהשרת מחובר למערכת החיוב.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="surface ambient-panel p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="relative grid size-11 place-items-center rounded-2xl bg-accent/10 text-accent">
            <UserPlus size={22} weight="duotone" />
          </span>
          <div>
            <h3 className="relative font-black text-white">הרשמה</h3>
            <p className="mt-1 text-xs text-zinc-500">צרו חשבון לניהול סוכנים ופגישות</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label>
            <span className="label">אימייל</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
          </label>
          <label>
            <span className="label">סיסמה</span>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="לפחות 6 תווים" minLength={6} required />
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        {message && <p className="mt-4 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm text-accent">{message}</p>}

        <Button className="relative mt-6 h-12 w-full" disabled={loading}>
          {loading ? "יוצר חשבון..." : "הרשמה והתחלה"}
        </Button>
      </form>
    </section>
  );
}
