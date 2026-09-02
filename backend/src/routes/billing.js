import { Router } from "express";

import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";
import { authenticateUser } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { startTrial, getSubscription, computeSubscriptionStatus } from "../services/subscriptionService.js";

export const ENABLE_MANUAL_BILLING = process.env.ENABLE_MANUAL_BILLING === "true";

const router = Router();

router.get("/status", authenticateUser, async (req, res, next) => {
  try {
    const sub = await getSubscription(req.user.id);
    const computed = computeSubscriptionStatus(sub);
    res.json({
      success: true,
      status: computed.status,
      daysRemaining: computed.daysRemaining,
      plan: sub?.plan ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/manual-activate", authenticateUser, async (req, res, next) => {
  try {
    if (!ENABLE_MANUAL_BILLING) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    // Only admins can proceed; otherwise 404 to avoid revealing the endpoint.
    await new Promise((resolve, reject) => {
      requireAdmin(req, res, (err) => (err ? reject(err) : resolve()));
    });

    if (!isSupabaseAvailable()) {
      return res.status(503).json({ success: false, error: "Database unavailable" });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("subscriptions")
      .insert({
        user_id: req.user.id,
        status: "active",
        plan: req.body.plan || "paid",
        current_period_end: req.body.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, subscription: data });
  } catch (error) {
    next(error);
  }
});

router.post("/start-trial", authenticateUser, async (req, res, next) => {
  try {
    const sub = await startTrial(req.user.id);
    res.status(201).json({ success: true, subscription: sub });
  } catch (error) {
    next(error);
  }
});

export default router;
