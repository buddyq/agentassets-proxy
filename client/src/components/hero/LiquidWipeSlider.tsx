import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface LiquidWipeSliderProps {
  images: string[];
  currentIndex: number;
  onTransitionComplete?: () => void;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);
  const animatingRef = useRef(false);
  
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
        
        const displacementCanvas = document.createElement('canvas');
        displacementCanvas.width = 512;
        displacementCanvas.height = 512;
        const ctx = displacementCanvas.getContext('2d');
        
        if (ctx) {
          const imageData = ctx.createImageData(512, 512);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const x = (i / 4) % 512;
            const y = Math.floor((i / 4) / 512);
            
            const noise1 = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 127 + 128;
            const noise2 = Math.sin((x + y) * 0.015) * 127 + 128;
            const noise3 = Math.cos(x * 0.03 - y * 0.02) * 127 + 128;
            
            const finalNoise = (noise1 + noise2 + noise3) / 3;
            
            imageData.data[i] = finalNoise;
            imageData.data[i + 1] = finalNoise;
            imageData.data[i + 2] = finalNoise;
            imageData.data[i + 3] = 255;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        const displacementTexture = PIXI.Texture.from(displacementCanvas);
        const displacementSprite = new PIXI.Sprite(displacementTexture);
        displacementSprite.texture.source.wrapMode = 'repeat';
        displacementSpriteRef.current = displacementSprite;
        
        const displacementFilter = new PIXI.DisplacementFilter({
          sprite: displacementSprite,
          scale: { x: 0, y: 0 },
        });
        
        app.stage.filters = [displacementFilter];
        app.stage.addChild(displacementSprite);
        
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
            sprite.x = (width - sprite.width) / 2;
            sprite.y = (height - sprite.height) / 2;
            sprite.alpha = i === currentIndex ? 1 : 0;
            
            app.stage.addChild(sprite);
            loadedSprites.push(sprite);
          } catch (err) {
            console.warn(`Failed to load image ${i}:`, err);
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, width, height);
            graphics.fill(0x333333);
            const sprite = new PIXI.Sprite(app.renderer.generateTexture(graphics));
            sprite.alpha = i === currentIndex ? 1 : 0;
            app.stage.addChild(sprite);
            loadedSprites.push(sprite);
          }
        }
        
        spritesRef.current = loadedSprites;
        setIsInitialized(true);
        
      } catch (err) {
        console.error('Failed to initialize PixiJS:', err);
      }
    };
    
    initPixi();
    
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      spritesRef.current = [];
      displacementSpriteRef.current = null;
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
      
      spritesRef.current.forEach((sprite, i) => {
        if (sprite.texture) {
          const scaleX = width / sprite.texture.width;
          const scaleY = height / sprite.texture.height;
          const scale = Math.max(scaleX, scaleY);
          
          sprite.width = sprite.texture.width * scale;
          sprite.height = sprite.texture.height * scale;
          sprite.x = (width - sprite.width) / 2;
          sprite.y = (height - sprite.height) / 2;
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
    const app = appRef.current;
    const sprites = spritesRef.current;
    const displacementSprite = displacementSpriteRef.current;
    
    if (!app || sprites.length === 0 || !displacementSprite) {
      animatingRef.current = false;
      return;
    }
    
    const fromSprite = sprites[previousIndex];
    const toSprite = sprites[currentIndex];
    
    if (!fromSprite || !toSprite) {
      animatingRef.current = false;
      return;
    }
    
    const displacementFilter = app.stage.filters?.[0] as PIXI.DisplacementFilter;
    if (!displacementFilter) {
      animatingRef.current = false;
      return;
    }
    
    const duration = 1200;
    const startTime = Date.now();
    
    toSprite.alpha = 0;
    fromSprite.alpha = 1;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const maxDisplacement = 80;
      const displacement = Math.sin(easedProgress * Math.PI) * maxDisplacement;
      displacementFilter.scale.x = displacement;
      displacementFilter.scale.y = displacement;
      
      displacementSprite.x += 2;
      displacementSprite.y += 1;
      
      if (progress < 0.5) {
        fromSprite.alpha = 1;
        toSprite.alpha = progress * 2;
      } else {
        fromSprite.alpha = 1 - (progress - 0.5) * 2;
        toSprite.alpha = 1;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        fromSprite.alpha = 0;
        toSprite.alpha = 1;
        displacementFilter.scale.x = 0;
        displacementFilter.scale.y = 0;
        animatingRef.current = false;
        setPreviousIndex(currentIndex);
        onTransitionComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
    
  }, [currentIndex, previousIndex, isInitialized, onTransitionComplete]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0"
      style={{ backgroundColor: '#000' }}
    />
  );
}
