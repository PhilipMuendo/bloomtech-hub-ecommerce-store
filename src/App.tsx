import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
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
const Blog = lazy(() => import("./pages/Blog"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Account = lazy(() => import('./pages/Account'));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ReturnsRefunds = lazy(() => import('./pages/ReturnsRefunds'));
const Shipping = lazy(() => import("./pages/Shipping"));
const MyQuotes = lazy(() => import('./pages/MyQuotes'));
const CustomCheckout = lazy(() => import('./pages/CustomCheckout'));

// Lazy load admin pages separately for better code splitting
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const Users = lazy(() => import("./pages/admin/Users"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const LowStockProducts = lazy(() => import('./pages/admin/LowStockProducts'));
const Quotes = lazy(() => import("./pages/admin/Quotes"));

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Wrapper to provide location context
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
          </Suspense>
        } />
        <Route path="/shop" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Shop />
          </motion.div>
          </Suspense>
        } />
        <Route path="/product/:id" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductDetail />
          </motion.div>
          </Suspense>
        } />
        <Route path="/cart" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Cart />
          </motion.div>
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <About />
          </motion.div>
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Contact />
          </motion.div>
          </Suspense>
        } />
        <Route path="/faqs" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FAQs />
          </motion.div>
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Blog />
          </motion.div>
          </Suspense>
        } />
        <Route path="/blog/:slug" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BlogPost />
          </motion.div>
          </Suspense>
        } />
        <Route path="/wishlist" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Wishlist />
          </motion.div>
          </Suspense>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Orders />
            </motion.div>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Login />
          </motion.div>
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Register />
          </motion.div>
          </Suspense>
        } />
        <Route path="/account" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Account />
          </motion.div>
          </Suspense>
        } />
        <Route path="/my-quotes" element={
          <Suspense fallback={<LoadingSpinner />}>
            <MyQuotes />
          </Suspense>
        } />
        <Route path="/privacy-policy" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/terms-of-service" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TermsOfService />
          </Suspense>
        } />
        <Route path="/returns-refunds" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ReturnsRefunds />
          </Suspense>
        } />
        <Route path="/shipping" element={
          <Suspense fallback={<LoadingSpinner />}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Shipping />
          </motion.div>
          </Suspense>
        } />
        <Route path="/checkout/:orderId" element={
          <Suspense fallback={<LoadingSpinner />}>
            <CustomCheckout />
          </Suspense>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<Suspense fallback={<div>Loading...</div>}><VerifyEmail /></Suspense>} />
        <Route path="/resend-verification" element={<Suspense fallback={<div>Loading...</div>}><ResendVerification /></Suspense>} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
            <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="products" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Products />
            </Suspense>
          } />
          <Route path="orders" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminOrders />
            </Suspense>
          } />
          <Route path="quotes" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Quotes />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Users />
            </Suspense>
          } />
          <Route path="reviews" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Reviews />
            </Suspense>
          } />
          <Route path="newsletter" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Newsletter />
            </Suspense>
          } />
          <Route path="blogs" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminBlogs />
            </Suspense>
          } />
          <Route path="low-stock" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LowStockProducts />
            </Suspense>
          } />
        </Route>
        <Route path="*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col">
            {!isAdminRoute && <Header />}
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            {!isAdminRoute && <Footer />}
          </div>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
