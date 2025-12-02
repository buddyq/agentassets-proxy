import { useRoute, Link } from "wouter";
import { useSite, useThemes, useLayout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Play, Home, Info, Video, Image, X, ChevronLeft, ChevronRight, Bed, Bath, Square, Calendar, Building, Phone, Mail, User } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";
import { useState, useEffect, useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Site, Theme, Layout } from "@shared/schema";

function getThemeStyles(theme?: Theme) {
  const primary = theme?.colors?.primary || '#558B73';
  const secondary = theme?.colors?.secondary || '#2C3E50';
  const background = theme?.colors?.background || '#ffffff';
  const text = theme?.colors?.text || '#1a1a1a';
  
  return {
    '--theme-primary': primary,
    '--theme-secondary': secondary,
    '--theme-background': background,
    '--theme-text': text,
    '--theme-primary-10': `${primary}1a`,
    '--theme-primary-20': `${primary}33`,
  } as React.CSSProperties;
}

function getLayoutTypography(layout?: Layout) {
  const structure = layout?.structure;
  if (!structure?.typography) {
    return {
      '--font-heading': 'Georgia, serif',
      '--font-body': 'Inter, system-ui, sans-serif',
      '--heading-weight': '700',
    } as React.CSSProperties;
  }
  
  const { headingFont, bodyFont, headingWeight } = structure.typography;
  return {
    '--font-heading': `"${headingFont}", serif`,
    '--font-body': `"${bodyFont}", sans-serif`,
    '--heading-weight': headingWeight,
  } as React.CSSProperties;
}

function ShoalwoodHero({ site, theme, heroImage }: { site: Site; theme?: Theme; heroImage: string }) {
  const heroImages = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : site.photos && site.photos.length > 0 
      ? site.photos 
      : [heroImage];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || heroImages.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, heroImages.length]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {heroImages.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      
      {heroImages.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-4 rounded-full transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/30 text-white p-4 rounded-full transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
        <div className="container mx-auto">
          <div className="inline-block bg-white/90 backdrop-blur-sm px-4 py-2 rounded-md mb-4">
            <span className="text-sm font-semibold tracking-wide" style={{ color: theme?.colors?.primary || '#1a1a1a' }}>
              FOR SALE
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {site.price}
          </h1>
          <h2 className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
            {site.address}
          </h2>
        </div>
      </div>

      {heroImages.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShoalwoodNavigation({ site, theme, hasPhotos, hasVideo }: { site: Site; theme?: Theme; hasPhotos: boolean; hasVideo: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '#overview', label: 'Overview', show: true },
    { href: '#details', label: 'Details', show: true },
    { href: '#photos', label: 'Photos', show: hasPhotos },
    { href: '#video', label: 'Video', show: hasVideo },
    { href: '#map', label: 'Map', show: true },
    { href: '#contact', label: 'Contact', show: true },
  ].filter(link => link.show);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
              data-testid="button-mobile-menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            {theme?.logoUrl ? (
              <img 
                src={theme.logoUrl} 
                alt="Logo" 
                className="h-10 w-auto object-contain"
                data-testid="img-nav-logo"
              />
            ) : (
              <div className="text-lg font-semibold truncate max-w-[200px] md:max-w-none" style={{ color: 'var(--theme-primary)', fontFamily: 'var(--font-heading)' }}>
                {site.title || site.address}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(link => (
              <a 
                key={link.href}
                href={link.href} 
                className="hover:opacity-70 transition-opacity" 
                style={{ color: 'var(--theme-text)' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <Button 
            size="sm" 
            className="text-white font-medium px-5"
            style={{ backgroundColor: 'var(--theme-primary)' }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-request-info"
          >
            Request Info
          </Button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100]" data-testid="mobile-menu-overlay">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto" />
              ) : (
                <div className="text-lg font-semibold" style={{ color: 'var(--theme-primary)', fontFamily: 'var(--font-heading)' }}>
                  {site.title || 'Menu'}
                </div>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
                data-testid="button-close-menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-1">
                {navLinks.map(link => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left px-4 py-3 text-lg font-medium hover:bg-gray-50 rounded-lg transition-colors"
                    style={{ color: 'var(--theme-text)' }}
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  className="w-full text-white font-medium"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  onClick={() => handleNavClick('#contact')}
                  data-testid="button-mobile-request-info"
                >
                  Request Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShoalwoodDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 400;
  
  return (
    <section id="overview" className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-primary)' }}>
          Property Description
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {isLong && !isExpanded ? description.slice(0, 400) + '...' : description}
          </p>
          {isLong && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 font-semibold hover:underline"
              style={{ color: 'var(--theme-primary)' }}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ShoalwoodDetails({ site }: { site: Site }) {
  const details = [
    { icon: Bed, label: 'Bedrooms', value: site.bedrooms },
    { icon: Bath, label: 'Bathrooms', value: site.bathrooms },
    { icon: Square, label: 'Living Area', value: `${site.sqft.toLocaleString()} sqft` },
  ];

  return (
    <section id="details" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-primary)' }}>
          Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--theme-primary-10)' }}>
                <Icon className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShoalwoodContact({ site, theme }: { site: Site; theme?: Theme }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: `I am interested in ${site.address}`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your inquiry! We will be in touch soon.');
  };

  return (
    <section id="contact" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-primary)' }}>
          Get in Touch
        </h2>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required 
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea 
                id="message" 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required 
                className="mt-1"
                rows={4}
              />
            </div>
            <Button 
              type="submit" 
              size="lg"
              className="w-full md:w-auto text-white"
              style={{ backgroundColor: theme?.colors?.primary || '#1a1a1a' }}
            >
              Send Inquiry
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function HeroSection({ site, theme, heroImage }: { site: Site; theme?: Theme; heroImage: string }) {
  const hasHeroSlider = site.heroPhotos && site.heroPhotos.length > 1;
  const heroImages = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : [site.imageUrl || (site.photos && site.photos.length > 0 ? site.photos[0] : heroImage)];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

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
    if (!emblaApi || !hasHeroSlider) return;
    
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    
    return () => clearInterval(autoplayInterval);
  }, [emblaApi, hasHeroSlider]);

  if (!hasHeroSlider) {
    return (
      <section id="home" className="relative h-[80vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImages[0]})` }}
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
    );
  }

  return (
    <section id="home" className="relative h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {heroImages.map((image, index) => (
            <div 
              key={index}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/30" />
      
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none z-10">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
          {site.title || site.address}
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 drop-shadow-md">
          {site.price}
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 h-14 pointer-events-auto" 
          style={{ backgroundColor: theme?.colors?.primary || '#558B73' }}
        >
          View Details
        </Button>
      </div>
    </section>
  );
}

export default function SiteView() {
  const [, params] = useRoute("/site/:id");
  const { data: site, isLoading } = useSite(params?.id || '');
  const { data: themes = [] } = useThemes();
  const { data: layout } = useLayout(site?.layoutId || '');
  const theme = themes.find(t => t.id === site?.themeId) || themes[0];

  const combinedStyles = useMemo(() => ({
    ...getThemeStyles(theme),
    ...getLayoutTypography(layout),
  }), [theme, layout]);

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
  const hasPhotos = site.photos && site.photos.length > 0;
  const hasVideo = !!embedUrl;
  const isShoalwoodLayout = site.layoutId === 'layout-shoalwood';

  if (isShoalwoodLayout) {
    return (
      <div 
        className="min-h-screen flex flex-col" 
        style={{ 
          ...combinedStyles,
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)',
          fontFamily: 'var(--font-body)'
        }}
      >
        <ShoalwoodHero site={site} theme={theme} heroImage={heroImage} />
        <ShoalwoodNavigation site={site} theme={theme} hasPhotos={!!hasPhotos} hasVideo={hasVideo} />
        <ShoalwoodDescription description={site.description || "A beautiful property awaiting your discovery."} />
        <ShoalwoodDetails site={site} />
        
        {hasPhotos && <PhotoGallery photos={site.photos!} themeColors={theme?.colors} />}
        
        {hasVideo && (
          <section id="video" className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-primary)' }}>
                Property Tour
              </h2>
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

        <section id="map" className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-primary)' }}>
              Map
            </h2>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span className="font-medium">{site.address}</span>
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

        <ShoalwoodContact site={site} theme={theme} />

        <footer className="py-8 px-4 border-t bg-white">
          <div className="container mx-auto text-center text-sm text-gray-500">
            <p>Property listing powered by AgentAssets</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        ...combinedStyles,
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full shadow-sm bg-white" style={{ borderBottom: '1px solid var(--theme-primary-20)' }}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div 
            className="text-2xl tracking-tight" 
            style={{ 
              color: 'var(--theme-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--heading-weight)'
            }}
          >
            {site.title || site.address}
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-wider" style={{ color: 'var(--theme-secondary)' }}>
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
      <HeroSection 
        site={site} 
        theme={theme} 
        heroImage={heroImage}
      />

      {/* Details Section */}
      <section id="details" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl mb-4" 
              style={{ 
                color: 'var(--theme-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--heading-weight)'
              }}
            >
              Property Details
            </h2>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
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
              <h2 
                className="text-3xl mb-4" 
                style={{ 
                  color: 'var(--theme-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--heading-weight)'
                }}
              >
                Property Tour
              </h2>
              <div className="h-1 w-20 mx-auto" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
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
            <h2 
              className="text-3xl mb-4" 
              style={{ 
                color: 'var(--theme-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--heading-weight)'
              }}
            >
              Location
            </h2>
            <div className="h-1 w-20 mx-auto" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="h-6 w-6 shrink-0" style={{ color: 'var(--theme-primary)' }} />
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
          <h2 
            className="text-3xl mb-4" 
            style={{ 
              color: 'var(--theme-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--heading-weight)'
            }}
          >
            Photo Gallery
          </h2>
          <div className="h-1 w-20 mx-auto" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
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
