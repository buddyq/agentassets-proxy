import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Zap, Palette, Heart, ArrowRight, Sparkles, Globe, BarChart3, Building2, Users } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";

export default function Home() {
  useEffect(() => {
    if (window.location.hash === '#pricing') {
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 z-10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse z-5" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse z-5" style={{ animationDelay: '1s' }} />
        
        <div className="container relative z-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/auth?trial=true">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-400/30 rounded-full px-5 py-2.5 mb-8 animate-pulse cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-colors">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold">Start Your 7-Day Free Trial</span>
                <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">FREE</span>
              </div>
            </Link>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight">
              <span className="block">Single Property Sites</span>
              <span className="block bg-gradient-to-r from-teal-300 via-primary to-emerald-400 bg-clip-text text-transparent">
                That Don't Suck!
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-light text-white/80 leading-relaxed">
              Create stunning, professional property websites in minutes. 
              Impress your sellers and attract more buyers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth?trial=true">
                <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white border-none shadow-xl shadow-primary/25 group">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-white/5 hover:bg-white/15 text-white border-white/30 backdrop-blur-sm">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <p className="mt-4 text-sm text-white/60">
              No credit card required. Create your first site free.
            </p>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-sm text-white/60 mt-1">Sites Created</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white">15min</div>
                <div className="text-sm text-white/60 mt-1">Avg. Build Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
                <div className="text-sm text-white/60 mt-1">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 via-teal-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">7-Day Free Trial</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  Try AgentAssets <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Risk-Free</span>
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  Create your first property website completely free. No credit card needed, no strings attached.
                </p>
                
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-secondary">1 Free Site Credit</div>
                      <div className="text-sm text-muted-foreground">Build a complete property site</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-secondary">All Premium Features</div>
                      <div className="text-sm text-muted-foreground">Analytics, lead capture & more</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-secondary">No Commitment</div>
                      <div className="text-sm text-muted-foreground">Cancel anytime, no questions</div>
                    </div>
                  </div>
                </div>
                
                <Link href="/auth?trial=true">
                  <Button size="lg" className="text-lg px-8 h-12 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white border-none shadow-lg shadow-primary/25 group">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Built for <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Real Estate Pros</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create property websites that convert buyers and impress sellers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary group-hover:text-primary transition-colors">Lightning Fast Setup</h3>
              <p className="text-muted-foreground leading-relaxed">
                Go from listing to live website in under 15 minutes. Our intuitive wizard guides you through every step.
              </p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                <Palette className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary group-hover:text-primary transition-colors">Your Brand, Everywhere</h3>
              <p className="text-muted-foreground leading-relaxed">
                Custom colors, your logo, your style. Every site automatically reflects your personal brand identity.
              </p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="h-14 w-14 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary group-hover:text-primary transition-colors">Sellers Love It</h3>
              <p className="text-muted-foreground leading-relaxed">
                Give your listings the dedicated attention they deserve. Stand out from crowded MLS pages.
              </p>
            </div>
          </div>

          {/* Additional features grid */}
          <div className="mt-20 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Globe, text: "Custom Domains" },
              { icon: BarChart3, text: "Built-in Analytics" },
              { icon: Sparkles, text: "SEO Optimized" },
              { icon: Zap, text: "Mobile Perfect" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium text-secondary">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonial */}
      <section className="py-20 bg-gradient-to-r from-primary via-teal-600 to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <blockquote className="text-2xl md:text-3xl text-white font-light italic max-w-4xl mx-auto leading-relaxed">
            "Finally, a property website builder that actually understands what agents need. 
            My sellers are always impressed with how professional their listing looks."
          </blockquote>
          <div className="mt-8 text-white/80">
            <div className="font-semibold text-white">Sarah Johnson</div>
            <div className="text-sm">Top Producer, Austin Texas</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Simple, <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy credits once, use them whenever you need. No subscriptions, no hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', credits: 1, price: '$29', perSite: '$29' },
              { name: 'Growth', credits: 5, price: '$125', perSite: '$25', popular: true },
              { name: 'Agency', credits: 10, price: '$200', perSite: '$20' },
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-2xl shadow-primary/20 scale-105' 
                    : 'border border-slate-200 hover:border-primary/30 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-teal-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-secondary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-secondary">{plan.price}</span>
                </div>
                <p className="text-muted-foreground mb-8 pb-6 border-b border-slate-100">
                  {plan.credits} site credit{plan.credits > 1 ? 's' : ''} • <span className="text-primary font-semibold">{plan.perSite}/site</span>
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    '3 Month Hosting Per Site',
                    'Mobile Optimized',
                    'SEO Friendly',
                    'Custom Domain Support',
                    'Lead Capture Forms',
                    'Analytics Dashboard',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link href="/auth">
                  <Button 
                    className={`w-full h-12 text-base ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 shadow-lg shadow-primary/25' 
                        : 'bg-secondary hover:bg-secondary/90'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-12">
            All credits never expire. Use them whenever you have a new listing.
          </p>
        </div>
      </section>

      {/* Brokerage Promo Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 mb-6">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">For Brokerages</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Empower Your <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">Entire Team</span>
              </h2>
              
              <p className="text-lg text-white/70 mb-8">
                Give your agents the tools they need to create stunning property sites while maintaining 
                centralized control over branding, templates, and billing.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  { icon: Users, text: 'Manage up to 15 agents included' },
                  { icon: Palette, text: 'Custom brokerage branding & templates' },
                  { icon: BarChart3, text: 'Centralized analytics dashboard' },
                  { icon: Zap, text: 'Tiered pricing for growing teams' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
              
              <Link href="/brokerage/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white shadow-xl shadow-primary/25 group" data-testid="button-brokerage-cta">
                  Start Brokerage Plan
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-600 mb-4">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Brokerage Plan</h3>
                </div>
                
                <div className="text-center mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">$249</span>
                    <span className="text-white/60">/month</span>
                  </div>
                  <p className="text-white/60 mt-2">15 agent seats included</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">First 100 extra agents</span>
                    <span className="text-white font-semibold">$10/agent/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">100+ extra agents</span>
                    <span className="text-white font-semibold">$5/agent/mo</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-white/60">
                    Custom templates, team management, and centralized billing included.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-slate-800 to-secondary" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Impress Your Next Seller?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of agents who are already creating stunning property websites.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-12 h-14 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white border-none shadow-xl shadow-primary/25 group">
              Create Your First Site
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
