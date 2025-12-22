import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBrokerage } from "@/lib/api";
import { LayoutDashboard, CreditCard, Palette, User, Settings, LogOut as LogOutIcon, Infinity, Menu, Home } from "lucide-react";
import logoUrl from "@assets/agentassets_logo_white_1765568440271.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const { data: brokerageData } = useBrokerage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if user is a brokerage member (agent role, not admin)
  const isBrokerageAgent = brokerageData?.membership?.role === 'agent';

  // Close mobile menu when auth state changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
    <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-md text-white bg-[#166e73]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="AgentAssets" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Desktop Navigation */}
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
              
              {/* Desktop Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="hidden md:flex w-8 h-8 rounded-full overflow-hidden items-center justify-center border border-white/30 hover:opacity-80 transition-opacity hover:bg-white/20 cursor-pointer"
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
              {/* Desktop Navigation for guests */}
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
                <Button className="hidden md:inline-flex bg-white text-[#1a4a4a] hover:bg-white/90">{isLoading ? "Loading..." : "Login / Sign Up"}</Button>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Button - Always visible on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white hover:bg-white/20" 
            onClick={() => setMobileMenuOpen(true)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Single Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-72 bg-[#166e73] border-l-white/20">
              <SheetHeader>
                <SheetTitle className="text-white text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {user ? (
                  <>
                    {/* Logged-in user menu items */}
                    <SheetClose asChild>
                      <Link href="/dashboard">
                        <Button 
                          variant={location === "/dashboard" ? "secondary" : "ghost"} 
                          className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/themes">
                        <Button 
                          variant={location === "/themes" ? "secondary" : "ghost"} 
                          className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                        >
                          <Palette className="h-5 w-5" />
                          Themes
                        </Button>
                      </Link>
                    </SheetClose>
                    {isBrokerageAgent ? (
                      <div className="flex items-center gap-3 px-4 py-2 text-white/90">
                        <Infinity className="h-5 w-5" />
                        Unlimited Credits
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/credits">
                          <Button 
                            variant={location === "/credits" ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                          >
                            <CreditCard className="h-5 w-5" />
                            Credits: {user.credits ?? 0}
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    <div className="border-t border-white/20 my-2" />
                    <SheetClose asChild>
                      <Link href="/profile">
                        <Button 
                          variant={location === "/profile" ? "secondary" : "ghost"} 
                          className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                        >
                          <Settings className="h-5 w-5" />
                          My Profile
                        </Button>
                      </Link>
                    </SheetClose>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOutIcon className="h-5 w-5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Guest menu items */}
                    <SheetClose asChild>
                      <Link href="/">
                        <Button 
                          variant={location === "/" ? "secondary" : "ghost"} 
                          className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                        >
                          <Home className="h-5 w-5" />
                          Home
                        </Button>
                      </Link>
                    </SheetClose>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        scrollToPricing(e);
                        closeMobileMenu();
                      }}
                    >
                      <CreditCard className="h-5 w-5" />
                      Pricing
                    </Button>
                    <div className="border-t border-white/20 my-2" />
                    <SheetClose asChild>
                      <Link href="/auth">
                        <Button className="w-full bg-white text-[#1a4a4a] hover:bg-white/90">
                          Login / Sign Up
                        </Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
