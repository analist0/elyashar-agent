import { Router } from "express";

import { authenticateUser } from "../middleware/auth.js";
import {
  createAgent,
  deleteAgent,
  getAgent,
  listAgents,
  updateAgent,
} from "../services/agentServiceSupabase.js";
import { getAppointments } from "../services/appointmentService.js";
import { listConversations } from "../services/conversationService.js";

const router = Router();

router.get("/", authenticateUser, async (req, res, next) => {
  try {
    const agents = await listAgents(req.user.id);
    res.json({ success: true, agents });
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateUser, async (req, res, next) => {
  const error = validateAgent(req.body);
  if (error) {
    return res.status(400).json({ success: false, error });
  }

  try {
    const agent = await createAgent(req.body, req.user.id);
    return res.status(201).json({ success: true, agent });
  } catch (e) {
    next(e);
  }
});

router.get("/:agentId", authenticateUser, async (req, res, next) => {
  try {
    const agent = await getAgent(req.params.agentId, req.user.id);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }
    return res.json({ success: true, agent });
  } catch (error) {
    next(error);
  }
});

router.put("/:agentId", authenticateUser, async (req, res, next) => {
  try {
    const agent = await updateAgent(req.params.agentId, req.user.id, req.body);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }
    return res.json({ success: true, agent });
  } catch (error) {
    next(error);
  }
});

router.delete("/:agentId", authenticateUser, async (req, res, next) => {
  try {
    await deleteAgent(req.params.agentId, req.user.id);
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/:agentId/appointments", authenticateUser, async (req, res, next) => {
  try {
    const agent = await getAgent(req.params.agentId, req.user.id);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }
    return res.json({
      success: true,
      appointments: getAppointments().filter(
        (appointment) => appointment.agent_id === req.params.agentId,
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:agentId/conversations", authenticateUser, async (req, res, next) => {
  try {
    const agent = await getAgent(req.params.agentId, req.user.id);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }
    return res.json({
      success: true,
      conversations: listConversations(req.params.agentId),
    });
  } catch (error) {
    next(error);
  }
});

function validateAgent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be a JSON object";
  if (typeof body.name !== "string" || !body.name.trim()) return "name is required";
  if (typeof body.instructions !== "string" || !body.instructions.trim()) return "instructions are required";
  return null;
}

export default router;
