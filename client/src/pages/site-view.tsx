import { useRoute, Link } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { MapPin, Play, Home, Info, Video } from "lucide-react";
import { useEffect } from "react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";

export default function SiteView() {
  const [, params] = useRoute("/site/:id");
  const { sites, themes } = useStore();
  const site = sites.find(s => s.id === params?.id);
  const theme = themes.find(t => t.id === site?.themeId) || themes[0];

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">The property site you are looking for does not exist.</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper to get embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") ? url.split("v=")[1] : url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(site.videoUrl || "");

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full shadow-sm" style={{ backgroundColor: 'white', borderBottom: `1px solid ${theme.colors.primary}20` }}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="text-2xl font-serif font-bold tracking-tight" style={{ color: theme.colors.primary }}>
            {site.address}
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-wider" style={{ color: theme.colors.secondary }}>
            <a href="#home" className="hover:opacity-70 transition-opacity">Home</a>
            <a href="#details" className="hover:opacity-70 transition-opacity">Details</a>
            {site.videoUrl && (
              <a href="#video" className="hover:opacity-70 transition-opacity">Video</a>
            )}
            <a href="#location" className="hover:opacity-70 transition-opacity">Location</a>
          </div>
          
          <Button className="md:hidden" size="icon" variant="ghost">
            <span className="sr-only">Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-[80vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${site.imageUrl || heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
            {site.title || site.address}
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 drop-shadow-md">
            {site.price}
          </p>
          <Button size="lg" className="text-lg px-8 h-14" style={{ backgroundColor: theme.colors.primary }}>
            View Details
          </Button>
        </div>
      </section>

      {/* Details Section */}
      <section id="details" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme.colors.primary }}>Property Details</h2>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: theme.colors.secondary }}></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
               <h3 className="text-xl font-bold mb-6 border-b pb-4">Facts & Features</h3>
               <div className="space-y-4">
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Price</span>
                   <span className="font-bold">{site.price}</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Bedrooms</span>
                   <span className="font-bold">{site.bedrooms}</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Bathrooms</span>
                   <span className="font-bold">{site.bathrooms}</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Square Footage</span>
                   <span className="font-bold">{site.sqft} sqft</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Status</span>
                   <span className="font-bold capitalize">{site.status}</span>
                 </div>
               </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">Description</h3>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {site.description || "No description provided for this property."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {embedUrl && (
        <section id="video" className="py-24 px-4 bg-muted/10">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme.colors.primary }}>Property Video</h2>
              <div className="h-1 w-20 mx-auto" style={{ backgroundColor: theme.colors.secondary }}></div>
            </div>
            
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xl">
              <iframe 
                src={embedUrl} 
                title="Property Video" 
                className="w-full h-full" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section id="location" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme.colors.primary }}>Location</h2>
            <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5" /> {site.address}
            </p>
          </div>
          
          <div className="h-[400px] w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground border">
             {/* In a real app, this would be a Google Maps embed */}
             <div className="text-center">
               <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Interactive Map Placeholder</p>
               <p className="text-sm opacity-70">{site.address}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-white" style={{ backgroundColor: theme.colors.secondary }}>
        <div className="container mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold mb-2">{site.address}</h3>
            <p className="opacity-80">Presented by AgentAssets</p>
          </div>
          <div className="text-sm opacity-50">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
