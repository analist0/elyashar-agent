import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * @typedef {Object} UsageEvent
 * @property {string} id
 * @property {string} user_id
 * @property {string} type
 * @property {number} quantity
 * @property {string|null} metadata
 * @property {string} created_at
 */

/**
 * @param {string} userId
 * @param {"voice_minutes"|"ai_requests"|"conversations"} type
 * @param {number} quantity
 * @param {Record<string, unknown>} [metadata]
 * @returns {Promise<UsageEvent|null>}
 */
export async function trackUsage(userId, type, quantity, metadata) {
  if (!isSupabaseAvailable()) return null;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("usage_events")
    .insert({
      user_id: userId,
      type,
      quantity,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
