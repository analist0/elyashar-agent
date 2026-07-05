import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "./layouts/MainLayout";
import { AgentsPage } from "./pages/AgentsPage";
import { BillingPage } from "./pages/BillingPage";
import { BookingPage } from "./pages/BookingPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PublicVoiceBookingPage } from "./pages/PublicVoiceBookingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TelephonyPage } from "./pages/TelephonyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/voice-booking/:agentId?" element={<PublicVoiceBookingPage />} />
      <Route element={<MainLayout />}>
        <Route index element={<ChatPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="telephony" element={<TelephonyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
