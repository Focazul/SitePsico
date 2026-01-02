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
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminAppointments from "@/pages/admin/Appointments";
import AdminPosts from "@/pages/admin/Posts";
import AdminMessages from "@/pages/admin/Messages";
import AdminSettings from "@/pages/admin/Settings";
import AdminEmails from "@/pages/admin/Emails";
import AdminCalendar from "@/pages/admin/Calendar";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import CookieConsent from "./components/CookieConsent";
import SkipToContent from "./components/SkipToContent";
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
          <Route path={"/"} component={Home} />
          <Route path={"/sobre"} component={About} />
          <Route path={"/servicos"} component={Services} />
          <Route path={"/blog"} component={Blog} />
          <Route path={"/blog/:slug"} component={BlogPost} />
          <Route path={"/contato"} component={Contact} />
          <Route path={"/agendamento"} component={Booking} />
          <Route path={"/login"} component={Login} />
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/admin/dashboard"} component={AdminDashboard} />
          <Route path={"/admin/appointments"} component={AdminAppointments} />
          <Route path={"/admin/posts"} component={AdminPosts} />
          <Route path={"/admin/messages"} component={AdminMessages} />
          <Route path={"/admin/emails"} component={AdminEmails} />
          <Route path={"/admin/calendar"} component={AdminCalendar} />
          <Route path={"/admin/settings"} component={AdminSettings} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
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
