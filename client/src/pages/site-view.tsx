import { useRoute, Link } from "wouter";
import { useSite, useThemes, useLayout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Play, Home, Info, Video, Image, X, ChevronLeft, ChevronRight, ChevronDown, Bed, Bath, Square, Calendar, Building, Phone, Mail, User, Instagram, Facebook, Linkedin, Youtube, Twitter, FileText, Download, Package } from "lucide-react";
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
  
  // Modern layout uses Outfit for all text
  if (layout?.id === 'layout-modern') {
    return {
      '--font-heading': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      '--font-body': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '600',
      '--font-nav': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  // Magazine layout uses Playfair Display for headings and Source Sans Pro for body
  if (layout?.id === 'layout-magazine') {
    return {
      '--font-heading': '"Playfair Display", Georgia, serif',
      '--font-body': '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '400',
      '--font-nav': '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  return {
    '--font-heading': `"${headingFont}", serif`,
    '--font-body': `"${bodyFont}", sans-serif`,
    '--heading-weight': headingWeight,
  } as React.CSSProperties;
}

function ShoalwoodHero({ site, theme, heroImage, effectiveLogo }: { site: Site; theme?: Theme; heroImage: string; effectiveLogo?: string | null }) {
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
        {(effectiveLogo || theme?.logoUrl) && (
          <img 
            src={effectiveLogo ?? theme?.logoUrl ?? ''} 
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

function ShoalwoodNavigation({ site, theme, hasPhotos, hasVideo, effectiveLogo }: { site: Site; theme?: Theme; hasPhotos: boolean; hasVideo: boolean; effectiveLogo?: string | null }) {
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
              {(effectiveLogo || theme?.logoUrl) ? (
                <img src={effectiveLogo ?? theme?.logoUrl ?? ''} alt="Logo" className="h-12 w-auto" />
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

function ShoalwoodDescription({ description, descriptionImage }: { description: string; descriptionImage?: string | null }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const textRef = useCallback((node: HTMLDivElement | null) => {
    if (node && descriptionImage) {
      const imageHeight = 400;
      const textHeight = node.scrollHeight;
      setIsTextTruncated(textHeight > imageHeight);
    }
  }, [descriptionImage]);

  const hasImage = !!descriptionImage;
  
  return (
    <>
      <section id="overview" className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
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
          
          {hasImage ? (
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Left column - Text */}
              <div className="relative">
                <div 
                  ref={textRef}
                  className="prose prose-lg max-w-none overflow-hidden"
                  style={{ maxHeight: isTextTruncated ? '400px' : 'none' }}
                >
                  <p 
                    className="leading-[1.8] whitespace-pre-wrap"
                    style={{ 
                      color: '#555',
                      fontSize: '1.0625rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: '400'
                    }}
                  >
                    {description}
                  </p>
                </div>
                {isTextTruncated && (
                  <div className="mt-6">
                    <button 
                      onClick={() => setShowPopup(true)}
                      className="text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--theme-primary)' }}
                      data-testid="button-read-more"
                    >
                      Read More
                    </button>
                  </div>
                )}
              </div>
              
              {/* Right column - Image */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={descriptionImage} 
                  alt="Property" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none max-w-3xl mx-auto">
              <p 
                className="leading-[1.8] whitespace-pre-wrap text-center md:text-left"
                style={{ 
                  color: '#555',
                  fontSize: '1.0625rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400'
                }}
              >
                {description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Read More Popup */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl max-h-[80vh] overflow-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              data-testid="button-close-popup"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 
              className="text-2xl mb-6"
              style={{ 
                fontFamily: 'var(--font-heading)', 
                color: 'var(--theme-text)',
                fontWeight: '400'
              }}
            >
              Property Description
            </h3>
            <p 
              className="leading-[1.8] whitespace-pre-wrap"
              style={{ 
                color: '#555',
                fontSize: '1.0625rem',
                fontFamily: 'var(--font-body)',
                fontWeight: '400'
              }}
            >
              {description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ShoalwoodDetails({ site, theme }: { site: Site; theme?: Theme }) {
  const standardDetails: { label: string; value: string | number | null | undefined }[] = [
    { label: 'Bedrooms', value: site.bedrooms },
    { label: 'Bathrooms', value: site.bathrooms },
    { label: 'Living Area', value: site.sqft ? `${site.sqft.toLocaleString()} sqft` : null },
    { label: 'Lot Size', value: site.lotSize },
    { label: 'Year Built', value: site.yearBuilt },
    { label: 'Stories', value: site.stories },
  ];

  const filteredStandardDetails = standardDetails.filter(d => d.value !== null && d.value !== undefined && d.value !== '');
  
  const customDetails = (site.customDetails || []).filter(d => d.label && d.value);
  
  const allDetails = [
    ...filteredStandardDetails.map(d => ({ label: d.label, value: String(d.value) })),
    ...customDetails,
  ];

  const primaryColor = theme?.colors?.primary || '#558B73';
  const bgColor = `${primaryColor}0D`;

  if (allDetails.length === 0) {
    return null;
  }

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
          {allDetails.map(({ label, value }, index) => (
            <div 
              key={`${label}-${index}`} 
              className="flex justify-between items-center py-4"
              style={{ 
                borderBottom: index < allDetails.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
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

// Modern Layout Components - Transparent nav that becomes solid on scroll, fade hero slider
function ModernNavigation({ site, theme, hasPhotos, hasVideo, hasDocuments, effectiveHeroLogo, effectiveLogo }: { 
  site: Site; 
  theme?: Theme; 
  hasPhotos: boolean; 
  hasVideo: boolean;
  hasDocuments: boolean;
  effectiveHeroLogo?: string | null;
  effectiveLogo?: string | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
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
    { href: '#home', label: 'Home' },
    { href: '#details', label: 'Details' },
    { href: '#photos', label: 'Photos', show: hasPhotos },
    { href: '#video', label: 'Video', show: hasVideo },
    { href: '#documents', label: 'Documents', show: hasDocuments },
    { href: '#map', label: 'Map' },
    { href: '#contact', label: 'Contact' },
  ].filter(link => link.show !== false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white shadow-md py-3' 
            : 'bg-transparent py-6'
        }`}
        style={isScrolled ? { borderBottom: `2px solid ${theme?.colors?.primary || '#558B73'}` } : undefined}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo - switches between hero logo (when on hero) and regular logo (when scrolled) */}
          <div className="flex items-center">
            {/* Show hero logo when NOT scrolled, regular logo when scrolled */}
            {!isScrolled && effectiveHeroLogo && (
              <img 
                src={effectiveHeroLogo} 
                alt="Logo" 
                className="w-auto object-contain transition-all duration-500 brightness-0 invert drop-shadow-lg"
                style={{ height: '70px' }}
                data-testid="img-modern-nav-hero-logo"
              />
            )}
            {isScrolled && effectiveLogo && (
              <img 
                src={effectiveLogo} 
                alt="Logo" 
                className="w-auto object-contain transition-all duration-500"
                style={{ height: '48px' }}
                data-testid="img-modern-nav-logo"
              />
            )}
            {/* Fallback text if no logos available for current state */}
            {((!isScrolled && !effectiveHeroLogo) || (isScrolled && !effectiveLogo)) && (
              <span 
                className={`font-semibold transition-all duration-500 ${
                  isScrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl text-white drop-shadow-lg'
                }`}
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  color: isScrolled ? (theme?.colors?.primary || '#558B73') : undefined
                }}
              >
                {site.title || site.address.split(',')[0]}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70 ${
                  isScrolled ? 'text-gray-700' : 'text-white drop-shadow-sm'
                }`}
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2"
            aria-label="Open menu"
            data-testid="button-modern-mobile-menu"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={isScrolled ? '#333' : 'white'} 
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100]" data-testid="modern-mobile-menu-overlay">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <span 
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-heading)', color: theme?.colors?.primary }}
              >
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-close-modern-menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 py-6">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-6 py-4 text-gray-700 hover:bg-gray-50 text-lg"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function ModernHero({ site, theme, heroImage, effectiveHeroLogo }: { 
  site: Site; 
  theme?: Theme; 
  heroImage: string;
  effectiveHeroLogo?: string | null;
}) {
  const slides = site.heroSlides && site.heroSlides.length > 0 
    ? site.heroSlides 
    : [{ 
        title: site.title || site.address, 
        subtitle: site.price || 'Luxury Living Awaits',
        backgroundImage: site.heroPhotos?.[0] || site.photos?.[0] || heroImage
      }];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides with fade
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide];
  const bgImage = currentSlideData.backgroundImage || site.heroPhotos?.[currentSlide] || site.photos?.[currentSlide] || heroImage;

  const scrollToDetails = () => {
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background images - fade between them */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundImage: `url(${slide.backgroundImage || site.photos?.[index] || heroImage})`,
            zIndex: index === currentSlide ? 1 : 0
          }}
        />
      ))}
      
      {/* Gradient overlay - more transparent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/15 z-10" />

      {/* Content - no logo, just title, subtitle, and button */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
        {/* Slide content with fade */}
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <h1 
            className="text-white mb-6"
            style={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 'normal',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              fontSize: '46px',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {currentSlideData.title || site.title || site.address}
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: '400',
              letterSpacing: '0.02em',
              textShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }}
          >
            {currentSlideData.subtitle || site.price}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={scrollToDetails}
          className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white text-base font-medium tracking-wider uppercase border border-white/40 hover:bg-white/30 transition-all duration-300 rounded-sm"
          style={{ fontFamily: 'var(--font-nav)' }}
          data-testid="button-have-a-look"
        >
          Have a look
        </button>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentSlide) {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsTransitioning(false);
                  }, 500);
                }
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white w-10' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              data-testid={`slide-indicator-${index}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ModernDetails({ site, theme }: { site: Site; theme?: Theme }) {
  const primaryColor = theme?.colors?.primary || '#558B73';
  
  const details = [
    { label: 'Bedrooms', value: site.bedrooms, icon: Bed },
    { label: 'Bathrooms', value: site.bathrooms, icon: Bath },
    { label: 'Square Feet', value: site.sqft?.toLocaleString(), icon: Square },
    { label: 'Year Built', value: site.yearBuilt, icon: Calendar },
    { label: 'Stories', value: site.stories, icon: Building },
  ].filter(d => d.value);

  const customDetails = site.customDetails?.filter(d => d.label && d.value) || [];
  const allDetails = [...details, ...customDetails.map(d => ({ label: d.label, value: d.value, icon: null }))];

  return (
    <section 
      id="details" 
      className="py-20 md:py-28 px-6 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, ${primaryColor}08 0%, transparent 50%, ${primaryColor}03 100%),
          radial-gradient(ellipse at 0% 100%, ${primaryColor}12 0%, transparent 50%),
          radial-gradient(ellipse at 100% 0%, ${primaryColor}06 0%, transparent 50%),
          linear-gradient(180deg, #fafafa 0%, #ffffff 100%)
        `
      }}
    >
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${primaryColor.replace('#', '')}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="container mx-auto max-w-5xl relative">
        {/* Header with Overview title (left) and Price (right) */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-8 mt-8 mb-12">
          {/* Left - Overview title */}
          <div>
            <h2 
              className="text-3xl md:text-4xl mb-3"
              style={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--heading-weight)',
                color: 'var(--theme-text)'
              }}
            >
              Overview
            </h2>
            {/* Short separator */}
            <div 
              className="w-16 h-1 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <p 
              className="mt-4 text-gray-500 text-lg"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {site.address}
            </p>
          </div>
          
          {/* Right - Price */}
          <div className="text-left md:text-right">
            <p 
              className="text-sm uppercase tracking-widest mb-1 text-gray-400"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Offered for
            </p>
            <span 
              className="text-3xl md:text-4xl font-semibold"
              style={{ color: primaryColor, fontFamily: 'var(--font-heading)' }}
            >
              {site.price}
            </span>
          </div>
        </div>

        {/* Details list - each on its own line */}
        <div className="space-y-4 mb-12">
          {allDetails.map((detail, index) => {
            const Icon = 'icon' in detail && detail.icon ? detail.icon : null;
            return (
              <div 
                key={index} 
                className="flex items-center justify-between py-4 border-b"
                style={{ borderColor: `${primaryColor}15` }}
              >
                <div className="flex items-center gap-4">
                  {Icon && (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <Icon 
                        className="h-5 w-5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  )}
                  {!Icon && (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                  )}
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {detail.label}
                  </span>
                </div>
                <span 
                  className="text-lg font-medium"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-text)' }}
                >
                  {detail.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Description with optional image */}
        {site.description && (
          <div className={`${site.descriptionImage ? 'flex flex-col md:flex-row gap-8 md:gap-12 items-start' : ''}`}>
            <div className={site.descriptionImage ? 'flex-1' : 'max-w-3xl'}>
              <h3 
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--heading-weight)' }}
              >
                About This Property
              </h3>
              <div 
                className="w-12 h-1 rounded-full mb-6"
                style={{ backgroundColor: primaryColor }}
              />
              <p 
                className="text-gray-600 leading-relaxed text-lg"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {site.description}
              </p>
            </div>
            {site.descriptionImage && (
              <div className="flex-1 md:max-w-md">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={site.descriptionImage} 
                    alt="Property" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

interface AgentInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  brokerage: string | null;
  teamName: string | null;
  address: string | null;
  socialMedia: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    x?: string;
  } | null;
}

function ModernContact({ site, theme, agentInfo }: { site: Site; theme?: Theme; agentInfo?: AgentInfo | null }) {
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

  const primaryColor = theme?.colors?.primary || '#558B73';

  return (
    <section id="contact" className="py-16 md:py-24 px-4 md:px-6" style={{ backgroundColor: '#fafafa' }}>
      <div className="container mx-auto max-w-6xl">
        <h2 
          className="text-3xl md:text-4xl text-center mb-3"
          style={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--heading-weight)',
            color: 'var(--theme-text)'
          }}
        >
          Get In Touch
        </h2>
        <p 
          className="text-center text-gray-500 mb-12 md:mb-16 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Ready to schedule a viewing or have questions? We'd love to hear from you.
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Contact Form */}
            <div className="flex-1 p-8 md:p-12 md:border-r" style={{ borderColor: primaryColor + '30' }}>
              <h3 
                className="text-xl font-semibold mb-6"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-text)' }}
              >
                Send Us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modernFirstName" className="text-sm text-gray-600">First Name *</Label>
                    <Input 
                      id="modernFirstName" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required 
                      className="mt-1.5 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modernLastName" className="text-sm text-gray-600">Last Name *</Label>
                    <Input 
                      id="modernLastName" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required 
                      className="mt-1.5 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="modernEmail" className="text-sm text-gray-600">Email Address *</Label>
                  <Input 
                    id="modernEmail" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                    className="mt-1.5 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="modernPhone" className="text-sm text-gray-600">Phone Number *</Label>
                  <Input 
                    id="modernPhone" 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                    className="mt-1.5 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="modernMessage" className="text-sm text-gray-600">Message *</Label>
                  <Textarea 
                    id="modernMessage" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required 
                    className="mt-1.5 border-gray-200 focus:border-gray-400 focus:ring-gray-400 resize-none"
                    rows={4}
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                    Thank you for your inquiry! We'll be in touch soon.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    Something went wrong. Please try again.
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting}
                  data-testid="button-modern-send-inquiry"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Mobile Separator */}
            <div className="md:hidden px-8">
              <div 
                className="h-px w-full"
                style={{ backgroundColor: primaryColor + '30' }}
              />
            </div>

            {/* Right Column - Agent Info */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center" style={{ backgroundColor: primaryColor + '05' }}>
              <div className="text-center md:text-left">
                {/* Agent Photo */}
                <div className="flex justify-center md:justify-start mb-6">
                  {agentInfo?.profileImageUrl ? (
                    <div 
                      className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4"
                      style={{ borderColor: primaryColor + '30' }}
                    >
                      <img 
                        src={agentInfo.profileImageUrl} 
                        alt={agentInfo.name || 'Agent'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {agentInfo?.name ? agentInfo.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>

                {/* Agent Name & Title */}
                <h3 
                  className="text-2xl font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--theme-text)' }}
                >
                  {agentInfo?.name || 'Your Real Estate Agent'}
                </h3>
                {agentInfo?.teamName && (
                  <p className="text-gray-500 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {agentInfo.teamName}
                  </p>
                )}
                {agentInfo?.brokerage && (
                  <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                    {agentInfo.brokerage}
                  </p>
                )}

                {/* Contact Details */}
                <div className="space-y-4 mt-6">
                  {agentInfo?.phone && (
                    <a 
                      href={`tel:${agentInfo.phone}`}
                      className="flex items-center justify-center md:justify-start gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: primaryColor + '15' }}
                      >
                        <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                        {agentInfo.phone}
                      </span>
                    </a>
                  )}
                  
                  {agentInfo?.email && (
                    <a 
                      href={`mailto:${agentInfo.email}`}
                      className="flex items-center justify-center md:justify-start gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: primaryColor + '15' }}
                      >
                        <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                        {agentInfo.email}
                      </span>
                    </a>
                  )}
                  
                  {agentInfo?.address && (
                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor + '15' }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                        {agentInfo.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {agentInfo?.socialMedia && Object.values(agentInfo.socialMedia).some(v => v) && (
                  <div className="mt-8 pt-6 border-t" style={{ borderColor: primaryColor + '20' }}>
                    <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                      Connect with me
                    </p>
                    <div className="flex justify-center md:justify-start gap-3">
                      {agentInfo.socialMedia.instagram && (
                        <a 
                          href={agentInfo.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: primaryColor + '15' }}
                        >
                          <Instagram className="w-4 h-4" style={{ color: primaryColor }} />
                        </a>
                      )}
                      {agentInfo.socialMedia.facebook && (
                        <a 
                          href={agentInfo.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: primaryColor + '15' }}
                        >
                          <Facebook className="w-4 h-4" style={{ color: primaryColor }} />
                        </a>
                      )}
                      {agentInfo.socialMedia.linkedin && (
                        <a 
                          href={agentInfo.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: primaryColor + '15' }}
                        >
                          <Linkedin className="w-4 h-4" style={{ color: primaryColor }} />
                        </a>
                      )}
                      {agentInfo.socialMedia.youtube && (
                        <a 
                          href={agentInfo.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: primaryColor + '15' }}
                        >
                          <Youtube className="w-4 h-4" style={{ color: primaryColor }} />
                        </a>
                      )}
                      {agentInfo.socialMedia.x && (
                        <a 
                          href={agentInfo.socialMedia.x}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: primaryColor + '15' }}
                        >
                          <Twitter className="w-4 h-4" style={{ color: primaryColor }} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernDocuments({ site, theme }: { site: Site; theme?: Theme }) {
  const primaryColor = theme?.colors?.primary || '#558B73';
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  
  const documents = site.documents || [];
  
  if (documents.length === 0) {
    return null;
  }
  
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/documents/download-all`);
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${site.address.replace(/[^a-zA-Z0-9]/g, '-')}-documents.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };
  
  return (
    <section id="documents" className="py-16 md:py-24 px-4 md:px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 
          className="text-3xl md:text-4xl text-center mb-3"
          style={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--heading-weight)',
            color: 'var(--theme-text)'
          }}
        >
          Property Documents
        </h2>
        <p 
          className="text-center text-gray-500 mb-10 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Download important documents related to this property.
        </p>
        
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              {documents.length} document{documents.length !== 1 ? 's' : ''} available
            </span>
            {documents.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                className="gap-2"
                data-testid="button-download-all-documents"
              >
                <Package className="h-4 w-4" />
                {isDownloadingAll ? 'Preparing...' : 'Download All'}
              </Button>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-4 group"
                data-testid={`document-row-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: primaryColor + '15' }}
                  >
                    <FileText className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <span 
                    className="font-medium text-gray-800"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {doc.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                    data-testid={`button-download-doc-${index}`}
                  >
                    <Download className="h-5 w-5" style={{ color: primaryColor }} />
                    <span className="sr-only">Download {doc.name}</span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== MAGAZINE LAYOUT COMPONENTS =====================

function MagazineNavigation({ site, theme, effectiveLogo }: { site: Site; theme?: Theme; effectiveLogo?: string | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasPhotos = site.photos && site.photos.length > 0;
  const hasDocuments = site.documents && site.documents.length > 0;
  const hasVideo = !!site.videoUrl;

  const features = (site as any).features as string[] | undefined;
  const hasFeatures = features && features.length > 0;

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Overview', href: '#facts' },
    { label: 'Features', href: '#features', show: hasFeatures },
    { label: 'Gallery', href: '#photos', show: hasPhotos },
    { label: 'Video', href: '#video', show: hasVideo },
    { label: 'Documents', href: '#documents', show: hasDocuments },
    { label: 'Contact', href: '#contact' },
  ].filter(item => item.show !== false);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {(effectiveLogo || theme?.logoUrl) && (
          <img 
            src={effectiveLogo ?? theme?.logoUrl ?? ''} 
            alt="Logo" 
            className={`w-auto object-contain transition-all duration-300 ${
              scrolled ? '' : 'brightness-0 invert'
            }`}
            style={{ height: '80px' }}
            data-testid="img-magazine-logo"
          />
        )}
        {!effectiveLogo && !theme?.logoUrl && <div />}
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`transition-colors hover:opacity-70 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              style={{ fontFamily: '"Arimo", sans-serif', fontSize: '16px', textTransform: 'capitalize', letterSpacing: '0.02em', fontWeight: '400' }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function MagazineHero({ site, theme, heroImage }: { site: Site; theme?: Theme; heroImage: string }) {
  const heroPhotos = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : site.photos && site.photos.length > 0 
      ? site.photos.slice(0, 4) 
      : [site.imageUrl || heroImage];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % heroPhotos.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [heroPhotos.length]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;600;700&display=swap');
        .magazine-hero-text {
          font-family: "Arimo", sans-serif;
        }
        @keyframes scroll-arrow {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        @keyframes magazine-zoom-out {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      {heroPhotos.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundImage: `url(${photo})`,
            zIndex: index === currentSlide ? 1 : 0,
            animation: index === currentSlide ? 'magazine-zoom-out 6s ease-out forwards' : 'none'
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10" />
      
      <div className="absolute left-0 right-0 text-white px-8 z-20" style={{ bottom: '40px' }}>
        <div className="container mx-auto max-w-6xl">
          <h1 
            className="magazine-hero-text"
            style={{ 
              fontSize: '24px',
              fontWeight: '300',
              letterSpacing: '-0.02em'
            }}
          >
            {site.title || site.address}
          </h1>
        </div>
      </div>
      
      <button
        onClick={() => document.getElementById('facts')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 right-8 rounded-full border-2 border-white/70 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer z-20"
        style={{ width: '128px', height: '128px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        data-testid="button-magazine-scroll"
        aria-label="Scroll down"
      >
        <ChevronDown 
          className="h-10 w-10 text-white" 
          style={{ animation: 'scroll-arrow 2s ease-in-out infinite' }}
        />
      </button>
    </section>
  );
}

function MagazineFactsBar({ site, theme }: { site: Site; theme?: Theme }) {
  const primaryColor = theme?.colors?.primary || '#558B73';
  
  return (
    <section 
      id="facts" 
      className="py-8 md:py-12"
      style={{ backgroundColor: primaryColor, scrollMarginTop: '100px' }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;600&display=swap" rel="stylesheet" />
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left side - Offered At, Price, Compensation */}
          <div className="text-white">
            <p 
              className="text-sm tracking-widest opacity-80 mb-1"
              style={{ fontFamily: '"Arimo", sans-serif', letterSpacing: '0.1em' }}
            >
              Offered at
            </p>
            <p 
              className="text-3xl md:text-4xl mb-1"
              style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
            >
              {site.price || '$0'}
            </p>
            {(site as any).buyerAgentComp && (
              <p 
                className="text-sm opacity-80"
                style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '300' }}
              >
                {(site as any).buyerAgentComp}
              </p>
            )}
          </div>
          
          {/* Right side - Property stats with icons above */}
          <div className="flex flex-wrap items-end gap-8 md:gap-10 text-white">
            {site.bedrooms && (
              <div className="flex flex-col items-center">
                <Bed style={{ height: '45px', width: '45px', marginBottom: '8px', opacity: 0.9 }} />
                <span style={{ fontFamily: '"Shippori Mincho B1", serif', fontSize: '32px' }}>
                  {site.bedrooms} Beds
                </span>
              </div>
            )}
            {site.bathrooms && (
              <div className="flex flex-col items-center">
                <Bath style={{ height: '45px', width: '45px', marginBottom: '8px', opacity: 0.9 }} />
                <span style={{ fontFamily: '"Shippori Mincho B1", serif', fontSize: '32px' }}>
                  {site.bathrooms} Baths
                </span>
              </div>
            )}
            {site.sqft && (
              <div className="flex flex-col items-center">
                <Square style={{ height: '45px', width: '45px', marginBottom: '8px', opacity: 0.9 }} />
                <span style={{ fontFamily: '"Shippori Mincho B1", serif', fontSize: '18px' }}>
                  {site.sqft.toLocaleString()} sqft
                </span>
                <span 
                  className="text-xs opacity-70"
                  style={{ fontFamily: '"Arimo", sans-serif' }}
                >
                  Home Size
                </span>
              </div>
            )}
            {site.lotSize && (
              <div className="flex flex-col items-center">
                <Building style={{ height: '45px', width: '45px', marginBottom: '8px', opacity: 0.9 }} />
                <span style={{ fontFamily: '"Shippori Mincho B1", serif', fontSize: '18px' }}>
                  {site.lotSize}
                </span>
                <span 
                  className="text-xs opacity-70"
                  style={{ fontFamily: '"Arimo", sans-serif' }}
                >
                  Lot Size
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MagazineMarqueeGallery({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;
  
  const topRowPhotos = photos.slice(0, Math.ceil(photos.length / 2));
  const bottomRowPhotos = photos.slice(Math.ceil(photos.length / 2));
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: selectedIndex || 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (selectedIndex !== null && emblaApi) {
      emblaApi.scrollTo(selectedIndex);
    }
  }, [selectedIndex, emblaApi]);

  return (
    <>
      <section id="photos" className="py-16 overflow-hidden bg-gray-50" style={{ scrollMarginTop: '100px' }}>
        <div className="mb-12 text-center">
          <h2 
            className="text-3xl md:text-4xl"
            style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
          >
            Photo Gallery
          </h2>
        </div>
        
        <div className="space-y-4">
          <div 
            className="flex"
            style={{ 
              width: `${topRowPhotos.length * 320 * 2}px`,
              animation: 'marquee-scroll-left 120s linear infinite'
            }}
          >
            {[...topRowPhotos, ...topRowPhotos].map((photo, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-80 h-56 mx-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedIndex(index % topRowPhotos.length)}
              >
                <img 
                  src={photo} 
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          <div 
            className="flex"
            style={{ 
              width: `${bottomRowPhotos.length * 320 * 2}px`,
              animation: 'marquee-scroll-right 120s linear infinite'
            }}
          >
            {[...bottomRowPhotos, ...bottomRowPhotos].map((photo, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-80 h-56 mx-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedIndex((index % bottomRowPhotos.length) + topRowPhotos.length)}
              >
                <img 
                  src={photo} 
                  alt={`Property ${topRowPhotos.length + index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <style>{`
        @keyframes marquee-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>


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
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
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
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
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
    </>
  );
}

function MagazineDocuments({ site, theme }: { site: Site; theme?: Theme }) {
  const primaryColor = theme?.colors?.primary || '#558B73';
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  
  const documents = site.documents || [];
  
  if (documents.length === 0) {
    return null;
  }
  
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/documents/download-all`);
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${site.address.replace(/[^a-zA-Z0-9]/g, '-')}-documents.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };
  
  return (
    <section id="documents" className="py-16 px-6 bg-white" style={{ scrollMarginTop: '100px' }}>
      <div className="container mx-auto max-w-4xl">
        <h2 
          className="text-3xl md:text-4xl mb-4 text-center"
          style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
        >
          Documents
        </h2>
        <p 
          className="text-center text-gray-500 mb-10"
          style={{ fontFamily: '"Arimo", sans-serif' }}
        >
          Download important documents related to this property
        </p>
        
        {/* Download All Button */}
        {documents.length > 1 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all hover:opacity-80 disabled:opacity-50"
              style={{ 
                borderColor: primaryColor, 
                color: primaryColor,
                fontFamily: '"Arimo", sans-serif'
              }}
              data-testid="button-download-all-documents"
            >
              <Package className="h-5 w-5" />
              {isDownloadingAll ? 'Preparing ZIP...' : 'Download All Documents'}
            </button>
          </div>
        )}
        
        {/* Document Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {documents.map((doc, index) => (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-4 p-5 border rounded-lg hover:shadow-md transition-all group"
              style={{ borderColor: '#e5e7eb' }}
              data-testid={`document-${index}`}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: primaryColor + '15' }}
              >
                <FileText className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span 
                className="flex-1 font-medium text-gray-800 truncate"
                style={{ fontFamily: '"Arimo", sans-serif' }}
              >
                {doc.name}
              </span>
              <Download 
                className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" 
                style={{ color: primaryColor }} 
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

type OpenHouseEventType = {
  label?: string;
  date: string;
  startTime: string;
  endTime: string;
};

function MagazineContentSection({ site, theme }: { site: Site; theme?: Theme }) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showOpenHouseModal, setShowOpenHouseModal] = useState(false);
  
  const primaryColor = theme?.colors?.primary || '#558B73';
  const hasDocuments = site.documents && site.documents.length > 0;
  const hasBrochure = site.brochureUrl;
  const openHouses = (site as any).openHouses as OpenHouseEventType[] | undefined;
  const hasOpenHouses = openHouses && openHouses.length > 0;
  
  const truncatedDescription = site.description && site.description.length > 700
    ? site.description.slice(0, 700) + '...'
    : site.description;
  const needsReadMore = site.description && site.description.length > 700;
  
  const features = (site as any).features as string[] | undefined;
  const hasFeatures = features && features.length > 0;
  
  const photos = site.photos || [];
  const rightImage = (site as any).contentGridImage1 || photos[1] || photos[0];
  const bottomLeftImage = (site as any).contentGridImage2 || photos[2] || photos[1] || photos[0];

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return 'TBD';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const m = minutes || '00';
      if (isNaN(h)) return timeStr;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <section id="about" className="py-16 px-6 bg-white" style={{ scrollMarginTop: '100px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;600&display=swap" rel="stylesheet" />
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Grid 1 - Top Left: Property Name, Links, Description */}
          <div className="space-y-8">
            {/* Property Name */}
            <h2 
              className="text-3xl md:text-4xl"
              style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
            >
              {site.title || site.address}
            </h2>
            
            {/* Brochure / Documents Links */}
            {(hasBrochure || hasDocuments) && (
              <div className="flex gap-6 border-b pb-4">
                {hasBrochure && (
                  <a
                    href={site.brochureUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base hover:opacity-70 transition-opacity border-b-2 pb-1"
                    style={{ 
                      fontFamily: '"Arimo", sans-serif', 
                      color: primaryColor,
                      borderColor: primaryColor 
                    }}
                    data-testid="link-brochure"
                  >
                    Brochure
                  </a>
                )}
                {hasDocuments && (
                  <a
                    href="#documents"
                    className="inline-flex items-center gap-2 text-base hover:opacity-70 transition-opacity"
                    style={{ fontFamily: '"Arimo", sans-serif', color: '#000000' }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    data-testid="link-documents"
                  >
                    <Download className="h-4 w-4" />
                    Documents
                  </a>
                )}
              </div>
            )}
            
            {/* Description */}
            {site.description && (
              <div>
                <p 
                  className="text-base leading-relaxed text-gray-600"
                  style={{ fontFamily: '"Arimo", sans-serif', lineHeight: '1.8' }}
                >
                  {truncatedDescription}
                </p>
                {needsReadMore && (
                  <button
                    onClick={() => setShowDescriptionModal(true)}
                    className="mt-4 inline-flex items-center gap-2 text-base hover:opacity-70 transition-opacity"
                    style={{ fontFamily: '"Arimo", sans-serif', color: primaryColor }}
                    data-testid="button-read-more"
                  >
                    Read more
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Grid 2 - Top Right: Image with Offset */}
          <div>
            {rightImage && (
              <div className="relative">
                <div 
                  className="absolute top-6 left-6 w-full h-full"
                  style={{ backgroundColor: primaryColor, opacity: 0.3 }}
                />
                <img 
                  src={rightImage} 
                  alt="Property" 
                  className="relative w-full h-auto"
                />
              </div>
            )}
          </div>
          
          {/* Grid 3 - Bottom Left: Image with Offset */}
          <div>
            {bottomLeftImage && (
              <div className="relative">
                <div 
                  className="absolute top-6 left-6 w-full h-full"
                  style={{ backgroundColor: primaryColor, opacity: 0.3 }}
                />
                <img 
                  src={bottomLeftImage} 
                  alt="Property" 
                  className="relative w-full h-auto"
                />
              </div>
            )}
          </div>
          
          {/* Grid 4 - Bottom Right: Open House Card */}
          <div>
            {hasOpenHouses && (
              <button
                onClick={() => setShowOpenHouseModal(true)}
                className="w-full text-left p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                data-testid="button-open-houses"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="text-sm uppercase tracking-widest mb-2 opacity-70"
                      style={{ fontFamily: '"Arimo", sans-serif' }}
                    >
                      Open Houses
                    </p>
                    <p 
                      className="text-xl"
                      style={{ fontFamily: '"Shippori Mincho B1", serif' }}
                    >
                      {openHouses.length} Scheduled
                    </p>
                  </div>
                  <ChevronRight 
                    className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: primaryColor }}
                  />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Features Section */}
      {hasFeatures && (
        <div id="features" className="mt-16 pt-16 border-t" style={{ scrollMarginTop: '100px' }}>
          <h2 
            className="text-3xl md:text-4xl mb-12 text-center font-normal"
            style={{ fontFamily: '"Shippori Mincho B1", serif' }}
          >
            Features & Amenities
          </h2>
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8">
              {/* Left Column - Property Details */}
              <div>
                <div className="space-y-0">
                  {site.bedrooms && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Bedrooms</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{site.bedrooms}</span>
                    </div>
                  )}
                  {site.bathrooms && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Bathrooms</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{site.bathrooms}</span>
                    </div>
                  )}
                  {site.sqft && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Square Feet</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{site.sqft}</span>
                    </div>
                  )}
                  {(site as any).stories && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Stories</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{(site as any).stories}</span>
                    </div>
                  )}
                  {(site as any).yearBuilt && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Year Built</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{(site as any).yearBuilt}</span>
                    </div>
                  )}
                  {site.lotSize && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>Lot Size</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{site.lotSize}</span>
                    </div>
                  )}
                  {/* Custom Details */}
                  {(site as any).customDetails?.map((detail: { label: string; value: string }, index: number) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Arimo", sans-serif', color: '#666' }}>{detail.label}</span>
                      <span style={{ fontFamily: '"Arimo", sans-serif', fontWeight: '500' }}>{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Middle Separator */}
              <div className="hidden md:flex flex-col items-center">
                <div 
                  className="w-px h-full"
                  style={{ 
                    background: `linear-gradient(to bottom, transparent, ${primaryColor}, ${primaryColor}, transparent)` 
                  }}
                />
              </div>
              
              {/* Right Column - Features Tag Cloud */}
              <div>
                <div className="flex flex-wrap gap-3">
                  {features?.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-full border"
                      style={{ 
                        borderColor: primaryColor,
                        color: primaryColor
                      }}
                      data-testid={`tag-feature-${index}`}
                    >
                      <span className="text-sm" style={{ fontFamily: '"Arimo", sans-serif' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Description Modal */}
      {showDescriptionModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDescriptionModal(false)}
        >
          <div 
            className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 
                className="text-2xl"
                style={{ fontFamily: '"Shippori Mincho B1", serif' }}
              >
                About the Property
              </h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="button-close-description-modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p 
              className="text-base leading-relaxed text-gray-600"
              style={{ fontFamily: '"Arimo", sans-serif', lineHeight: '1.8' }}
            >
              {site.description}
            </p>
          </div>
        </div>
      )}
      {/* Open House Modal */}
      {showOpenHouseModal && hasOpenHouses && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowOpenHouseModal(false)}
        >
          <div 
            className="bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-lg p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 
                className="text-2xl"
                style={{ fontFamily: '"Shippori Mincho B1", serif' }}
              >
                Open Houses
              </h3>
              <button
                onClick={() => setShowOpenHouseModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="button-close-openhouse-modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              {openHouses.map((event, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                  data-testid={`open-house-modal-${index}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
                    <span 
                      className="font-medium"
                      style={{ fontFamily: '"Arimo", sans-serif' }}
                    >
                      {formatDate(event.date)}
                    </span>
                  </div>
                  {event.label && (
                    <p 
                      className="text-sm mb-1"
                      style={{ fontFamily: '"Arimo", sans-serif', color: primaryColor }}
                    >
                      {event.label}
                    </p>
                  )}
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: '"Arimo", sans-serif' }}
                  >
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type MagazineAgentInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  brokerage?: string | null;
  teamName?: string | null;
  address?: string | null;
  socialMedia?: {
    x?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  } | null;
};

function MagazineContact({ site, theme, agentInfo }: { site: Site; theme?: Theme; agentInfo?: MagazineAgentInfo | null }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryColor = theme?.colors?.primary || '#558B73';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to submit inquiry');
      
      setSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Unable to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6" style={{ backgroundColor: theme?.colors?.background || '#F8FAF9', scrollMarginTop: '100px' }}>
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 
              className="text-3xl md:text-4xl mb-6"
              style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400', color: theme?.colors?.text || '#2C3E50' }}
            >
              Schedule a Private Showing
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ fontFamily: '"Arimo", sans-serif', lineHeight: '1.7', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}
            >
              Interested in viewing this property? Fill out the form and we'll get back to you within 24 hours to arrange a private showing.
            </p>
            
            {agentInfo && (
              <div className="mt-8 pt-8 border-t" style={{ borderColor: (theme?.colors?.text || '#2C3E50') + '20' }}>
                <div className="flex items-start gap-4">
                  {agentInfo.profileImageUrl && (
                    <img 
                      src={agentInfo.profileImageUrl} 
                      alt={agentInfo.name || 'Agent'} 
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium text-xl" style={{ fontFamily: '"Arimo", sans-serif', color: theme?.colors?.text || '#2C3E50' }}>
                      {agentInfo.name || 'Your Agent'}
                    </p>
                    {agentInfo.teamName && (
                      <p className="text-sm" style={{ fontFamily: '"Arimo", sans-serif', color: primaryColor }}>
                        {agentInfo.teamName}
                      </p>
                    )}
                    {agentInfo.brokerage && (
                      <p className="text-sm" style={{ fontFamily: '"Arimo", sans-serif', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}>
                        {agentInfo.brokerage}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  {agentInfo.phone && (
                    <a 
                      href={`tel:${agentInfo.phone}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      style={{ fontFamily: '"Arimo", sans-serif', color: theme?.colors?.text || '#2C3E50' }}
                    >
                      <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                      {agentInfo.phone}
                    </a>
                  )}
                  {agentInfo.email && (
                    <a 
                      href={`mailto:${agentInfo.email}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      style={{ fontFamily: '"Arimo", sans-serif', color: theme?.colors?.text || '#2C3E50' }}
                    >
                      <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                      {agentInfo.email}
                    </a>
                  )}
                  {agentInfo.address && (
                    <div 
                      className="flex items-center gap-3"
                      style={{ fontFamily: '"Arimo", sans-serif', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}
                    >
                      <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                      {agentInfo.address}
                    </div>
                  )}
                </div>

                {agentInfo.socialMedia && (
                  <div className="mt-6 flex gap-4">
                    {agentInfo.socialMedia.facebook && (
                      <a 
                        href={agentInfo.socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {agentInfo.socialMedia.instagram && (
                      <a 
                        href={agentInfo.socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    )}
                    {agentInfo.socialMedia.linkedin && (
                      <a 
                        href={agentInfo.socialMedia.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    )}
                    {agentInfo.socialMedia.youtube && (
                      <a 
                        href={agentInfo.socialMedia.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                    {agentInfo.socialMedia.x && (
                      <a 
                        href={agentInfo.socialMedia.x} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-xl">
            {submitted ? (
              <div className="text-center py-8">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: primaryColor + '20' }}
                >
                  <Mail className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 
                  className="text-2xl mb-2"
                  style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
                >
                  Thank You!
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ fontFamily: '"Arimo", sans-serif' }}
                >
                  We've received your inquiry and will be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" style={{ fontFamily: '"Arimo", sans-serif' }}>First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="mt-1"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" style={{ fontFamily: '"Arimo", sans-serif' }}>Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="mt-1"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" style={{ fontFamily: '"Arimo", sans-serif' }}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-1"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" style={{ fontFamily: '"Arimo", sans-serif' }}>Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="mt-1"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="message" style={{ fontFamily: '"Arimo", sans-serif' }}>Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="mt-1 min-h-[100px]"
                    placeholder="I'm interested in scheduling a showing..."
                    data-testid="input-message"
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm" data-testid="text-error">{error}</p>
                )}
                
                <Button
                  type="submit"
                  className="w-full py-6 text-lg"
                  style={{ backgroundColor: primaryColor, fontFamily: '"Arimo", sans-serif' }}
                  disabled={isSubmitting}
                  data-testid="button-submit-inquiry"
                >
                  {isSubmitting ? 'Sending...' : 'Request Showing'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MagazineFooter({ site, theme }: { site: Site; theme?: Theme }) {
  return (
    <footer className="py-8 px-6 bg-gray-900 text-white/60 text-center">
      <p style={{ fontFamily: 'var(--font-body)' }}>
        Property listing powered by AgentAssets
      </p>
    </footer>
  );
}

// ===================== END MAGAZINE LAYOUT COMPONENTS =====================

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
  const isModernLayout = site.layoutId === 'layout-modern';
  // Get effective logo: site-specific logo or fallback to user default logo
  const effectiveLogo = (site as any).effectiveLogo || null;
  // Get effective hero logo: heroLogo → site.logo → user.logo
  const effectiveHeroLogo = (site as any).effectiveHeroLogo || null;
  // Get agent info for contact section
  const agentInfo = (site as any).agentInfo || null;

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
        <ShoalwoodNavigation site={site} theme={theme} hasPhotos={!!hasPhotos} hasVideo={hasVideo} effectiveLogo={effectiveLogo} />
        <ShoalwoodHero site={site} theme={theme} heroImage={heroImage} effectiveLogo={effectiveLogo} />
        <ShoalwoodDescription description={site.description || "A beautiful property awaiting your discovery."} descriptionImage={site.descriptionImage} />
        <ShoalwoodDetails site={site} theme={theme} />
        
        {hasPhotos && <PhotoGallery photos={site.photos!} themeColors={theme?.colors} galleryStyle={layout?.structure?.galleryStyle} />}
        
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

  // Modern Layout - transparent nav that becomes solid, fade hero slider
  if (isModernLayout) {
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
        <ModernNavigation 
          site={site} 
          theme={theme} 
          hasPhotos={!!hasPhotos} 
          hasVideo={hasVideo}
          hasDocuments={!!(site.documents && site.documents.length > 0)}
          effectiveHeroLogo={effectiveHeroLogo}
          effectiveLogo={effectiveLogo}
        />
        <ModernHero 
          site={site} 
          theme={theme} 
          heroImage={heroImage}
          effectiveHeroLogo={effectiveHeroLogo}
        />
        <ModernDetails site={site} theme={theme} />
        
        {hasPhotos && <PhotoGallery photos={site.photos!} themeColors={theme?.colors} galleryStyle={layout?.structure?.galleryStyle} />}
        
        {hasVideo && (
          <section id="video" className="py-20 px-6 bg-white">
            <div className="container mx-auto max-w-4xl">
              <h2 
                className="text-3xl md:text-4xl mb-10 text-center"
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--heading-weight)',
                  color: 'var(--theme-text)'
                }}
              >
                Property Video
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

        <ModernDocuments site={site} theme={theme} />

        <section id="map" className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <h2 
              className="text-3xl md:text-4xl mb-10 text-center"
              style={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--heading-weight)',
                color: 'var(--theme-text)'
              }}
            >
              Location
            </h2>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="bg-white px-6 py-4 border-b">
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

        <ModernContact site={site} theme={theme} agentInfo={agentInfo} />

        <footer className="py-8 px-6 border-t bg-white">
          <div className="container mx-auto text-center text-sm text-gray-500">
            <p>Property listing powered by AgentAssets</p>
          </div>
        </footer>
      </div>
    );
  }

  // Magazine Layout - elegant, editorial style with marquee gallery
  const isMagazineLayout = site.layoutId === 'layout-magazine';
  if (isMagazineLayout) {
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
        <MagazineNavigation site={site} theme={theme} effectiveLogo={effectiveLogo} />
        <MagazineHero site={site} theme={theme} heroImage={heroImage} />
        <MagazineFactsBar site={site} theme={theme} />
        
        <MagazineContentSection site={site} theme={theme} />
        
        {hasPhotos && <MagazineMarqueeGallery photos={site.photos!} />}
        
        {hasVideo && (
          <section id="video" className="py-16 px-6 bg-gray-50" style={{ scrollMarginTop: '100px' }}>
            <div className="container mx-auto max-w-4xl">
              <h2 
                className="text-3xl md:text-4xl mb-10 text-center"
                style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
              >
                Property Video
              </h2>
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
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
        
        {site.documents && site.documents.length > 0 && (
          <MagazineDocuments site={site} theme={theme} />
        )}
        
        <section id="map" className="py-16 px-6" style={{ backgroundColor: theme?.colors?.background || '#F8FAF9' }}>
          <div className="container mx-auto max-w-4xl">
            <h2 
              className="text-3xl md:text-4xl mb-10 text-center"
              style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400', color: theme?.colors?.text || '#2C3E50' }}
            >
              Location
            </h2>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b bg-white">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" style={{ color: theme?.colors?.primary || '#558B73' }} />
                  <span className="font-medium" style={{ color: theme?.colors?.text || '#2C3E50' }}>{site.address}</span>
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

        <MagazineContact site={site} theme={theme} agentInfo={agentInfo} />
        <MagazineFooter site={site} theme={theme} />
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
                 {site.bedrooms && (
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Bedrooms</span>
                   <span className="font-medium">{site.bedrooms}</span>
                 </div>
                 )}
                 {site.bathrooms && (
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Bathrooms</span>
                   <span className="font-medium">{site.bathrooms}</span>
                 </div>
                 )}
                 {site.sqft && (
                 <div className="flex justify-between border-b border-dashed pb-2">
                   <span className="text-muted-foreground">Square Feet</span>
                   <span className="font-medium">{site.sqft.toLocaleString()}</span>
                 </div>
                 )}
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
        <PhotoGallery photos={site.photos} themeColors={theme?.colors} galleryStyle={layout?.structure?.galleryStyle} />
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

function PhotoGallery({ photos, themeColors, galleryStyle = 'grid' }: { 
  photos: string[], 
  themeColors?: any,
  galleryStyle?: 'grid' | 'masonry' | 'carousel' | 'lightbox'
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: selectedIndex || 0 });
  const [carouselRef, carouselApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const carouselScrollPrev = useCallback(() => {
    if (carouselApi) carouselApi.scrollPrev();
  }, [carouselApi]);

  const carouselScrollNext = useCallback(() => {
    if (carouselApi) carouselApi.scrollNext();
  }, [carouselApi]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselSlide, setCarouselSlide] = useState(0);

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
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCarouselSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on('select', onSelect);
    onSelect();
    
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

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

  // Render gallery based on style
  const renderGalleryContent = () => {
    switch (galleryStyle) {
      case 'masonry':
        return (
          <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: '2px' }}>
            {photos.map((photo, index) => (
              <div 
                key={index}
                className="break-inside-avoid overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-300"
                style={{ marginBottom: '2px' }}
                onClick={() => setSelectedIndex(index)}
                data-testid={`photo-${index}`}
              >
                <img 
                  src={photo} 
                  alt={`Property photo ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="relative">
            <div className="overflow-hidden" ref={carouselRef}>
              <div className="flex gap-4">
                {photos.map((photo, index) => (
                  <div 
                    key={index}
                    className="flex-[0_0_80%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
                  >
                    <div 
                      className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedIndex(index)}
                      data-testid={`photo-${index}`}
                    >
                      <img 
                        src={photo} 
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all"
              onClick={carouselScrollPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all"
              onClick={carouselScrollNext}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        );

      case 'lightbox':
      case 'grid':
      default:
        return (
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
        );
    }
  };

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
        
        {renderGalleryContent()}
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
