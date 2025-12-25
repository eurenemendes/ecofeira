
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { BANNER_HOME_DURATION } from '../constants';

interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  gradient?: string;
  imageUrl?: string;
  videoEmbedUrl?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Ofertas de Hortifruti",
    description: "Frescor direto do produtor com preços imbatíveis em todos os mercados parceiros.",
    buttonText: "Ver Ofertas",
    link: "#",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  {
    id: 2,
    title: "Economia na Palma da Mão",
    description: "Assista como o EcoFeira ajuda milhares de famílias a economizar todos os meses.",
    buttonText: "Saiba Mais",
    link: "#",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ", // Exemplo de vídeo
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
  },
  {
    id: 3,
    title: "Marcas Premium com Desconto",
    description: "Vinhos, queijos e cortes especiais com selo de qualidade e economia real.",
    buttonText: "Explorar Clube",
    link: "#",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000",
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
    const interval = setInterval(nextSlide, BANNER_HOME_DURATION);
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
        height: '240px',
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
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {SLIDES.map((slide) => (
          <div 
            key={slide.id}
            style={{
              width: `${100 / SLIDES.length}%`,
              height: '100%',
              background: slide.gradient,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
              overflow: 'hidden'
            }}
          >
            {/* Background Image */}
            {slide.imageUrl && !slide.videoEmbedUrl && (
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
            )}

            {/* Background Video (Iframe) */}
            {slide.videoEmbedUrl && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                pointerEvents: 'none'
              }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={slide.videoEmbedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: 'scale(1.5)' // Zoom para garantir que cubra as bordas
                  }}
                ></iframe>
              </div>
            )}

            {/* Content Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (slide.imageUrl || slide.videoEmbedUrl) ? 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' : 'transparent',
              zIndex: 2,
              padding: '30px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div className="animate-pop">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {slide.videoEmbedUrl && <Play size={16} fill="white" />}
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{slide.title}</h3>
                </div>
                <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '60%', marginBottom: '24px', lineHeight: 1.4 }}>
                  {slide.description}
                </p>
                <a 
                  href={slide.link}
                  className="btn"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    width: 'fit-content',
                    padding: '12px 28px',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    fontWeight: 800,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {slide.buttonText} <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="carousel-control"
        style={{ left: '20px', zIndex: 10 }}
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="carousel-control"
        style={{ right: '20px', zIndex: 10 }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        {SLIDES.map((_, idx) => (
          <div 
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: current === idx ? '30px' : '8px',
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
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        .carousel-container:hover .carousel-control {
          opacity: 1;
        }
        .carousel-control:hover {
          background: var(--primary);
          transform: translateY(-50%) scale(1.1);
          border-color: transparent;
        }
        @media (max-width: 768px) {
          .carousel-container { height: 300px !important; }
          .carousel-container div[style*="padding: 30px 60px"] {
             padding: 24px !important;
          }
          .carousel-container p { maxWidth: 100% !important; font-size: 0.9rem !important; }
          .carousel-control { display: none; }
          .carousel-container h3 { font-size: 1.4rem !important; }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
