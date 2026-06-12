import { WebSocket, WebSocketServer } from "ws";

import { createSessionConfig } from "./sessionConfig.js";
import { dispatchToolCall } from "./toolDispatcher.js";
import { getAgent } from "../services/agentService.js";
import {
  endConversation,
  startConversation,
} from "../services/conversationService.js";

const realtimeUrl = "wss://api.x.ai/v1/realtime?model=grok-voice-latest";
const activeClients = new Map();

export function attachVoiceProxy(server, {
  apiKey = process.env.XAI_API_KEY,
  WebSocketImpl = WebSocket,
} = {}) {
  const wss = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url, "http://localhost");

    if (requestUrl.pathname !== "/xai/realtime") {
      return;
    }

    if (!apiKey) {
      socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (client) => {
      const clientId = getClientId(request);
      const agentId = requestUrl.searchParams.get("agent_id") ?? "elyashar";
      const agent = getAgent(agentId);

      if (!agent) {
        client.close(4004, "Agent not found");
        return;
      }
      const previousClient = activeClients.get(clientId);

      if (previousClient?.readyState === WebSocket.OPEN) {
        previousClient.close(4001, "Replaced by a newer voice session");
      }

      activeClients.set(clientId, client);
      const conversation = startConversation(agent.id);
      connectClientToXai(client, apiKey, WebSocketImpl, agent, () => {
        endConversation(conversation.id);
        if (activeClients.get(clientId) === client) {
          activeClients.delete(clientId);
        }
      });
    });
  });

  return wss;
}

function connectClientToXai(client, apiKey, WebSocketImpl, agent, onClose) {
  const upstream = new WebSocketImpl(realtimeUrl, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  upstream.on("open", () => {
    upstream.send(JSON.stringify({
      type: "session.update",
      session: createSessionConfig(agent),
    }));
    sendJson(client, {
      type: "proxy.connected",
    });
  });

  client.on("message", (data) => {
    if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(data.toString());
    }
  });

  upstream.on("message", async (data) => {
    const raw = data.toString();
    const event = parseJson(raw);

    if (event?.type === "response.function_call_arguments.done") {
      await handleToolCall(upstream, event, agent.id);
    }

    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  });

  upstream.on("error", () => {
    sendJson(client, {
      type: "proxy.error",
      message: "לא ניתן להתחבר כרגע לשירות הקולי",
    });
  });

  upstream.on("close", () => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });

  client.on("close", () => {
    onClose();
    if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) {
      upstream.close();
    }
  });
}

function getClientId(request) {
  const url = new URL(request.url, "http://localhost");
  return url.searchParams.get("client_id") ?? request.socket.remoteAddress ?? crypto.randomUUID();
}

async function handleToolCall(upstream, event, agentId) {
  try {
    const result = await dispatchToolCall(event.name, event.arguments, agentId);
    upstream.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: event.call_id,
        output: JSON.stringify(result),
      },
    }));
    upstream.send(JSON.stringify({
      type: "response.create",
    }));
  } catch (error) {
    upstream.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: event.call_id,
        output: JSON.stringify({
          error: error.message,
        }),
      },
    }));
  }
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function sendJson(socket, value) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(value));
  }
}
