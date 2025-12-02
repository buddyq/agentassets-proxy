import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Plus, CreditCard, Palette, LogOut, Home, User } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const isDashboard = location !== "/" || isAuthenticated;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logoUrl} alt="AgentAssets" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-1 mr-4">
                <Link href="/dashboard">
                  <Button variant={location === "/dashboard" || location === "/" ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/themes">
                  <Button variant={location === "/themes" ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Themes
                  </Button>
                </Link>
                <Link href="/credits">
                  <Button variant={location === "/credits" ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credits: {user?.credits ?? 0}
                  </Button>
                </Link>
              </div>
              
              <Link href={user && user.credits > 0 ? "/create-site" : "/credits"}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Site
                </Button>
              </Link>
              
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <a href="/api/logout">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </a>
            </>
          ) : (
            <>
              <Link href="/">
                <Button variant="ghost" className="hidden md:inline-flex">Home</Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="ghost" className="hidden md:inline-flex">Pricing</Button>
              </Link>
              <a href="/api/login">
                <Button>{isLoading ? "Loading..." : "Login / Sign Up"}</Button>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
