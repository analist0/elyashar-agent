import { useCallback, useState } from "react";

export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
};

const answers: Record<string, string> = {
  "מה זה Elyashar Labs?": "Elyashar Labs בונה מערכות AI שמחברות בין שיחות, לידים ותהליכים עסקיים. אנחנו מתכננים ומפתחים פתרון מלא, מהרעיון ועד מערכת פעילה.",
  "אילו שירותי AI אתם מציעים?": "אנחנו מתמחים בסוכני AI, אוטומציות עסקיות, אפליקציות חכמות, אינטגרציות ומערכות קול בזמן אמת.",
  "ספר לי על SafePing": "SafePing הוא מוצר בטיחות חכם שמאפשר לאנשים ולעסקים לנהל התראות, אנשי קשר ותגובה מהירה בצורה פשוטה ואמינה.",
  "אני רוצה לבנות אפליקציה": "מצוין. נתחיל בהבנת הבעיה, קהל היעד והגרסה הראשונה שכדאי להשיק. לאחר מכן נבנה תכנית מוצר, עיצוב ופיתוח.",
  "אני רוצה אוטומציה לעסק": "אפשר לחבר בין הלידים, ה־CRM, היומן והתקשורת עם הלקוחות כדי לחסוך זמן ולהגדיל המרות. מה התהליך שהכי מעכב את העסק היום?",
};

const initialMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  content: "שלום, אני סוכן המכירות החכם של Elyashar Labs. איך אוכל לעזור לכם להתקדם היום?",
  time: "עכשיו",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((content: string) => {
    const cleanContent = content.trim();
    if (!cleanContent || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content: cleanContent, time: "עכשיו" },
    ]);
    setIsTyping(true);

    window.setTimeout(() => {
      const answer = answers[cleanContent]
        ?? "תודה על הפרטים. כדי להתאים פתרון מדויק, אשמח להבין מה היעד העסקי המרכזי ומה תרצו לשפר בתהליך הקיים.";
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: answer, time: "עכשיו" },
      ]);
      setIsTyping(false);
    }, 850);
  }, [isTyping]);

  return { messages, isTyping, sendMessage };
}
