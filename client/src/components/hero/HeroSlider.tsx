import { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroTransitionType } from '@shared/schema';

interface HeroSliderProps {
  images: string[];
  transition?: HeroTransitionType;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  overlay?: React.ReactNode;
  onSlideChange?: (index: number) => void;
}

const LiquidWipeSlider = lazy(() => import('./LiquidWipeSlider'));

function SlideTransition({ 
  images, 
  currentIndex, 
  isTransitioning 
}: { 
  images: string[]; 
  currentIndex: number; 
  isTransitioning: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>
    </div>
  );
}

function CrossfadeTransition({ 
  images, 
  currentIndex, 
  isTransitioning 
}: { 
  images: string[]; 
  currentIndex: number; 
  isTransitioning: boolean;
}) {
  return (
    <>
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${image})`,
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0
          }}
        />
      ))}
    </>
  );
}

function KenBurnsTransition({ 
  images, 
  currentIndex, 
  isTransitioning,
  zoomProgress 
}: { 
  images: string[]; 
  currentIndex: number; 
  isTransitioning: boolean;
  zoomProgress: number;
}) {
  const [previousIndex, setPreviousIndex] = useState(0);
  
  useEffect(() => {
    if (!isTransitioning) {
      setPreviousIndex(currentIndex);
    }
  }, [currentIndex, isTransitioning]);
  
  const zoomScale = 1 + (zoomProgress * 0.08);
  
  return (
    <>
      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const isPrevious = index === previousIndex && isTransitioning;
        
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
                backgroundImage: `url(${image})`,
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
    </>
  );
}

export default function HeroSlider({
  images,
  transition = 'slide',
  autoPlayInterval = 6000,
  showArrows = true,
  showDots = true,
  className = '',
  overlay,
  onSlideChange
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);
  
  useEffect(() => {
    if (transition === 'liquid-webgl') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(!!gl);
    }
  }, [transition]);
  
  useEffect(() => {
    if (transition !== 'kenburns' || isTransitioning) return;
    
    const startTime = Date.now();
    const duration = autoPlayInterval;
    
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
  }, [currentIndex, isTransitioning, transition, autoPlayInterval]);
  
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, currentIndex]);
  
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setZoomProgress(0);
    
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      onSlideChange?.(nextIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, transition === 'kenburns' ? 600 : 300);
  }, [currentIndex, images.length, isTransitioning, onSlideChange, transition]);
  
  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setZoomProgress(0);
    
    setTimeout(() => {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      setCurrentIndex(prevIndex);
      onSlideChange?.(prevIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, transition === 'kenburns' ? 600 : 300);
  }, [currentIndex, images.length, isTransitioning, onSlideChange, transition]);
  
  const goToIndex = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setZoomProgress(0);
    
    setTimeout(() => {
      setCurrentIndex(index);
      onSlideChange?.(index);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, transition === 'kenburns' ? 600 : 300);
  }, [currentIndex, isTransitioning, onSlideChange, transition]);
  
  if (images.length === 0) {
    return <div className={`bg-gray-200 ${className}`} />;
  }
  
  const effectiveTransition = transition === 'liquid-webgl' && !webglSupported ? 'crossfade' : transition;
  
  const renderTransition = () => {
    switch (effectiveTransition) {
      case 'slide':
        return (
          <SlideTransition 
            images={images} 
            currentIndex={currentIndex} 
            isTransitioning={isTransitioning} 
          />
        );
      case 'crossfade':
        return (
          <CrossfadeTransition 
            images={images} 
            currentIndex={currentIndex} 
            isTransitioning={isTransitioning} 
          />
        );
      case 'kenburns':
        return (
          <KenBurnsTransition 
            images={images} 
            currentIndex={currentIndex} 
            isTransitioning={isTransitioning}
            zoomProgress={zoomProgress}
          />
        );
      case 'liquid-webgl':
        return (
          <Suspense fallback={
            <CrossfadeTransition 
              images={images} 
              currentIndex={currentIndex} 
              isTransitioning={isTransitioning} 
            />
          }>
            <LiquidWipeSlider
              images={images}
              currentIndex={currentIndex}
              onTransitionComplete={() => setIsTransitioning(false)}
            />
          </Suspense>
        );
      default:
        return (
          <CrossfadeTransition 
            images={images} 
            currentIndex={currentIndex} 
            isTransitioning={isTransitioning} 
          />
        );
    }
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {renderTransition()}
      
      {overlay}
      
      {showArrows && images.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
            data-testid="button-hero-next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {showDots && images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-3 rounded-full transition-all duration-500 ${
                currentIndex === index 
                  ? 'bg-white w-10' 
                  : 'bg-white/40 hover:bg-white/60 w-3'
              }`}
              data-testid={`slide-indicator-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
