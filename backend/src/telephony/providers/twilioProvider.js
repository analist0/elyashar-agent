export function createTwilioInboundTwiML({ streamUrl }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}" />
  </Connect>
</Response>`;
}

export function normalizeTwilioMessage(message) {
  if (message.event === "start") {
    return {
      type: "start",
      callId: message.start?.callSid,
      callerNumber: message.start?.customParameters?.from,
    };
  }

  if (message.event === "media") {
    return {
      type: "media",
      audioBase64: message.media?.payload,
    };
  }

  if (message.event === "stop") {
    return {
      type: "stop",
      callId: message.stop?.callSid,
    };
  }

  return { type: "unknown" };
}
