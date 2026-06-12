import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

let baseUrl;
let server;

before(async () => {
  server = createApp().listen(0);
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

test("GET /health returns service status", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "Elyashar Agent",
  });
});

test("POST /tool/check_availability returns available slots", async () => {
  const date = "2026-06-15";
  const response = await fetch(`${baseUrl}/tool/check_availability`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ date }),
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.date, date);
  assert.deepEqual(body.slots, ["10:00", "11:00", "14:00"]);
  assert.equal(typeof body.weekday, "string");
  assert.equal(typeof body.relative_date, "string");
});

test("POST /tool/book_appointment creates an appointment", async () => {
  const appointment = {
    name: "Test User",
    date: "2026-06-15",
    time: "10:00",
  };
  const response = await fetch(`${baseUrl}/tool/book_appointment`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(appointment),
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.deepEqual(body.appointment, {
    id: body.appointment.id,
    created_at: body.appointment.created_at,
    ...appointment,
    fullName: appointment.name,
    source: "טופס באתר",
  });
});

test("GET /tool/appointments returns booked appointments", async () => {
  const response = await fetch(`${baseUrl}/tool/appointments`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.appointments.some((appointment) => appointment.name === "Test User"), true);
});

test("POST /tool/book_appointment rejects an invalid body", async () => {
  const response = await fetch(`${baseUrl}/tool/book_appointment`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "{}",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "name is required and must be a non-empty string",
  });
});

test("POST /tool/check_availability rejects an invalid date", async () => {
  const response = await fetch(`${baseUrl}/tool/check_availability`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ date: "2026-02-30" }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "date is required and must use YYYY-MM-DD format",
  });
});

test("malformed JSON returns a validation error", async () => {
  const response = await fetch(`${baseUrl}/tool/book_appointment`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: "{",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Request body must contain valid JSON",
  });
});

test("unknown routes return a JSON 404 response", async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Route not found",
  });
});
