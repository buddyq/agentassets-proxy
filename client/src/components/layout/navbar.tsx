import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, CreditCard, Palette, User, Settings, LogOut as LogOutIcon } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border hover:opacity-80 transition-opacity hover:bg-primary/20 cursor-pointer"
                    data-testid="button-profile"
                  >
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
