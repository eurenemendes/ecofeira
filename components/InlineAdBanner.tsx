
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Megaphone, Play } from 'lucide-react';
import { BANNER_AD_GRID_DURATION, BANNER_AD_LIST_DURATION, BANNER_AD_GRID_SHUFFLE, BANNER_AD_LIST_SHUFFLE } from '../constants';

interface AdSlide {
  id: number;
  title: string;
  tag: string;
  cta: string;
  gradient: string;
  imageUrl?: string;
  videoEmbedUrl?: string;
}

const AD_SLIDES_DATA: AdSlide[] = [
  {
    id: 1,
    title: "Entrega Grátis na primeira compra!",
    tag: "PROMO",
    cta: "Aproveitar",
    imageUrl: "https://images.unsplash.com/photo-1586880244406-5569ac3f295e?auto=format&fit=crop&q=80&w=800",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
  },
  {
    id: 2,
    title: "EcoFeira Card: Ganhe Cashback",
    tag: "NOVIDADE",
    cta: "Pedir Meu Cartão",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
  },
  {
    id: 3,
    title: "Orgânicos com 20% de Desconto",
    tag: "OFERTA",
    cta: "Ver Itens",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
  }
];

interface InlineAdBannerProps {
  layout: 'grid' | 'list';
}

const InlineAdBanner: React.FC<InlineAdBannerProps> = ({ layout }) => {
  const [current, setCurrent] = useState(0);

  const slides = useMemo(() => {
    const isGrid = layout === 'grid';
    const shouldShuffle = isGrid ? BANNER_AD_GRID_SHUFFLE : BANNER_AD_LIST_SHUFFLE;
    if (shouldShuffle) {
      return [...AD_SLIDES_DATA].sort(() => Math.random() - 0.5);
    }
    return AD_SLIDES_DATA;
  }, [layout]);

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const duration = layout === 'grid' ? BANNER_AD_GRID_DURATION : BANNER_AD_LIST_DURATION;
    const timer = setInterval(() => nextSlide(), duration);
    return () => clearInterval(timer);
  }, [nextSlide, layout]);

  const slide = slides[current];

  const renderBackground = () => {
    if (slide.videoEmbedUrl) {
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          <iframe width="100%" height="100%" src={slide.videoEmbedUrl} frameBorder="0" style={{ objectFit: 'cover' }}></iframe>
        </div>
      );
    }
    if (slide.imageUrl) {
      return (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${slide.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1
        }} />
      );
    }
    return null;
  };

  if (layout === 'list') {
    return (
      <div className="card animate" style={{ 
        flexDirection: 'row', 
        padding: '0', 
        height: '110px',
        overflow: 'hidden',
        background: slide.gradient,
        border: 'none',
        position: 'relative'
      }}>
        {renderBackground()}

        <div style={{ 
          flex: 1, 
          padding: '16px 24px', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          background: (slide.imageUrl || slide.videoEmbedUrl) ? 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)' : 'transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>{slide.tag}</span>
            <Megaphone size={12} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{slide.title}</h4>
        </div>

        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '8px' }} className="hide-mobile">
             <button onClick={prevSlide} className="ad-nav-btn"><ChevronLeft size={16} /></button>
             <button onClick={nextSlide} className="ad-nav-btn"><ChevronRight size={16} /></button>
          </div>
          <button className="btn" style={{ background: 'white', color: '#0f172a', padding: '10px 20px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            {slide.cta}
          </button>
        </div>
        
        <style>{`
          .ad-nav-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            backdrop-filter: blur(4px);
          }
          .ad-nav-btn:hover { background: rgba(255,255,255,0.4); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="card animate" style={{ 
      padding: '0', 
      height: '100%',
      minHeight: '280px',
      overflow: 'hidden',
      background: slide.gradient,
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {renderBackground()}

      <div style={{ 
        padding: '24px', 
        flex: 1, 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        background: (slide.imageUrl || slide.videoEmbedUrl) ? 'rgba(0,0,0,0.5)' : 'transparent'
      }}>
        <div style={{ marginBottom: '12px', opacity: 0.8 }}>
           {slide.videoEmbedUrl ? <Play size={32} style={{ margin: '0 auto' }} /> : <Megaphone size={32} style={{ margin: '0 auto' }} />}
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '4px', alignSelf: 'center', marginBottom: '12px', backdropFilter: 'blur(4px)' }}>{slide.tag}</span>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px' }}>{slide.title}</h4>
        
        <button className="btn" style={{ background: 'white', color: '#0f172a', padding: '12px 24px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 800, alignSelf: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {slide.cta}
        </button>
      </div>

      <div style={{ 
        padding: '12px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevSlide} className="ad-nav-btn"><ChevronLeft size={16} /></button>
          <button onClick={nextSlide} className="ad-nav-btn"><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {slides.map((_, idx) => (
            <div key={idx} style={{ width: current === idx ? '16px' : '4px', height: '4px', background: 'white', opacity: current === idx ? 1 : 0.4, borderRadius: '2px', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineAdBanner;
