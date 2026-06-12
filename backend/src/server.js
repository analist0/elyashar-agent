import dotenv from "dotenv";
import { createServer } from "node:http";

import { createApp } from "./app.js";
import { attachVoiceProxy } from "./realtime/voiceProxy.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = createApp();
const server = createServer(app);

attachVoiceProxy(server);

server.listen(port, () => {
  console.log("Server started on", port);
});
