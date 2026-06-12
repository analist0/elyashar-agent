import {
  createAppointment,
  formatHebrewTime,
  getAvailableSlots,
  getDateContext,
  getSpokenSlots,
} from "../services/appointmentService.js";
import { getAgent } from "../services/agentService.js";
import { notifyTelegram } from "../services/telegramService.js";

const toolHandlers = {
  check_availability: ({ date, service }, agentId) => ({
    ...getDateContext(date),
    service,
    slots: getAvailableSlots(),
    spoken_slots: getSpokenSlots(),
  }),
  book_appointment: async ({ client_name, phone_number, ...appointment }, agentId) => {
    const savedAppointment = createAppointment({
      ...appointment,
      name: client_name,
      fullName: client_name,
      phone: phone_number,
      source: "סוכן קולי",
      agent_id: agentId,
    });
    const telegram = await notifyTelegram(getAgent(agentId), savedAppointment);

    return {
      appointment: savedAppointment,
      telegram,
      spoken_time: formatHebrewTime(savedAppointment.time),
      ...getDateContext(savedAppointment.date),
    };
  },
};

export function dispatchToolCall(name, argumentsValue, agentId = "elyashar") {
  const handler = toolHandlers[name];

  if (!handler) {
    throw new Error(`Unknown realtime tool: ${name}`);
  }

  const parsedArguments = typeof argumentsValue === "string"
    ? JSON.parse(argumentsValue)
    : argumentsValue;

  return handler(parsedArguments ?? {}, agentId);
}
