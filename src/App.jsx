import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import NonLinear from '@/pages/NonLinear';
import Matrices from '@/pages/Matrices';
import LinearSystems from '@/pages/LinearSystems';
import Integration from '@/pages/Integration';
import ODE from '@/pages/ODE';
import Calculus from '@/pages/Calculus';
import NumericalMethods from '@/pages/NumericalMethods';
import Statistics from '@/pages/Statistics';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SavedWorks from '@/pages/SavedWorks';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app - auth is handled per-page or in the sidebar
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Public routes - calculators and methods accessible without login */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/nonlinear" element={<NonLinear />} />
        <Route path="/matrices" element={<Matrices />} />
        <Route path="/linear-systems" element={<LinearSystems />} />
        <Route path="/integration" element={<Integration />} />
        <Route path="/ode" element={<ODE />} />
        <Route path="/calculus" element={<Calculus />} />
        <Route path="/methods" element={<NumericalMethods />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/mis-trabajos" element={<SavedWorks />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App