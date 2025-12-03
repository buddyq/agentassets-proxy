import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  PlayCircle,
  Headphones,
  BookOpen,
  ArrowRight,
  Youtube,
  ExternalLink,
  HelpCircle,
  Video
} from "lucide-react";
import { Link } from "wouter";

export default function Support() {
  const videos = [
    {
      id: "JKF7Cm6BNbQ",
      title: "How to Create & Customize Your Website",
      description: "Learn how to create your first property website and customize it to match your brand."
    },
    {
      id: "-JyaWQhL6Jk",
      title: "Reorder Your Image Gallery",
      description: "Quick tutorial on how to rearrange the order of images in your property gallery."
    }
  ];

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
              <span className="text-sm font-medium text-white">Support Center</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
              How Can We <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">Help?</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Find answers, watch tutorials, and get the support you need to create amazing property websites.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 bg-gradient-to-br from-primary to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Mail className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary mb-2">Email Support</h3>
                    <p className="text-muted-foreground mb-4">Get help from our team. We typically respond within 24 hours.</p>
                    <a 
                      href="mailto:support@agentassets.com" 
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      support@agentassets.com
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Youtube className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary mb-2">YouTube Channel</h3>
                    <p className="text-muted-foreground mb-4">Subscribe for tutorials, tips, and product updates.</p>
                    <a 
                      href="https://www.youtube.com/@Agentassets" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      Visit Channel
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Video Tutorials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Learn How to Use <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">AgentAssets</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch our step-by-step tutorials to get the most out of your property websites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {videos.map((video) => (
              <div key={video.id} className="group" data-testid={`video-card-${video.id}`}>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl mb-5 bg-slate-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-muted-foreground">{video.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="https://www.youtube.com/@Agentassets" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:bg-primary/5">
                <Youtube className="h-5 w-5 text-red-500" />
                View All Videos on YouTube
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Quick Help</h2>
            <p className="text-muted-foreground text-lg">Common topics and resources</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/how-it-works">
              <Card className="bg-white border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-secondary mb-2">How It Works</h3>
                  <p className="text-sm text-muted-foreground">Learn the basics of creating property websites</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/credits">
              <Card className="bg-white border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-secondary mb-2">Pricing & Credits</h3>
                  <p className="text-sm text-muted-foreground">Understand our credit system and pricing</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="bg-white border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-secondary mb-2">Contact Us</h3>
                  <p className="text-sm text-muted-foreground">Send us a message for personalized help</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-teal-600 to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-xl mx-auto">
            Our support team is ready to assist you with any questions.
          </p>
          <a href="mailto:support@agentassets.com">
            <Button size="lg" className="text-lg px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-xl group">
              Email Support
              <Mail className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
