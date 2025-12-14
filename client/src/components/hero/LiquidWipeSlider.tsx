import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

interface LiquidWipeSliderProps {
  images: string[];
  currentIndex: number;
  onTransitionComplete?: () => void;
}

async function loadImageAsTexture(url: string): Promise<PIXI.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const texture = PIXI.Texture.from(img);
      resolve(texture);
    };
    img.onerror = (err) => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

function createRippleDisplacementMap(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 2048;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const imageData = ctx.createImageData(size, size);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % size;
      const y = Math.floor((i / 4) / size);
      
      const cx = size / 2;
      const cy = size / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const rippleFreq = 0.015;
      const ripple = Math.sin(dist * rippleFreq) * 0.5 + 0.5;
      
      const secondaryFreq = 0.008;
      const secondary = Math.sin(dist * secondaryFreq + Math.PI / 4) * 0.3 + 0.5;
      
      const waveX = Math.sin(x * 0.01 + y * 0.005) * 0.2;
      const waveY = Math.cos(y * 0.01 - x * 0.005) * 0.2;
      
      const combined = (ripple * 0.6 + secondary * 0.25 + waveX * 0.075 + waveY * 0.075);
      
      const value = Math.floor(combined * 255);
      const clampedValue = Math.max(0, Math.min(255, value));
      
      imageData.data[i] = clampedValue;
      imageData.data[i + 1] = clampedValue;
      imageData.data[i + 2] = clampedValue;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  return canvas;
}

export default function LiquidWipeSlider({
  images,
  currentIndex,
  onTransitionComplete
}: LiquidWipeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spritesRef = useRef<PIXI.Sprite[]>([]);
  const displacementSpriteRef = useRef<PIXI.Sprite | null>(null);
  const displacementFilterRef = useRef<PIXI.DisplacementFilter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);
  const [containerReady, setContainerReady] = useState(false);
  const animatingRef = useRef(false);
  const tickerRef = useRef<PIXI.Ticker | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const checkDimensions = () => {
      const container = containerRef.current;
      if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        setContainerReady(true);
      }
    };
    
    checkDimensions();
    
    const resizeObserver = new ResizeObserver(() => {
      checkDimensions();
    });
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  useEffect(() => {
    if (!containerRef.current || images.length === 0 || !containerReady) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0 || height === 0) return;
    
    const initPixi = async () => {
      try {
        const app = new PIXI.Application();
        await app.init({
          width,
          height,
          backgroundAlpha: 0,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        
        container.appendChild(app.canvas as HTMLCanvasElement);
        appRef.current = app;
        
        const displacementCanvas = createRippleDisplacementMap();
        const displacementTexture = PIXI.Texture.from(displacementCanvas);
        const displacementSprite = new PIXI.Sprite(displacementTexture);
        
        displacementSprite.texture.source.wrapMode = 'repeat';
        displacementSprite.anchor.set(0.5);
        displacementSprite.x = width / 2;
        displacementSprite.y = height / 2;
        displacementSprite.scale.set(2);
        
        displacementSpriteRef.current = displacementSprite;
        
        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: { x: 20, y: 20 },
        });
        displacementFilterRef.current = displacementFilter;
        
        const slidesContainer = new PIXI.Container();
        app.stage.addChild(slidesContainer);
        app.stage.addChild(displacementSprite);
        app.stage.filters = [displacementFilter];
        
        const loadedSprites: PIXI.Sprite[] = [];
        
        for (let i = 0; i < images.length; i++) {
          try {
            const texture = await loadImageAsTexture(images[i]);
            const sprite = new PIXI.Sprite(texture);
            
            const texWidth = sprite.texture.width || width;
            const texHeight = sprite.texture.height || height;
            const scaleX = width / texWidth;
            const scaleY = height / texHeight;
            const scale = Math.max(scaleX, scaleY);
            
            sprite.width = texWidth * scale;
            sprite.height = texHeight * scale;
            sprite.anchor.set(0.5);
            sprite.x = width / 2;
            sprite.y = height / 2;
            sprite.alpha = i === currentIndex ? 1 : 0;
            
            slidesContainer.addChild(sprite);
            loadedSprites.push(sprite);
          } catch (err) {
            console.warn(`Failed to load image ${i}:`, err);
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, width, height);
            graphics.fill(0x333333);
            const sprite = new PIXI.Sprite(app.renderer.generateTexture(graphics));
            sprite.anchor.set(0.5);
            sprite.x = width / 2;
            sprite.y = height / 2;
            sprite.alpha = i === currentIndex ? 1 : 0;
            slidesContainer.addChild(sprite);
            loadedSprites.push(sprite);
          }
        }
        
        spritesRef.current = loadedSprites;
        
        const ticker = new PIXI.Ticker();
        ticker.autoStart = true;
        ticker.add((delta) => {
          displacementSprite.x += 0.1 * delta.deltaTime;
          displacementSprite.y += 0.1 * delta.deltaTime;
          
          displacementSprite.x += 2.14 * delta.deltaTime;
          displacementSprite.y += 22.24 * delta.deltaTime;
          
          app.renderer.render(app.stage);
        });
        tickerRef.current = ticker;
        
        setIsInitialized(true);
        
      } catch (err) {
        console.error('Failed to initialize PixiJS:', err);
      }
    };
    
    initPixi();
    
    return () => {
      if (tickerRef.current) {
        tickerRef.current.destroy();
        tickerRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      spritesRef.current = [];
      displacementSpriteRef.current = null;
      displacementFilterRef.current = null;
      setIsInitialized(false);
    };
  }, [images, containerReady]);
  
  useEffect(() => {
    if (!containerRef.current || !appRef.current) return;
    
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !appRef.current) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      appRef.current.renderer.resize(width, height);
      
      if (displacementSpriteRef.current) {
        displacementSpriteRef.current.x = width / 2;
        displacementSpriteRef.current.y = height / 2;
      }
      
      spritesRef.current.forEach((sprite) => {
        if (sprite.texture) {
          const scaleX = width / sprite.texture.width;
          const scaleY = height / sprite.texture.height;
          const scale = Math.max(scaleX, scaleY);
          
          sprite.width = sprite.texture.width * scale;
          sprite.height = sprite.texture.height * scale;
          sprite.x = width / 2;
          sprite.y = height / 2;
        }
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);
  
  useEffect(() => {
    if (!isInitialized || currentIndex === previousIndex || animatingRef.current) {
      return;
    }
    
    animatingRef.current = true;
    const sprites = spritesRef.current;
    const displacementSprite = displacementSpriteRef.current;
    const displacementFilter = displacementFilterRef.current;
    
    if (sprites.length === 0 || !displacementSprite || !displacementFilter) {
      animatingRef.current = false;
      return;
    }
    
    const fromSprite = sprites[previousIndex];
    const toSprite = sprites[currentIndex];
    
    if (!fromSprite || !toSprite) {
      animatingRef.current = false;
      return;
    }
    
    const initialScale = displacementSprite.scale.x;
    
    const tl = gsap.timeline({
      onComplete: () => {
        setPreviousIndex(currentIndex);
        animatingRef.current = false;
        displacementSprite.scale.set(2);
        onTransitionComplete?.();
      },
      onUpdate: () => {
        const progress = tl.progress();
        displacementSprite.rotation += progress * 0.02;
        displacementSprite.scale.set(initialScale + progress * 3);
      }
    });
    
    tl.to(displacementFilter.scale, {
      y: `+=${1280}`,
      duration: 1,
      ease: "power3.out"
    })
    .to(fromSprite, {
      alpha: 0,
      duration: 0.5,
      ease: "power3.out"
    }, 0.4)
    .to(toSprite, {
      alpha: 1,
      duration: 0.5,
      ease: "power3.inOut"
    }, 0.7)
    .to(displacementFilter.scale, {
      y: 20,
      duration: 1,
      ease: "power3.out"
    }, 1);
    
  }, [currentIndex, previousIndex, isInitialized, onTransitionComplete]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ 
        backgroundColor: '#000',
        zIndex: 1,
        overflow: 'hidden'
      }}
    />
  );
}
