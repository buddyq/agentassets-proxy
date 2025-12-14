import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

interface LiquidWipeSliderProps {
  images: string[];
  currentIndex: number;
  onTransitionComplete?: () => void;
}

function createCrystallizeDisplacementMap(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const imageData = ctx.createImageData(512, 512);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);
      
      const freq1 = 0.008;
      const freq2 = 0.012;
      const freq3 = 0.02;
      const freq4 = 0.004;
      
      const layer1 = Math.sin(x * freq1 + Math.cos(y * freq2) * 2) * Math.cos(y * freq1 + Math.sin(x * freq2) * 2);
      const layer2 = Math.sin((x + y) * freq2) * Math.cos((x - y) * freq3);
      const layer3 = Math.sin(x * freq3) * Math.sin(y * freq3) * Math.cos((x * y) * freq4 * 0.001);
      const layer4 = Math.sin(Math.sqrt(x * x + y * y) * freq2) * 0.5;
      
      const combined = (layer1 + layer2 * 0.8 + layer3 * 0.6 + layer4) / 3;
      
      const voronoi = Math.abs(Math.sin(x * 0.1) * Math.cos(y * 0.1) + 
                              Math.sin((x + 50) * 0.08) * Math.cos((y + 30) * 0.08));
      
      const noise = (combined * 0.7 + voronoi * 0.3) * 127 + 128;
      const clampedNoise = Math.max(0, Math.min(255, noise));
      
      imageData.data[i] = clampedNoise;
      imageData.data[i + 1] = clampedNoise;
      imageData.data[i + 2] = clampedNoise;
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
  const animatingRef = useRef(false);
  const tickerRef = useRef<PIXI.Ticker | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || images.length === 0) return;
    
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    
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
        
        const displacementCanvas = createCrystallizeDisplacementMap();
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
          scale: { x: 0, y: 0 },
        });
        displacementFilterRef.current = displacementFilter;
        
        const slidesContainer = new PIXI.Container();
        app.stage.addChild(slidesContainer);
        app.stage.addChild(displacementSprite);
        app.stage.filters = [displacementFilter];
        
        const loadedSprites: PIXI.Sprite[] = [];
        
        for (let i = 0; i < images.length; i++) {
          try {
            const texture = await PIXI.Assets.load(images[i]);
            const sprite = new PIXI.Sprite(texture);
            
            const scaleX = width / sprite.texture.width;
            const scaleY = height / sprite.texture.height;
            const scale = Math.max(scaleX, scaleY);
            
            sprite.width = sprite.texture.width * scale;
            sprite.height = sprite.texture.height * scale;
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
        ticker.add(() => {
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
  }, [images]);
  
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
    
    const displaceScale = [300, 300];
    const displaceScaleTo = [0, 0];
    
    const initialRotation = displacementSprite.rotation;
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
        displacementSprite.rotation = initialRotation + progress * 0.15;
        displacementSprite.scale.set(initialScale + progress * 2);
      }
    });
    
    tl.to(displacementFilter.scale, {
      x: displaceScale[0],
      y: displaceScale[1],
      duration: 1,
      ease: "power1.out"
    })
    .to(fromSprite, {
      alpha: 0,
      duration: 0.5,
      ease: "power2.out"
    }, 0.2)
    .to(toSprite, {
      alpha: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 0.3)
    .to(displacementFilter.scale, {
      x: displaceScaleTo[0],
      y: displaceScaleTo[1],
      duration: 1,
      ease: "power2.out"
    }, 0.3);
    
  }, [currentIndex, previousIndex, isInitialized, onTransitionComplete]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0"
      style={{ backgroundColor: '#000' }}
    />
  );
}
