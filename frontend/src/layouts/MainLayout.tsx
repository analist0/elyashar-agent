import { Outlet, useLocation } from "react-router-dom";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TrialBanner } from "../components/TrialBanner";

const meta: Record<string, { title: string; description: string }> = {
  "/voice": { title: "סוכן המכירות", description: "שיחה חכמה עם לקוחות בזמן אמת" },
  "/booking": { title: "קביעת פגישה", description: "בדיקת זמינות וקביעת פגישה חדשה" },
  "/dashboard": { title: "לוח בקרה", description: "לידים, פגישות ושיחות במקום אחד" },
  "/agents": { title: "ניהול סוכנים", description: "יצירה, הגדרה והטמעת סוכנים קוליים" },
  "/register": { title: "הרשמה", description: "פתיחת חשבון והפעלת תקופת ניסיון" },
};

export function MainLayout() {
  const location = useLocation();
  const page = meta[location.pathname] ?? meta["/voice"];

  return (
    <div className="ambient-panel min-h-[100dvh]">
      <TrialBanner />
      <Sidebar />
      <div className="relative z-10 mr-20 lg:mr-72">
        <Header {...page} />
        <main className="mx-auto max-w-[1500px] p-3 pb-8 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
