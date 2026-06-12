import { Router } from "express";

import { createSessionConfig } from "../realtime/sessionConfig.js";

export function createXaiRouter(xaiClient) {
  const router = Router();

  router.post("/session", async (req, res, next) => {
    try {
      const clientSecret = await xaiClient.createClientSecret(createSessionConfig());
      res.status(200).json(clientSecret);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
