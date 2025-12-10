import { Store } from './types';

export const MOCK_STORES: Store[] = [
  {
    id: 'store_1',
    name: 'Mercado Preço Bom',
    color: 'bg-red-500',
    logo: '🍎',
    distance: '1.2 km'
  },
  {
    id: 'store_2',
    name: 'Supermercado Central',
    color: 'bg-blue-600',
    logo: '🛒',
    distance: '0.5 km'
  },
  {
    id: 'store_3',
    name: 'Hortifruti da Esquina',
    color: 'bg-green-600',
    logo: '🥦',
    distance: '2.0 km'
  }
];

export const STORE_PRICING_FACTORS: Record<string, number> = {
  'store_1': 1.0,   // Base price
  'store_2': 0.94,  // ~6% cheaper
  'store_3': 1.08   // ~8% more expensive
};

export const INITIAL_SUGGESTIONS = [
  "Arroz 5kg",
  "Feijão Carioca",
  "Leite Integral",
  "Café em Pó",
  "Azeite de Oliva",
  "Detergente",
  "Banana Prata"
];