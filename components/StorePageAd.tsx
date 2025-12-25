
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Store, Sparkles, Megaphone } from 'lucide-react';
import { BANNER_STORE_PAGE_DURATION, BANNER_STORE_PAGE_SHUFFLE } from '../constants';

interface StoreAd {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  tag: string;
  gradient: string;
  imageUrl?: string;
}

const STORE_ADS: StoreAd[] = [
  {
    id: 1,
    title: "Seja um Parceiro EcoFeira",
    subtitle: "Aumente suas vendas e alcance mais clientes na sua região com nossa plataforma.",
    cta: "Cadastrar Loja",
    tag: "NEGÓCIOS",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Destaque sua Marca Aqui",
    subtitle: "Milhares de usuários comparam preços todos os dias. Sua loja merece estar no topo.",
    cta: "Saber Mais",
    tag: "PROMOÇÃO",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Relatórios de Inteligência",
    subtitle: "Entenda o comportamento do consumidor e ajuste seus preços de forma estratégica.",
    cta: "Ver Planos",
    tag: "DADOS",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
  }
];

const StorePageAd: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const slides = useMemo(() => {
    if (BANNER_STORE_PAGE_SHUFFLE) {
      return [...STORE_ADS].sort(() => Math.random() - 0.5);
    }
    return STORE_ADS;
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, BANNER_STORE_PAGE_DURATION);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[current];

  return (
    <div className="card store-ad-card animate" style={{
      padding: '0',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      minHeight: '320px',
      border: 'none',
      background: slide.gradient,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {slide.imageUrl && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${slide.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          opacity: 0.4
        }} />
      )}

      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', backdropFilter: 'blur(8px)' }}>
          <Megaphone size={32} />
        </div>
        
        <span style={{ 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          background: 'rgba(255,255,255,0.2)', 
          padding: '4px 12px', 
          borderRadius: '6px', 
          marginBottom: '12px',
          backdropFilter: 'blur(4px)',
          letterSpacing: '0.05em'
        }}>
          {slide.tag}
        </span>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>{slide.title}</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4, marginBottom: '24px', maxWidth: '240px' }}>{slide.subtitle}</p>
        
        <button className="btn" style={{ 
          background: 'white', 
          color: '#0f172a', 
          padding: '12px 24px', 
          borderRadius: '14px', 
          fontWeight: 800,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          {slide.cta}
        </button>
      </div>

      <div style={{
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevSlide} className="ad-nav-btn"><ChevronLeft size={16} /></button>
          <button onClick={nextSlide} className="ad-nav-btn"><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {slides.map((_, idx) => (
            <div key={idx} style={{ 
              width: current === idx ? '16px' : '4px', 
              height: '4px', 
              background: 'white', 
              opacity: current === idx ? 1 : 0.4, 
              borderRadius: '2px', 
              transition: 'all 0.3s' 
            }} />
          ))}
        </div>
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
};

export default StorePageAd;
