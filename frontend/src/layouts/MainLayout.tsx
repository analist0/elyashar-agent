import { Outlet, useLocation } from "react-router-dom";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

const meta: Record<string, { title: string; description: string }> = {
  "/": { title: "סוכן המכירות", description: "שיחה חכמה עם לקוחות בזמן אמת" },
  "/booking": { title: "קביעת פגישה", description: "בדיקת זמינות וקביעת פגישה חדשה" },
  "/dashboard": { title: "לוח בקרה", description: "לידים, פגישות ושיחות במקום אחד" },
  "/agents": { title: "ניהול סוכנים", description: "יצירה, הגדרה והטמעת סוכנים קוליים" },
};

export function MainLayout() {
  const location = useLocation();
  const page = meta[location.pathname] ?? meta["/"];

  return (
    <div className="min-h-[100dvh]">
      <Sidebar />
      <div className="lg:mr-64">
        <Header {...page} />
        <main className="mx-auto max-w-[1500px] p-4 pb-28 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
