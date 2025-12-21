import React, { useMemo } from 'react';
import { CartItem, CartOptimization } from '../types';
import { MOCK_STORES, STORE_PRICING_FACTORS } from '../constants';
import { TrendingDown, MapPin } from 'lucide-react';

interface CartOptimizerProps {
  cart: CartItem[];
}

const CartOptimizer: React.FC<CartOptimizerProps> = ({ cart }) => {
  
  const optimizedData: CartOptimization[] = useMemo(() => {
    if (cart.length === 0) return [];

    return MOCK_STORES.map(store => {
      let total = 0;
      let missingCount = 0;
      const storeItems: CartItem[] = [];

      const targetStoreFactor = STORE_PRICING_FACTORS[store.id] || 1.0;

      cart.forEach(item => {
         const sourceStoreFactor = STORE_PRICING_FACTORS[item.storeId] || 1.0;
         const estimatedBasePrice = item.price / sourceStoreFactor;
         const estimatedPrice = estimatedBasePrice * targetStoreFactor;

         total += estimatedPrice * item.quantity;
         storeItems.push({ ...item, price: estimatedPrice, storeName: store.name, storeId: store.id });
      });

      return {
        storeId: store.id,
        storeName: store.name,
        totalPrice: total,
        missingItems: missingCount,
        items: storeItems
      };
    }).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [cart]);

  if (cart.length === 0) return null;

  const bestOption = optimizedData[0];
  const worstOption = optimizedData[optimizedData.length - 1];

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '8px', opacity: 0.9 }}>
          <TrendingDown size={24} />
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Melhor Opção de Compra</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.8, marginBottom: '4px' }}>Comprando tudo no:</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
               {bestOption.storeName}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Estimado</p>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>R$ {bestOption.totalPrice.toFixed(2)}</p>
          </div>
        </div>
        
        {optimizedData.length > 1 && (
             <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                <p>Economia de <span style={{ fontWeight: 800, color: '#fcd34d' }}>R$ {(worstOption.totalPrice - bestOption.totalPrice).toFixed(2)}</span> comparado ao mais caro.</p>
             </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginLeft: '4px' }}>Comparativo por Mercado</h4>
        {optimizedData.map((opt, idx) => (
          <div key={opt.storeId} style={{ 
            position: 'relative', 
            padding: '16px', 
            borderRadius: '16px', 
            border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: idx === 0 ? 'var(--primary-light)' : 'var(--card-bg)',
            color: idx === 0 && document.body.getAttribute('data-theme') !== 'dark' ? '#065f46' : 'inherit',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '16px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                    Mais Barato
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      background: 'var(--bg)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                        {MOCK_STORES.find(s => s.id === opt.storeId)?.logo}
                    </div>
                    <div>
                        <h5 style={{ fontWeight: 700 }}>{opt.storeName}</h5>
                        <div className="flex items-center gap-1" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                             <MapPin size={12} />
                             {MOCK_STORES.find(s => s.id === opt.storeId)?.distance}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>R$ {opt.totalPrice.toFixed(2)}</div>
                    {idx !== 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                            + R$ {(opt.totalPrice - bestOption.totalPrice).toFixed(2)}
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartOptimizer;