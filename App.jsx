// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import BookAppointment from "./pages/BookAppointment";
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";
import TelemarketerDashboard from "./pages/TelemarketerDashboard";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/login" element={<Login />} />

      {/* Role dashboards */}
      <Route path="/super-admin" element={
        <ProtectedRoute roles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>
      } />
      <Route path="/agency" element={
        <ProtectedRoute roles={["agency_owner"]}><AgencyDashboard /></ProtectedRoute>
      } />
      <Route path="/producer" element={
        <ProtectedRoute roles={["producer"]}><ProducerDashboard /></ProtectedRoute>
      } />
      <Route path="/telemarketer" element={
        <ProtectedRoute roles={["telemarketer"]}><TelemarketerDashboard /></ProtectedRoute>
      } />

      {/* Shared lead detail (all authenticated roles) */}
      <Route path="/lead/:id" element={
        <ProtectedRoute><LeadDetail /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
