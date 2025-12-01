import { Link } from "wouter";
import logoUrl from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt="AgentAssets" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-secondary-foreground/80 max-w-xs">
              Single property websites that don't suck. The easiest way to showcase your listings and impress your sellers.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-white">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white/80 transition-colors">Dashboard</Link></li>
              <li><Link href="/themes" className="hover:text-white/80 transition-colors">Themes</Link></li>
              <li><Link href="/credits" className="hover:text-white/80 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white/80 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Support</a></li>
              <li><Link href="/admin" className="hover:text-white/80 transition-colors text-white/30 hover:text-white/50 text-xs">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-secondary-foreground/60">
          © {new Date().getFullYear()} AgentAssets. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
