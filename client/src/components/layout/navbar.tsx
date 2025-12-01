import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { LayoutDashboard, Plus, CreditCard, Palette, LogOut, Home } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Navbar() {
  const [location] = useLocation();
  const user = useStore((state) => state.user);
  
  // Simple check for dashboard routes
  const isDashboard = location !== "/" && location !== "/login" && location !== "/register";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={isDashboard ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logoUrl} alt="AgentAssets" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {isDashboard ? (
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
                    Credits: {user.credits}
                  </Button>
                </Link>
              </div>
              
              <Link href="/create-site">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Site
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/">
                <Button variant="ghost" className="hidden md:inline-flex">Home</Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="ghost" className="hidden md:inline-flex">Pricing</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Login / Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
