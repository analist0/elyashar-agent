import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "./layouts/MainLayout";
import { BookingPage } from "./pages/BookingPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PublicVoiceBookingPage } from "./pages/PublicVoiceBookingPage";
import { AgentsPage } from "./pages/AgentsPage";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path="/voice-booking/:agentId?" element={<PublicVoiceBookingPage />} />
      <Route element={<MainLayout />}>
        <Route path="voice" element={<ChatPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
