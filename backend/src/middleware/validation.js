const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateAvailabilityRequest(req, res, next) {
  const bodyError = validateObjectBody(req.body);

  if (bodyError) {
    return validationError(res, bodyError);
  }

  if (!isValidDate(req.body.date)) {
    return validationError(res, "date is required and must use YYYY-MM-DD format");
  }

  return next();
}

export function validateBookingRequest(req, res, next) {
  const bodyError = validateObjectBody(req.body);

  if (bodyError) {
    return validationError(res, bodyError);
  }

  if (!isNonEmptyString(req.body.name)) {
    return validationError(res, "name is required and must be a non-empty string");
  }

  if (!isValidDate(req.body.date)) {
    return validationError(res, "date is required and must use YYYY-MM-DD format");
  }

  if (!isNonEmptyString(req.body.time) || !timePattern.test(req.body.time)) {
    return validationError(res, "time is required and must use HH:MM format");
  }

  return next();
}

function validateObjectBody(body) {
  if (body === undefined) {
    return "Request body is required";
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }

  return null;
}

function isValidDate(value) {
  if (!isNonEmptyString(value) || !datePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validationError(res, error) {
  return res.status(400).json({
    success: false,
    error,
  });
}
