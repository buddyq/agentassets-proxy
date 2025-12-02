import { useRoute, Link } from "wouter";
import { useSite, useThemes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MapPin, Play, Home, Info, Video, Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

export default function SiteView() {
  const [, params] = useRoute("/site/:id");
  const { data: site, isLoading } = useSite(params?.id || '');
  const { data: themes = [] } = useThemes();
  const theme = themes.find(t => t.id === site?.themeId) || themes[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">The property site you are looking for does not exist.</p>
          <Link href="/">
            <Button>Return Home</Button>
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
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: theme?.colors?.background || '#fff', color: theme?.colors?.text || '#000' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full shadow-sm" style={{ backgroundColor: 'white', borderBottom: `1px solid ${theme?.colors?.primary || '#558B73'}20` }}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="text-2xl font-serif font-bold tracking-tight" style={{ color: theme?.colors?.primary || '#558B73' }}>
            {site.title || site.address}
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-wider" style={{ color: theme?.colors?.secondary || '#2C3E50' }}>
            <a href="#home" className="hover:opacity-70 transition-opacity">Home</a>
            <a href="#details" className="hover:opacity-70 transition-opacity">Details</a>
            {site.videoUrl && (
              <a href="#video" className="hover:opacity-70 transition-opacity">Video</a>
            )}
            <a href="#location" className="hover:opacity-70 transition-opacity">Location</a>
            {site.photos && site.photos.length > 0 && (
              <a href="#photos" className="hover:opacity-70 transition-opacity">Photos</a>
            )}
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
          <Button size="lg" className="text-lg px-8 h-14" style={{ backgroundColor: theme?.colors?.primary || '#558B73' }}>
            View Details
          </Button>
        </div>
      </section>

      {/* Details Section */}
      <section id="details" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme?.colors?.primary || '#558B73' }}>Property Details</h2>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: theme?.colors?.secondary || '#2C3E50' }}></div>
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
                   <span className="font-medium">{site.bedrooms}</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Bathrooms</span>
                   <span className="font-medium">{site.bathrooms}</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Square Feet</span>
                   <span className="font-medium">{site.sqft.toLocaleString()}</span>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold mb-6 border-b pb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {site.description || "A beautiful property awaiting your discovery."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section (if video URL exists) */}
      {embedUrl && (
        <section id="video" className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme?.colors?.primary || '#558B73' }}>Property Tour</h2>
              <div className="h-1 w-20 mx-auto" style={{ backgroundColor: theme?.colors?.secondary || '#2C3E50' }}></div>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Property Video"
              />
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section id="location" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: theme?.colors?.primary || '#558B73' }}>Location</h2>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: theme?.colors?.secondary || '#2C3E50' }}></div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="h-6 w-6 shrink-0" style={{ color: theme?.colors?.primary || '#558B73' }} />
              <div>
                <h3 className="font-bold text-lg">{site.address}</h3>
                <p className="text-muted-foreground">Explore the neighborhood and nearby amenities.</p>
              </div>
            </div>
            <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      {site.photos && site.photos.length > 0 && (
        <PhotoGallery photos={site.photos} themeColors={theme?.colors} />
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Property listing powered by AgentAssets</p>
        </div>
      </footer>
    </div>
  );
}

function PhotoGallery({ photos, themeColors }: { photos: string[], themeColors?: any }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: selectedIndex || 0 });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (selectedIndex !== null && emblaApi) {
      emblaApi.scrollTo(selectedIndex, true);
    }
  }, [selectedIndex, emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, scrollPrev, scrollNext]);

  return (
    <section id="photos" className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: themeColors?.primary || '#558B73' }}>Photo Gallery</h2>
          <div className="h-1 w-20 mx-auto" style={{ backgroundColor: themeColors?.secondary || '#2C3E50' }}></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={index}
              className="aspect-square rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedIndex(index)}
              data-testid={`photo-${index}`}
            >
              <img 
                src={photo} 
                alt={`Property photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="flex items-center justify-between p-4">
            <div className="text-white/70 text-sm font-medium">
              {currentSlide + 1} / {photos.length}
            </div>
            <button 
              className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
              onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div className="overflow-hidden w-full max-w-5xl" ref={emblaRef} onClick={(e) => e.stopPropagation()}>
              <div className="flex">
                {photos.map((photo, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-4">
                    <img 
                      src={photo} 
                      alt={`Property photo ${index + 1}`}
                      className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
              onClick={(e) => { e.stopPropagation(); scrollNext(); }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          <div className="p-4 flex justify-center gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
                onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(index); }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
