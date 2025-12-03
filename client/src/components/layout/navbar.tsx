import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, CreditCard, Palette, LogOut, User } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Navbar() {
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logoUrl} alt="AgentAssets" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-1 mr-4">
                <Link href="/dashboard">
                  <Button variant={location === "/dashboard" ? "secondary" : "ghost"} size="sm" className="gap-2">
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
                    Credits: {user.credits ?? 0}
                  </Button>
                </Link>
              </div>
              
              <Link href="/profile">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid="button-profile"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                    <User className="h-4 w-4 text-primary" data-testid="button-profile" />
                  </div>
                )}
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/">
                <Button variant="ghost" className="hidden md:inline-flex">Home</Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="ghost" className="hidden md:inline-flex">Pricing</Button>
              </Link>
              <Link href="/auth">
                <Button>{isLoading ? "Loading..." : "Login / Sign Up"}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
