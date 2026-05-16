import { useRoute, Link } from "wouter";
import { useSite, useThemes, useLayout, useSiteProtectionStatus, verifySitePassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Play, Home, Info, Video, Image, X, ChevronLeft, ChevronRight, ChevronDown, Bed, Bath, Square, Calendar, Building, Phone, Mail, User, Instagram, Facebook, Linkedin, Youtube, Twitter, FileText, Download, Package, Lock, Eye, EyeOff, Grid } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}
import useEmblaCarousel from "embla-carousel-react";
import type { Site, Theme, Layout, HeroTransitionType } from "@shared/schema";
import HeroSlider from "@/components/hero/HeroSlider";

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
  
  // Soap Stone layout uses elegant serif fonts with modern sans-serif for body
  if (layout?.id === 'layout-soapstone') {
    return {
      '--font-heading': '"Playfair Display", Georgia, serif',
      '--font-body': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '400',
      '--font-nav': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  return {
    '--font-heading': `"${headingFont}", serif`,
    '--font-body': `"${bodyFont}", sans-serif`,
    '--heading-weight': headingWeight,
  } as React.CSSProperties;
}

function ShoalwoodHero({ site, theme, heroImage, effectiveLogo, invertLogo }: { site: Site; theme?: Theme; heroImage: string; effectiveLogo?: string | null; invertLogo?: boolean }) {
  const heroImages = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : site.photos && site.photos.length > 0 
      ? site.photos 
      : [heroImage];
  
  const heroTransition = (site.heroTransition as HeroTransitionType) || 'slide';

  const overlayContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 z-10" />

      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-4">
        {(effectiveLogo || theme?.logoUrl) && (
          <img 
            src={effectiveLogo ?? theme?.logoUrl ?? ''} 
            alt="Logo" 
            className={`h-10 md:h-14 w-auto object-contain ${invertLogo ? 'brightness-0 invert' : ''}`}
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
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10 pl-20 md:pl-24">
        <div className="container mx-auto">
          <div className="inline-block bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded mb-6">
            <span 
              className="text-xs font-semibold tracking-[0.2em] uppercase" 
              style={{ color: theme?.colors?.primary || '#1a1a1a' }}
            >
              For Sale
            </span>
          </div>
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
    </>
  );

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <HeroSlider
        images={heroImages}
        transition={heroTransition}
        autoPlayInterval={5000}
        showArrows={heroImages.length > 1}
        showDots={heroImages.length > 1}
        className="h-full w-full"
        overlay={overlayContent}
      />
    </section>
  );
}

function ShoalwoodNavigation({ site, theme, hasPhotos, hasVideo, effectiveLogo, invertLogo }: { site: Site; theme?: Theme; hasPhotos: boolean; hasVideo: boolean; effectiveLogo?: string | null; invertLogo?: boolean }) {
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
                    className="block w-full text-left px-4 py-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-300 border-b border-gray-50 hover:tracking-[1px]"
                    style={{
                      fontFamily: '"Raleway", sans-serif',
                      fontSize: '35px',
                      fontWeight: 600,
                      letterSpacing: '0px'
                    }}
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

function ShoalwoodContact({ site, theme, agentInfo }: { site: Site; theme?: Theme; agentInfo?: AgentInfo | null }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: `I am interested in ${site.address}`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const primaryColor = theme?.colors?.primary || '#558B73';

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
          Get in Touch
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Left side - Contact Form */}
          <div className="flex-1 md:pr-10">
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
                  className="w-full text-white"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting}
                  data-testid="button-send-inquiry"
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </form>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:flex flex-col items-center justify-center px-2">
            <div 
              className="w-px h-full min-h-[300px]"
              style={{ 
                background: `linear-gradient(to bottom, transparent, ${primaryColor}40, ${primaryColor}40, transparent)` 
              }}
            />
          </div>

          {/* Horizontal Separator (mobile) */}
          <div className="md:hidden flex items-center justify-center py-4">
            <div 
              className="h-px w-full max-w-[200px]"
              style={{ 
                background: `linear-gradient(to right, transparent, ${primaryColor}40, ${primaryColor}40, transparent)` 
              }}
            />
          </div>

          {/* Right side - Agent Info */}
          <div className="flex-1 md:pl-10 flex flex-col justify-center">
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
                      data-testid="img-shoalwood-agent-photo"
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
                data-testid="text-shoalwood-agent-name"
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
                    data-testid="link-shoalwood-agent-phone"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: primaryColor + '15' }}
                    >
                      <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)' }}>{agentInfo.phone}</span>
                  </a>
                )}
                {agentInfo?.email && (
                  <a 
                    href={`mailto:${agentInfo.email}`}
                    className="flex items-center justify-center md:justify-start gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
                    data-testid="link-shoalwood-agent-email"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: primaryColor + '15' }}
                    >
                      <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)' }}>{agentInfo.email}</span>
                  </a>
                )}
              </div>

              {/* Social Media Links */}
              {agentInfo?.socialMedia && Object.values(agentInfo.socialMedia).some(v => v) && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-3" style={{ fontFamily: 'var(--font-body)' }}>Follow Me</p>
                  <div className="flex gap-3 justify-center md:justify-start">
                    {agentInfo.socialMedia.instagram && (
                      <a 
                        href={agentInfo.socialMedia.instagram.startsWith('http') ? agentInfo.socialMedia.instagram : `https://instagram.com/${agentInfo.socialMedia.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor + '15' }}
                        data-testid="link-shoalwood-social-instagram"
                      >
                        <Instagram className="w-4 h-4" style={{ color: primaryColor }} />
                      </a>
                    )}
                    {agentInfo.socialMedia.facebook && (
                      <a 
                        href={agentInfo.socialMedia.facebook.startsWith('http') ? agentInfo.socialMedia.facebook : `https://facebook.com/${agentInfo.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor + '15' }}
                        data-testid="link-shoalwood-social-facebook"
                      >
                        <Facebook className="w-4 h-4" style={{ color: primaryColor }} />
                      </a>
                    )}
                    {agentInfo.socialMedia.linkedin && (
                      <a 
                        href={agentInfo.socialMedia.linkedin.startsWith('http') ? agentInfo.socialMedia.linkedin : `https://linkedin.com/in/${agentInfo.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor + '15' }}
                        data-testid="link-shoalwood-social-linkedin"
                      >
                        <Linkedin className="w-4 h-4" style={{ color: primaryColor }} />
                      </a>
                    )}
                    {agentInfo.socialMedia.youtube && (
                      <a 
                        href={agentInfo.socialMedia.youtube.startsWith('http') ? agentInfo.socialMedia.youtube : `https://youtube.com/${agentInfo.socialMedia.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor + '15' }}
                        data-testid="link-shoalwood-social-youtube"
                      >
                        <Youtube className="w-4 h-4" style={{ color: primaryColor }} />
                      </a>
                    )}
                    {agentInfo.socialMedia.x && (
                      <a 
                        href={agentInfo.socialMedia.x.startsWith('http') ? agentInfo.socialMedia.x : `https://x.com/${agentInfo.socialMedia.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor + '15' }}
                        data-testid="link-shoalwood-social-x"
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
    </section>
  );
}

// Modern Layout Components - Transparent nav that becomes solid on scroll, fade hero slider
function ModernNavigation({ site, theme, hasPhotos, hasVideo, hasDocuments, effectiveHeroLogo, effectiveLogo, invertLogo }: { 
  site: Site; 
  theme?: Theme; 
  hasPhotos: boolean; 
  hasVideo: boolean;
  hasDocuments: boolean;
  effectiveHeroLogo?: string | null;
  effectiveLogo?: string | null;
  invertLogo?: boolean;
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
                className={`w-auto object-contain transition-all duration-500 drop-shadow-lg ${invertLogo ? 'brightness-0 invert' : ''}`}
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
  const heroTransition = (site.heroTransition as HeroTransitionType) || 'kenburns';
  
  // Use heroPhotos array for the slider, fallback to photos or default
  const heroImages = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : site.photos && site.photos.length > 0 
      ? site.photos.slice(0, 3)
      : [heroImage];
  
  const slides = site.heroSlides && site.heroSlides.length > 0 
    ? site.heroSlides 
    : heroImages.map((img, i) => ({ 
        title: i === 0 ? (site.title || site.address) : '',
        subtitle: i === 0 ? (site.price || 'Luxury Living Awaits') : '',
        backgroundImage: img
      }));

  const scrollToDetails = () => {
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Use HeroSlider for liquid-webgl, slide, or crossfade transitions
  if (heroTransition === 'liquid-webgl' || heroTransition === 'slide' || heroTransition === 'crossfade') {
    const overlayContent = (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/15 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
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
            {site.title || site.address}
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
            {site.price}
          </p>
          <button
            onClick={scrollToDetails}
            className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white text-base font-medium tracking-wider uppercase border border-white/40 hover:bg-white/30 transition-all duration-300 rounded-sm"
            style={{ fontFamily: 'var(--font-nav)' }}
            data-testid="button-have-a-look"
          >
            Have a look
          </button>
        </div>
      </>
    );

    return (
      <section id="home" className="relative h-screen w-full overflow-hidden">
        <HeroSlider
          images={heroImages}
          transition={heroTransition}
          autoPlayInterval={6000}
          showArrows={heroImages.length > 1}
          showDots={heroImages.length > 1}
          className="h-full w-full"
          overlay={overlayContent}
        />
      </section>
    );
  }
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomProgress, setZoomProgress] = useState(0);

  // Ken Burns zoom effect - continuous slow zoom on current slide
  useEffect(() => {
    if (isTransitioning) return;
    
    const startTime = Date.now();
    const duration = 6000; // Match the slide interval
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setZoomProgress(progress);
      
      if (progress < 1 && !isTransitioning) {
        requestAnimationFrame(animate);
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [currentSlide, isTransitioning]);

  // Auto-advance slides with zoom/blur transition
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setPreviousSlide(currentSlide);
      setIsTransitioning(true);
      setZoomProgress(0);
      
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 600);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [slides.length, currentSlide]);

  const handleSlideChange = (index: number) => {
    if (index !== currentSlide && !isTransitioning) {
      setPreviousSlide(currentSlide);
      setIsTransitioning(true);
      setZoomProgress(0);
      
      setTimeout(() => {
        setCurrentSlide(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 600);
    }
  };

  const currentSlideData = slides[currentSlide];

  // Calculate Ken Burns zoom scale (1.0 to 1.08 over the duration)
  const zoomScale = 1 + (zoomProgress * 0.08);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background images with Ken Burns zoom + scale/blur transition */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const isPrevious = index === previousSlide && isTransitioning;
        const bgImage = slide.backgroundImage || heroImages[index] || heroImage;
        
        return (
          <div
            key={index}
            className="absolute inset-0 overflow-hidden"
            style={{ 
              zIndex: isActive ? 2 : isPrevious ? 1 : 0,
              opacity: isActive || isPrevious ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${bgImage})`,
                transform: isActive && !isTransitioning 
                  ? `scale(${zoomScale})`
                  : isActive && isTransitioning
                    ? 'scale(1.02)'
                    : isPrevious 
                      ? 'scale(1.12)' 
                      : 'scale(1)',
                filter: isPrevious ? 'blur(4px)' : 'blur(0px)',
                opacity: isPrevious ? 0 : 1,
                transition: isTransitioning 
                  ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease-out, opacity 0.6s ease-out'
                  : 'none',
              }}
            />
          </div>
        );
      })}
      
      {/* Gradient overlay - more transparent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/15 z-10" />

      {/* Content - no logo, just title, subtitle, and button */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
        {/* Slide content with fade */}
        <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
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

      {/* Navigation arrows for multiple slides */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => handleSlideChange((currentSlide - 1 + slides.length) % slides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={() => handleSlideChange((currentSlide + 1) % slides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
            data-testid="button-hero-next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`h-3 rounded-full transition-all duration-500 ${
                currentSlide === index 
                  ? 'bg-white w-10' 
                  : 'bg-white/40 hover:bg-white/60 w-3'
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
          <div 
            className={`rounded-2xl p-8 md:p-10 ${site.descriptionImage ? 'flex flex-col md:flex-row gap-8 md:gap-12 items-start' : ''}`}
            style={{ backgroundColor: 'var(--theme-background)' }}
          >
            <div className={site.descriptionImage ? 'flex-1' : 'max-w-3xl'}>
              <h3 
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--heading-weight)', color: 'var(--theme-text)' }}
              >
                About This Property
              </h3>
              <div 
                className="w-12 h-1 rounded-full mb-6"
                style={{ backgroundColor: primaryColor }}
              />
              <p 
                className="leading-relaxed text-lg"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--theme-text)', opacity: 0.8 }}
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

        {/* Features Section */}
        {site.features && site.features.length > 0 && (
          <div className="mt-16 pt-12 border-t" style={{ borderColor: `${primaryColor}15` }}>
            <h3 
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--heading-weight)' }}
            >
              Features & Amenities
            </h3>
            <div 
              className="w-12 h-1 rounded-full mb-8"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="flex flex-wrap gap-3">
              {site.features.map((feature: string, index: number) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ 
                    borderColor: `${primaryColor}40`,
                    color: 'var(--theme-text)'
                  }}
                  data-testid={`tag-feature-${index}`}
                >
                  <span 
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
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
    <section id="contact" className="py-16 md:py-24 px-4 md:px-6" style={{ backgroundColor: 'var(--theme-background)' }}>
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
          className="text-center mb-12 md:mb-16 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--theme-text)', opacity: 0.7 }}
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

function MagazineNavigation({ site, theme, effectiveLogo, effectiveHeroLogo, invertLogo }: { site: Site; theme?: Theme; effectiveLogo?: string | null; effectiveHeroLogo?: string | null; invertLogo?: boolean }) {
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
    { label: 'Map', href: '#map' },
    { label: 'Contact', href: '#contact' },
  ].filter(item => item.show !== false);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="relative flex items-center" style={{ height: '80px' }}>
          {/* Hero logo — visible when not scrolled */}
          {(effectiveHeroLogo || effectiveLogo || theme?.logoUrl) && (
            <img
              src={effectiveHeroLogo || effectiveLogo || theme?.logoUrl || ''}
              alt="Logo"
              className={`w-auto object-contain absolute transition-all duration-500 ${
                scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
              } ${!scrolled && invertLogo ? 'brightness-0 invert' : ''}`}
              style={{ height: '80px' }}
              data-testid="img-magazine-hero-logo"
            />
          )}
          {/* Site logo — visible when scrolled */}
          {(effectiveLogo || theme?.logoUrl) && (
            <img
              src={effectiveLogo || theme?.logoUrl || ''}
              alt="Logo"
              className={`w-auto object-contain absolute transition-all duration-500 ${
                scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ height: '56px' }}
              data-testid="img-magazine-logo"
            />
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`transition-colors hover:opacity-70 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              style={{ fontFamily: '"Figtree", sans-serif', fontSize: '16px', textTransform: 'capitalize', letterSpacing: '0.02em', fontWeight: '400' }}
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
  
  const heroTransition = (site.heroTransition as HeroTransitionType) || 'crossfade';

  const overlayContent = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        .magazine-hero-text {
          font-family: "Figtree", sans-serif;
        }
        @keyframes scroll-arrow {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
      `}</style>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10" />
      
      <div className="absolute left-0 right-0 text-white px-8 z-20" style={{ bottom: '40px' }}>
        <div className="container mx-auto max-w-6xl">
          <h1 
            className="magazine-hero-text"
            style={{ 
              fontSize: '27px',
              fontWeight: '400',
              letterSpacing: '0'
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
    </>
  );

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <HeroSlider
        images={heroPhotos}
        transition={heroTransition}
        autoPlayInterval={6000}
        showArrows={heroPhotos.length > 1}
        showDots={heroPhotos.length > 1}
        className="h-full w-full"
        overlay={overlayContent}
      />
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
              style={{ fontFamily: '"Figtree", sans-serif', letterSpacing: '0.1em' }}
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
                style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '300' }}
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
                  style={{ fontFamily: '"Figtree", sans-serif' }}
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
                  style={{ fontFamily: '"Figtree", sans-serif' }}
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
          style={{ fontFamily: '"Figtree", sans-serif' }}
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
                fontFamily: '"Figtree", sans-serif'
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
                style={{ fontFamily: '"Figtree", sans-serif' }}
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
                      fontFamily: '"Figtree", sans-serif', 
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
                    style={{ fontFamily: '"Figtree", sans-serif', color: '#000000' }}
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
                  className="text-base leading-relaxed text-gray-600 whitespace-pre-line"
                  style={{ fontFamily: '"Figtree", sans-serif', lineHeight: '1.8' }}
                >
                  {truncatedDescription}
                </p>
                {needsReadMore && (
                  <button
                    onClick={() => setShowDescriptionModal(true)}
                    className="mt-4 inline-flex items-center gap-2 text-base hover:opacity-70 transition-opacity"
                    style={{ fontFamily: '"Figtree", sans-serif', color: primaryColor }}
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
                      style={{ fontFamily: '"Figtree", sans-serif' }}
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
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Bedrooms</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{site.bedrooms}</span>
                    </div>
                  )}
                  {site.bathrooms && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Bathrooms</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{site.bathrooms}</span>
                    </div>
                  )}
                  {site.sqft && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Square Feet</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{site.sqft}</span>
                    </div>
                  )}
                  {(site as any).stories && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Stories</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{(site as any).stories}</span>
                    </div>
                  )}
                  {(site as any).yearBuilt && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Year Built</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{(site as any).yearBuilt}</span>
                    </div>
                  )}
                  {site.lotSize && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>Lot Size</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{site.lotSize}</span>
                    </div>
                  )}
                  {/* Custom Details */}
                  {(site as any).customDetails?.map((detail: { label: string; value: string }, index: number) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200">
                      <span style={{ fontFamily: '"Figtree", sans-serif', color: '#666' }}>{detail.label}</span>
                      <span style={{ fontFamily: '"Figtree", sans-serif', fontWeight: '500' }}>{detail.value}</span>
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
                        color: theme?.colors?.text || '#2C3E50'
                      }}
                      data-testid={`tag-feature-${index}`}
                    >
                      <span className="text-sm" style={{ fontFamily: '"Figtree", sans-serif' }}>
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
              className="text-base leading-relaxed text-gray-600 whitespace-pre-line"
              style={{ fontFamily: '"Figtree", sans-serif', lineHeight: '1.8' }}
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
                      style={{ fontFamily: '"Figtree", sans-serif' }}
                    >
                      {formatDate(event.date)}
                    </span>
                  </div>
                  {event.label && (
                    <p 
                      className="text-sm mb-1"
                      style={{ fontFamily: '"Figtree", sans-serif', color: primaryColor }}
                    >
                      {event.label}
                    </p>
                  )}
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: '"Figtree", sans-serif' }}
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
    <section id="contact" className="py-20 px-6 border-t" style={{ backgroundColor: theme?.colors?.background || '#F8FAF9', scrollMarginTop: '100px', borderColor: 'rgba(0,0,0,0.08)' }}>
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
              style={{ fontFamily: '"Figtree", sans-serif', lineHeight: '1.7', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}
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
                    <p className="font-medium text-xl" style={{ fontFamily: '"Figtree", sans-serif', color: theme?.colors?.text || '#2C3E50' }}>
                      {agentInfo.name || 'Your Agent'}
                    </p>
                    {agentInfo.teamName && (
                      <p className="text-sm" style={{ fontFamily: '"Figtree", sans-serif', color: primaryColor }}>
                        {agentInfo.teamName}
                      </p>
                    )}
                    {agentInfo.brokerage && (
                      <p className="text-sm" style={{ fontFamily: '"Figtree", sans-serif', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}>
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
                      style={{ fontFamily: '"Figtree", sans-serif', color: theme?.colors?.text || '#2C3E50' }}
                    >
                      <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                      {agentInfo.phone}
                    </a>
                  )}
                  {agentInfo.email && (
                    <a 
                      href={`mailto:${agentInfo.email}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      style={{ fontFamily: '"Figtree", sans-serif', color: theme?.colors?.text || '#2C3E50' }}
                    >
                      <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                      {agentInfo.email}
                    </a>
                  )}
                  {agentInfo.address && (
                    <div 
                      className="flex items-center gap-3"
                      style={{ fontFamily: '"Figtree", sans-serif', color: theme?.colors?.text || '#2C3E50', opacity: 0.7 }}
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
                  style={{ fontFamily: '"Figtree", sans-serif' }}
                >
                  We've received your inquiry and will be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" style={{ fontFamily: '"Figtree", sans-serif' }}>First Name</Label>
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
                    <Label htmlFor="lastName" style={{ fontFamily: '"Figtree", sans-serif' }}>Last Name</Label>
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
                  <Label htmlFor="email" style={{ fontFamily: '"Figtree", sans-serif' }}>Email</Label>
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
                  <Label htmlFor="phone" style={{ fontFamily: '"Figtree", sans-serif' }}>Phone</Label>
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
                  <Label htmlFor="message" style={{ fontFamily: '"Figtree", sans-serif' }}>Message</Label>
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
                  style={{ backgroundColor: primaryColor, fontFamily: '"Figtree", sans-serif' }}
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

function MagazineFooter({ site, theme, footerLogo, invertLogo }: { site: Site; theme?: Theme; footerLogo?: string | null; invertLogo?: boolean }) {
  return (
    <footer className="py-8 px-6 bg-gray-900 text-white/60 text-center">
      <div className="flex flex-col items-center gap-4">
        {footerLogo && (
          <img 
            src={footerLogo} 
            alt="Logo" 
            className={`h-10 w-auto object-contain ${invertLogo ? 'brightness-0 invert' : ''}`}
            data-testid="img-footer-logo"
          />
        )}
        <p style={{ fontFamily: 'var(--font-body)' }}>
          Property listing powered by AgentAssets
        </p>
      </div>
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

// ==================== SOAP STONE LAYOUT COMPONENTS (400inwood.com style) ====================

interface VideoTab {
  label: string;
  url: string;
}

// Helper function to get video embed URL
function getSoapstoneVideoEmbedUrl(url: string, autoplay = false, muted = false, loop = false) {
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (muted) params.set('mute', '1');
    if (loop) { params.set('loop', '1'); params.set('playlist', videoId || ''); }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (muted) params.set('mute', '1');
    if (loop) { params.set('loop', '1'); params.set('playlist', videoId || ''); }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } else if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (muted) params.set('muted', '1');
    if (loop) params.set('loop', '1');
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }
  return url;
}

function SoapStoneHero({ site, theme, heroImage, hasPhotos, onOpenMenu, navLinks }: { 
  site: Site; 
  theme?: Theme; 
  heroImage: string; 
  hasPhotos: boolean;
  onOpenMenu: () => void;
  navLinks: { id: string; label: string }[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isInHero, setIsInHero] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const heroMode = (site as any).soapstoneHeroMode || 'video';
  const presentedBy = (site as any).soapstonePresentedBy || (site as any).brokerageName;
  
  const heroPhotos = site.heroPhotos && site.heroPhotos.length > 0 
    ? site.heroPhotos 
    : site.photos && site.photos.length > 0 
      ? site.photos.slice(0, 5) 
      : [site.imageUrl || heroImage];
  
  const videoUrl = site.videoUrl;
  const hasVideo = heroMode === 'video' && videoUrl;

  useEffect(() => {
    if (heroMode === 'slider' && heroPhotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroPhotos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroMode, heroPhotos.length]);

  useEffect(() => {
    const handleScroll = () => {
      const overviewSection = document.getElementById('overview');
      const scrollPos = window.scrollY + window.innerHeight / 3;
      
      // Check if we're still in the hero section (before overview starts)
      if (overviewSection) {
        const inHero = scrollPos < overviewSection.offsetTop;
        setIsInHero(inHero);
        
        // If in hero, no section is active
        if (inHero) {
          setActiveSection(null);
        } else {
          // Find active section when not in hero
          const sections = navLinks.map(link => document.getElementById(link.id));
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section && section.offsetTop <= scrollPos) {
              setActiveSection(navLinks[i].id);
              break;
            }
          }
        }
      }
      
      // Hide title bar and presented by bar on scroll
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Check if at bottom of page
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(atBottom);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Open+Sans:wght@300;400;500;600&display=swap');
      `}</style>
      
      {/* White top bar with centered title - slides up on scroll */}
      <header 
        className="bg-white py-4 px-6 text-center z-50 fixed top-0 left-0 right-0 transition-transform duration-500 ease-out md:left-12 lg:left-16"
        style={{ 
          transform: isScrolled ? 'translateY(-100%)' : 'translateY(0)'
        }}
      >
        <h1 
          className="uppercase"
          style={{ 
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: '400',
            fontSize: '25px',
            letterSpacing: '2px',
            color: '#333'
          }}
        >
          {site.title || site.address}
        </h1>
      </header>
      
      
      {/* Fixed left white sidebar with hamburger - always on top with shadow */}
      <div 
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-12 lg:w-16 bg-white items-center justify-center z-[60]"
        style={{ boxShadow: '4px 0 12px rgba(0,0,0,0.1)' }}
      >
        <button
          onClick={onOpenMenu}
          className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
          aria-label="Open menu"
        >
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="0" y1="2" x2="28" y2="2" />
            <line x1="0" y1="10" x2="28" y2="10" />
            <line x1="0" y1="18" x2="28" y2="18" />
          </svg>
        </button>
      </div>
      
      {/* Hero section - full viewport height */}
      <section id="home" className="relative h-screen w-full flex md:pl-12 lg:pl-16">
        
        {/* Center hero content - video or photos */}
        <div className="flex-1 relative overflow-hidden">
          {hasVideo ? (
            <div className="absolute inset-0">
              <iframe
                src={getSoapstoneVideoEmbedUrl(videoUrl, true, true, true)}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
                style={{ border: 'none', pointerEvents: 'none', aspectRatio: '16/9' }}
                allow="autoplay; fullscreen"
                title="Hero Video"
              />
            </div>
          ) : (
            <>
              {heroPhotos.map((photo, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundImage: `url(${photo})` }}
                />
              ))}
            </>
          )}
          
          
          {/* Slider dots for photo mode */}
          {heroMode === 'slider' && heroPhotos.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlide === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Right white sidebar with dot navigation and city text - FIXED position */}
        <div className="hidden md:flex w-12 lg:w-16 bg-white flex-shrink-0 flex-col items-center justify-between py-6 fixed right-0 top-0 bottom-0 z-50">
          {/* City/State text at top - vertical */}
          <div 
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            <span 
              className="text-xs uppercase tracking-widest text-gray-500"
              style={{ fontFamily: '"Open Sans", sans-serif' }}
            >
              {(site as any).city ? `${(site as any).city}, ${(site as any).state || 'TX'}` : 'Austin, TX'}
            </span>
          </div>
          
          {/* Dot navigation */}
          <nav className="flex flex-col gap-4 items-center">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.id;
              const showLabel = hoveredDot === index || (!isInHero && isActive);
              
              return (
                <div
                  key={link.id}
                  className="relative flex items-center justify-center cursor-pointer p-3"
                  onMouseEnter={() => setHoveredDot(index)}
                  onMouseLeave={() => setHoveredDot(null)}
                  onClick={() => scrollToSection(link.id)}
                >
                  {/* Label - visible when active (not in hero) or hovered */}
                  <div 
                    className={`absolute right-8 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                      showLabel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                    style={{ 
                      backgroundColor: '#ffffff',
                      padding: '8px 16px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <span
                      style={{ 
                        color: '#333',
                        fontWeight: '400',
                        fontSize: '25px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: '"Open Sans", sans-serif'
                      }}
                    >
                      {link.label}
                    </span>
                  </div>
                  
                  {/* Dot - only filled when active and not in hero */}
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      isActive
                        ? 'bg-gray-700 border-gray-700' 
                        : 'bg-transparent border-gray-500 hover:border-gray-600'
                    }`}
                    aria-label={`Go to ${link.label}`}
                  />
                </div>
              );
            })}
          </nav>
          
          {/* Empty spacer for balance */}
          <div className="h-4" />
        </div>
        
        {/* Mobile hamburger - fixed on left for small screens */}
        <button
          onClick={onOpenMenu}
          className="md:hidden fixed left-4 top-20 z-[60] p-2 bg-white/90 rounded shadow text-gray-800"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        
      </section>
      
    </>
  );
}

// Full-screen overlay menu (400inwood.com style)
function SoapstoneMenuOverlay({ site, isOpen, onClose, navItems, presentedBy }: { 
  site: Site; 
  isOpen: boolean; 
  onClose: () => void;
  navItems: { href: string; label: string }[];
  presentedBy?: string;
}) {
  const heroImage = site.imageUrl || (site.photos && site.photos.length > 0 ? site.photos[0] : '');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    onClose();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes soapstone-slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes soapstone-slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .soapstone-nav-link {
          letter-spacing: 2px;
          transition: letter-spacing 0.3s ease, color 0.3s ease;
        }
        .soapstone-nav-link:hover {
          letter-spacing: 1px;
        }
      `}</style>
      
      {/* Left sidebar - stays on top with shadow */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-12 lg:w-16 bg-white z-[110] flex items-center justify-center"
        style={{ 
          boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
        }}
      >
        <button 
          onClick={onClose} 
          className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Menu content - slides under the sidebar */}
      <div 
        className="fixed top-0 bottom-0 right-0 z-[100] bg-[#f5f5f0]"
        style={{ 
          left: '48px',
          animation: 'soapstone-slideIn 0.4s ease-out forwards'
        }}
      >
        {/* Content container */}
        <div className="h-full flex">
          {/* Left side - Navigation */}
          <div className="w-1/2 flex items-center px-12 lg:px-20">
            <nav className="flex flex-col gap-6">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="soapstone-nav-link text-gray-800 hover:text-gray-500 uppercase"
                  style={{ 
                    fontFamily: '"Raleway", sans-serif',
                    fontSize: '35px',
                    fontWeight: 500,
                    animation: `soapstone-slideUp 0.4s ease-out ${index * 0.05}s forwards`,
                    opacity: 0
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Right side - Property Image */}
          <div className="w-1/2 flex items-center justify-center p-8 lg:p-16">
            <div 
              className="max-w-md w-full"
              style={{ 
                animation: 'soapstone-slideUp 0.5s ease-out 0.2s forwards', 
                opacity: 0 
              }}
            >
              {heroImage && (
                <>
                  <div className="aspect-[4/3] overflow-hidden shadow-lg">
                    <img 
                      src={heroImage} 
                      alt={site.address}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p 
                    className="mt-4 text-center text-sm uppercase tracking-widest text-gray-600"
                    style={{ fontFamily: '"Open Sans", sans-serif' }}
                  >
                    {site.address}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* "Presented by" bar at bottom */}
        {presentedBy && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 py-3 text-center">
            <span 
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: '"Open Sans", sans-serif', color: '#666' }}
            >
              PRESENTED BY: {presentedBy}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// Soap Stone Layout Wrapper - manages menu state and renders all components
function SoapStoneLayoutWrapper({ 
  site, 
  theme, 
  combinedStyles, 
  heroImage, 
  hasPhotos, 
  navLinks, 
  navItems, 
  presentedBy, 
  agentInfo, 
  footerLogo 
}: { 
  site: Site; 
  theme?: Theme; 
  combinedStyles: React.CSSProperties;
  heroImage: string;
  hasPhotos: boolean;
  navLinks: { id: string; label: string }[];
  navItems: { href: string; label: string }[];
  presentedBy?: string;
  agentInfo?: any;
  footerLogo?: string | null;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // Track scroll position for presented by bar animation
  useEffect(() => {
    const handleScroll = () => {
      // Hide bar when scrolling down
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Show bar when at bottom of page
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(atBottom);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        ...combinedStyles,
        backgroundColor: '#ffffff',
        color: 'var(--theme-text)',
        fontFamily: 'var(--font-body)'
      }}
    >
      <SoapstoneMenuOverlay 
        site={site} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        navItems={navItems}
        presentedBy={presentedBy}
      />
      <SoapStoneHero 
        site={site} 
        theme={theme} 
        heroImage={heroImage} 
        hasPhotos={hasPhotos}
        onOpenMenu={() => setIsMenuOpen(true)}
        navLinks={navLinks}
      />
      <SoapstoneOverview site={site} theme={theme} />
      <SoapstoneVideoTabs site={site} theme={theme} />
      {hasPhotos && <SoapstoneGallery photos={site.photos!} theme={theme} />}
      <SoapstoneFloorPlans site={site} theme={theme} />
      <SoapstoneContact site={site} theme={theme} agentInfo={agentInfo} />
      <SoapstoneMap site={site} theme={theme} />
      
      {/* Spacer for bottom bar to slide up into at bottom */}
      <div className="h-20 bg-white" />
      
      {/* Fixed bottom bar - slides up when at bottom of page */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white py-4 px-6 transition-transform duration-500 ease-out"
        style={{ 
          transform: isAtBottom ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Powered by - left on desktop, below on mobile */}
          <a 
            href="https://agentassets.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 text-xs hover:text-gray-600 order-2 md:order-1"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Powered by <span className="font-semibold">AgentAssets</span>
          </a>
          
          {/* Presented by - center on desktop, top on mobile */}
          {presentedBy && (
            <span 
              className="text-xs uppercase tracking-widest order-1 md:order-2"
              style={{ fontFamily: '"Open Sans", sans-serif', color: '#666' }}
            >
              {presentedBy}
            </span>
          )}
          
          {/* Empty spacer for balance on desktop when presentedBy exists */}
          {presentedBy && <div className="hidden md:block order-3" style={{ width: '150px' }} />}
        </div>
      </div>
    </div>
  );
}

// Helper function to lighten a hex color by a percentage
function lightenColor(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Lighten each channel toward 255 (white)
  const lightenChannel = (channel: number) => {
    return Math.round(channel + (255 - channel) * (percent / 100));
  };
  
  const newR = lightenChannel(r);
  const newG = lightenChannel(g);
  const newB = lightenChannel(b);
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Helper function to convert hex to rgba with opacity
function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Overview section (400inwood.com style)
function SoapstoneOverview({ site, theme }: { site: Site; theme?: Theme }) {
  const primaryColor = theme?.colors?.primary || '#558B73';
  const backgroundColor = theme?.colors?.background || '#ffffff';
  const backgroundWithOpacity = hexToRgba(backgroundColor, 0.5);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      // Calculate parallax offset - boxes float UP into hero as user scrolls
      const maxParallax = 60; // Maximum pixels to move up (half as high)
      const scrollPercent = Math.min(window.scrollY / (window.innerHeight * 1.2), 1); // Twice as slow
      setParallaxOffset(scrollPercent * maxParallax);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      {/* Noto Sans font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500&display=swap');
      `}</style>
      
      {/* Overview text section - with subtle SVG background */}
      <section 
        id="overview" 
        className="pb-16 md:pb-24 px-6 relative overflow-visible"
        style={{ 
          paddingTop: '150px',
          scrollMarginTop: '64px',
          backgroundColor: backgroundWithOpacity
        }}
      >
        {/* Subtle topography-style SVG background */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="topo-pattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              <path 
                d="M0 50 C 150 30, 350 70, 500 50 S 800 30, 1000 50 S 1300 70, 1500 50" 
                fill="none" 
                stroke={primaryColor}
                strokeWidth="1"
                opacity="0.08"
              />
              <path 
                d="M0 120 C 200 100, 400 140, 600 120 S 900 100, 1100 120 S 1400 140, 1600 120" 
                fill="none" 
                stroke={primaryColor}
                strokeWidth="1"
                opacity="0.06"
              />
              <path 
                d="M0 190 C 180 170, 380 210, 560 190 S 860 170, 1060 190 S 1360 210, 1560 190" 
                fill="none" 
                stroke={primaryColor}
                strokeWidth="1"
                opacity="0.05"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-pattern)" />
        </svg>
        
        {/* Floating Price Box - absolutely positioned, parallax */}
        <div 
          className="absolute z-30"
          style={{ 
            top: '15px',
            left: '100px',
            transform: `translateY(-${parallaxOffset}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div 
            className="bg-white"
            style={{ 
              padding: '10px 15px',
              boxShadow: '-10px 20px 0px 0px rgba(30, 30, 30, 0.85)',
              fontFamily: '"Noto Sans", sans-serif',
              fontWeight: 300
            }}
          >
            <span 
              className="text-lg md:text-xl tracking-wide"
              style={{ color: '#1a1a1a' }}
            >
              {site.price || 'Price Upon Request'}
            </span>
          </div>
        </div>
        
        {/* Floating Details Box - absolutely positioned, parallax */}
        <div 
          className="absolute z-30"
          style={{ 
            top: '15px',
            right: '100px',
            transform: `translateY(-${parallaxOffset}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div 
            className="bg-white flex items-center gap-4 md:gap-6"
            style={{ 
              padding: '10px 15px',
              boxShadow: '10px 20px 0px 0px rgba(30, 30, 30, 0.85)',
              fontFamily: '"Noto Sans", sans-serif',
              fontWeight: 300
            }}
          >
            {site.bedrooms && (
              <>
                <div className="text-center">
                  <span className="text-base md:text-lg" style={{ color: '#1a1a1a' }}>
                    {site.bedrooms} <span className="text-xs uppercase tracking-wider text-gray-500">beds</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300" />
              </>
            )}
            {site.bathrooms && (
              <>
                <div className="text-center">
                  <span className="text-base md:text-lg" style={{ color: '#1a1a1a' }}>
                    {site.bathrooms} <span className="text-xs uppercase tracking-wider text-gray-500">baths</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300" />
              </>
            )}
            {site.sqft && (
              <>
                <div className="text-center">
                  <span className="text-base md:text-lg" style={{ color: '#1a1a1a' }}>
                    {site.sqft.toLocaleString()} <span className="text-xs uppercase tracking-wider text-gray-500">sqft</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-300" />
              </>
            )}
            {(site as any).acres && (
              <div className="text-center">
                <span className="text-base md:text-lg" style={{ color: '#1a1a1a' }}>
                  {(site as any).acres} <span className="text-xs uppercase tracking-wider text-gray-500">acres</span>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 
            className="text-3xl md:text-4xl mb-8"
            style={{ 
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: '400',
              color: '#1a1a1a'
            }}
          >
            Overview
          </h2>
          
          {site.description && (
            <div 
              className="prose prose-lg max-w-none"
              style={{ fontFamily: '"Open Sans", sans-serif', lineHeight: '1.9' }}
            >
              {site.description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 mb-6 text-base md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          
          {/* Documents link if available */}
          {site.brochureUrl && (
            <div className="mt-8 pt-8 border-t border-gray-200/50">
              <a
                href={site.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wider hover:underline"
                style={{ color: primaryColor, fontFamily: '"Open Sans", sans-serif', fontWeight: '500' }}
              >
                <FileText className="w-4 h-4" />
                Documents
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// Video Gallery with tabs (400inwood.com style)
function SoapstoneVideoTabs({ site, theme }: { site: Site; theme?: Theme }) {
  const videoTabs = ((site as any).soapstoneVideoTabs as VideoTab[]) || [];
  const [activeTab, setActiveTab] = useState(0);
  const primaryColor = theme?.colors?.primary || '#558B73';
  
  // If no video tabs but has main video URL, create a default tab
  const effectiveTabs = videoTabs.length > 0 
    ? videoTabs 
    : site.videoUrl 
      ? [{ label: 'PROPERTY VIDEO', url: site.videoUrl }]
      : [];
  
  if (effectiveTabs.length === 0) return null;

  return (
    <section 
      id="videos" 
      className="py-16 md:py-20 px-6 bg-gray-100"
      style={{ scrollMarginTop: '64px' }}
    >
      <div className="container mx-auto max-w-5xl">
        <h2 
          className="text-2xl md:text-3xl mb-8 text-center"
          style={{ 
            fontFamily: '"Open Sans", sans-serif', 
            fontWeight: '400',
            color: '#1a1a1a',
            letterSpacing: '0.05em'
          }}
        >
          Video Gallery
        </h2>
        
        {/* Video tabs - styled like 400inwood */}
        {effectiveTabs.length > 1 && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white rounded overflow-hidden shadow-sm">
              {effectiveTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 text-xs uppercase tracking-widest font-medium transition-all ${
                    activeTab === index 
                      ? 'bg-[#1a1a1a] text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: '"Open Sans", sans-serif' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Video player */}
        <div className="aspect-video overflow-hidden shadow-lg bg-black">
          <iframe
            key={activeTab}
            src={getSoapstoneVideoEmbedUrl(effectiveTabs[activeTab].url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={effectiveTabs[activeTab].label}
          />
        </div>
      </div>
    </section>
  );
}

// Photo Gallery (400inwood.com style - 3x3 grid with "View X Photos" button)
function SoapstoneGallery({ photos, theme }: { photos: string[]; theme?: Theme }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Show first 9 photos in grid (3x3)
  const gridPhotos = photos.slice(0, 9);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section 
      id="photos" 
      className="py-16 md:py-20 px-6 bg-white"
      style={{ scrollMarginTop: '64px' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Masonry Photo Gallery - Custom asymmetric grid */}
        <div className="grid grid-cols-4 auto-rows-auto gap-1 md:gap-2">
          {/* Row 1: Large left (2 cols), 2 small top right */}
          <div 
            className="col-span-2 row-span-2 overflow-hidden cursor-pointer group relative"
            onClick={() => openLightbox(0)}
          >
            <img
              src={gridPhotos[0]}
              alt="Property photo 1"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(1)}
          >
            <img
              src={gridPhotos[1]}
              alt="Property photo 2"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(2)}
          >
            <img
              src={gridPhotos[2]}
              alt="Property photo 3"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          {/* Row 2: continues large left, 1 small center, large right starts (2 rows) */}
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(3)}
          >
            <img
              src={gridPhotos[3]}
              alt="Property photo 4"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          <div 
            className="col-span-1 row-span-2 overflow-hidden cursor-pointer group relative"
            onClick={() => openLightbox(4)}
          >
            <img
              src={gridPhotos[4]}
              alt="Property photo 5"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          {/* Row 3: 3 small images left/center, continues large right */}
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(5)}
          >
            <img
              src={gridPhotos[5]}
              alt="Property photo 6"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(6)}
          >
            <img
              src={gridPhotos[6]}
              alt="Property photo 7"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
          
          <div 
            className="col-span-1 overflow-hidden cursor-pointer group relative aspect-[4/3]"
            onClick={() => openLightbox(7)}
          >
            <img
              src={gridPhotos[7]}
              alt="Property photo 8"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          </div>
        </div>
        
        {/* "View X Photos" button */}
        <div className="text-center mt-8">
          <button
            onClick={() => openLightbox(0)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            View {photos.length} Photos
          </button>
        </div>
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/80">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                className="text-white/70 hover:text-white text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                Photo Grid
              </button>
            </div>
            <span className="text-white/70 text-sm">
              {lightboxIndex + 1} / {photos.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="text-white/70 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
              }}
              className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <img
              src={photos[lightboxIndex]}
              alt={`Property photo ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % photos.length);
              }}
              className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
          
          {/* Thumbnails */}
          <div className="p-4 bg-black/80 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                  className={`w-16 h-16 flex-shrink-0 overflow-hidden rounded ${
                    index === lightboxIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Floor Plans with tabs (400inwood.com style)
function SoapstoneFloorPlans({ site, theme }: { site: Site; theme?: Theme }) {
  const floorPlans = ((site as any).soapstoneFloorPlans as string[]) || [];
  const [activeIndex, setActiveIndex] = useState(0);
  
  if (floorPlans.length === 0) return null;

  return (
    <section 
      id="floorplans" 
      className="py-16 md:py-20 px-6 bg-gray-100"
      style={{ scrollMarginTop: '64px' }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Floor tabs - styled like 400inwood */}
        {floorPlans.length > 1 && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex border-b border-gray-300">
              {floorPlans.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`px-6 py-3 text-sm tracking-wider transition-all border-b-2 -mb-px ${
                    activeIndex === index 
                      ? 'border-[#1a1a1a] text-[#1a1a1a]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ fontFamily: '"Open Sans", sans-serif' }}
                >
                  Floor {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Floor plan image */}
        <div className="flex justify-center bg-white p-4 md:p-8">
          <img
            src={floorPlans[activeIndex]}
            alt={`Floor plan ${activeIndex + 1}`}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      </div>
    </section>
  );
}

interface SoapstoneAgentInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  photoUrl?: string;
  company?: string;
}

// Contact section with agent card (400inwood.com style)
function SoapstoneContact({ site, theme, agentInfo }: { site: Site; theme?: Theme; agentInfo?: SoapstoneAgentInfo | null }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const primaryColor = theme?.colors?.primary || '#558B73';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/sites/${site.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="py-20 md:py-28 px-6"
      style={{ 
        scrollMarginTop: '64px',
        backgroundColor: '#f8f8f8'
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-0 bg-white shadow-xl overflow-hidden">
          {/* Agent card - left side with image */}
          <div className="relative">
            {/* Company logo - top left corner */}
            {theme?.logoUrl && (
              <div className="absolute top-6 left-6 z-10 bg-white/90 p-3 rounded">
                <img
                  src={theme.logoUrl}
                  alt="Company logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
            )}
            
            {/* Agent photo - full height */}
            {agentInfo?.photoUrl ? (
              <div className="h-full min-h-[400px] md:min-h-[500px] relative">
                <img
                  src={agentInfo.photoUrl}
                  alt={agentInfo.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Agent info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <h3 
                    className="text-2xl md:text-3xl mb-1"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {agentInfo.name}
                  </h3>
                  <p 
                    className="text-white/80 text-sm uppercase tracking-wider mb-1"
                    style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300 }}
                  >
                    {agentInfo.title}
                  </p>
                  {agentInfo.company && (
                    <p 
                      className="text-white/70 text-sm mb-4"
                      style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300 }}
                    >
                      {agentInfo.company}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-1 text-sm">
                    {agentInfo.phone && (
                      <a 
                        href={`tel:${agentInfo.phone}`} 
                        className="text-white/90 hover:text-white transition-colors"
                        style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300 }}
                      >
                        {agentInfo.phone}
                      </a>
                    )}
                    {agentInfo.email && (
                      <a 
                        href={`mailto:${agentInfo.email}`} 
                        className="text-white/90 hover:text-white transition-colors"
                        style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300 }}
                      >
                        {agentInfo.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback when no agent photo */
              <div 
                className="h-full min-h-[400px] flex flex-col items-center justify-center p-8"
                style={{ backgroundColor: primaryColor }}
              >
                {agentInfo && (
                  <div className="text-center text-white">
                    <div 
                      className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 mx-auto"
                      style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem' }}
                    >
                      {agentInfo.name.charAt(0)}
                    </div>
                    <h3 
                      className="text-2xl md:text-3xl mb-1"
                      style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      {agentInfo.name}
                    </h3>
                    <p className="text-white/80 text-sm uppercase tracking-wider mb-1">
                      {agentInfo.title}
                    </p>
                    {agentInfo.company && (
                      <p className="text-white/70 text-sm mb-4">{agentInfo.company}</p>
                    )}
                    <div className="flex flex-col gap-1 text-sm">
                      {agentInfo.phone && (
                        <a href={`tel:${agentInfo.phone}`} className="text-white/90 hover:text-white">
                          {agentInfo.phone}
                        </a>
                      )}
                      {agentInfo.email && (
                        <a href={`mailto:${agentInfo.email}`} className="text-white/90 hover:text-white">
                          {agentInfo.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Contact form - right side */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-[#f5f5f5]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First*"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 px-0 py-3 text-gray-600 placeholder-gray-400"
                  style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, fontSize: '16px' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Last*"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 px-0 py-3 text-gray-600 placeholder-gray-400"
                  style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, fontSize: '16px' }}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email*"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 px-0 py-3 text-gray-600 placeholder-gray-400"
                style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, fontSize: '16px' }}
                required
              />
              <input
                type="tel"
                placeholder="Phone #"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 px-0 py-3 text-gray-600 placeholder-gray-400"
                style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, fontSize: '16px' }}
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 px-0 py-3 text-gray-600 placeholder-gray-400 min-h-[120px] resize-none"
                style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, fontSize: '16px' }}
                required
              />
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white border border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ 
                    fontFamily: '"Noto Sans", sans-serif', 
                    fontWeight: 400, 
                    fontSize: '14px',
                    boxShadow: '-8px 6px 0px 0px rgba(30, 30, 30, 0.85)'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
              
              {submitStatus === 'success' && (
                <p className="text-green-600 text-sm mt-2">Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-600 text-sm mt-2">Failed to send. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Google Map component with clickableIcons disabled
function SoapstoneGoogleMap({ address }: { address: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);
  
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        
        const map = new window.google.maps.Map(mapRef.current!, {
          center: location,
          zoom: 14,
          clickableIcons: false,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ saturation: -100 }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -100 }] },
            { elementType: 'labels.text.fill', stylers: [{ saturation: -100, lightness: 40 }] },
            { elementType: 'labels.text.stroke', stylers: [{ saturation: -100 }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ saturation: -100, lightness: 50 }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ saturation: -100, lightness: 30 }] },
            { featureType: 'poi', elementType: 'all', stylers: [{ saturation: -100 }] },
            { featureType: 'landscape', elementType: 'all', stylers: [{ saturation: -100 }] },
            { featureType: 'transit', elementType: 'all', stylers: [{ saturation: -100 }] },
          ]
        });
        
        new window.google.maps.Marker({
          position: location,
          map: map,
          clickable: false
        });
      }
    });
  }, [mapLoaded, address]);
  
  return <div ref={mapRef} className="w-full h-full" />;
}

// Map section (400inwood.com style)
function SoapstoneMap({ site, theme }: { site: Site; theme?: Theme }) {
  // Parse address into street and city/state/zip
  const addressParts = site.address.split(',');
  const streetAddress = addressParts[0]?.trim() || site.address;
  const cityStateZip = addressParts.slice(1).join(',').trim();
  
  return (
    <section 
      id="map" 
      className="bg-white relative w-full"
      style={{ scrollMarginTop: '64px' }}
    >
      {/* Mobile layout - stacked */}
      <div className="md:hidden">
        {/* Address box - full width on mobile */}
        <div 
          className="bg-white p-6 mx-4"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
        >
          <h3 
            className="text-sm uppercase tracking-widest mb-3"
            style={{ 
              fontFamily: '"Noto Sans", sans-serif', 
              fontWeight: 400, 
              color: '#1a1a1a',
              letterSpacing: '0.15em'
            }}
          >
            ADDRESS
          </h3>
          <p 
            className="text-gray-700 text-base"
            style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, lineHeight: 1.6 }}
          >
            {streetAddress}
          </p>
          {cityStateZip && (
            <p 
              className="text-gray-700 text-base"
              style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, lineHeight: 1.6 }}
            >
              {cityStateZip}
            </p>
          )}
        </div>
        
        {/* Map - full width on mobile */}
        <div className="h-[300px] mt-4">
          <SoapstoneGoogleMap address={site.address} />
        </div>
      </div>
      
      {/* Desktop layout - overlapping */}
      <div 
        className="hidden md:block relative h-[500px]"
        style={{ 
          marginLeft: '140px',
          marginRight: '140px'
        }}
      >
        {/* Map - right side, 75% width */}
        <div 
          className="absolute top-0 bottom-0"
          style={{ 
            width: '75%',
            right: '0'
          }}
        >
          <SoapstoneGoogleMap address={site.address} />
        </div>
        
        {/* Address box - floating, half over map */}
        <div 
          className="absolute z-10 bg-white p-10"
          style={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40%',
            minWidth: '280px',
            maxWidth: '400px'
          }}
        >
          <h3 
            className="text-sm uppercase tracking-widest mb-4"
            style={{ 
              fontFamily: '"Noto Sans", sans-serif', 
              fontWeight: 400, 
              color: '#1a1a1a',
              letterSpacing: '0.15em'
            }}
          >
            ADDRESS
          </h3>
          <p 
            className="text-gray-700 text-lg"
            style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, lineHeight: 1.6 }}
          >
            {streetAddress}
          </p>
          {cityStateZip && (
            <p 
              className="text-gray-700 text-lg"
              style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 300, lineHeight: 1.6 }}
            >
              {cityStateZip}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// Footer (400inwood.com / Rela style)
function SoapstoneFooter({ site, theme, footerLogo, invertLogo }: { site: Site; theme?: Theme; footerLogo?: string | null; invertLogo?: boolean }) {
  const backgroundColor = theme?.colors?.background || '#ffffff';
  
  return (
    <footer 
      className="py-6 px-6 border-t"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Powered by */}
          <a 
            href="https://agentassets.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 text-sm hover:text-gray-600 flex items-center gap-2"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Powered by <span className="font-semibold">AgentAssets</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

// ==================== END SOAP STONE LAYOUT COMPONENTS ====================

function PasswordGate({ 
  siteId, 
  site, 
  onUnlock 
}: { 
  siteId: string; 
  site: Site; 
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    
    try {
      const result = await verifySitePassword(siteId, password);
      if (result.success && result.accessToken) {
        sessionStorage.setItem(`site_access_${siteId}`, result.accessToken);
        onUnlock();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const heroImage = site.photos && site.photos.length > 0 ? site.photos[0] : undefined;

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {heroImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {!heroImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
      )}
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Password Protected</h1>
            <p className="text-slate-600 mt-2">This property site requires a password to view.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12 text-lg"
                  data-testid="input-site-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={isVerifying || !password}
              data-testid="button-verify-password"
            >
              {isVerifying ? "Verifying..." : "View Property"}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-slate-500">
              {site.title || site.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SiteViewProps {
  siteId?: string;
  params?: { id?: string };
}

export default function SiteView({ siteId: propSiteId, params: routeParams }: SiteViewProps = {}) {
  const [, hookParams] = useRoute("/site/:id");
  const siteId = propSiteId || routeParams?.id || hookParams?.id || '';
  const { data: site, isLoading } = useSite(siteId);
  const { data: themes = [] } = useThemes();
  const { data: layout } = useLayout(site?.layoutId || '');
  const { data: protectionStatus, isLoading: isLoadingProtection } = useSiteProtectionStatus(siteId);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const theme = themes.find(t => t.id === site?.themeId) || themes[0];

  const combinedStyles = useMemo(() => ({
    ...getThemeStyles(theme),
    ...getLayoutTypography(layout),
  }), [theme, layout]);

  useEffect(() => {
    if (siteId) {
      const accessToken = sessionStorage.getItem(`site_access_${siteId}`);
      if (accessToken) {
        setIsUnlocked(true);
      }
    }
  }, [siteId]);

  // Track page view for analytics
  useEffect(() => {
    if (site?.id && site?.status === 'published') {
      // Only track once per session per site
      const trackedKey = `tracked_view_${site.id}`;
      if (!sessionStorage.getItem(trackedKey)) {
        fetch(`/api/sites/${site.id}/track-view`, { 
          method: 'POST',
          credentials: 'include'
        }).then(() => {
          sessionStorage.setItem(trackedKey, 'true');
        }).catch(err => {
          console.error('Failed to track view:', err);
        });
      }
    }
  }, [site?.id, site?.status]);

  // Set SEO meta tags for property sites (only when unlocked or not password-protected)
  useEffect(() => {
    const isAccessible = !protectionStatus?.isProtected || isUnlocked;
    if (!site || !isAccessible) return;
    
    const seoTitle = (site as any).seoTitle || site.title || site.address || 'Property Listing';
    const seoDescription = (site as any).seoDescription || site.description?.substring(0, 160) || `View this property listing: ${site.address}`;
    const seoImage = (site as any).seoImage || (site.heroPhotos && site.heroPhotos.length > 0 ? site.heroPhotos[0] : '');
    
    // Store original values upfront to restore on cleanup
    const originalTitle = document.title;
    const originalMetas: { selector: string; attr: 'property' | 'name'; key: string; value: string | null }[] = [];
    
    const cacheOriginalMeta = (attr: 'property' | 'name', key: string) => {
      const selector = `meta[${attr}="${key}"]`;
      const meta = document.querySelector(selector) as HTMLMetaElement;
      originalMetas.push({ selector, attr, key, value: meta ? meta.content : null });
    };
    
    // Cache all meta tags we will modify
    cacheOriginalMeta('name', 'description');
    cacheOriginalMeta('property', 'og:title');
    cacheOriginalMeta('property', 'og:description');
    cacheOriginalMeta('property', 'og:image');
    cacheOriginalMeta('property', 'og:type');
    cacheOriginalMeta('name', 'twitter:card');
    cacheOriginalMeta('name', 'twitter:title');
    cacheOriginalMeta('name', 'twitter:description');
    cacheOriginalMeta('name', 'twitter:image');
    
    const setMeta = (attr: 'property' | 'name', key: string, content: string) => {
      const selector = `meta[${attr}="${key}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    document.title = seoTitle;
    setMeta('name', 'description', seoDescription);
    setMeta('property', 'og:title', seoTitle);
    setMeta('property', 'og:description', seoDescription);
    if (seoImage) {
      setMeta('property', 'og:image', seoImage);
    }
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seoTitle);
    setMeta('name', 'twitter:description', seoDescription);
    if (seoImage) {
      setMeta('name', 'twitter:image', seoImage);
    }
    
    return () => {
      // Cleanup: restore all original values when effect re-runs or component unmounts
      document.title = originalTitle;
      originalMetas.forEach(({ selector, attr, key, value }) => {
        const meta = document.querySelector(selector) as HTMLMetaElement;
        if (value === null) {
          if (meta) meta.remove();
        } else {
          if (meta) {
            meta.content = value;
          } else {
            const newMeta = document.createElement('meta');
            newMeta.setAttribute(attr, key);
            newMeta.content = value;
            document.head.appendChild(newMeta);
          }
        }
      });
    };
  }, [site, protectionStatus?.isProtected, isUnlocked]);

  // Inject custom Google Analytics if configured (only when site is accessible)
  useEffect(() => {
    const isAccessible = !protectionStatus?.isProtected || isUnlocked;
    const customGaId = (site as any)?.customGaId;
    if (!customGaId || !customGaId.startsWith('G-') || !isAccessible) return;
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${customGaId}"]`);
    if (existingScript) return;
    
    // Add gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${customGaId}`;
    script.id = `ga-script-${customGaId}`;
    document.head.appendChild(script);
    
    // Add gtag config
    const configScript = document.createElement('script');
    configScript.id = `ga-config-${customGaId}`;
    configScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${customGaId}');
    `;
    document.head.appendChild(configScript);
    
    return () => {
      // Cleanup when navigating away
      const scriptEl = document.getElementById(`ga-script-${customGaId}`);
      const configEl = document.getElementById(`ga-config-${customGaId}`);
      if (scriptEl) scriptEl.remove();
      if (configEl) configEl.remove();
    };
  }, [(site as any)?.customGaId, protectionStatus?.isProtected, isUnlocked]);

  if (isLoading || isLoadingProtection) {
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

  if (protectionStatus?.isProtected && !isUnlocked) {
    return (
      <PasswordGate 
        siteId={siteId} 
        site={site} 
        onUnlock={() => setIsUnlocked(true)} 
      />
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
  // Get footer logo: brokerage logo for brokerage members, user profile logo for individuals
  const footerLogo = (site as any).footerLogo || null;

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
        <ShoalwoodNavigation site={site} theme={theme} hasPhotos={!!hasPhotos} hasVideo={hasVideo} effectiveLogo={effectiveLogo} invertLogo={site.invertLogo} />
        <ShoalwoodHero site={site} theme={theme} heroImage={heroImage} effectiveLogo={effectiveLogo} invertLogo={site.invertLogo} />
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

        <ShoalwoodContact site={site} theme={theme} agentInfo={agentInfo} />

        <footer className="py-8 px-4 border-t bg-white">
          <div className="container mx-auto flex flex-col items-center gap-4">
            {footerLogo && (
              <img 
                src={footerLogo} 
                alt="Logo" 
                className={`h-10 w-auto object-contain ${site.invertLogo ? 'brightness-0 invert' : ''}`}
                data-testid="img-footer-logo"
              />
            )}
            <p className="text-sm text-gray-500">Property listing powered by AgentAssets</p>
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
          invertLogo={site.invertLogo}
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
          <div className="container mx-auto flex flex-col items-center gap-4">
            {footerLogo && (
              <img 
                src={footerLogo} 
                alt="Logo" 
                className="h-10 w-auto object-contain"
                data-testid="img-footer-logo"
              />
            )}
            <p className="text-sm text-gray-500">Property listing powered by AgentAssets</p>
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
        <MagazineNavigation site={site} theme={theme} effectiveLogo={effectiveLogo} effectiveHeroLogo={effectiveHeroLogo} invertLogo={site.invertLogo} />
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
        
        <section 
          id="map" 
          className="py-16 px-6 relative overflow-hidden" 
          style={{ 
            backgroundColor: '#cecece',
            scrollMarginTop: '100px' 
          }}
        >
          {/* Subtle gradient pattern */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: theme?.colors?.primary || '#558B73', stopOpacity: 0.25 }} />
                <stop offset="100%" style={{ stopColor: theme?.colors?.primary || '#558B73', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGradient)" />
          </svg>
          <div className="container mx-auto max-w-4xl relative z-10">
            <h2 
              className="text-3xl md:text-4xl mb-10 text-center"
              style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400', color: theme?.colors?.text || '#2C3E50' }}
            >
              Map
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
        <MagazineFooter site={site} theme={theme} footerLogo={footerLogo} invertLogo={site.invertLogo} />
      </div>
    );
  }

  // Soap Stone Layout - elegant modern design with dot navigation, hamburger menu, and video/photo hero options
  const isSoapStoneLayout = site.layoutId === 'layout-soapstone';
  if (isSoapStoneLayout) {
    const videoTabs = ((site as any).soapstoneVideoTabs as VideoTab[]) || [];
    const floorPlans = ((site as any).soapstoneFloorPlans as string[]) || [];
    const presentedBy = (site as any).soapstonePresentedBy || (site as any).brokerageName;
    
    const soapstoneNavLinks = [
      { id: 'overview', label: 'OVERVIEW' },
      ...(videoTabs.length > 0 || site.videoUrl ? [{ id: 'videos', label: 'VIDEO' }] : []),
      ...(hasPhotos ? [{ id: 'photos', label: 'PHOTOS' }] : []),
      ...(floorPlans.length > 0 ? [{ id: 'floorplans', label: 'FLOOR PLAN' }] : []),
      { id: 'contact', label: 'CONTACT' },
      { id: 'map', label: 'MAP' },
    ];
    
    const soapstoneNavItems = soapstoneNavLinks.map(link => ({ href: `#${link.id}`, label: link.label }));
    
    return (
      <SoapStoneLayoutWrapper 
        site={site} 
        theme={theme} 
        combinedStyles={combinedStyles}
        heroImage={heroImage}
        hasPhotos={!!hasPhotos}
        navLinks={soapstoneNavLinks}
        navItems={soapstoneNavItems}
        presentedBy={presentedBy}
        agentInfo={agentInfo}
        footerLogo={footerLogo}
      />
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
        <div className="container mx-auto flex flex-col items-center gap-4">
          {footerLogo && (
            <img 
              src={footerLogo} 
              alt="Logo" 
              className="h-10 w-auto object-contain"
              data-testid="img-footer-logo"
            />
          )}
          <p className="text-sm text-muted-foreground">Property listing powered by AgentAssets</p>
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
