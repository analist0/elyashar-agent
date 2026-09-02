import { Router } from "express";
import { authenticateUser } from "../middleware/auth.js";
import { requireSubscription } from "../services/subscriptionService.js";
import { createVoiceToken } from "../services/tokenService.js";

const router = Router();

router.post("/xai/voice-token", authenticateUser, async (req, res, next) => {
  try {
    const { agent_id: agentId = "elyashar" } = req.body || {};
    await requireSubscription(req.user.id);

    if (!process.env.XAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "XAI_API_KEY is not configured",
      });
    }

    const { token } = await createVoiceToken(req.user.id, agentId, 60);
    res.json({ success: true, token, expires_in: 60 });
  } catch (error) {
    next(error);
  }
});

export default router;
