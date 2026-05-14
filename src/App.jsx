import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import EquipmentBase from './pages/EquipmentBase';
import Tickets from './pages/Tickets';
import Dashboard from './pages/Dashboard';
import MaterialRequests from './pages/MaterialRequests';
import KnowledgeBase from './pages/KnowledgeBase';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import DispatcherConsole from './pages/DispatcherConsole';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="equipment" element={<EquipmentBase />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="materials" element={<MaterialRequests />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="calendar" element={<MaintenanceCalendar />} />
          <Route path="dispatcher" element={<DispatcherConsole />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
