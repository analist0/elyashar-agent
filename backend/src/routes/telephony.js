import { Router } from "express";

import { createTwilioInboundTwiML } from "../telephony/providers/twilioProvider.js";

const router = Router();

router.get("/providers", (req, res) => {
  res.json({
    success: true,
    providers: [
      {
        id: "twilio",
        name: "Twilio",
        status: "planned",
        type: "media_stream",
      },
      {
        id: "telnyx",
        name: "Telnyx",
        status: "planned",
        type: "media_stream",
      },
      {
        id: "sip",
        name: "SIP / Asterisk",
        status: "planned",
        type: "sip",
      },
    ],
  });
});

router.post("/twilio/inbound/:agentId", (req, res) => {
  const { agentId } = req.params;
  const host = process.env.PUBLIC_API_HOST || req.get("host");
  const streamUrl = `wss://${host}/telephony/twilio/stream/${encodeURIComponent(agentId)}`;

  res.type("text/xml").send(createTwilioInboundTwiML({ streamUrl }));
});

export default router;
