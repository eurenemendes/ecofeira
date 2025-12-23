
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Ofertas da Semana",
    description: "Economize até 40% em produtos de hortifruti nos mercados parceiros.",
    buttonText: "Ver Ofertas",
    link: "#",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  {
    id: 2,
    title: "Otimize seu Carrinho",
    description: "Nossa nova IA ajuda você a encontrar a combinação mais barata de lojas.",
    buttonText: "Testar Agora",
    link: "#",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
  },
  {
    id: 3,
    title: "Clube EcoFeira",
    description: "Cadastre-se e receba alertas de preços baixos direto no seu e-mail.",
    buttonText: "Cadastrar",
    link: "#",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
  }
];

const BannerCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div 
      className="carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '30px',
        boxShadow: 'var(--shadow-lg)',
        userSelect: 'none'
      }}
    >
      <div 
        style={{
          display: 'flex',
          width: `${SLIDES.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(current * 100) / SLIDES.length}%)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {SLIDES.map((slide) => (
          <div 
            key={slide.id}
            style={{
              width: `${100 / SLIDES.length}%`,
              height: '100%',
              background: slide.gradient,
              padding: '30px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
              position: 'relative'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{slide.title}</h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '70%', marginBottom: '20px', lineHeight: 1.4 }}>
              {slide.description}
            </p>
            <a 
              href={slide.link}
              className="btn"
              style={{
                background: 'white',
                color: 'var(--text-main)',
                width: 'fit-content',
                padding: '8px 20px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              {slide.buttonText} <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="carousel-control"
        style={{ left: '15px' }}
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="carousel-control"
        style={{ right: '15px' }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px'
      }}>
        {SLIDES.map((_, idx) => (
          <div 
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: current === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '10px',
              background: 'white',
              opacity: current === idx ? 1 : 0.5,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      <style>{`
        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0;
        }
        .carousel-container:hover .carousel-control {
          opacity: 1;
        }
        .carousel-control:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        @media (max-width: 640px) {
          .carousel-container { height: 220px !important; }
          .carousel-container div[style*="padding: 30px 60px"] {
             padding: 20px 40px !important;
          }
          .carousel-container p { maxWidth: 100% !important; }
          .carousel-control { opacity: 0.6; width: 32px; height: 32px; }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
