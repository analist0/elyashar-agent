import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { createApp } from "../src/app.js";
import { computeSubscriptionStatus } from "../src/services/subscriptionService.js";

describe("Registration Flow", () => {
  let baseUrl;
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("POST /register validates missing email", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "", password: "123456" }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.ok(body.error.includes("email"));
  });

  test("POST /register validates short password", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "123" }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.ok(body.error.includes("Password"));
  });

  test("POST /register succeeds in local-dev mode without Supabase", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "newuser@example.com", password: "secure123" }),
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.ok(body.access_token);
    assert.ok(body.user.id);
    assert.equal(body.user.email, "newuser@example.com");
  });
});

describe("Billing Protection", () => {
  let baseUrl;
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("GET /billing/status requires authentication", async () => {
    const response = await fetch(`${baseUrl}/billing/status`);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error, "Unauthorized");
  });

  test("POST /billing/manual-activate returns 404 when disabled", async () => {
    const response = await fetch(`${baseUrl}/billing/manual-activate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer local-dev-token",
      },
      body: JSON.stringify({ plan: "paid" }),
    });
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.error, "Not found");
  });

  test("POST /billing/start-trial requires auth", async () => {
    const response = await fetch(`${baseUrl}/billing/start-trial`, { method: "POST" });
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error, "Unauthorized");
  });
});

describe("Voice Token Production Flow", () => {
  let baseUrl;
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("POST /xai/voice-token requires authentication", async () => {
    const response = await fetch(`${baseUrl}/xai/voice-token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error, "Unauthorized");
  });

  test("POST /xai/voice-token reports missing xAI key after local trial fallback", async () => {
    const response = await fetch(`${baseUrl}/xai/voice-token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer local-dev-token",
      },
      body: JSON.stringify({}),
    });
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.error, "XAI_API_KEY is not configured");
  });
});

describe("Subscription Status Computation", () => {
  test("computeSubscriptionStatus returns none for null", () => {
    const result = computeSubscriptionStatus(null);
    assert.deepEqual(result, { status: "none", daysRemaining: null });
  });

  test("computeSubscriptionStatus detects active trialing", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeSubscriptionStatus({
      status: "trialing",
      plan: "trial",
      current_period_end: future,
    });
    assert.equal(result.status, "trialing");
    assert.ok(result.daysRemaining >= 6 && result.daysRemaining <= 8);
  });

  test("computeSubscriptionStatus detects expired trial", () => {
    const past = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeSubscriptionStatus({
      status: "trialing",
      plan: "trial",
      current_period_end: past,
    });
    assert.equal(result.status, "expired");
    assert.equal(result.daysRemaining, 0);
  });

  test("computeSubscriptionStatus detects active paid", () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeSubscriptionStatus({
      status: "active",
      plan: "pro",
      current_period_end: future,
    });
    assert.equal(result.status, "active");
    assert.ok(result.daysRemaining >= 14 && result.daysRemaining <= 16);
  });

  test("computeSubscriptionStatus detects expired paid", () => {
    const past = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeSubscriptionStatus({
      status: "active",
      plan: "pro",
      current_period_end: past,
    });
    assert.equal(result.status, "expired");
    assert.equal(result.daysRemaining, 0);
  });
});

describe("Public Agent Endpoint", () => {
  let baseUrl;
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("GET /public/agents/:slug returns public agent data without auth", async () => {
    const response = await fetch(`${baseUrl}/public/agents/elyashar`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.agent.name);
    assert.ok(body.agent.instructions);
    // Must not expose private fields
    assert.equal(body.agent.telegram_bot_token, undefined);
    assert.equal(body.agent.telegram_chat_id, undefined);
  });

  test("GET /public/agents/:slug returns 404 for unknown slug", async () => {
    const response = await fetch(`${baseUrl}/public/agents/unknown-slug-12345`);
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
  });
});

describe("Auth Middleware", () => {
  let baseUrl;
  let server;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("GET /agents without token returns 401", async () => {
    const response = await fetch(`${baseUrl}/agents`);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error, "Unauthorized");
  });

  test("GET /agents with Bearer token returns agents in dev", async () => {
    const response = await fetch(`${baseUrl}/agents`, {
      headers: { Authorization: "Bearer local-dev-token" },
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.agents));
  });
});
