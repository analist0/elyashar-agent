import cors from "cors";
import express from "express";

import { createXaiClient } from "./realtime/xaiClient.js";
import agentRouter from "./routes/agents.js";
import conversationRouter from "./routes/conversations.js";
import healthRouter from "./routes/health.js";
import toolRouter from "./routes/tools.js";
import { createXaiRouter } from "./routes/xai.js";

export function createApp({
  xaiClient = createXaiClient(),
} = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/agents", agentRouter);
  app.use("/conversations", conversationRouter);
  app.use("/tool", toolRouter);
  app.use("/xai", createXaiRouter(xaiClient));

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
