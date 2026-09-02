import dotenv from "dotenv";
import { createServer } from "node:http";

import { createApp } from "./app.js";
import { attachVoiceProxy } from "./realtime/voiceProxy.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = createApp();
const server = createServer(app);

attachVoiceProxy(server);

// Production readiness: warn on permissive CORS.
const corsOrigin = process.env.CORS_ORIGIN || "*";
if (corsOrigin === "*" && process.env.NODE_ENV === "production") {
  console.warn("[SECURITY] CORS_ORIGIN is set to '*'. Restrict it to your frontend domain in production.");
}

server.listen(port, () => {
  console.log("Server started on", port);
});
