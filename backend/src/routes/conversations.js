import { Router } from "express";

import { authenticateUser } from "../middleware/auth.js";
import {
  listAgents,
} from "../services/agentServiceSupabase.js";
import { listConversations } from "../services/conversationService.js";

const router = Router();

router.get("/", authenticateUser, async (req, res, next) => {
  try {
    const agents = await listAgents(req.user.id);
    const agentNames = new Map(agents.map((agent) => [agent.id, agent.name]));
    const conversations = listConversations().map((conversation) => ({
      ...conversation,
      agent_name: agentNames.get(conversation.agent_id) ?? "סוכן לא ידוע",
    }));

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
