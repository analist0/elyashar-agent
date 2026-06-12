import {
  getAvailableSlots,
  getDateContext,
} from "../services/appointmentService.js";

export function checkAvailability(req, res) {
  res.json({
    success: true,
    ...getDateContext(req.body.date),
    slots: getAvailableSlots(),
  });
}
