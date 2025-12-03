import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/protected-route";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CreateSite from "@/pages/create-site";
import EditSite from "@/pages/edit-site";
import Themes from "@/pages/themes";
import AdminDashboard from "@/pages/admin";
import Credits from "@/pages/credits";
import Profile from "@/pages/profile";
import SiteView from "@/pages/site-view";
import HowItWorks from "@/pages/how-it-works";
import Contact from "@/pages/contact";
import Support from "@/pages/support";
import OurStory from "@/pages/our-story";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route path="/our-story" component={OurStory} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/site/:id" component={SiteView} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/create-site" component={CreateSite} />
      <ProtectedRoute path="/edit-site/:id" component={EditSite} />
      <ProtectedRoute path="/themes" component={Themes} />
      <ProtectedRoute path="/credits" component={Credits} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
