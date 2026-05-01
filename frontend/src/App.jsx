import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ToastProvider } from './store/ToastContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Login           from './pages/Login';
import AdminDashboard  from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Members         from './pages/Members';
import MemberProfile   from './pages/MemberProfile';
import Tasks           from './pages/Tasks';
import Projects        from './pages/Projects';
import KanbanPage      from './pages/KanbanPage';
import Activity        from './pages/Activity';

function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard"       element={<DashboardPage />} />
              <Route path="/tasks"           element={<Tasks />} />
              <Route path="/kanban"          element={<KanbanPage />} />
              <Route path="/projects"        element={<Projects />} />
              <Route path="/activity"        element={<Activity />} />
              <Route path="/admin/members"   element={<AdminRoute><Members /></AdminRoute>} />
              <Route path="/admin/members/:id" element={<AdminRoute><MemberProfile /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
