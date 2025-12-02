import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <div className="container relative z-20 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif drop-shadow-lg">
            Single Property Sites<br/>That Don't Suck!
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light drop-shadow-md text-white/90">
            We build great looking single property websites to showcase your hard earned listing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/login">
              <Button size="lg" className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 text-white border-none">
                Get Started
              </Button>
            </a>
            <Link href="/#features">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-white/10 hover:bg-white/20 text-white border-white backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Agents Love Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built by real estate professionals for real estate professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-6 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Easiest Editing</h3>
              <p className="text-muted-foreground">
                Create a new site in less than 15 minutes. Choose a template, add details, and you're ready to go.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Custom Branding</h3>
              <p className="text-muted-foreground">
                Your brand, your colors, your logo. Apply your unique identity to every property site automatically.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Sellers Love It</h3>
              <p className="text-muted-foreground">
                Give buyers a personal experience with the house, far better than looking at a crowded MLS page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Simple Credit Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purchase credits and use them whenever you have a new listing. Credits never expire.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', credits: 1, price: '$29', perSite: '$29' },
              { name: 'Growth', credits: 5, price: '$125', perSite: '$25', popular: true },
              { name: 'Agency', credits: 10, price: '$200', perSite: '$20' },
            ].map((plan) => (
              <div key={plan.name} className={`relative bg-white rounded-2xl p-8 shadow-sm border ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-secondary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-secondary">{plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.credits} site{plan.credits > 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Breaks down to <strong>{plan.perSite}</strong> per property site.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> 1 Year Hosting
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> Mobile Optimized
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> SEO Friendly
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> Custom Domain Support
                  </li>
                </ul>
                
                <a href="/api/login">
                  <Button className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}`}>
                    Get Started
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
