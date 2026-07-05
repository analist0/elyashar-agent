import { supabaseAdmin } from "./supabaseAdmin.js";

const trialDays = Number(process.env.TRIAL_DAYS || 7);

export async function createTrialForUser(userId, businessId = null) {
  ensureDb();

  const trialEndsAt = new Date(Date.now() + trialDays * 86400000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .insert({
      user_id: userId,
      business_id: businessId,
      plan: "trial",
      status: "trialing",
      trial_ends_at: trialEndsAt,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getSubscriptionForUser(userId) {
  ensureDb();

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function getAccessStateFromSubscription(subscription, now = new Date()) {
  if (!subscription) {
    return {
      status: "none",
      allowed: false,
      daysRemaining: 0,
      plan: "none",
      reason: "NO_SUBSCRIPTION",
    };
  }

  const trialEndsAt = subscription.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const msRemaining = trialEndsAt ? trialEndsAt.getTime() - now.getTime() : 0;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86400000));

  if (subscription.status === "active") {
    const activePeriodValid = !currentPeriodEnd || currentPeriodEnd > now;

    return {
      status: activePeriodValid ? "active" : "past_due",
      allowed: activePeriodValid,
      daysRemaining: 0,
      plan: subscription.plan,
      reason: activePeriodValid ? undefined : "PAYMENT_PERIOD_ENDED",
    };
  }

  if (subscription.status === "trialing" && trialEndsAt && trialEndsAt > now) {
    return {
      status: "trialing",
      allowed: true,
      daysRemaining,
      plan: subscription.plan,
    };
  }

  return {
    status: subscription.status === "trialing" ? "trial_expired" : subscription.status,
    allowed: false,
    daysRemaining: 0,
    plan: subscription.plan,
    reason: "PAYMENT_REQUIRED",
  };
}

export async function getAccessState(userId) {
  const subscription = await getSubscriptionForUser(userId);
  return getAccessStateFromSubscription(subscription);
}

export async function requireActiveAccess(req, res, next) {
  try {
    const subscription = await getSubscriptionForUser(req.user.id);
    const access = getAccessStateFromSubscription(subscription);

    if (!access.allowed) {
      return res.status(402).json({
        success: false,
        error: "Payment required",
        code: access.reason || "PAYMENT_REQUIRED",
        access,
      });
    }

    req.subscription = subscription;
    req.access = access;
    return next();
  } catch (error) {
    return next(error);
  }
}

function ensureDb() {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured");
  }
}
