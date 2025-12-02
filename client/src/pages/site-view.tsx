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
  
  // Shoalwood layout uses Plus Jakarta Sans with Open Sans fallback
  if (layout?.id === 'layout-shoalwood') {
    return {
      '--font-heading': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      '--font-body': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '400',
      '--font-nav': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
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

      {/* Top right - Logo and Request Info (scroll with hero) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-4">
        {theme?.logoUrl && (
          <img 
            src={theme.logoUrl} 
            alt="Logo" 
            className="h-10 md:h-14 w-auto object-contain brightness-0 invert"
            data-testid="img-nav-logo"
          />
        )}
        <a 
          href="#contact"
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-base font-medium tracking-[0.1em] uppercase border border-white/40 hover:bg-white/30 transition-colors"
          data-testid="button-request-info"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          REQUEST INFO
        </a>
      </div>
      
      {heroImages.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-[80px] top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10 pl-20 md:pl-24">
        <div className="container mx-auto">
          {/* Status badge */}
          <div className="inline-block bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded mb-6">
            <span 
              className="text-xs font-semibold tracking-[0.2em] uppercase" 
              style={{ color: theme?.colors?.primary || '#1a1a1a' }}
            >
              For Sale
            </span>
          </div>
          {/* Price */}
          <h1 
            className="text-white mb-3"
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: '400',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              fontSize: '24px'
            }}
          >
            {site.price}
          </h1>
          {/* Address - all caps */}
          <h2 
            className="text-lg md:text-xl text-white/90 tracking-wide uppercase"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              letterSpacing: '0.05em'
            }}
          >
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('Menu');
  const [isOnHero, setIsOnHero] = useState(true);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const sectionIds = ['home', 'overview', 'details', 'photos', 'video', 'map', 'contact'];
    const sectionLabels: Record<string, string> = {
      'home': 'Menu',
      'overview': 'Property Description',
      'details': 'Details',
      'photos': 'Photos',
      'video': 'Video',
      'map': 'Map',
      'contact': 'Contact'
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const heroSection = document.getElementById('home');
      const heroHeight = heroSection?.offsetHeight || window.innerHeight;
      
      setIsOnHero(window.scrollY < heroHeight - 100);
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setCurrentSection(sectionLabels[sectionIds[i]] || 'Menu');
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#overview', label: 'Property Description' },
    { href: '#details', label: 'Details' },
    { href: '#photos', label: 'Photos', show: hasPhotos },
    { href: '#video', label: 'Video', show: hasVideo },
    { href: '#map', label: 'Map' },
    { href: '#contact', label: 'Contact' },
  ].filter(link => link.show !== false);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const menuColor = isOnHero ? 'white' : 'black';
  const borderColor = isOnHero ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)';

  return (
    <>
      {/* Fixed side menu bar - hamburger with vertical text */}
      <div 
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center transition-all duration-300"
        style={{ 
          width: '60px',
          borderRight: `1px solid ${borderColor}`
        }}
      >
        {/* Hamburger button - no background */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="mt-4 p-3 transition-colors"
          aria-label="Open menu"
          data-testid="button-mobile-menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={menuColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        {/* Vertical section name text - changes based on scroll position */}
        <div 
          className="mt-4 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300"
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            color: menuColor
          }}
        >
          {currentSection}
        </div>
      </div>

      {/* Slide-out menu panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100]" data-testid="mobile-menu-overlay">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            className="absolute left-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            {/* Menu header with logo and close */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-12 w-auto" />
              ) : (
                <div 
                  className="text-xl font-semibold" 
                  style={{ color: theme?.colors?.primary || '#1a1a1a', fontFamily: 'var(--font-heading)' }}
                >
                  {site.title || site.address.split(',')[0]}
                </div>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
                data-testid="button-close-menu"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Property address */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Property</p>
              <p className="text-base font-medium text-gray-800">{site.address}</p>
            </div>
            
            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-4">
                {navLinks.map(link => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left px-4 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors border-b border-gray-50"
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Bottom CTA */}
            <div className="p-6 border-t border-gray-100">
              <Button 
                className="w-full text-white font-medium py-3 text-base"
                style={{ backgroundColor: theme?.colors?.primary || '#1a1a1a' }}
                onClick={() => handleNavClick('#contact')}
                data-testid="button-mobile-request-info"
              >
                Request Info
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function ShoalwoodDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 500;
  
  return (
    <section id="overview" className="py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <h2 
          className="text-3xl md:text-4xl mb-10 text-center" 
          style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--theme-text)',
            fontWeight: '400',
            letterSpacing: '-0.01em'
          }}
        >
          Property Description
        </h2>
        <div className="prose prose-lg max-w-none">
          <p 
            className="leading-[1.8] whitespace-pre-wrap text-center md:text-left"
            style={{ 
              color: '#555',
              fontSize: '1.0625rem',
              fontFamily: 'var(--font-body)',
              fontWeight: '400'
            }}
          >
            {isLong && !isExpanded ? description.slice(0, 500) + '...' : description}
          </p>
          {isLong && (
            <div className="text-center mt-6">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-opacity"
                style={{ color: 'var(--theme-primary)' }}
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ShoalwoodDetails({ site, theme }: { site: Site; theme?: Theme }) {
  const details = [
    { label: 'Bedrooms', value: site.bedrooms },
    { label: 'Bathrooms', value: site.bathrooms },
    { label: 'Living Area', value: `${site.sqft.toLocaleString()} sqft` },
    { label: 'Lot Size', value: site.lotSize || '—' },
    { label: 'Year Built', value: site.yearBuilt || '—' },
    { label: 'Stories', value: site.stories || '—' },
  ];

  const primaryColor = theme?.colors?.primary || '#558B73';
  const bgColor = `${primaryColor}0D`;

  return (
    <section 
      id="details" 
      className="py-16 px-4 md:px-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto max-w-3xl">
        {/* Section title with divider - left aligned */}
        <div className="mb-10">
          <h2 
            className="uppercase tracking-[0.2em] mb-4" 
            style={{ 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--theme-text)',
              fontWeight: '600',
              fontSize: '21px'
            }}
          >
            PROPERTY DETAILS
          </h2>
          {/* Section title divider */}
          <div 
            className="w-12 h-0.5"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
        
        {/* Details list - each on own line with underline */}
        <div className="space-y-0">
          {details.map(({ label, value }, index) => (
            <div 
              key={label} 
              className="flex justify-between items-center py-4"
              style={{ 
                borderBottom: index < details.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <span 
                className="text-sm uppercase tracking-[0.1em]"
                style={{ 
                  color: '#666', 
                  fontFamily: 'var(--font-body)',
                  fontWeight: '500'
                }}
              >
                {label}
              </span>
              <span 
                className="text-base"
                style={{ 
                  color: 'var(--theme-text)', 
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400'
                }}
              >
                {value}
              </span>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: `I am interested in ${site.address}`
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 md:px-8 border-t border-gray-100">
      <div className="container mx-auto max-w-2xl">
        <h2 
          className="text-3xl md:text-4xl mb-10 text-center" 
          style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--theme-text)',
            fontWeight: '400',
            letterSpacing: '-0.01em'
          }}
        >
          Get in Touch
        </h2>
        
        <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border border-gray-100">
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
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                Thank you for your inquiry! The agent will be in touch with you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                Something went wrong. Please try again or contact us directly.
              </div>
            )}
            
            <Button 
              type="submit" 
              size="lg"
              className="w-full md:w-auto text-white"
              style={{ backgroundColor: theme?.colors?.primary || '#1a1a1a' }}
              disabled={isSubmitting}
              data-testid="button-send-inquiry"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
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
        {/* Navigation overlay - rendered first, floats on top of hero */}
        <ShoalwoodNavigation site={site} theme={theme} hasPhotos={!!hasPhotos} hasVideo={hasVideo} />
        <ShoalwoodHero site={site} theme={theme} heroImage={heroImage} />
        <ShoalwoodDescription description={site.description || "A beautiful property awaiting your discovery."} />
        <ShoalwoodDetails site={site} theme={theme} />
        
        {hasPhotos && <PhotoGallery photos={site.photos!} themeColors={theme?.colors} />}
        
        {hasVideo && (
          <section id="video" className="py-20 px-4 md:px-8 border-t border-gray-100">
            <div className="container mx-auto max-w-3xl">
              <h2 
                className="text-3xl md:text-4xl mb-10 text-center" 
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  color: 'var(--theme-text)',
                  fontWeight: '400',
                  letterSpacing: '-0.01em'
                }}
              >
                Property Tour
              </h2>
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
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

        <section id="map" className="py-20 px-4 md:px-8 border-t border-gray-100">
          <div className="container mx-auto max-w-3xl">
            <h2 
              className="text-3xl md:text-4xl mb-10 text-center" 
              style={{ 
                fontFamily: 'var(--font-heading)', 
                color: 'var(--theme-text)',
                fontWeight: '400',
                letterSpacing: '-0.01em'
              }}
            >
              Map
            </h2>
            <div className="rounded-lg overflow-hidden shadow-md">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-medium text-gray-700">{site.address}</span>
                </div>
              </div>
              <div className="aspect-[16/9]">
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
    <section id="photos" className="py-20 px-4 md:px-8 border-t border-gray-100">
      <div className="container mx-auto max-w-5xl">
        <h2 
          className="text-3xl md:text-4xl mb-12 text-center" 
          style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--theme-text)',
            fontWeight: '400',
            letterSpacing: '-0.01em'
          }}
        >
          Photos
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
