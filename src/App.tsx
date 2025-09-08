// E:\work\Spot\spice-track-hub-98\src\App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BusinessProvider } from '@/contexts/BusinessContext';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Kitchen from './pages/Kitchen';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null; // Wait for user data
  }

  // Role-based default redirect
  switch (user.role) {
    case 'cashier':
      return <Navigate to="/billing" replace />;
    case 'chef':
      return <Navigate to="/kitchen" replace />;
    case 'stock':
      return <Navigate to="/stock" replace />;
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <RoleBasedRedirect />;
};

// Component to handle loading state and routes
const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated !== undefined && user !== undefined) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="billing" element={<Billing />} />
        <Route path="products" element={<Products />} />
        <Route path="stock" element={<Stock />} />
        <Route path="kitchen" element={<Kitchen />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BusinessProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </BusinessProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;