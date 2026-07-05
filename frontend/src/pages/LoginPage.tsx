import { useState } from "react";
import { Link } from "react-router-dom";

import { signInWithEmail } from "../services/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await signInWithEmail({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "לא ניתן להתחבר כרגע");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center p-6" dir="rtl">
      <form onSubmit={submit} className="surface w-full max-w-md space-y-4 p-6 text-right">
        <h1 className="text-3xl font-black text-white">כניסה</h1>
        <input className="w-full rounded-xl p-3 text-black" placeholder="אימייל" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="w-full rounded-xl p-3 text-black" placeholder="סיסמה" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button disabled={isSubmitting} className="w-full rounded-xl bg-white p-3 font-bold text-black disabled:opacity-60">
          {isSubmitting ? "מתחבר..." : "כניסה"}
        </button>
        {message && <p className="text-sm text-red-300">{message}</p>}
        <p className="text-sm text-zinc-500">
          אין חשבון? <Link className="text-white underline" to="/register">פתח ניסיון חינם</Link>
        </p>
      </form>
    </main>
  );
}
