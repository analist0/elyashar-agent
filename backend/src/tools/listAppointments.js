import { getAppointments } from "../services/appointmentService.js";

export function listAppointments(req, res) {
  res.status(200).json({
    success: true,
    appointments: getAppointments(),
  });
}
