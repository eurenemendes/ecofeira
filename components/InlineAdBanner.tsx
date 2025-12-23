
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';

interface AdSlide {
  id: number;
  title: string;
  tag: string;
  cta: string;
  gradient: string;
}

const AD_SLIDES: AdSlide[] = [
  {
    id: 1,
    title: "Entrega Grátis na primeira compra!",
    tag: "PROMO",
    cta: "Aproveitar",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
  },
  {
    id: 2,
    title: "Cartão EcoFeira: 5% de cashback",
    tag: "NOVIDADE",
    cta: "Saiba mais",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
  },
  {
    id: 3,
    title: "Produtos Orgânicos com 20% OFF",
    tag: "OFERTA",
    cta: "Ver mais",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
  }
];

interface InlineAdBannerProps {
  layout: 'grid' | 'list';
}

const InlineAdBanner: React.FC<InlineAdBannerProps> = ({ layout }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === AD_SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === 0 ? AD_SLIDES.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => nextSlide(), 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = AD_SLIDES[current];

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
        <div style={{ 
          flex: 1, 
          padding: '16px 24px', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>{slide.tag}</span>
            <Megaphone size={12} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{slide.title}</h4>
        </div>

        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button onClick={prevSlide} className="ad-nav-btn"><ChevronLeft size={16} /></button>
             <button onClick={nextSlide} className="ad-nav-btn"><ChevronRight size={16} /></button>
          </div>
          <button className="btn" style={{ background: 'white', color: '#0f172a', padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
            {slide.cta}
          </button>
        </div>
        
        {/* Background Decoration */}
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }}>
            <Megaphone size={120} strokeWidth={1} />
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
      <div style={{ padding: '24px', flex: 1, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', opacity: 0.8 }}>
           <Megaphone size={32} style={{ margin: '0 auto' }} />
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '4px', alignSelf: 'center', marginBottom: '12px' }}>{slide.tag}</span>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>{slide.title}</h4>
        
        <button className="btn" style={{ background: 'white', color: '#0f172a', padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, alignSelf: 'center' }}>
          {slide.cta}
        </button>
      </div>

      <div style={{ 
        padding: '12px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevSlide} className="ad-nav-btn"><ChevronLeft size={16} /></button>
          <button onClick={nextSlide} className="ad-nav-btn"><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {AD_SLIDES.map((_, idx) => (
            <div key={idx} style={{ width: current === idx ? '16px' : '4px', height: '4px', background: 'white', opacity: current === idx ? 1 : 0.4, borderRadius: '2px', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineAdBanner;
