import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MaintenancePage from "@/components/MaintenancePage";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import WarehouseLayout from "./components/WarehouseLayout";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from "react";
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQs = lazy(() => import("./pages/FAQs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Account = lazy(() => import('./pages/Account'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ReturnsRefunds = lazy(() => import('./pages/ReturnsRefunds'));
const Shipping = lazy(() => import("./pages/Shipping"));
const MyQuotes = lazy(() => import('./pages/MyQuotes'));
const CustomCheckout = lazy(() => import('./pages/CustomCheckout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));

// Lazy load admin pages separately for better code splitting
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const Subcategories = lazy(() => import("./pages/admin/Subcategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const Users = lazy(() => import("./pages/admin/Users"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const LowStockProducts = lazy(() => import('./pages/admin/LowStockProducts'));
const Quotes = lazy(() => import("./pages/admin/Quotes"));
const ContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const AdminBlogManage = lazy(() => import('./pages/admin/BlogManage'));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const BankTransferOrders = lazy(() => import("./pages/admin/BankTransferOrders"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

const PesapalTransactions = lazy(() => import("./pages/admin/PesapalTransactions"));
const WarehouseOrders = lazy(() => import("./pages/warehouse/WarehouseOrders"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min: avoid refetching the same data on quick navigations
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Uniform page transition for public-facing pages: one consistent fade/slide
// plus the lazy-loading Suspense boundary, applied to every page the same way.
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </Suspense>
);

// Suspense-only boundary for admin/warehouse pages, which render inside a
// persistent layout and should not re-animate on every sub-navigation.
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/faqs" element={<PageTransition><FAQs /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
        <Route path="/orders" element={
          <ProtectedRoute>
            <PageTransition><Orders /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
        <Route path="/my-quotes" element={<PageTransition><MyQuotes /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/returns-refunds" element={<PageTransition><ReturnsRefunds /></PageTransition>} />
        <Route path="/shipping" element={<PageTransition><Shipping /></PageTransition>} />
        <Route path="/checkout/:orderId" element={<PageTransition><CustomCheckout /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
        <Route path="/payment-failure" element={<PageTransition><PaymentFailure /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/resend-verification" element={<PageTransition><ResendVerification /></PageTransition>} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Lazy><AdminLayout /></Lazy>
          </ProtectedRoute>
        }>
          <Route index element={<Lazy><Dashboard /></Lazy>} />
          <Route path="products" element={<Lazy><Products /></Lazy>} />
          <Route path="subcategories" element={<Lazy><Subcategories /></Lazy>} />
          <Route path="orders" element={<Lazy><AdminOrders /></Lazy>} />
          <Route path="bank-transfer-orders" element={<Lazy><BankTransferOrders /></Lazy>} />
          <Route path="quotes" element={<Lazy><Quotes /></Lazy>} />
          <Route path="users" element={<Lazy><Users /></Lazy>} />
          <Route path="reviews" element={<Lazy><Reviews /></Lazy>} />
          <Route path="contact-messages" element={<Lazy><ContactMessages /></Lazy>} />
          <Route path="newsletter" element={<Lazy><Newsletter /></Lazy>} />
          <Route path="blog" element={<Lazy><AdminBlogManage /></Lazy>} />
          <Route path="settings" element={<Lazy><AdminSettings /></Lazy>} />
          <Route path="low-stock" element={<Lazy><LowStockProducts /></Lazy>} />
          <Route path="audit-logs" element={<Lazy><AuditLogs /></Lazy>} />
          <Route path="pesapal-transactions" element={<Lazy><PesapalTransactions /></Lazy>} />
        </Route>
        <Route path="/warehouse" element={
          <ProtectedRoute allowedRoles={['warehouse', 'admin', 'superadmin']}>
            <Lazy><WarehouseLayout /></Lazy>
          </ProtectedRoute>
        }>
          <Route index element={<Lazy><WarehouseOrders /></Lazy>} />
        </Route>
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isWarehouseRoute = location.pathname.startsWith("/warehouse");
  const isAppRoute = isAdminRoute || isWarehouseRoute;
  const { settings } = useSettings();
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'warehouse';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Maintenance mode takes the storefront offline for everyone except staff,
  // who still need /admin and /warehouse to turn it back off.
  if (settings?.maintenanceMode && !isAppRoute && !isStaff) {
    return (
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <MaintenancePage />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col">
            {!isAppRoute && <AnnouncementBanner />}
            {!isAppRoute && <Header />}
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            {!isAppRoute && <Footer />}
          </div>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
