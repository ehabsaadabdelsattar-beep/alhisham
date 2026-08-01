import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import AIChat from './components/AIChat';
import ScrollToTop from './components/ui/ScrollToTop';
import ScrollProgress from './components/ui/ScrollProgress';
import SplashScreen from './components/ui/SplashScreen';
import PageTransition from './components/ui/PageTransition';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminProjectForm = lazy(() => import('./pages/admin/AdminProjectForm'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdmin && <Navbar />}
      <main>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />} key={location.pathname}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/projects/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
              <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
              <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
              <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
              <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['customer', 'investor', 'editor', 'admin']} />}>
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'editor']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="projects/new" element={<AdminProjectForm />} />
                  <Route path="projects/edit/:id" element={<AdminProjectForm />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="requests" element={<AdminRequests />} />
                </Route>
              </Route>

              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <FloatingWhatsApp />
          <AIChat />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
            <ThemeProvider>
              <BrowserRouter>
                <SplashScreen />
                <ScrollProgress />
                <ScrollToTop />
                <div className="min-h-screen bg-surface dark:bg-dark text-dark dark:text-white transition-colors duration-300">
                  <AnimatedRoutes />
                </div>
              </BrowserRouter>
            </ThemeProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
