import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import Chat from "./pages/Chat";
import Checklists from "./pages/Checklists";
import Settings from "./pages/Settings";
import VerifyMagicLink from "./pages/VerifyMagicLink";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("zareb_token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-cream-200">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("zareb_token");
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/auth/verify-magic" element={<VerifyMagicLink />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/dashboard/reports/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/dashboard/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/dashboard/chat/:reportId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/dashboard/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
