import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * @typedef {Object} VoiceToken
 * @property {string} token
 * @property {string} user_id
 * @property {string} agent_id
 * @property {string} expires_at
 * @property {string} created_at
 */

/**
 * @param {string} userId
 * @param {string} agentId
 * @param {number} ttlSeconds
 * @returns {Promise<{token: string}>}
 */
export async function createVoiceToken(userId, agentId, ttlSeconds = 60) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  if (isSupabaseAvailable()) {
    const sb = getSupabase();
    const { error } = await sb.from("voice_tokens").insert({
      token,
      user_id: userId,
      agent_id: agentId,
      expires_at: expiresAt,
    });
    if (error) throw error;
  }

  return { token };
}

/**
 * @param {string} token
 * @returns {Promise<{user_id: string; agent_id: string}|null>}
 */
export async function consumeVoiceToken(token) {
  if (!isSupabaseAvailable()) {
    return { user_id: "anonymous", agent_id: "elyashar" };
  }

  const sb = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("voice_tokens")
    .select("user_id, agent_id")
    .eq("token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (error) throw error;
  return data;
}
