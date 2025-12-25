
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Play, CloudSun } from 'lucide-react';
import { BANNER_HOME_DURATION, BANNER_HOME_SHUFFLE } from '../constants';

interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText?: string;
  link?: string;
  gradient?: string;
  imageUrl?: string;
  videoEmbedUrl?: string;
  isWeather?: boolean;
}

const SLIDES_DATA: Slide[] = [
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
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ",
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
  },
  {
    id: 4,
    title: "Clima em Belo Jardim",
    description: "Planeje suas compras com a previsão do tempo local em tempo real.",
    isWeather: true,
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)"
  }
];

const BannerCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo(() => {
    if (BANNER_HOME_SHUFFLE) {
      const weatherSlide = SLIDES_DATA.find(s => s.isWeather);
      const otherSlides = SLIDES_DATA.filter(s => !s.isWeather).sort(() => Math.random() - 0.5);
      return [...otherSlides, weatherSlide!].sort(() => Math.random() - 0.5);
    }
    return SLIDES_DATA;
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, BANNER_HOME_DURATION);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Weather Widget Script Injection
  useEffect(() => {
    const id = 'weatherwidget-io-js';
    if (!document.getElementById(id)) {
      const js = document.createElement('script');
      js.id = id;
      js.src = 'https://weatherwidget.io/js/widget.min.js';
      document.body.appendChild(js);
    }
    
    if (slides[current]?.isWeather && (window as any).__weatherwidget_init) {
      (window as any).__weatherwidget_init();
    }
  }, [current, slides]);

  return (
    <div 
      className="carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '32px',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.15)',
        userSelect: 'none'
      }}
    >
      <div 
        style={{
          display: 'flex',
          width: `${slides.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(current * 100) / slides.length}%)`,
          transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            style={{
              width: `${100 / slides.length}%`,
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
            {/* Background Image/Video */}
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
                zIndex: 1,
                opacity: 0.6
              }} />
            )}

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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)', opacity: 0.5 }}
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
              background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
              zIndex: 2,
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {/* Key ensures animation restarts on slide change */}
              <div key={current === index ? `active-${current}` : `inactive-${index}`} className={current === index ? "animate-pop" : ""} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {slide.videoEmbedUrl && <div className="play-icon-pulse"><Play size={20} fill="white" /></div>}
                  {slide.isWeather && <CloudSun size={32} className="weather-icon-pulse" />}
                  <h3 style={{ fontSize: '2.8rem', fontWeight: 900, textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>{slide.title}</h3>
                </div>
                
                <p style={{ fontSize: '1.2rem', opacity: 0.95, maxWidth: '550px', marginBottom: '32px', lineHeight: 1.5, fontWeight: 500 }}>
                  {slide.description}
                </p>

                {slide.isWeather ? (
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '800px', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    pointerEvents: 'none' // Desativa cliques em todo o container do widget
                  }}>
                    <a 
                      className="weatherwidget-io" 
                      href="https://forecast7.com/pt/n8d34n36d42/belo-jardim/" 
                      data-label_1="BELO JARDIM" 
                      data-label_2="Previsão do tempo" 
                      data-icons="Climacons Animated" 
                      data-theme="weather_one"
                      style={{ 
                        display: 'block', 
                        pointerEvents: 'none', // Garante que o link não seja clicável
                        cursor: 'default' 
                      }}
                    >
                      BELO JARDIM Previsão do tempo
                    </a>
                  </div>
                ) : slide.buttonText && (
                  <a 
                    href={slide.link}
                    className="btn btn-primary"
                    style={{
                      width: 'fit-content',
                      padding: '16px 36px',
                      borderRadius: '18px',
                      fontSize: '1rem',
                      textDecoration: 'none',
                      fontWeight: 800,
                      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                      background: 'var(--primary)',
                      color: 'white'
                    }}
                  >
                    {slide.buttonText} <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="carousel-control" style={{ left: '30px' }}><ChevronLeft size={28} /></button>
      <button onClick={nextSlide} className="carousel-control" style={{ right: '30px' }}><ChevronRight size={28} /></button>

      {/* Dots Indicator */}
      <div style={{ position: 'absolute', bottom: '30px', left: '60px', display: 'flex', gap: '10px', zIndex: 10 }}>
        {slides.map((_, idx) => (
          <div 
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: current === idx ? '40px' : '10px',
              height: '10px',
              borderRadius: '10px',
              background: 'white',
              opacity: current === idx ? 1 : 0.4,
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        ))}
      </div>

      <style>{`
        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0;
          z-index: 10;
        }
        .carousel-container:hover .carousel-control {
          opacity: 1;
        }
        .carousel-control:hover {
          background: var(--primary);
          border-color: transparent;
          transform: translateY(-50%) scale(1.1);
        }
        .play-icon-pulse {
          background: var(--primary);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          animation: pulseIcon 2s infinite;
        }
        @keyframes pulseIcon {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .weather-icon-pulse {
          animation: floatWeather 3s ease-in-out infinite;
        }
        @keyframes floatWeather {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 768px) {
          .carousel-container { height: 480px !important; }
          .carousel-container div[style*="padding: 60px"] { padding: 30px !important; }
          .carousel-container h3 { font-size: 1.8rem !important; }
          .carousel-container p { font-size: 1rem !important; max-width: 100% !important; }
          .carousel-control { display: none; }
          .carousel-container div[style*="left: 60px"] { left: 50% !important; transform: translateX(-50%) !important; }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
