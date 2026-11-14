import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { LangProvider } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import BookingDetail from '@/pages/BookingDetail';
import BookingManagement from '@/pages/BookingManagement';
import Agents from '@/pages/Agents';
import Guests from '@/pages/Guests';
import GuestDetail from '@/pages/GuestDetail';
import Passes from '@/pages/Passes';
import Ski from '@/pages/Ski';
import Lessons from '@/pages/Lessons';
import Operations from '@/pages/Operations';
import Dining from '@/pages/Dining';
import StaffPage from '@/pages/Staff';
import Transport from '@/pages/Transport';
import Accommodation from '@/pages/Accommodation';
import Events from '@/pages/Events';
import Reports from '@/pages/Reports';
import Support from '@/pages/Support';
import Analytics from '@/pages/Analytics';
import ContentManagement from '@/pages/ContentManagement';
import Payments from '@/pages/Payments';
import Refunds from '@/pages/Refunds';
import GiftVouchers from '@/pages/GiftVouchers';
import Retail from '@/pages/Retail';
import RetailInventory from '@/pages/RetailInventory';
import OwnershipSupport from '@/pages/OwnershipSupport';
import WebsiteBuilder from '@/pages/WebsiteBuilder';
import SiteShell from '@/components/site/SiteShell';
import SiteHome from '@/pages/SiteHome';
import SitePageDetail from '@/pages/SitePageDetail';
import CustomerExperience from '@/pages/CustomerExperience';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<CustomerHome />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Navigate to="/booking-management" replace />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/booking-management" element={<BookingManagement />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/gift-vouchers" element={<GiftVouchers />} />
          <Route path="/retail" element={<Retail />} />
          <Route path="/retail-inventory" element={<RetailInventory />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/guests/:id" element={<GuestDetail />} />
          <Route path="/passes" element={<Passes />} />
          <Route path="/ski" element={<Ski />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/events" element={<Events />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/support" element={<Support />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/content" element={<ContentManagement />} />
          <Route path="/website-builder" element={<WebsiteBuilder />} />
          <Route path="/ownership-support" element={<OwnershipSupport />} />
        </Route>

        <Route path="/site" element={<SiteShell />}>
          <Route index element={<SiteHome />} />
          <Route path=":slug" element={<SitePageDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <LangProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRouteGate />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </LangProvider>
  );
}

function AppRouteGate() {
  const { pathname } = useLocation();
  const customerPaths = new Set([
    '/', '/passes', '/configure-pass', '/bike-configure', '/book', '/checkout', '/cart', '/shop', '/retail', '/rentals',
    '/orders', '/account', '/login', '/register', '/lessons', '/transport', '/resort',
    '/ski', '/support',
  ]);

  return (
    customerPaths.has(pathname) ? <CustomerExperience /> : (
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    )
  );
}

export default App
