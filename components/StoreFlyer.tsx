
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Store } from '../types';

interface StoreFlyerProps {
  store: Store;
}

const StoreFlyer: React.FC<StoreFlyerProps> = ({ store }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6; // Limite definido conforme solicitado anteriormente ou padrão razoável

  const flyerSrc = useMemo(() => {
    if (!store.flyerUrl) return "";
    // O parâmetro 'slide=id.p[N]' permite navegar para slides específicos no Google Slides
    const connector = store.flyerUrl.includes('?') ? '&' : '?';
    return `${store.flyerUrl}${connector}slide=id.p${currentSlide}`;
  }, [store.flyerUrl, currentSlide]);

  if (!store.flyerUrl) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= totalSlides ? 1 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 1 ? totalSlides : prev - 1));
  };

  return (
    <div className="animate" style={{
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '40px'
    }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-3">
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: '10px'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>Panfleto Virtual</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ofertas exclusivas de {store.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            className="btn btn-ghost" 
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            title="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{
            background: 'var(--bg)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--primary)',
            minWidth: '60px',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            {currentSlide} / {totalSlides}
          </div>

          <button 
            onClick={nextSlide}
            className="btn btn-ghost" 
            style={{ padding: '8px 12px', borderRadius: '10px' }}
            title="Próximo"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '141.6%', // Proporção aproximada de uma folha A4 (1125 / 794)
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f1f5f9',
        border: '1px solid var(--border)'
      }}>
        <iframe 
          key={currentSlide} // Key forçada para garantir que o iframe recarregue ao mudar de slide
          src={flyerSrc} 
          frameBorder="0" 
          width="100%" 
          height="100%" 
          allowFullScreen={true}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        ></iframe>
      </div>
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Dica: Use os botões acima para folhear o panfleto.
        </p>
      </div>
    </div>
  );
};

export default StoreFlyer;
