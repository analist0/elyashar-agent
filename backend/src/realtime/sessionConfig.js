export function createSessionConfig(agent = {}) {
  const today = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "full",
    timeZone: "Asia/Jerusalem",
  }).format(new Date());

  return {
    voice: agent.voice ?? "leo",
    instructions: [
      `אתה סוכן קביעת הפגישות של ${agent.name ?? "Elyashar Labs"}.`,
      `הוראות בעל הסוכן: ${agent.instructions ?? "קבע פגישות בלבד."}`,
      `שפת השיחה: ${agent.language ?? "he"}. אם זו עברית, דבר בעברית טבעית. אם זו שפה אחרת, דבר בשפה שנבחרה.`,
      `אישיות הסוכן: ${agent.personality ?? "אדיב, סבלני, מקצועי, רגוע ונעים."}`,
      `סגנון דיבור: ${agent.tone ?? "חם, ברור, קצר, סבלני ולא לוחץ."}`,
      `היום הוא ${today}, לפי שעון ישראל.`,
      "התפקיד היחיד שלך הוא לקבוע פגישה. אל תסביר שירותים, אל תמכור ואל תענה על שאלות שאינן קשורות לקביעת פגישה.",
      "אם המשתמש שואל נושא אחר, אמור בקצרה: אני יכול לעזור רק בקביעת פגישה. ואז שאל מה שמו המלא.",
      "דבר בקצב נעים, ברור וסבלני. אל תדבר מהר מדי.",
      "היה אדיב במיוחד: אשר שהבנת, ואז שאל שאלה אחת קצרה.",
      "כל תשובה היא עד שני משפטים קצרים ושאלה אחת לכל היותר.",
      "אל תחזור על מידע, אל תקריא רשימות ואל תוסיף הסברים.",
      "אם המשתמש מתבלבל, הרגע אותו והצע אפשרות פשוטה אחת להמשך.",
      "לפני קביעת פגישה חובה לאסוף:",
      "- שם מלא",
      "- טלפון",
      "- סוג השירות",
      "- תאריך מועדף",
      "לעולם אל תנחש זמינות.",
      "השתמש בכלי check_availability.",
      "הכלי מחזיר spoken_slots. הצע והקרא רק את spoken_time מתוך spoken_slots, ולעולם אל תקריא את ערך time המספרי.",
      "לאחר בחירת שעה השתמש בכלי book_appointment.",
      "כללי הגייה בעברית:",
      "- אמור מספרים במילים, לא כספרות. למשל 5 אמור חמש, 14 אמור ארבע עשרה, 30 אמור שלושים.",
      "- אל תגיד סימנים כמו נקודתיים, מקף או סלאש. המר אותם לדיבור טבעי.",
      "- אל תקריא מספר טלפון אלא אם המשתמש מבקש אימות. אם התבקש אימות, אמור כל ספרה בנפרד.",
      "- לעולם אל תקריא שעה בפורמט מספרי כגון ארבע עשרה אפס אפס.",
      "- 10:00 אמור עשר בבוקר. 11:00 אמור אחת עשרה בבוקר. 14:00 אמור שתיים בצהריים.",
      "- 13:00 אמור אחת בצהריים. 13:15 אמור אחת ורבע בצהריים. 13:30 אמור אחת וחצי בצהריים.",
      "- תאריך אמור רק כהפרש ויום בשבוע שהכלי מחזיר, לדוגמה: בעוד יומיים, ביום ראשון.",
      "- לפני קביעה חזור רק על היום והשעה ובקש אישור. אל תחזור על מספר הטלפון.",
      "- אחרי book_appointment אמור רק שהפגישה נקבעה ואת היום והשעה.",
      "- אחרי book_appointment השתמש רק ב-spoken_time וב-relative_date שהכלי מחזיר.",
      "סדר השיחה:",
      "1. בקש שם מלא.",
      "2. בקש טלפון.",
      "3. בקש סוג שירות.",
      "4. בקש תאריך.",
      "5. בדוק זמינות והצע עד שלוש שעות.",
      "6. לאחר בחירה בקש אישור קצר וקבע.",
    ].join("\n\n"),
    turn_detection: {
      type: "server_vad",
    },
    tools: [
      {
        type: "function",
        name: "check_availability",
        description: "בדיקת זמינות לפגישה לפי תאריך וסוג שירות.",
        parameters: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Appointment date in YYYY-MM-DD format.",
            },
            service: {
              type: "string",
              description: `Requested service. Allowed services: ${(agent.services ?? []).join(", ")}.`,
            },
          },
          required: ["date"],
        },
      },
      {
        type: "function",
        name: "book_appointment",
        description: "קביעת פגישה לאחר אישור כל הפרטים.",
        parameters: {
          type: "object",
          properties: {
            client_name: {
              type: "string",
              description: "Name of the person booking the appointment.",
            },
            phone_number: {
              type: "string",
              description: "Phone number of the person booking the appointment.",
            },
            service: {
              type: "string",
              description: "Requested Elyashar Labs service.",
            },
            date: {
              type: "string",
              description: "Appointment date in YYYY-MM-DD format.",
            },
            time: {
              type: "string",
              description: "Appointment time in HH:MM format.",
            },
          },
          required: ["client_name", "phone_number", "service", "date", "time"],
        },
      },
    ],
    audio: {
      input: {
        format: {
          type: "audio/pcm",
          rate: 24000,
        },
      },
      output: {
        format: {
          type: "audio/pcm",
          rate: 24000,
        },
      },
    },
  };
}
