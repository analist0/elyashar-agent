import { Router } from "express";

import { listAgents } from "../services/agentService.js";
import { listConversations } from "../services/conversationService.js";

const router = Router();

router.get("/", (req, res) => {
  const agentNames = new Map(listAgents().map((agent) => [agent.id, agent.name]));
  const conversations = listConversations().map((conversation) => ({
    ...conversation,
    agent_name: agentNames.get(conversation.agent_id) ?? "סוכן לא ידוע",
  }));

  res.json({
    success: true,
    conversations,
  });
});

export default router;
