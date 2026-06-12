export async function notifyTelegram(agent, appointment, fetchImpl = globalThis.fetch) {
  if (!agent?.telegram_bot_token || !agent.telegram_chat_id) {
    return {
      sent: false,
      reason: "not_configured",
    };
  }

  const response = await fetchImpl(
    `https://api.telegram.org/bot${agent.telegram_bot_token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chat_id: agent.telegram_chat_id,
        text: formatAppointmentMessage(agent, appointment),
      }),
    },
  );

  return {
    sent: response.ok,
    reason: response.ok ? undefined : "telegram_error",
  };
}

function formatAppointmentMessage(agent, appointment) {
  return [
    `פגישה חדשה דרך ${agent.name}`,
    `שם: ${appointment.fullName ?? appointment.name}`,
    `טלפון: ${appointment.phone}`,
    `שירות: ${appointment.service}`,
    `תאריך: ${appointment.date}`,
    `שעה: ${appointment.time}`,
  ].join("\n");
}
