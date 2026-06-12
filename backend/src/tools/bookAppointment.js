import { createAppointment } from "../services/appointmentService.js";

export function bookAppointment(req, res) {
  return res.status(200).json({
    success: true,
    appointment: createAppointment({
      ...req.body,
      fullName: req.body.fullName ?? req.body.name,
      source: req.body.source ?? "טופס באתר",
    }),
  });
}
