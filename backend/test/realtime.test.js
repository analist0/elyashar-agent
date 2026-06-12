import assert from "node:assert/strict";
import test from "node:test";

import { dispatchToolCall } from "../src/realtime/toolDispatcher.js";
import { getAppointments } from "../src/services/appointmentService.js";

test("realtime availability includes Hebrew date context", () => {
  const result = dispatchToolCall("check_availability", {
    date: "2026-06-15",
    service: "ייעוץ AI",
  });

  assert.equal(result.date, "2026-06-15");
  assert.equal(typeof result.weekday, "string");
  assert.equal(typeof result.relative_date, "string");
  assert.deepEqual(result.slots, ["10:00", "11:00", "14:00"]);
  assert.deepEqual(result.spoken_slots, [
    { time: "10:00", spoken_time: "עשר בבוקר" },
    { time: "11:00", spoken_time: "אחת עשרה בבוקר" },
    { time: "14:00", spoken_time: "שתיים בצהריים" },
  ]);
});

test("realtime booking is stored for the dashboard", async () => {
  const result = await dispatchToolCall("book_appointment", {
    client_name: "לקוח קולי",
    phone_number: "0501234567",
    service: "סוכן AI",
    date: "2026-06-15",
    time: "11:00",
  });

  assert.equal(result.appointment.fullName, "לקוח קולי");
  assert.equal(result.appointment.phone, "0501234567");
  assert.equal(result.appointment.source, "סוכן קולי");
  assert.equal(result.spoken_time, "אחת עשרה בבוקר");
  assert.equal(
    getAppointments().some((appointment) => appointment.id === result.appointment.id),
    true,
  );
});
