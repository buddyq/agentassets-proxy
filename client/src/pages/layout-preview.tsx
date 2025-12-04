import { useRoute } from "wouter";
import { useMemo } from "react";
import { previewSite, previewTheme, previewAgentInfo, getSiteForLayout, type PreviewSite, type PreviewTheme } from "@/lib/preview-fixtures";

function getThemeStyles(theme?: PreviewTheme) {
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

function getLayoutTypography(layoutId: string) {
  if (layoutId === 'layout-shoalwood') {
    return {
      '--font-heading': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      '--font-body': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '400',
      '--font-nav': '"Plus Jakarta Sans", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  if (layoutId === 'layout-modern') {
    return {
      '--font-heading': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      '--font-body': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '600',
      '--font-nav': '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  if (layoutId === 'layout-magazine') {
    return {
      '--font-heading': '"Shippori Mincho B1", Georgia, serif',
      '--font-body': '"Arimo", -apple-system, BlinkMacSystemFont, sans-serif',
      '--heading-weight': '400',
      '--font-nav': '"Arimo", -apple-system, BlinkMacSystemFont, sans-serif',
    } as React.CSSProperties;
  }
  
  return {
    '--font-heading': 'Georgia, serif',
    '--font-body': 'Inter, system-ui, sans-serif',
    '--heading-weight': '700',
  } as React.CSSProperties;
}

function MinimalHero({ site, theme }: { site: PreviewSite; theme: PreviewTheme }) {
  const heroImage = site.heroPhotos?.[0] || site.photos?.[0] || '';
  
  return (
    <section 
      id="home" 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      data-testid="minimal-hero"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white text-xl font-semibold tracking-tight">
            {site.title || site.address}
          </div>
          <div className="hidden md:flex items-center gap-8 text-white/90 text-sm font-medium">
            <span>Home</span>
            <span>Details</span>
            <span>Photos</span>
            <span>Contact</span>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          {site.title || "Luxury Living"}
        </h1>
        <p className="text-xl md:text-2xl mb-2 opacity-90">
          {site.address}
        </p>
        <p className="text-3xl md:text-4xl font-semibold" style={{ color: theme.colors?.primary || '#558B73' }}>
          {site.price}
        </p>
      </div>
    </section>
  );
}

function ClassicHero({ site, theme }: { site: PreviewSite; theme: PreviewTheme }) {
  const heroImage = site.heroPhotos?.[0] || site.photos?.[0] || '';
  
  return (
    <div data-testid="classic-hero">
      <nav className="sticky top-0 z-50 w-full shadow-sm bg-white" style={{ borderBottom: `1px solid ${theme.colors?.primary}20` }}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div 
            className="text-2xl tracking-tight" 
            style={{ 
              color: theme.colors?.primary,
              fontFamily: 'Georgia, serif',
              fontWeight: '700'
            }}
          >
            {site.title || site.address}
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-wider" style={{ color: theme.colors?.secondary }}>
            <span>Home</span>
            <span>Details</span>
            <span>Location</span>
            <span>Photos</span>
          </div>
        </div>
      </nav>
      
      <section 
        id="home" 
        className="relative h-[70vh] w-full flex items-end overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-6 pb-16">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {site.address}
          </h1>
          <div className="flex items-center gap-6 text-white/90">
            <span className="text-3xl font-semibold" style={{ color: theme.colors?.primary }}>
              {site.price}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{site.bedrooms}</span> Beds
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{site.bathrooms}</span> Baths
            </span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{site.sqft?.toLocaleString()}</span> Sq Ft
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShoalwoodHero({ site, theme }: { site: PreviewSite; theme: PreviewTheme }) {
  const heroImage = site.heroPhotos?.[0] || site.photos?.[0] || '';
  
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden" data-testid="shoalwood-hero">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-4">
        <button 
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-base font-medium tracking-[0.1em] uppercase border border-white/40"
        >
          REQUEST INFO
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10 pl-20 md:pl-24">
        <div className="container mx-auto">
          <div className="inline-block bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded mb-6">
            <span 
              className="text-xs font-semibold tracking-[0.2em] uppercase" 
              style={{ color: theme.colors?.primary || '#1a1a1a' }}
            >
              For Sale
            </span>
          </div>
          
          <h1 
            className="text-white text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            {site.address}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg mt-6">
            <span className="text-2xl md:text-3xl font-semibold text-white">{site.price}</span>
            {site.bedrooms && <span className="flex items-center gap-2">{site.bedrooms} Beds</span>}
            {site.bathrooms && <span className="flex items-center gap-2">{site.bathrooms} Baths</span>}
            {site.sqft && <span className="flex items-center gap-2">{site.sqft.toLocaleString()} Sq Ft</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernHero({ site, theme }: { site: PreviewSite; theme: PreviewTheme }) {
  const currentSlide = site.heroSlides?.[0] || {
    title: site.title || "Modern Estate Living",
    subtitle: "Luxury Redefined",
    backgroundImage: site.heroPhotos?.[0] || site.photos?.[0] || ''
  };
  
  return (
    <div data-testid="modern-hero">
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div 
              className="text-2xl tracking-tight font-semibold"
              style={{ fontFamily: '"Outfit", sans-serif', color: theme.colors?.primary }}
            >
              {site.title || site.address}
            </div>
          </div>
          <div 
            className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-wider"
            style={{ fontFamily: '"Outfit", sans-serif', color: theme.colors?.secondary }}
          >
            <span>Home</span>
            <span>Details</span>
            <span>Photos</span>
            <span>Contact</span>
          </div>
        </div>
      </nav>
      
      <section id="home" className="relative h-screen w-full overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${currentSlide.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4"
            style={{ 
              fontFamily: '"Outfit", sans-serif',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {currentSlide.title}
          </h1>
          {currentSlide.subtitle && (
            <p 
              className="text-xl md:text-2xl opacity-90 mb-8"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              {currentSlide.subtitle}
            </p>
          )}
          <button
            className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white text-lg font-medium border border-white/40 rounded-full hover:bg-white/30 transition-colors"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            Have a look
          </button>
        </div>
      </section>
    </div>
  );
}

function MagazineHero({ site, theme }: { site: PreviewSite; theme: PreviewTheme }) {
  const heroImage = site.heroPhotos?.[0] || site.photos?.[0] || '';
  
  return (
    <div data-testid="magazine-hero">
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div 
            className="text-xl tracking-tight"
            style={{ fontFamily: '"Shippori Mincho B1", serif', color: theme.colors?.text }}
          >
            {site.title || site.address}
          </div>
          <div 
            className="hidden md:flex items-center gap-6 text-sm"
            style={{ fontFamily: '"Arimo", sans-serif', color: theme.colors?.secondary }}
          >
            <span>Property</span>
            <span>Gallery</span>
            <span>Documents</span>
            <span>Map</span>
            <span>Contact</span>
          </div>
        </div>
      </nav>
      
      <section id="home" className="relative h-screen w-full overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p 
                  className="text-5xl md:text-6xl lg:text-7xl text-white mb-4"
                  style={{ fontFamily: '"Shippori Mincho B1", serif', fontWeight: '400' }}
                >
                  {site.price}
                </p>
                <h1 
                  className="text-2xl md:text-3xl text-white/90"
                  style={{ fontFamily: '"Arimo", sans-serif' }}
                >
                  {site.address}
                </h1>
                {site.buyerAgentComp && (
                  <p 
                    className="text-lg text-white/70 mt-2"
                    style={{ fontFamily: '"Arimo", sans-serif' }}
                  >
                    {site.buyerAgentComp} Buyers Agent Compensation
                  </p>
                )}
              </div>
              <button
                className="px-8 py-3 text-white text-base font-medium border border-white/60 hover:bg-white/10 transition-colors self-start md:self-auto"
                style={{ fontFamily: '"Arimo", sans-serif' }}
              >
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div 
        className="py-4 px-6"
        style={{ backgroundColor: theme.colors?.primary || '#558B73' }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 text-white">
          {site.bedrooms && (
            <div className="text-center">
              <span className="text-2xl font-semibold" style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{site.bedrooms}</span>
              <span className="ml-2 text-sm opacity-80" style={{ fontFamily: '"Arimo", sans-serif' }}>Bedrooms</span>
            </div>
          )}
          {site.bathrooms && (
            <div className="text-center">
              <span className="text-2xl font-semibold" style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{site.bathrooms}</span>
              <span className="ml-2 text-sm opacity-80" style={{ fontFamily: '"Arimo", sans-serif' }}>Bathrooms</span>
            </div>
          )}
          {site.sqft && (
            <div className="text-center">
              <span className="text-2xl font-semibold" style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{site.sqft.toLocaleString()}</span>
              <span className="ml-2 text-sm opacity-80" style={{ fontFamily: '"Arimo", sans-serif' }}>Sq Ft</span>
            </div>
          )}
          {site.yearBuilt && (
            <div className="text-center">
              <span className="text-2xl font-semibold" style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{site.yearBuilt}</span>
              <span className="ml-2 text-sm opacity-80" style={{ fontFamily: '"Arimo", sans-serif' }}>Year Built</span>
            </div>
          )}
          {site.lotSize && (
            <div className="text-center">
              <span className="text-2xl font-semibold" style={{ fontFamily: '"Shippori Mincho B1", serif' }}>{site.lotSize}</span>
              <span className="ml-2 text-sm opacity-80" style={{ fontFamily: '"Arimo", sans-serif' }}>Lot Size</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LayoutPreview() {
  const [, params] = useRoute("/layout-preview/:layoutId");
  const layoutId = params?.layoutId || 'layout-minimal';
  
  const site = useMemo(() => getSiteForLayout(layoutId), [layoutId]);
  const theme = previewTheme;
  
  const combinedStyles = useMemo(() => ({
    ...getThemeStyles(theme),
    ...getLayoutTypography(layoutId),
  }), [theme, layoutId]);

  const renderLayout = () => {
    switch (layoutId) {
      case 'layout-shoalwood':
        return <ShoalwoodHero site={site} theme={theme} />;
      case 'layout-modern':
        return <ModernHero site={site} theme={theme} />;
      case 'layout-magazine':
        return <MagazineHero site={site} theme={theme} />;
      case 'layout-classic':
        return <ClassicHero site={site} theme={theme} />;
      case 'layout-minimal':
      default:
        return <MinimalHero site={site} theme={theme} />;
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        ...combinedStyles,
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)',
        fontFamily: 'var(--font-body)'
      }}
      data-testid={`layout-preview-${layoutId}`}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Shippori+Mincho+B1:wght@400;500;600&family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {renderLayout()}
    </div>
  );
}
