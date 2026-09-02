import { Router } from "express";

import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";
import { startTrial } from "../services/subscriptionService.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // Local dev fallback: simulate registration when Supabase is not configured.
    if (!isSupabaseAvailable()) {
      const userId = crypto.randomUUID();
      return res.status(201).json({
        success: true,
        message: "Registration successful (local dev).",
        access_token: "local-dev-token",
        refresh_token: "local-dev-refresh",
        user: { id: userId, email },
        subscription: null,
      });
    }

    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const user = data?.user;
    const session = data?.session;

    if (!user) {
      return res.status(500).json({ success: false, error: "User creation failed" });
    }

    // When email confirmation is required, session is null.
    if (!session) {
      // Create a minimal profile row so the user exists in public tables.
      await sb.from("profiles").insert({ id: user.id, email: user.email, role: "user" }).single();
      return res.status(202).json({
        success: true,
        message: "Registration initiated. Please confirm your email before logging in.",
        requiresEmailConfirmation: true,
      });
    }

    // Email confirmation is disabled: session exists.
    // Create the user profile row and start trial.
    await sb.from("profiles").insert({ id: user.id, email: user.email, role: "user" }).single();
    const sub = await startTrial(user.id);

    res.status(201).json({
      success: true,
      message: "Registration successful. Trial started.",
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: { id: user.id, email: user.email },
      subscription: sub,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
