
import React, { useState, useEffect } from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket, Tag, Check, Heart, Scale, Clock } from 'lucide-react';
import { MOCK_STORES } from '../constants';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
  onStoreClick?: (storeId: string) => void;
  layout?: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: (product: ProductOffer) => void;
  isComparing?: boolean;
  onToggleCompare?: (product: ProductOffer) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAdd, 
  onStoreClick, 
  layout = 'grid',
  isFavorite = false,
  onToggleFavorite,
  isComparing = false,
  onToggleCompare
}) => {
  const [added, setAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const savings = product.originalPrice - product.price;
  const discountPercent = Math.round((savings / product.originalPrice) * 100);

  const storeInfo = MOCK_STORES.find(s => s.id === product.storeId);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(product);
    }
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStoreClick) {
      onStoreClick(product.storeId);
    }
  };

  const renderLogo = (logo: string | undefined, size: string = '24px') => {
    if (!logo) return null;
    if (logo.startsWith('http')) {
      return <img src={logo} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
    }
    return <span style={{ fontSize: '1.2rem' }}>{logo}</span>;
  };

  if (layout === 'list') {
    return (
      <div className="card animate" style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: isMobile ? '12px' : '16px 20px', 
        gap: isMobile ? '12px' : '20px',
        width: '100%',
        minHeight: isMobile ? '80px' : '100px',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'space-between',
        flexWrap: 'nowrap'
      }}>
        {product.isPromo && (
          <div style={{
            position: 'absolute',
            top: isMobile ? '-8px' : '-10px',
            left: isMobile ? '12px' : '20px',
            background: 'var(--danger)',
            color: 'white',
            padding: isMobile ? '2px 8px' : '4px 10px',
            borderRadius: '6px',
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            fontWeight: 800,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}>
            {discountPercent}% OFF
          </div>
        )}

        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 15 }}>
          {!isMobile && (
            <button 
              onClick={handleToggleCompare}
              data-tooltip={isComparing ? "Remover da comparação" : "Comparar produto"}
              style={{
                background: isComparing ? 'var(--primary-light)' : 'var(--card-bg)',
                border: `1px solid ${isComparing ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isComparing ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Scale size={12} />
            </button>
          )}
          <button 
            onClick={handleToggleFavorite}
            data-tooltip={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: isMobile ? '24px' : '28px',
              height: isMobile ? '24px' : '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavorite ? '#f43f5e' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Heart size={isMobile ? 12 : 14} fill={isFavorite ? '#f43f5e' : 'none'} />
          </button>
        </div>

        <div style={{
          background: 'var(--bg)',
          width: isMobile ? '50px' : '70px',
          height: isMobile ? '50px' : '70px',
          borderRadius: isMobile ? '10px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--border)'
        }}>
          <ShoppingBasket size={isMobile ? 24 : 32} style={{opacity: 0.2, color: 'var(--primary)'}} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '6px', minWidth: 0 }}>
          <div style={{ overflow: 'hidden' }}>
            <span style={{
              fontSize: '0.55rem', 
              background: '#d1fae5', 
              color: '#059669', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              marginBottom: '2px',
              display: 'inline-block'
            }}>
              {product.category}
            </span>
            <h4 style={{
              fontWeight: 700, 
              fontSize: isMobile ? '0.85rem' : '1rem', 
              lineHeight: 1.2,
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {product.name}
            </h4>
          </div>

          <div 
            onClick={handleStoreClick}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: 'fit-content' }}
            className="store-link"
          >
             <div style={{ 
               width: isMobile ? '18px' : '24px', 
               height: isMobile ? '18px' : '24px', 
               background: 'white', 
               border: '1px solid var(--border)', 
               borderRadius: '4px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               padding: '2px'
             }}>
               {renderLogo(storeInfo?.logo, isMobile ? '12px' : '16px')}
             </div>
             <span style={{ fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{product.storeName}</span>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '24px', 
          paddingLeft: isMobile ? '8px' : '20px', 
          borderLeft: isMobile ? 'none' : '1px solid var(--border)',
          flexShrink: 0
        }}>
          <div style={{ textAlign: 'right', minWidth: isMobile ? '60px' : '90px' }}>
            {product.isPromo && (
               <span style={{fontSize: isMobile ? '0.65rem' : '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7, display: 'block'}}>
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
               </span>
            )}
            <span style={{
              fontSize: isMobile ? '0.95rem' : '1.25rem', 
              fontWeight: 800, 
              color: product.isPromo ? 'var(--danger)' : 'var(--primary)',
              display: 'block'
            }}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.updatedAt && (
              <div style={{ 
                fontSize: '0.6rem', 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                gap: '3px',
                marginTop: '2px',
                fontWeight: 600
              }}>
                <Clock size={10} />
                {product.updatedAt}
              </div>
            )}
          </div>

          <button 
            className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
            data-tooltip={added ? "Adicionado" : "Adicionar à lista"}
            style={{
              padding: '0', 
              borderRadius: isMobile ? '8px' : '12px',
              background: added ? 'var(--primary)' : '#10b981',
              width: isMobile ? '36px' : '44px',
              height: isMobile ? '36px' : '44px',
              minWidth: isMobile ? '36px' : '44px',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.3s ease'
            }} 
            onClick={handleAdd}
            disabled={added}
          >
            {added ? <Check size={isMobile ? 18 : 22} className="animate-pop" /> : <Plus size={isMobile ? 18 : 22} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate" style={{ position: 'relative' }}>
      {product.isPromo && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'var(--danger)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.65rem',
          fontWeight: 800,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Tag size={10} /> {discountPercent}% OFF
        </div>
      )}

      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 5 }}>
        <button 
          onClick={handleToggleCompare}
          data-tooltip={isComparing ? "Remover da comparação" : "Comparar produto"}
          style={{
            background: isComparing ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.9)',
            border: isComparing ? '1px solid var(--primary)' : 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: isComparing ? 'var(--primary)' : '#64748b',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          className="compare-btn"
        >
          <Scale size={16} />
        </button>
        <button 
          onClick={handleToggleFavorite}
          data-tooltip={isFavorite ? "Remover dos favoritos" : "Favoritar"}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: isFavorite ? '#f43f5e' : '#64748b',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          className="favorite-btn"
        >
          <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} />
        </button>
      </div>

      <div className="product-card-image" style={{
        background: 'var(--bg)',
        height: '140px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        <ShoppingBasket size={48} className="placeholder-icon" style={{opacity: 0.1, color: 'var(--primary)'}} />
      </div>
      
      <div style={{ padding: '0 2px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-between items-start" style={{ gap: '12px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontWeight: 700, 
              fontSize: '0.9rem', 
              marginBottom: '6px', 
              lineHeight: 1.2, 
              minHeight: '2.4em', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden'
            }}>
              {product.name}
            </h4>
            <div className="flex gap-2 items-center">
               <span style={{fontSize: '0.6rem', background: '#d1fae5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase'}}>{product.category}</span>
            </div>
          </div>

          <div 
            onClick={handleStoreClick}
            data-tooltip={`Ver mais em ${product.storeName}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            className="store-link"
          >
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {renderLogo(storeInfo?.logo, '24px')}
            </div>
            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{product.storeName}</span>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          {product.isPromo && (
            <div style={{ marginBottom: '2px' }}>
              <span style={{fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7}}>
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-end">
            <div>
              <span style={{fontSize: '1.2rem', fontWeight: 800, color: product.isPromo ? 'var(--danger)' : 'var(--text-main)'}}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.updatedAt && (
                <div style={{ 
                  fontSize: '0.62rem', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '3px',
                  marginTop: '1px',
                  fontWeight: 600
                }}>
                  <Clock size={10} />
                  {product.updatedAt}
                </div>
              )}
            </div>
            <button 
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
              data-tooltip={added ? "Adicionado" : "Adicionar à lista"}
              style={{
                padding: '0', 
                borderRadius: '10px',
                minWidth: '38px',
                height: '38px',
                justifyContent: 'center',
                background: added ? 'var(--primary)' : '#10b981',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} 
              onClick={handleAdd}
              disabled={added}
            >
              {added ? <Check size={20} className="animate-pop" /> : <Plus size={20} />}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .store-link:hover span {
          color: var(--primary) !important;
        }
        .store-link:hover div {
          border-color: var(--primary) !important;
          transform: scale(1.05);
        }
        .favorite-btn:hover, .compare-btn:hover {
          transform: scale(1.1);
          background: white !important;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;