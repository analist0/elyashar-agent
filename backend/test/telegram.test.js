import assert from "node:assert/strict";
import test from "node:test";

import { notifyTelegram } from "../src/services/telegramService.js";

test("Telegram notification targets the configured chat without exposing token in payload", async () => {
  const calls = [];
  const fetchImpl = async (...args) => {
    calls.push(args);
    return {
      ok: true,
    };
  };

  const result = await notifyTelegram(
    {
      name: "סוכן בדיקה",
      telegram_bot_token: "bot-secret",
      telegram_chat_id: "998877",
    },
    {
      fullName: "ישראל ישראלי",
      phone: "0501234567",
      service: "ייעוץ",
      date: "2026-06-15",
      time: "14:00",
    },
    fetchImpl,
  );

  assert.deepEqual(result, {
    sent: true,
    reason: undefined,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "https://api.telegram.org/botbot-secret/sendMessage");
  const body = JSON.parse(calls[0][1].body);
  assert.equal(body.chat_id, "998877");
  assert.equal(body.text.includes("ישראל ישראלי"), true);
  assert.equal(body.text.includes("bot-secret"), false);
});
