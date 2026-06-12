const availableSlots = [
  "10:00",
  "11:00",
  "14:00",
];
const appointments = [];

export function getAvailableSlots() {
  return [...availableSlots];
}

export function getSpokenSlots() {
  return availableSlots.map((time) => ({
    time,
    spoken_time: formatHebrewTime(time),
  }));
}

export function createAppointment(appointment) {
  const savedAppointment = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...appointment,
  };

  appointments.unshift(savedAppointment);
  return { ...savedAppointment };
}

export function getAppointments() {
  return appointments.map((appointment) => ({ ...appointment }));
}

export function getDateContext(dateValue, now = new Date()) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const daysFromToday = Math.round((date.getTime() - today.getTime()) / 86400000);
  const weekday = new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);

  return {
    date: dateValue,
    weekday,
    days_from_today: daysFromToday,
    relative_date: formatRelativeDate(daysFromToday),
  };
}

export function formatHebrewTime(time) {
  const spokenTimes = {
    "10:00": "עשר בבוקר",
    "11:00": "אחת עשרה בבוקר",
    "13:00": "אחת בצהריים",
    "13:15": "אחת ורבע בצהריים",
    "13:30": "אחת וחצי בצהריים",
    "14:00": "שתיים בצהריים",
  };

  return spokenTimes[time] ?? time;
}

function formatRelativeDate(daysFromToday) {
  if (daysFromToday === 0) return "היום";
  if (daysFromToday === 1) return "מחר";
  if (daysFromToday === 2) return "בעוד יומיים";
  if (daysFromToday > 2) return `בעוד ${daysFromToday} ימים`;
  return "בתאריך שצוין";
}
