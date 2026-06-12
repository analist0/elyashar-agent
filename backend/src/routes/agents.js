import { Router } from "express";

import {
  createAgent,
  getAgent,
  listAgents,
  sanitizeAgent,
} from "../services/agentService.js";
import { getAppointments } from "../services/appointmentService.js";
import { listConversations } from "../services/conversationService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    agents: listAgents(),
  });
});

router.post("/", (req, res) => {
  const error = validateAgent(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }

  return res.status(201).json({
    success: true,
    agent: createAgent(req.body),
  });
});

router.get("/:agentId", (req, res) => {
  const agent = getAgent(req.params.agentId);
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: "Agent not found",
    });
  }

  return res.json({
    success: true,
    agent: sanitizeAgent(agent),
  });
});

router.get("/:agentId/appointments", (req, res) => {
  if (!getAgent(req.params.agentId)) {
    return res.status(404).json({
      success: false,
      error: "Agent not found",
    });
  }

  return res.json({
    success: true,
    appointments: getAppointments().filter(
      (appointment) => appointment.agent_id === req.params.agentId,
    ),
  });
});

router.get("/:agentId/conversations", (req, res) => {
  if (!getAgent(req.params.agentId)) {
    return res.status(404).json({
      success: false,
      error: "Agent not found",
    });
  }

  return res.json({
    success: true,
    conversations: listConversations(req.params.agentId),
  });
});

function validateAgent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Request body must be a JSON object";
  if (typeof body.name !== "string" || !body.name.trim()) return "name is required";
  if (typeof body.instructions !== "string" || !body.instructions.trim()) return "instructions are required";
  return null;
}

export default router;
