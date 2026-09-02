import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";
import { createXaiClient } from "../src/realtime/xaiClient.js";

const apiKey = "xai-server-secret";
let baseUrl;
let fetchCalls;
let upstreamResponse;
let server;

before(async () => {
  const fetchImpl = async (...args) => {
    fetchCalls.push(args);
    return upstreamResponse;
  };
  const xaiClient = createXaiClient({
    apiKey,
    fetchImpl,
  });

  server = createApp({ xaiClient }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("POST /xai/session creates a client secret without exposing the API key", async () => {
  fetchCalls = [];
  upstreamResponse = Response.json({
    client_secret: {
      value: "ephemeral-secret",
      expires_at: 1781260000,
    },
    expires_at: 1781260000,
    ignored_upstream_field: "not returned",
  });

  const response = await fetch(`${baseUrl}/xai/session`, {
    method: "POST",
    headers: {
      Authorization: "Bearer local-dev-token",
    },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    client_secret: {
      value: "ephemeral-secret",
      expires_at: 1781260000,
    },
    expires_at: 1781260000,
  });
  assert.equal(JSON.stringify(body).includes(apiKey), false);
  assert.equal(fetchCalls.length, 1);

  const [url, options] = fetchCalls[0];
  assert.equal(url, "https://api.x.ai/v1/realtime/client_secrets");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.authorization, `Bearer ${apiKey}`);

  const requestBody = JSON.parse(options.body);
  assert.equal(requestBody.session.voice, "leo");
  assert.equal(requestBody.session.turn_detection.type, "server_vad");
  assert.equal(requestBody.session.audio.input.format.rate, 24000);
  assert.deepEqual(
    requestBody.session.tools.map((tool) => tool.type),
    ["function", "function"],
  );
});

test("POST /xai/session returns 500 when xAI rejects the request", async () => {
  fetchCalls = [];
  upstreamResponse = Response.json(
    {
      error: "unauthorized",
      api_key: apiKey,
    },
    {
      status: 401,
    },
  );

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await fetch(`${baseUrl}/xai/session`, {
      method: "POST",
      headers: {
        Authorization: "Bearer local-dev-token",
      },
    });
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(body, {
      success: false,
      error: "Internal server error",
    });
    assert.equal(JSON.stringify(body).includes(apiKey), false);
  } finally {
    console.error = originalConsoleError;
  }
});
