import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  ArrowRight,
  Quote,
  Lightbulb,
  Rocket,
  Users,
  MapPin,
  Calendar
} from "lucide-react";
import { Link } from "wouter";

export default function OurStory() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-slate-800 to-secondary" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">The Beginning</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
              Our <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">Story</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              How frustration with tiny listing photos sparked a revolution in real estate marketing.
            </p>
          </div>
        </div>
      </section>
      {/* Main Story Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* The Problem */}
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm text-primary font-semibold uppercase tracking-wider">The Spark</span>
                  <h2 className="text-2xl font-bold text-secondary">Where It All Began</h2>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  About 12 years ago, Buddy Quaid made a career pivot from web development to real estate. After 15 years of building websites for businesses of all sizes, he thought he'd seen it all. Then he discovered the luxury real estate market—and was shocked.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg mt-4">
                  Million-dollar properties were being marketed with thumbnail-sized images squeezed onto cluttered MLS pages. Stunning architectural details, breathtaking views, and custom finishes were reduced to postage stamps. These homes deserved better. Their sellers deserved better.
                </p>
              </div>
            </div>

            {/* Quote Block */}
            <div className="relative bg-gradient-to-br from-primary/5 to-teal-500/5 rounded-3xl p-8 md:p-12 mb-20 border border-primary/10">
              <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/20" />
              <blockquote className="relative z-10 text-2xl md:text-3xl font-serif text-secondary leading-relaxed text-center italic">
                "Why squeeze a $2 million home into a 300-pixel box when I can show it in all its full-screen glory?"
              </blockquote>
              <div className="text-center mt-6">
                <div className="font-semibold text-secondary">Buddy Quaid</div>
                <div className="text-sm text-muted-foreground">Founder, AgentAssets</div>
              </div>
            </div>

            {/* The Solution */}
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm text-primary font-semibold uppercase tracking-wider">The Innovation</span>
                  <h2 className="text-2xl font-bold text-secondary">Full-Screen Changed Everything</h2>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Drawing on his web development expertise, Buddy created the first single-property microsites featuring immersive, full-screen imagery. Properties finally had the digital stage they deserved—dedicated websites where stunning photos could breathe and buyers could truly experience a home before ever stepping inside.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg mt-4">
                  The response was immediate. Sellers loved it. Buyers were captivated. And soon, agents everywhere were copying the approach. What started as a simple solution to a frustrating problem became the new standard in luxury real estate marketing.
                </p>
              </div>
            </div>

            {/* Timeline highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <Calendar className="h-8 w-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-secondary mb-1">12+</div>
                <div className="text-sm text-muted-foreground">Years of Innovation</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <Users className="h-8 w-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-secondary mb-1">1,400+</div>
                <div className="text-sm text-muted-foreground">Agents in Austin Network</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <MapPin className="h-8 w-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-secondary mb-1">2</div>
                <div className="text-sm text-muted-foreground">Markets & Growing</div>
              </div>
            </div>

            {/* Today */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm text-primary font-semibold uppercase tracking-wider">Today</span>
                  <h2 className="text-2xl font-bold text-secondary">The Next Chapter</h2>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Now, AgentAssets has been completely reimagined from the ground up. The mission remains the same, but the technology is faster, smarter, and more powerful than ever. What once took hours now takes minutes. Creating a stunning property website is now stupid simple.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg mt-4">
                  Beyond AgentAssets, Buddy has built the premier luxury pocket network in Austin with over 1,400 agents, and recently expanded to Nashville. It's all part of the same vision: giving agents the tools and connections they need to market properties the way they deserve.
                </p>
              </div>
            </div>

            {/* Principles */}
            <div className="bg-secondary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-8 text-center">Our Guiding Principles</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h4 className="font-bold text-lg mb-2">Stupid Simple</h4>
                    <p className="text-white/70 text-sm">If it's not easy enough for anyone to use, it's not done yet.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <h4 className="font-bold text-lg mb-2">Looks Amazing</h4>
                    <p className="text-white/70 text-sm">Every property deserves to shine. We never compromise on design.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <h4 className="font-bold text-lg mb-2">Affordable</h4>
                    <p className="text-white/70 text-sm">Premium quality shouldn't require a premium price tag.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-teal-600 to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Join hundreds of agents who showcase their properties the right way.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-xl group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-transparent text-white border-white/30 hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
