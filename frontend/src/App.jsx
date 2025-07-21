import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import LoginPage from "./components/auth/LoginPage"
import SignupPage from "./components/auth/SignupPage"
import PendingApprovalPage from "./components/auth/PendingApprovalPage"
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AdminDashboard from "./components/AdminDashboard"
import GeoJsonImport from "./components/GeoJsonImport"
import ProjectsMap from "./components/ProjectsMap"
import SecurityDemoPage from "./pages/SecurityDemoPage"
import ProjectsDashboard from "./components/ProjectsDashboard"
import ProjectDetail from "./components/ProjectDetail"
import ProjectsMapWithProject from "./components/ProjectsMapWithProject"
import AdminUsersPage from "./pages/AdminUsersPage"
import AdminSignupRequestsPage from "./pages/AdminSignupRequestsPage"
import ProjectsPage from "./pages/ProjectsPage"
import ProjectDetailPage from "./pages/ProjectDetailPage"
import ProjectsMapPage from "./pages/ProjectsMapPage"
import ProjectMapWithProjectPage from "./pages/ProjectMapWithProjectPage"
import ProjectEditPage from "./pages/ProjectEditPage"


// import ProjectsMap from "./components/ProjectsMap"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <ProjectEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/map"
            element={
              <ProtectedRoute>
                <ProjectsMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/map/:projectId"
            element={
              <ProtectedRoute>
                <ProjectMapWithProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/import"
            element={
              <ProtectedRoute>
                <GeoJsonImport />
              </ProtectedRoute>
            }
          />
          <Route path="/security-demo" element={<SecurityDemoPage />} />


          {/* Protected Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/signup-requests"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSignupRequestsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">User Dashboard</h1>
                  <p>Welcome to your dashboard!</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Unauthorized Route */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Accès non autorisé</h1>
                  <p className="text-gray-600">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                  </p>
                </div>
              </div>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
