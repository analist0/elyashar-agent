import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import { signUpWithEmail } from "../services/auth";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await signUpWithEmail({ email, password, fullName });

      if (error) {
        setMessage(error.message);
        return;
      }

      await api.startTrial();
      setMessage("נרשמת בהצלחה. נפתח ניסיון חינם ל־7 ימים.");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "לא ניתן להשלים הרשמה כרגע");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center p-6" dir="rtl">
      <form onSubmit={submit} className="surface w-full max-w-md space-y-4 p-6 text-right">
        <h1 className="text-3xl font-black text-white">הרשמה</h1>
        <p className="text-sm leading-6 text-zinc-400">פתח ניסיון חינם ל־7 ימים. אין צורך באימות מייל.</p>
        <input className="w-full rounded-xl p-3 text-black" placeholder="שם מלא" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <input className="w-full rounded-xl p-3 text-black" placeholder="אימייל" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="w-full rounded-xl p-3 text-black" placeholder="סיסמה" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button disabled={isSubmitting} className="w-full rounded-xl bg-white p-3 font-bold text-black disabled:opacity-60">
          {isSubmitting ? "פותח חשבון..." : "פתח ניסיון חינם"}
        </button>
        {message && <p className="text-sm text-zinc-300">{message}</p>}
        <p className="text-sm text-zinc-500">
          כבר יש חשבון? <Link className="text-white underline" to="/login">כניסה</Link>
        </p>
      </form>
    </main>
  );
}
