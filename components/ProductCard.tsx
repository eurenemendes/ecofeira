
import React, { useState } from 'react';
import { ProductOffer } from '../types';
import { Plus, ShoppingBasket, Tag, Check } from 'lucide-react';
import { MOCK_STORES } from '../constants';

interface ProductCardProps {
  product: ProductOffer;
  onAdd: (product: ProductOffer) => void;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, layout = 'grid' }) => {
  const [added, setAdded] = useState(false);
  const savings = product.originalPrice - product.price;
  const discountPercent = Math.round((savings / product.originalPrice) * 100);

  const storeInfo = MOCK_STORES.find(s => s.id === product.storeId);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
        padding: '12px', 
        gap: '12px',
        minHeight: '110px',
        position: 'relative',
        overflow: 'visible'
      }}>
        {product.isPromo && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '12px',
            background: 'var(--danger)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.65rem',
            fontWeight: 800,
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {discountPercent}% OFF
          </div>
        )}

        <div style={{
          background: 'var(--bg)',
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShoppingBasket size={28} style={{opacity: 0.1, color: 'var(--primary)'}} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h4 style={{
              fontWeight: 700, 
              fontSize: '0.85rem', 
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.name}
            </h4>
            <div>
              <span style={{
                fontSize: '0.55rem', 
                background: '#d1fae5', 
                color: '#059669', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontWeight: 800, 
                textTransform: 'uppercase'
              }}>
                {product.category}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
             <div style={{ 
               width: '28px', 
               height: '28px', 
               background: 'var(--card-bg)', 
               border: '1px solid var(--border)', 
               borderRadius: '6px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               padding: '2px',
               boxShadow: 'var(--shadow-sm)'
             }}>
               {renderLogo(storeInfo?.logo, '18px')}
             </div>
             <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{product.storeName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '70px' }}>
          <div style={{ textAlign: 'right' }}>
            {product.isPromo && (
               <span style={{fontSize: '0.65rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7, display: 'block'}}>
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
               </span>
            )}
            <span style={{
              fontSize: '1rem', 
              fontWeight: 800, 
              color: product.isPromo ? 'var(--danger)' : 'var(--text-main)',
              display: 'block'
            }}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button 
            className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
            style={{
              padding: '0', 
              borderRadius: '10px',
              background: added ? 'var(--primary)' : '#10b981',
              width: '36px',
              height: '36px',
              minWidth: '36px',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }} 
            onClick={handleAdd}
            disabled={added}
          >
            {added ? <Check size={18} className="animate-pop" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
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

      <div className="product-card-image" style={{
        background: 'var(--bg)',
        height: '120px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <ShoppingBasket size={48} className="placeholder-icon" style={{opacity: 0.1, color: 'var(--primary)'}} />
      </div>
      
      <div style={{ padding: '0 2px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-between items-start" style={{ gap: '12px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontWeight: 700, 
              fontSize: '0.85rem', 
              marginBottom: '4px', 
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
               <span style={{fontSize: '0.55rem', background: '#d1fae5', color: '#059669', padding: '2px 5px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase'}}>{product.category}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {renderLogo(storeInfo?.logo, '28px')}
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>{product.storeName}</span>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          {product.isPromo && (
            <div style={{ marginBottom: '2px' }}>
              <span style={{fontSize: '0.7rem', textDecoration: 'line-through', color: 'var(--text-muted)', opacity: 0.7}}>
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
              <span style={{fontSize: '1.1rem', fontWeight: 800, color: product.isPromo ? 'var(--danger)' : 'var(--text-main)'}}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`} 
              style={{
                padding: '6px', 
                borderRadius: '10px',
                minWidth: '36px',
                height: '36px',
                justifyContent: 'center',
                background: added ? 'var(--primary)' : '#10b981',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} 
              onClick={handleAdd}
              disabled={added}
            >
              {added ? <Check size={18} className="animate-pop" /> : <Plus size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
