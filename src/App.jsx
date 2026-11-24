import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AgentProvider } from '@/lib/AgentContext';
import { CartProvider } from '@/lib/CartContext';
import { PassCartProvider } from '@/lib/PassCartContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import MiniShell from '@/components/MiniShell';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ShopNew from '@/pages/ShopNew';
import ShopDetail from '@/pages/ShopDetail';
import AdEntry from '@/pages/AdEntry';
import Tickets from '@/pages/Tickets';
import Lessons from '@/pages/Lessons';
import BookLesson from '@/pages/BookLesson';
import LessonCheckout from '@/pages/LessonCheckout';
import FirstTimerLessons from '@/pages/FirstTimerLessons';
import Rentals from '@/pages/Rentals';
import PassCart from '@/pages/PassCart';
import My from '@/pages/My';
import Favorites from '@/pages/Favorites';
import FeatureMap from '@/pages/FeatureMap';
import AllFeatures from '@/pages/AllFeatures';
import Info from '@/pages/Info';
import Resort from '@/pages/Resort';
import ProductDetail from '@/pages/ProductDetail';
import ConfigurePass from '@/pages/ConfigurePass';
import BikeRental from '@/pages/BikeRental';
import BookingFlow from '@/pages/BookingFlow';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import AgentCenter from '@/pages/AgentCenter';
import AgentPortal from '@/pages/AgentPortal';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

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

      {/* 课程预约为宽屏双栏布局，独立于手机框架 */}
      <Route path="/lessons/book" element={<BookLesson />} />
      <Route path="/lessons/checkout" element={<LessonCheckout />} />

      {/* 游客可直接浏览与下单，无需注册账号 */}
      <Route element={<MiniShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/new" element={<ShopNew />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/ad" element={<AdEntry />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/first-timer" element={<FirstTimerLessons />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/pass-cart" element={<PassCart />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/info" element={<Info />} />
        <Route path="/resort" element={<Resort />} />
        <Route path="/map" element={<FeatureMap />} />
        <Route path="/features" element={<AllFeatures />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/configure/:id" element={<ConfigurePass />} />
        <Route path="/bike/:id" element={<BikeRental />} />
        <Route path="/booking" element={<Tickets />} />
        <Route path="/booking/:id" element={<BookingFlow />} />
        <Route path="/me" element={<My />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/agent-portal" element={<AgentPortal />} />
      </Route>

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<MiniShell />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/agent" element={<AgentCenter />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <AgentProvider>
            <CartProvider>
              <PassCartProvider>
                <Router>
                  <ScrollToTop />
                  <AuthenticatedApp />
                </Router>
              </PassCartProvider>
            </CartProvider>
          </AgentProvider>
          <Toaster />
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App