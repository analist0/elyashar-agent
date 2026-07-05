import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

import { attachOptionalSession, requireCurrentUser } from "./middleware/currentUser.js";
import { createXaiClient } from "./realtime/xaiClient.js";
import { requireActiveAccess } from "./services/subscriptionService.js";
import agentRouter from "./routes/agents.js";
import billingRouter from "./routes/billing.js";
import conversationRouter from "./routes/conversations.js";
import healthRouter from "./routes/health.js";
import telephonyRouter from "./routes/telephony.js";
import toolRouter from "./routes/tools.js";
import { createXaiRouter } from "./routes/xai.js";

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

function getAllowedOrigins() {
  return process.env.APP_ORIGIN
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp({
  xaiClient = createXaiClient(),
} = {}) {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    credentials: true,
  }));
  app.use(express.json({ limit: "2mb" }));
  app.use(apiLimiter);

  app.use("/health", healthRouter);
  app.use("/billing", billingRouter);
  app.use("/telephony", telephonyRouter);

  app.use("/agents", requireCurrentUser, agentRouter);
  app.use("/conversations", requireCurrentUser, conversationRouter);
  app.use("/tool", attachOptionalSession, toolRouter);
  app.use("/xai", requireCurrentUser, requireActiveAccess, aiLimiter, createXaiRouter(xaiClient));

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({
        success: false,
        error: "Request body must contain valid JSON",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  });

  return app;
}
