
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Maximize2 } from 'lucide-react';
import { Store } from '../types';

interface StoreFlyerProps {
  store: Store;
}

const StoreFlyer: React.FC<StoreFlyerProps> = ({ store }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6; 

  const flyerSrc = useMemo(() => {
    if (!store.flyerUrl) return "";
    
    // Check if it's a Google Slides URL to apply slide parameters
    if (store.flyerUrl.includes('docs.google.com/presentation')) {
      const connector = store.flyerUrl.includes('?') ? '&' : '?';
      // rm=minimal hides the Google Slides bottom bar
      return `${store.flyerUrl}${connector}rm=minimal&slide=id.p${currentSlide}`;
    }
    
    // For other links like the Netlify one, we return it directly
    // If the Netlify app supports slide params, we could append them, but standard iframes don't.
    // However, keeping the logic for generic iframes:
    return store.flyerUrl;
  }, [store.flyerUrl, currentSlide]);

  if (!store.flyerUrl) return null;

  const isGoogleSlides = store.flyerUrl.includes('docs.google.com/presentation');

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= totalSlides ? 1 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 1 ? totalSlides : prev - 1));
  };

  return (
    <div className="flyer-container animate" style={{
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-lg)',
      marginBottom: '32px',
      width: '100%',
      maxWidth: '840px',
      margin: '0 auto 40px auto'
    }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div className="flex items-center gap-3">
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2px' }}>
              Panfleto Digital Interactiva
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {store.name} • Ofertas exclusivas
            </p>
          </div>
        </div>

        {isGoogleSlides && (
          <div className="flex items-center gap-2">
            <button 
              onClick={prevSlide}
              className="btn btn-ghost" 
              style={{ padding: '8px', borderRadius: '10px', minWidth: '40px' }}
              title="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div style={{
              background: 'var(--bg)',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--primary)',
              minWidth: '70px',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              {currentSlide} / {totalSlides}
            </div>

            <button 
              onClick={nextSlide}
              className="btn btn-ghost" 
              style={{ padding: '8px', borderRadius: '10px', minWidth: '40px' }}
              title="Próximo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        
        {!isGoogleSlides && (
           <a href={store.flyerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem' }}>
             <Maximize2 size={14} /> Abrir em nova aba
           </a>
        )}
      </div>

      <div className="flyer-iframe-wrapper" style={{
        position: 'relative',
        width: '100%',
        paddingTop: '141.6%', /* Aspect ratio for A4ish vertical content (1125/794) */
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#f8fafc',
        border: '1px solid var(--border)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <iframe 
          key={isGoogleSlides ? currentSlide : 'static-iframe'} 
          src={flyerSrc} 
          frameBorder="0" 
          width="100%" 
          height="100%" 
          allowFullScreen={true}
          // scrolling="no" helps remove scrollbars on some browsers for simple content
          // @ts-ignore
          scrolling="no"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            border: 'none',
            outline: 'none'
          }}
          title={`Panfleto Virtual - ${store.name}`}
        ></iframe>
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }}></div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {isGoogleSlides ? 'Navegue pelas páginas usando as setas superiores.' : 'Role o conteúdo para ver todas as ofertas.'}
        </p>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }}></div>
      </div>

      <style>{`
        .flyer-iframe-wrapper iframe::-webkit-scrollbar {
          display: none;
        }
        .flyer-iframe-wrapper iframe {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          .flyer-container {
            padding: 12px;
            border-radius: 16px;
          }
          .flyer-iframe-wrapper {
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default StoreFlyer;
