import { getSupabase, isSupabaseAvailable } from "../lib/supabase.js";

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} owner_id
 * @property {string|null} business_id
 * @property {string} name
 * @property {string} slug
 * @property {string} instructions
 * @property {string} voice
 * @property {string} language
 * @property {string} created_at
 * @property {string} updated_at
 */

import {
  createAgent as createAgentMemory,
  deleteAgent as deleteAgentMemory,
  getAgent as getAgentMemory,
  listAgents as listAgentsMemory,
  updateAgent as updateAgentMemory,
  sanitizeAgent as sanitizeAgentMemory,
} from "./agentService.js";

function makeSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 60);
}

/**
 * @param {Object} input
 * @param {string} input.name
 * @param {string} input.instructions
 * @param {string} input.voice
 * @param {string} input.language
 * @param {string} ownerId
 * @returns {Promise<Agent>}
 */
export async function createAgent(input, ownerId) {
  if (!isSupabaseAvailable()) return createAgentMemory(input);

  const sb = getSupabase();
  const slug = makeSlug(input.name) + "-" + crypto.randomUUID().slice(0, 6);
  const { data, error } = await sb
    .from("agents")
    .insert({
      owner_id: ownerId,
      business_id: input.business_id ?? null,
      name: input.name.trim(),
      slug,
      instructions: input.instructions.trim(),
      voice: input.voice?.trim() || "leo",
      language: input.language?.trim() || "he",
      personality: input.personality?.trim() || "אדיב, סבלני, מקצועי, רגוע ונעים.",
      tone: input.tone?.trim() || "חם, ברור, קצר ולא לוחץ.",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @param {string} ownerId
 * @returns {Promise<Agent|null>}
 */
export async function getAgent(id, ownerId) {
  if (!isSupabaseAvailable()) return getAgentMemory(id);

  const sb = getSupabase();
  const { data, error } = await sb
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<Agent|null>}
 */
export async function getAgentPublic(id) {
  if (!isSupabaseAvailable()) return getAgentMemory(id);

  const sb = getSupabase();
  const { data, error } = await sb
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * @param {string} slug
 * @returns {Promise<Agent|null>}
 */
export async function getPublicAgentBySlug(slug) {
  if (!isSupabaseAvailable()) {
    const agent = getAgentMemory(slug);
    return agent ? sanitizeAgentMemory(agent) : null;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("agents")
    .select("id, name, slug, instructions, voice, language, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * @param {string} ownerId
 * @returns {Promise<Agent[]>}
 */
export async function listAgents(ownerId) {
  if (!isSupabaseAvailable()) return listAgentsMemory();

  const sb = getSupabase();
  const { data, error } = await sb
    .from("agents")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * @param {string} id
 * @param {string} ownerId
 * @param {Partial<Agent>} patch
 * @returns {Promise<Agent|null>}
 */
export async function updateAgent(id, ownerId, patch) {
  if (!isSupabaseAvailable()) return updateAgentMemory(id, patch);

  const sb = getSupabase();
  const { data, error } = await sb
    .from("agents")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @param {string} ownerId
 * @returns {Promise<void>}
 */
export async function deleteAgent(id, ownerId) {
  if (!isSupabaseAvailable()) {
    deleteAgentMemory(id);
    return;
  }

  const sb = getSupabase();
  const { error } = await sb
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) throw error;
}
