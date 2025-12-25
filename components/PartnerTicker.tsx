
import React, { useMemo } from 'react';
import { MOCK_STORES } from '../constants';

const PartnerTicker: React.FC = () => {
  // Embaralha as lojas para exibição aleatória
  const shuffledStores = useMemo(() => {
    return [...MOCK_STORES].sort(() => Math.random() - 0.5);
  }, []);

  // Triplicamos a lista para garantir que o scroll infinito não tenha gaps
  const tickerItems = [...shuffledStores, ...shuffledStores, ...shuffledStores];

  const renderLogo = (logo: string, size: string = '36px') => {
    if (logo.startsWith('http')) {
      return <img src={logo} alt="" style={{ width: size, height: size, objectFit: 'contain', borderRadius: '6px' }} />;
    }
    return <span style={{ fontSize: '1.8rem' }}>{logo}</span>;
  };

  return (
    <div className="ticker-container">
      <div className="ticker-track">
        {tickerItems.map((store, idx) => (
          <div key={`${store.id}-${idx}`} className="ticker-item">
            <div className="ticker-logo-box">
              {renderLogo(store.logo)}
            </div>
            <span className="ticker-store-name">{store.name}</span>
          </div>
        ))}
      </div>
      <style>{`
        .ticker-container {
          width: 100%;
          overflow: hidden;
          padding: 10px 0;
          margin-bottom: 30px;
          position: relative;
          /* Efeito de fade nas bordas */
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }

        .ticker-track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 50px;
          animation: scrollLeft 40s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 12px;
          user-select: none;
        }

        .ticker-logo-box {
          width: 50px;
          height: 50px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .ticker-store-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Como triplicamos, movemos um terço do tamanho total */
            transform: translateX(calc(-33.333% - 16.666px)); 
          }
        }

        @media (max-width: 768px) {
          .ticker-track {
            gap: 30px;
            animation-duration: 25s;
          }
          .ticker-container {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerTicker;
