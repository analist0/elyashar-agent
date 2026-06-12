import { Router } from "express";

import {
  validateAvailabilityRequest,
  validateBookingRequest,
} from "../middleware/validation.js";
import { bookAppointment } from "../tools/bookAppointment.js";
import { checkAvailability } from "../tools/checkAvailability.js";
import { listAppointments } from "../tools/listAppointments.js";

const router = Router();

router.get("/appointments", listAppointments);
router.post(
  "/check_availability",
  validateAvailabilityRequest,
  checkAvailability,
);
router.post(
  "/book_appointment",
  validateBookingRequest,
  bookAppointment,
);

export default router;
