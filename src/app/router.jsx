import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoleRoute, homePathForRole } from "./permissions";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SuperAdminDashboard = lazy(() => import("@/features/superadmin/Dashboard"));
const AdminDashboard = lazy(() => import("@/features/admin/Dashboard"));
const PresidentDashboard = lazy(() => import("@/features/president/Dashboard"));
const SecretaireDashboard = lazy(() => import("@/features/secretaire/Dashboard"));
const TresorierDashboard = lazy(() => import("@/features/tresorier/Dashboard"));
const CenseurDashboard = lazy(() => import("@/features/censeur/Dashboard"));
const MembreDashboard = lazy(() => import("@/features/membre/Dashboard"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
      Chargement...
    </div>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessRoleRoute(user, roles)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <RoleRedirect />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<RoleRedirect />} />

          <Route path="/superadmin/*" element={<ProtectedRoute roles={["superadmin"]}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/president/*" element={<ProtectedRoute roles={["president"]}><PresidentDashboard /></ProtectedRoute>} />
          <Route path="/secretaire/*" element={<ProtectedRoute roles={["secretaire"]}><SecretaireDashboard /></ProtectedRoute>} />
          <Route path="/tresorier/*" element={<ProtectedRoute roles={["tresorier"]}><TresorierDashboard /></ProtectedRoute>} />
          <Route path="/censeur/*" element={<ProtectedRoute roles={["censeur"]}><CenseurDashboard /></ProtectedRoute>} />
          <Route path="/membre/*" element={<ProtectedRoute roles={["membre"]}><MembreDashboard /></ProtectedRoute>} />
          <Route path="/member/*" element={<ProtectedRoute roles={["membre"]}><MembreDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
