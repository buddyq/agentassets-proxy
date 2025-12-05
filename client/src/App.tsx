import { Switch, Route, useLocation } from "wouter";
import { useEffect, useMemo } from "react";
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

// Detect if we're on a subdomain of agentassets.com
function useSubdomainDetection() {
  return useMemo(() => {
    const hostname = window.location.hostname.toLowerCase();
    // Check for subdomain pattern: xxx.agentassets.com (but not www or app)
    const subdomainMatch = hostname.match(/^([^.]+)\.agentassets\.com$/);
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1];
      // Exclude known app subdomains
      if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
        return { isSubdomain: true, subdomain, host: hostname };
      }
    }
    // Also check for custom domains (not agentassets.com and not replit dev domains)
    if (!hostname.includes('agentassets.com') && 
        !hostname.includes('replit') && 
        !hostname.includes('localhost') &&
        hostname !== '127.0.0.1') {
      return { isSubdomain: false, customDomain: hostname, host: hostname };
    }
    return { isSubdomain: false, subdomain: null, host: null };
  }, []);
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
import SubdomainSiteView from "@/pages/subdomain-site-view";
import LayoutPreview from "@/pages/layout-preview";
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
      <Route path="/layout-preview/:layoutId" component={LayoutPreview} />
      
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
  const hostInfo = useSubdomainDetection();
  
  // If on a subdomain or custom domain, show the site directly
  if (hostInfo.host) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <SubdomainSiteView host={hostInfo.host} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  
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
