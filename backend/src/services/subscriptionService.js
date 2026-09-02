import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} user_id
 * @property {string} status
 * @property {string|null} plan
 * @property {string|null} current_period_end
 * @property {number|null} trial_days
 * @property {string} created_at
 * @property {string} updated_at
 */

/** @type {number} */
const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || "14");

const localSubscriptions = new Map();

/**
 * Create a trial subscription for a user.
 * @param {string} userId
 * @returns {Promise<Subscription|null>}
 */
export async function startTrial(userId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const sub = {
    id: crypto.randomUUID(),
    user_id: userId,
    status: "trialing",
    plan: "trial",
    trial_days: TRIAL_DAYS,
    current_period_end: expiresAt,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  if (!isSupabaseAvailable()) {
    localSubscriptions.set(userId, sub);
    return sub;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("subscriptions")
    .insert({
      user_id: userId,
      status: "trialing",
      plan: "trial",
      trial_days: TRIAL_DAYS,
      current_period_end: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get the active subscription/trial for a user.
 * @param {string} userId
 * @returns {Promise<Subscription|null>}
 */
export async function getSubscription(userId) {
  if (!isSupabaseAvailable()) {
    return localSubscriptions.get(userId) || null;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Returns the subscription status with computed trial expiry.
 * @param {Subscription|null} sub
 * @returns {{ status: "active" | "trialing" | "expired" | "none"; daysRemaining: number|null }}
 */
export function computeSubscriptionStatus(sub) {
  if (!sub) {
    return { status: "none", daysRemaining: null };
  }

  if (sub.status === "active" && sub.plan && sub.plan !== "trial") {
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : Infinity;
    if (periodEnd > Date.now()) {
      return { status: "active", daysRemaining: Math.max(0, Math.ceil((periodEnd - Date.now()) / 86400000)) };
    }
  }

  if (sub.status === "trialing" && sub.current_period_end) {
    const end = new Date(sub.current_period_end).getTime();
    const remaining = Math.ceil((end - Date.now()) / 86400000);
    if (remaining <= 0) {
      return { status: "expired", daysRemaining: 0 };
    }
    return { status: "trialing", daysRemaining: remaining };
  }

  return { status: "expired", daysRemaining: 0 };
}

/**
 * Assert that the user has an active subscription or trial.
 * @param {string} userId
 * @returns {Promise<{ subscription: Subscription; status: "active" | "trialing"; daysRemaining: number|null }>}
 */
export async function requireSubscription(userId) {
  let sub = await getSubscription(userId);
  if (!sub && !isSupabaseAvailable()) {
    sub = await startTrial(userId);
  }
  const computed = computeSubscriptionStatus(sub);
  if (computed.status !== "active" && computed.status !== "trialing") {
    const error = new Error("Subscription required");
    error.status = 403;
    throw error;
  }
  return { subscription: sub, status: computed.status, daysRemaining: computed.daysRemaining };
}
