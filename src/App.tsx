import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import BookCylinder from "./pages/BookCylinder";
import AgentDashboard from "./pages/AgentDashboard";
import TrackOrder from "./pages/TrackOrder";
import CylinderStock from "./pages/CylinderStock";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role ?? '')) {
    return <Navigate to="/" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function RoleDashboard() {
  const { role } = useAuth();
  if (role === "agent") return <AgentDashboard />;
  return <CustomerDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute allowedRoles={["customer"]}><BookCylinder /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute allowedRoles={["customer"]}><TrackOrder /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute allowedRoles={["customer"]}><CylinderStock /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/agent/orders" element={<ProtectedRoute allowedRoles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

