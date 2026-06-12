import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

let baseUrl;
let server;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("POST /agents creates an agent without exposing Telegram bot token", async () => {
  const response = await fetch(`${baseUrl}/agents`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: "סוכן לדוגמה",
      instructions: "קבע פגישות ייעוץ בלבד",
      services: ["ייעוץ"],
      telegram_bot_token: "secret-token",
      telegram_chat_id: "12345",
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.agent.name, "סוכן לדוגמה");
  assert.equal(body.agent.telegram_configured, true);
  assert.equal(body.agent.telegram_chat_id, "12345");
  assert.equal(JSON.stringify(body).includes("secret-token"), false);
});

test("GET /agents lists available agents", async () => {
  const response = await fetch(`${baseUrl}/agents`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.agents.some((agent) => agent.id === "elyashar"), true);
});
