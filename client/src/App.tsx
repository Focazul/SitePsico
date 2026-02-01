import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Booking from "@/pages/Booking";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import Services from "@/pages/Services";
import Home from "./pages/Home";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminAppointments from "@/pages/admin/Appointments";
import AdminPosts from "@/pages/admin/Posts";
import AdminMessages from "@/pages/admin/Messages";
import AdminSettings from "@/pages/admin/Settings";
import AdminEmails from "@/pages/admin/Emails";
import AdminCommunication from "@/pages/admin/Communication";
import AdminCalendar from "@/pages/admin/Calendar";
import AdminPages from "@/pages/admin/Pages";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import CookieConsent from "./components/CookieConsent";
import SkipToContent from "./components/SkipToContent";
import BackgroundBlobs from "./components/BackgroundBlobs";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ManusDialog } from "./components/ManusDialog";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QuickBookingProvider, useQuickBooking } from "./contexts/QuickBookingContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useGA4Config } from "./hooks/useGA4Config";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Switch location={location}>
          {/* PUBLIC ROUTES */}
          <Route path={"/"} component={Home} />
          <Route path={"/sobre"} component={About} />
          <Route path={"/servicos"} component={Services} />
          <Route path={"/blog"} component={Blog} />
          <Route path={"/blog/:slug"} component={BlogPost} />
          <Route path={"/contato"} component={Contact} />
          <Route path={"/agendamento"} component={Booking} />
          <Route path={"/login"} component={Login} />
          <Route path={"/admin/login"}>
            {() => {
              const [, setLocation] = useLocation();
              React.useEffect(() => {
                setLocation('/login');
              }, [setLocation]);
              return null;
            }}
          </Route>
          <Route path={"/forgot-password"} component={ForgotPassword} />
          <Route path={"/reset-password"} component={ResetPassword} />

          {/* ADMIN ROUTES - Protected */}
          <Route path={"/admin"}>
            {() => <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/dashboard"}>
            {() => <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/appointments"}>
            {() => <ProtectedRoute adminOnly><AdminAppointments /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/posts"}>
            {() => <ProtectedRoute adminOnly><AdminPosts /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/messages"}>
            {() => <ProtectedRoute adminOnly><AdminMessages /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/emails"}>
            {() => <ProtectedRoute adminOnly><AdminEmails /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/communication"}>
            {() => <ProtectedRoute adminOnly><AdminCommunication /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/calendar"}>
            {() => <ProtectedRoute adminOnly><AdminCalendar /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/pages"}>
            {() => <ProtectedRoute adminOnly><AdminPages /></ProtectedRoute>}
          </Route>
          <Route path={"/admin/settings"}>
            {() => <ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>}
          </Route>

          {/* ERROR ROUTES */}
          <Route path={"/404"} component={NotFound} />

          {/* FALLBACK - 404 */}
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Load GA4 configuration from backend
  useGA4Config();

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <QuickBookingProvider>
          <TooltipProvider>
            <BackgroundBlobs />
            <SkipToContent />
            <RouteProgressBar />
            <Toaster />
            <Router />
            <FloatingWhatsApp />
            <CookieConsent />
            <QuickBookingDialogPortal />
          </TooltipProvider>
        </QuickBookingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function QuickBookingDialogPortal() {
  const { open, openModal, closeModal } = useQuickBooking();
  return (
    <ManusDialog
      open={open}
      onOpenChange={(next) => (next ? openModal() : closeModal())}
      onSuccess={closeModal}
    />
  );
}

function RouteProgressBar() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(15);
    const mid = setTimeout(() => setProgress(65), 80);
    const end = setTimeout(() => setProgress(100), 200);
    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 520);

    return () => {
      clearTimeout(mid);
      clearTimeout(end);
      clearTimeout(hide);
    };
  }, [location]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 pointer-events-none">
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: visible ? `${progress}%` : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        aria-hidden
      />
    </div>
  );
}

export default App;
