const defaultAgentId = "elyashar";
const agents = new Map([
  [defaultAgentId, {
    id: defaultAgentId,
    name: "Elyashar AI",
    instructions: "קבע פגישות עבור Elyashar Labs.",
    services: ["סוכן AI", "פיתוח אפליקציה", "אוטומציה עסקית", "ייעוץ AI"],
    telegram_bot_token: "",
    telegram_chat_id: "",
    voice: "leo",
    language: "he",
    personality: "אדיב, סבלני, מקצועי, רגוע ונעים.",
    tone: "חם, ברור, קצר ולא לוחץ.",
    slug: "elyashar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
]);

export function createAgent(input) {
  const id = crypto.randomUUID();
  const agent = {
    id,
    name: input.name.trim(),
    instructions: input.instructions.trim(),
    services: normalizeServices(input.services),
    telegram_bot_token: input.telegram_bot_token?.trim() ?? "",
    telegram_chat_id: input.telegram_chat_id?.trim() ?? "",
    voice: input.voice?.trim() || "leo",
    language: input.language?.trim() || "he",
    personality: input.personality?.trim() || "אדיב, סבלני, מקצועי, רגוע ונעים.",
    tone: input.tone?.trim() || "חם, ברור, קצר ולא לוחץ.",
    slug: input.slug?.trim() || makeSlug(input.name),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  agents.set(id, agent);
  return sanitizeAgent(agent);
}

export function getAgent(id = defaultAgentId) {
  const agent = agents.get(id);
  if (!agent) return null;

  if (id === defaultAgentId) {
    return {
      ...agent,
      telegram_bot_token: agent.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || "",
      telegram_chat_id: agent.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || "",
    };
  }

  return agent;
}

export function listAgents() {
  return [...agents.keys()].map((id) => sanitizeAgent(getAgent(id)));
}

export function updateAgent(id, patch) {
  const agent = agents.get(id);
  if (!agent) return null;
  if (patch.name !== undefined) agent.name = patch.name.trim();
  if (patch.instructions !== undefined) agent.instructions = patch.instructions.trim();
  if (patch.services !== undefined) agent.services = normalizeServices(patch.services);
  if (patch.telegram_bot_token !== undefined) agent.telegram_bot_token = patch.telegram_bot_token.trim();
  if (patch.telegram_chat_id !== undefined) agent.telegram_chat_id = patch.telegram_chat_id.trim();
  if (patch.voice !== undefined) agent.voice = patch.voice.trim();
  if (patch.language !== undefined) agent.language = patch.language.trim();
  if (patch.personality !== undefined) agent.personality = patch.personality.trim();
  if (patch.tone !== undefined) agent.tone = patch.tone.trim();
  if (patch.slug !== undefined) agent.slug = patch.slug.trim();
  agent.updated_at = new Date().toISOString();
  return agent;
}

export function deleteAgent(id) {
  return agents.delete(id);
}

export function sanitizeAgent(agent) {
  return {
    id: agent.id,
    name: agent.name,
    instructions: agent.instructions,
    services: [...agent.services],
    telegram_chat_id: agent.telegram_chat_id,
    telegram_configured: Boolean(agent.telegram_bot_token && agent.telegram_chat_id),
    voice: agent.voice ?? "leo",
    language: agent.language ?? "he",
    personality: agent.personality ?? "אדיב, סבלני, מקצועי, רגוע ונעים.",
    tone: agent.tone ?? "חם, ברור, קצר ולא לוחץ.",
    slug: agent.slug ?? agent.id,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

function makeSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 60);
}

function normalizeServices(services) {
  if (Array.isArray(services)) {
    return services.map((service) => String(service).trim()).filter(Boolean);
  }

  return String(services ?? "")
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean);
}
