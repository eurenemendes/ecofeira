
import React, { useState } from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket, Tag, Check, Heart, Scale } from 'lucide-react';
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
        padding: '16px 20px', 
        gap: '20px',
        width: '100%',
        minHeight: '100px',
        position: 'relative',
        overflow: 'visible',
        justifyContent: 'space-between'
      }}>
        {product.isPromo && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '20px',
            background: 'var(--danger)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: 800,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}>
            {discountPercent}% ECONOMIA
          </div>
        )}

        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 15 }}>
          <button 
            onClick={handleToggleCompare}
            style={{
              background: isComparing ? 'var(--primary-light)' : 'var(--card-bg)',
              border: `1px solid ${isComparing ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isComparing ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Comparar este produto"
          >
            <Scale size={14} />
          </button>
          <button 
            onClick={handleToggleFavorite}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavorite ? '#f43f5e' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Heart size={16} fill={isFavorite ? '#f43f5e' : 'none'} />
          </button>
        </div>

        <div style={{
          background: 'var(--bg)',
          width: '70px',
          height: '70px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--border)'
        }}>
          <ShoppingBasket size={32} style={{opacity: 0.2, color: 'var(--primary)'}} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <span style={{
              fontSize: '0.65rem', 
              background: '#d1fae5', 
              color: '#059669', 
              padding: '3px 8px', 
              borderRadius: '6px', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              marginBottom: '4px',
              display: 'inline-block'
            }}>
              {product.category}
            </span>
            <h4 style={{
              fontWeight: 700, 
              fontSize: '1rem', 
              lineHeight: 1.3,
              color: 'var(--text-main)'
            }}>
              {product.name}
            </h4>
          </div>

          <div 
            onClick={handleStoreClick}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'fit-content' }}
            className="store-link"
          >
             <div style={{ 
               width: '24px', 
               height: '24px', 
               background: 'white', 
               border: '1px solid var(--border)', 
               borderRadius: '6px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               padding: '2px'
             }}>
               {renderLogo(storeInfo?.logo, '16px')}
             </div>
             <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{product.storeName}</span>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px', 
          paddingLeft: '20px', 
          borderLeft: '1px solid var(--border)' 
        }}>
          <div style={{ textAlign: 'right', minWidth: '100px' }}>
            {product.isPromo && (
               <span style={{fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7, display: 'block'}}>
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
               </span>
            )}
            <span style={{
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: product.isPromo ? 'var(--danger)' : 'var(--primary)',
              display: 'block'
            }}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button 
            className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
            style={{
              padding: '0', 
              borderRadius: '12px',
              background: added ? 'var(--primary)' : '#10b981',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.3s ease'
            }} 
            onClick={handleAdd}
            disabled={added}
          >
            {added ? <Check size={22} className="animate-pop" /> : <Plus size={22} />}
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
          title="Comparar este produto"
        >
          <Scale size={16} />
        </button>
        <button 
          onClick={handleToggleFavorite}
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
          
          <div className="flex justify-between items-center">
            <div>
              <span style={{fontSize: '1.2rem', fontWeight: 800, color: product.isPromo ? 'var(--danger)' : 'var(--text-main)'}}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
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
