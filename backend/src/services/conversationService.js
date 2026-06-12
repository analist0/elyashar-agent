const conversations = [];

export function startConversation(agentId) {
  const conversation = {
    id: crypto.randomUUID(),
    agent_id: agentId,
    status: "active",
    started_at: new Date().toISOString(),
    ended_at: null,
  };

  conversations.unshift(conversation);
  return { ...conversation };
}

export function endConversation(id) {
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) return null;

  conversation.status = "completed";
  conversation.ended_at = new Date().toISOString();
  return { ...conversation };
}

export function listConversations(agentId) {
  return conversations
    .filter((conversation) => !agentId || conversation.agent_id === agentId)
    .map((conversation) => ({ ...conversation }));
}
