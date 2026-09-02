import { Router } from "express";
import { getPublicAgentBySlug } from "../services/agentServiceSupabase.js";

const router = Router();

router.get("/:slug", async (req, res, next) => {
  try {
    const agent = await getPublicAgentBySlug(req.params.slug);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        instructions: agent.instructions,
        voice: agent.voice ?? "leo",
        language: agent.language ?? "he",
        personality: agent.personality ?? "",
        tone: agent.tone ?? "",
        created_at: agent.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
