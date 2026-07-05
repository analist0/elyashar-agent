import { Router } from "express";

import { requireCurrentUser } from "../middleware/currentUser.js";
import {
  createTrialForUser,
  getAccessState,
  getSubscriptionForUser,
} from "../services/subscriptionService.js";
import { supabaseAdmin } from "../services/supabaseAdmin.js";

const router = Router();

router.get("/plans", (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: "starter",
        name: "Starter",
        price_ils_monthly: 99,
        features: ["סוכן קולי אחד", "דף קולי באתר", "התראות טלגרם"],
      },
      {
        id: "business",
        name: "Business",
        price_ils_monthly: 249,
        features: ["Google Calendar", "מחירון", "שאלות נפוצות", "עד 500 שיחות"],
      },
      {
        id: "pro",
        name: "Pro",
        price_ils_monthly: 499,
        features: ["מספר טלפון AI", "RAG", "סיכומי שיחות", "כמה סוכנים"],
      },
    ],
  });
});

router.get("/subscription", requireCurrentUser, async (req, res, next) => {
  try {
    const subscription = await getSubscriptionForUser(req.user.id);
    const access = await getAccessState(req.user.id);

    res.json({
      success: true,
      subscription,
      access,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/start-trial", requireCurrentUser, async (req, res, next) => {
  try {
    const existing = await getSubscriptionForUser(req.user.id);

    if (existing) {
      return res.json({
        success: true,
        subscription: existing,
        access: await getAccessState(req.user.id),
      });
    }

    const subscription = await createTrialForUser(req.user.id, req.body?.business_id ?? null);

    return res.status(201).json({
      success: true,
      subscription,
      access: await getAccessState(req.user.id),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/manual-activate", requireCurrentUser, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: "Supabase is not configured" });
    }

    const plan = req.body?.plan || "business";
    const currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    const existing = await getSubscriptionForUser(req.user.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: currentPeriodEnd,
        payment_provider: "manual",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      subscription: data,
      access: await getAccessState(req.user.id),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/checkout", requireCurrentUser, (req, res) => {
  res.status(501).json({
    success: false,
    error: "Checkout provider is not connected yet",
    code: "CHECKOUT_NOT_IMPLEMENTED",
    message: "בשלב זה הפעלת מנוי מתבצעת ידנית. בהמשך נחבר משולם / Cardcom / Stripe.",
  });
});

export default router;
