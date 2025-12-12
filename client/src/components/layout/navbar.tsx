import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBrokerage } from "@/lib/api";
import { LayoutDashboard, CreditCard, Palette, User, Settings, LogOut as LogOutIcon, Infinity } from "lucide-react";
import logoUrl from "@assets/agentassets_logo_white_1765568440271.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const { data: brokerageData } = useBrokerage();
  
  // Check if user is a brokerage member (agent role, not admin)
  const isBrokerageAgent = brokerageData?.membership?.role === 'agent';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location === "/") {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setLocation("/");
      setTimeout(() => {
        const pricingSection = document.getElementById("pricing");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#1a4a4a] backdrop-blur-md text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="AgentAssets" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-1 mr-4">
                <Link href="/dashboard">
                  <Button variant={location === "/dashboard" ? "secondary" : "ghost"} size="sm" className="gap-2 text-white hover:text-white hover:bg-white/20">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/themes">
                  <Button variant={location === "/themes" ? "secondary" : "ghost"} size="sm" className="gap-2 text-white hover:text-white hover:bg-white/20">
                    <Palette className="h-4 w-4" />
                    Themes
                  </Button>
                </Link>
                {isBrokerageAgent ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/90">
                    <Infinity className="h-4 w-4" />
                    Unlimited Credits
                  </div>
                ) : (
                  <Link href="/credits">
                    <Button variant={location === "/credits" ? "secondary" : "ghost"} size="sm" className="gap-2 text-white hover:text-white hover:bg-white/20">
                      <CreditCard className="h-4 w-4" />
                      Credits: {user.credits ?? 0}
                    </Button>
                  </Link>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/30 hover:opacity-80 transition-opacity hover:bg-white/20 cursor-pointer"
                    data-testid="button-profile"
                  >
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-white/20 w-full h-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
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
                <Button variant="ghost" className="hidden md:inline-flex text-white hover:text-white hover:bg-white/20">Home</Button>
              </Link>
              <Button 
                variant="ghost" 
                className="hidden md:inline-flex text-white hover:text-white hover:bg-white/20"
                onClick={scrollToPricing}
              >
                Pricing
              </Button>
              <Link href="/auth">
                <Button className="bg-white text-[#1a4a4a] hover:bg-white/90">{isLoading ? "Loading..." : "Login / Sign Up"}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
