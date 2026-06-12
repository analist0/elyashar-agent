const defaultAgentId = "elyashar";
const agents = new Map([
  [defaultAgentId, {
    id: defaultAgentId,
    name: "Elyashar AI",
    instructions: "קבע פגישות עבור Elyashar Labs.",
    services: ["סוכן AI", "פיתוח אפליקציה", "אוטומציה עסקית", "ייעוץ AI"],
    telegram_bot_token: "",
    telegram_chat_id: "",
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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

export function sanitizeAgent(agent) {
  return {
    id: agent.id,
    name: agent.name,
    instructions: agent.instructions,
    services: [...agent.services],
    telegram_chat_id: agent.telegram_chat_id,
    telegram_configured: Boolean(agent.telegram_bot_token && agent.telegram_chat_id),
    created_at: agent.created_at,
  };
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
