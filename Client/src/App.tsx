import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import BookingPage from "./pages/BookingPage";
import PremiumTrainingPage from "./pages/PremiumTrainingPage";
import UserDashboard from "./pages/dashboard/UserDashboard";
import AdminDashboard from "./pages/dashboard/admin/DashboardPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboardPage from "./pages/dashboard/admin/DashboardPage";
import AdminUsersPage from "./pages/dashboard/admin/UsersPage";
import AdminBookingsPage from "./pages/dashboard/admin/BookingsPage";
import AdminPremiumTeamsPage from "./pages/dashboard/admin/PremiumTeamsPage";
import AdminReportsPage from "./pages/dashboard/admin/ReportsPage";
import AdminSettingsPage from "./pages/dashboard/admin/SettingsPage";
import CoachesPage from "./pages/dashboard/admin/CoachesPage";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
}) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  const userDataStr = localStorage.getItem("user");
  let isAdmin = false;

  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      isAdmin = userData.role === "admin";
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// AppContent component to use useLocation
const AppContent = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the user is an admin
    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setIsAdmin(userData.role === "admin");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {!location.pathname.startsWith('/admin') && (
        <Navbar isAdmin={isAdmin} />
      )}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/premium" element={<PremiumTrainingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/booking"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/premium"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPremiumTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coaches"
            element={
              <ProtectedRoute adminOnly={true}>
                <CoachesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-confirmation"
            element={<PaymentSuccessPage />}
          />

          {/* Add this redirect for premium-confirmation */}
          <Route
            path="/premium-confirmation"
            element={<Navigate to="/dashboard" />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
};

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
