import React, { useMemo, useState } from 'react';
import { CartItem, CartOptimization, ProductOffer } from '../types';
import { MOCK_STORES, STORE_PRICING_FACTORS, RAW_PRODUCTS } from '../constants';
import { TrendingDown, MapPin, CheckCircle2, AlertCircle, Eye, X, Plus, Trash2 } from 'lucide-react';

interface CartOptimizerProps {
  cart: CartItem[];
  onAdd: (product: ProductOffer) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

const CartOptimizer: React.FC<CartOptimizerProps> = ({ cart, onAdd, onDecrement, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const optimizedData: CartOptimization[] = useMemo(() => {
    if (cart.length === 0) return [];

    return MOCK_STORES.map(store => {
      let total = 0;
      let foundCount = 0;
      const storeItems: CartItem[] = [];

      const targetStoreFactor = STORE_PRICING_FACTORS[store.id] || 1.0;

      cart.forEach(item => {
        const dbProduct = RAW_PRODUCTS.find(p => 
          p.produto === item.name && 
          p.supermercado === store.name
        );

        let finalPrice: number;

        if (dbProduct) {
          finalPrice = dbProduct.promocao ? (dbProduct.preco_promocional || dbProduct.preco_normal) : dbProduct.preco_normal;
          foundCount++;
        } else {
          const sourceStoreFactor = STORE_PRICING_FACTORS[item.storeId] || 1.0;
          const estimatedBasePrice = item.price / sourceStoreFactor;
          finalPrice = estimatedBasePrice * targetStoreFactor;
        }

        total += finalPrice * item.quantity;
        storeItems.push({ 
          ...item, 
          price: finalPrice, 
          storeName: store.name, 
          storeId: store.id 
        });
      });

      return {
        storeId: store.id,
        storeName: store.name,
        totalPrice: total,
        missingItems: cart.length - foundCount,
        items: storeItems
      };
    }).sort((a, b) => a.totalPrice - b.totalPrice);
  }, [cart]);

  if (cart.length === 0) return null;

  const bestOption = optimizedData[0];
  const worstOption = optimizedData[optimizedData.length - 1];
  const totalCartItems = cart.length;

  return (
    <div style={{ display: 'grid', gap: '24px', width: '100%' }}>
      {/* Pop-up de Detalhes (Modal) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: 'var(--card-bg)',
            width: '100%',
            maxWidth: '540px',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>Itens em {bestOption.storeName}</h4>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {bestOption.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center" style={{ padding: '16px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>R$ {item.price.toFixed(2).replace('.', ',')} p/ un.</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3" style={{ minWidth: '160px' }}>
                    <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    <div className="flex items-center gap-2">
                       {/* Seletor de quantidade compacto */}
                       <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          border: '1px solid var(--border)', 
                          borderRadius: '8px', 
                          background: 'var(--card-bg)', 
                          overflow: 'hidden'
                        }}>
                          <button 
                            onClick={() => onDecrement(item.id)}
                            style={{ background: 'none', border: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800 }}>{item.quantity}</span>
                          <button 
                            onClick={() => onAdd(item)}
                            style={{ background: 'none', border: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => onRemove(item.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: 'var(--danger)', 
                            border: 'none', 
                            borderRadius: '8px', 
                            padding: '6px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid var(--border)', textAlign: 'right' }}>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VALOR ESTIMADO NO MERCADO</p>
               <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>R$ {bestOption.totalPrice.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card de Destaque - Banner de Melhor Opção */}
      <div style={{
        background: 'linear-gradient(135deg, #6fd4b2 0%, #4cae8d 100%)',
        borderRadius: '32px',
        padding: '32px',
        color: 'white',
        boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ícone Decorativo de Fundo */}
        <div style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1, pointerEvents: 'none' }}>
          <TrendingDown size={140} strokeWidth={1.5} />
        </div>

        <div className="flex items-center gap-2" style={{ marginBottom: '24px', opacity: 0.9 }}>
          <TrendingDown size={20} />
          <h3 style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Melhor Opção de Compra
          </h3>
        </div>
        
        <div className="flex justify-between items-start" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.85, marginBottom: '4px' }}>Economize comprando no:</p>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1, marginBottom: '16px' }}>
               {bestOption.storeName}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '0.75rem', 
                    background: 'rgba(255, 255, 255, 0.15)', 
                    padding: '6px 14px', 
                    borderRadius: '100px',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)'
                }}>
                    <CheckCircle2 size={14} /> 
                    {totalCartItems - bestOption.missingItems} de {totalCartItems} itens confirmados no banco
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    background: 'white',
                    color: '#4cae8d',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Eye size={14} /> Ver Itens
                </button>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '2px' }}>Total Estimado</p>
            <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>
              R$ {bestOption.totalPrice.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
        
        {optimizedData.length > 1 && (
             <div style={{ 
               marginTop: '32px', 
               paddingTop: '20px', 
               borderTop: '1px solid rgba(255,255,255,0.2)', 
               fontSize: '0.95rem',
               fontWeight: 500
             }}>
                Você economiza <span style={{ fontWeight: 800, color: '#fcd34d' }}>R$ {(worstOption.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')}</span> nesta escolha!
             </div>
        )}
      </div>

      {/* Seção Lista Comparativa */}
      <div style={{ display: 'grid', gap: '16px' }}>
        <h4 style={{ 
          fontWeight: 800, 
          color: 'var(--text-muted)', 
          fontSize: '1.1rem', 
          marginLeft: '4px',
          marginBottom: '4px' 
        }}>
          Comparativo por Mercado
        </h4>
        
        {optimizedData.map((opt, idx) => {
          const isBest = idx === 0;
          const storeInfo = MOCK_STORES.find(s => s.id === opt.storeId);
          
          return (
            <div key={opt.storeId} style={{ 
              position: 'relative', 
              padding: '24px', 
              borderRadius: '24px', 
              border: isBest ? '2px solid #6fd4b2' : '1px solid var(--border)',
              background: isBest ? '#f0faf6' : 'var(--card-bg)',
              boxShadow: isBest ? '0 10px 20px -5px rgba(111, 212, 178, 0.15)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {isBest && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    background: '#4cae8d',
                    color: 'white',
                    fontSize: '0.65rem',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 10px rgba(76, 174, 141, 0.3)',
                    zIndex: 2
                  }}>
                      Mais Econômico
                  </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                      {storeInfo?.logo}
                  </div>
                  <div>
                      <h5 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                        {opt.storeName}
                      </h5>
                      <div className="flex items-center gap-3">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <MapPin size={12} />
                              {storeInfo?.distance}
                          </div>
                          <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem', 
                              color: opt.missingItems === 0 ? 'var(--primary)' : 'var(--text-muted)',
                              fontWeight: opt.missingItems === 0 ? 800 : 500
                          }}>
                              {opt.missingItems === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                              {totalCartItems - opt.missingItems}/{totalCartItems} no banco
                          </div>
                      </div>
                  </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 900, 
                    fontSize: '1.4rem', 
                    color: isBest ? '#4cae8d' : 'var(--text-main)' 
                  }}>
                      R$ {opt.totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  {!isBest && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 800, marginTop: '2px' }}>
                          + R$ {(opt.totalPrice - bestOption.totalPrice).toFixed(2).replace('.', ',')}
                      </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartOptimizer;