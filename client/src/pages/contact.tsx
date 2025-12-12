import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  MapPin, 
  Send, 
  Clock, 
  Headphones,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
      variant: "success",
    });
    
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

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
              <Headphones className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">We're Here to Help</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
              Get in <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Have questions about AgentAssets? We'd love to hear from you. 
              Our team is ready to help you create stunning property websites.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">We reply within 24 hours</p>
                <a href="mailto:hello@agentassets.com" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  hello@agentassets.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">Business Hours</h3>
                <p className="text-muted-foreground mb-4">Monday - Friday</p>
                <span className="text-primary font-semibold">9:00 AM - 6:00 PM CST</span>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">Location</h3>
                <p className="text-muted-foreground mb-4">Headquartered in</p>
                <span className="text-primary font-semibold">Austin, Texas</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <div className="mb-10">
                <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">Send a Message</span>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  Let's Start a Conversation
                </h2>
                <p className="text-muted-foreground text-lg">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Company / Brokerage</Label>
                    <Input
                      id="company"
                      placeholder="ABC Realty"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
                      data-testid="input-contact-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
                      data-testid="input-contact-subject"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="border-slate-200 focus:border-primary focus:ring-primary resize-none"
                    data-testid="input-contact-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white shadow-lg shadow-primary/25 group"
                  data-testid="button-contact-submit"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right Column - Quick Response */}
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-primary/5 to-teal-500/5 rounded-3xl p-8 md:p-10 border border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary">Quick Response</h3>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Our support team typically responds within 24 hours on business days. 
                  For urgent matters, we prioritize and respond even faster.
                </p>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-3xl font-bold text-primary">&lt;24h</div>
                    <div className="text-sm text-muted-foreground">Avg. Response</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200" />
                  <div>
                    <div className="text-3xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
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
          <Sparkles className="h-12 w-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Create your first stunning property website today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-xl group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-transparent text-white border-white/30 hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
