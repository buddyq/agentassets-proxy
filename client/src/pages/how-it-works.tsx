import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Check, 
  ArrowRight, 
  Home, 
  Palette, 
  Rocket, 
  Clock, 
  Globe, 
  BarChart3,
  Users,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

import step1Image from "@assets/generated_images/property_details_form_interface.png";
import step2Image from "@assets/generated_images/template_selection_gallery_interface.png";
import step3Image from "@assets/generated_images/branding_customization_interface.png";

const faqs = [
  {
    question: "How long does it take to create a property site?",
    answer: "Most agents complete their first property site in under 15 minutes. Once you're familiar with the process, you can create new sites in as little as 5 minutes."
  },
  {
    question: "How long do property sites stay live?",
    answer: "Each property site stays live for 4 months from the creation date. This gives you plenty of time to market the property and capture leads."
  },
  {
    question: "Can I use my own domain name?",
    answer: "Yes! Every site supports custom domain mapping. You can use your own domain or subdomain to maintain your professional branding."
  },
  {
    question: "What happens to my credits if I don't use them?",
    answer: "Credits never expire. Purchase them when it makes sense for you, and use them whenever you have a new listing."
  },
  {
    question: "Can I edit my site after it's published?",
    answer: "Absolutely. You can update property details, photos, and branding at any time. Changes go live instantly."
  },
  {
    question: "Do I need any technical skills?",
    answer: "Not at all. Our wizard guides you through every step. If you can fill out a form and upload photos, you can create a stunning property site."
  }
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Simple 3-Step Process
            </span>
            
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
              Create Stunning Property Sites in{" "}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Minutes
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              No coding required. No design skills needed. Just add your listing details, 
              pick a template, and go live. It's that simple.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white shadow-xl shadow-primary/25 group" data-testid="button-hero-start">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14" data-testid="button-hero-pricing">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Step 1 */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 text-sm font-semibold">
                <span className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Step One
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Add Your Property Details
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Enter the essential information about your listing. Address, price, bedrooms, 
                bathrooms, and a compelling description. Upload your best photos to showcase 
                the property's features.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Auto-formatted pricing and addresses",
                  "Drag-and-drop photo uploads",
                  "Unlimited property photos",
                  "Video tour embedding support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-teal-500/20 rounded-3xl blur-3xl transform -rotate-6" />
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-slate-200"
                style={{
                  transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
                  transformOrigin: 'center center'
                }}
              >
                <img 
                  src={step1Image} 
                  alt="Property details form interface" 
                  className="w-full h-auto"
                  data-testid="img-step1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Step 2 */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-primary/20 rounded-3xl blur-3xl transform rotate-6" />
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-slate-200"
                style={{
                  transform: 'perspective(1000px) rotateY(8deg) rotateX(4deg)',
                  transformOrigin: 'center center'
                }}
              >
                <img 
                  src={step2Image} 
                  alt="Template selection gallery" 
                  className="w-full h-auto"
                  data-testid="img-step2"
                />
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 text-sm font-semibold">
                <span className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Step Two
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Choose Your Perfect Template
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Browse our collection of professionally designed templates. Each one is 
                optimized for real estate and designed to convert visitors into leads. 
                Pick the style that best matches your listing.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Multiple layout styles to choose from",
                  "Mobile-optimized designs",
                  "Fast-loading, SEO-friendly templates",
                  "Preview before you publish"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Step 3 */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 text-sm font-semibold">
                <span className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Step Three
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Apply Your Branding & Go Live
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Add your logo, choose your brand colors, and customize the look to match 
                your personal brand. Once you're happy with the preview, hit publish and 
                your site goes live instantly.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Upload your logo and headshot",
                  "Custom color themes",
                  "Contact form with lead capture",
                  "Instant publishing - no delays"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-teal-500/20 rounded-3xl blur-3xl transform -rotate-6" />
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-slate-200"
                style={{
                  transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
                  transformOrigin: 'center center'
                }}
              >
                <img 
                  src={step3Image} 
                  alt="Branding customization interface" 
                  className="w-full h-auto"
                  data-testid="img-step3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every property site comes packed with features designed to help you market your listings effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: "15 Min Setup", desc: "From start to live site" },
              { icon: Globe, title: "Custom Domains", desc: "Use your own URL" },
              { icon: BarChart3, title: "Analytics", desc: "Track views & leads" },
              { icon: Users, title: "Lead Capture", desc: "Built-in contact forms" },
              { icon: Palette, title: "Your Branding", desc: "Logo, colors, style" },
              { icon: Rocket, title: "Fast & SEO", desc: "Optimized for Google" },
              { icon: Home, title: "Templates", desc: "Professional designs" },
              { icon: Sparkles, title: "Mobile Ready", desc: "Looks great everywhere" },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                <div className="h-12 w-12 bg-gradient-to-br from-primary/10 to-teal-500/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-secondary mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-teal-600 to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-white/70">Sites Created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10 min</div>
              <div className="text-white/70">Average Build Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-white/70">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/70">Sites Always Online</div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                  data-testid={`faq-question-${i}`}
                >
                  <span className="font-semibold text-secondary pr-4">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
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
            Ready to Create Your First Site?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of agents already using AgentAssets to impress their sellers and attract more buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-12 h-14 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white border-none shadow-xl shadow-primary/25 group" data-testid="button-cta-start">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 bg-white/5 hover:bg-white/15 text-white border-white/30" data-testid="button-cta-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
