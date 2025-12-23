
import { Store } from './types';

export const MOCK_STORES: Store[] = [
  {
    id: 'store_bh',
    name: 'Supermercados BH',
    color: 'bg-red-500',
    logo: '🍎',
    distance: '1.2 km'
  },
  {
    id: 'store_carrefour',
    name: 'Carrefour',
    color: 'bg-blue-600',
    logo: '🛒',
    distance: '0.5 km'
  },
  {
    id: 'store_extra',
    name: 'Extra',
    color: 'bg-red-600',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOf-t-njVAeC0v0M2Xy5e4Kn9QND636ytb9A&s',
    distance: '2.0 km'
  },
  {
    id: 'store_pao',
    name: 'Pão de Açúcar',
    color: 'bg-green-700',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL5Wc0BCEz604XzlbPWbs0eWwVhRErL_Rbbg&s',
    distance: '1.5 km',
    flyerUrl: 'https://iframesb.netlify.app/'
  },
  {
    id: 'store_borges',
    name: 'Borges',
    color: 'bg-blue-800',
    logo: '🏗️',
    distance: '3.2 km',
    flyerUrl: 'https://iframesb.netlify.app/'
  }
];

export const STORE_PRICING_FACTORS: Record<string, number> = {
  'store_bh': 0.95,
  'store_carrefour': 1.0,
  'store_extra': 1.05,
  'store_pao': 1.15,
  'store_borges': 0.90
};

export const RAW_PRODUCTS = [
  { id: 1, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 24.90, promocao: true, preco_promocional: 19.90, supermercado: "Supermercados BH" },
  { id: 2, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 5.49, promocao: false, preco_promocional: null, supermercado: "Carrefour" },
  { id: 3, produto: "Café em Pó 500g", categoria: "Mercearia", preco_normal: 18.90, promocao: true, preco_promocional: 15.90, supermercado: "Extra" },
  { id: 4, produto: "Azeite de Oliva Extra Virgem 500ml", categoria: "Mercearia", preco_normal: 32.90, promocao: true, preco_promocional: 27.90, supermercado: "Pão de Açúcar" },
  { id: 6, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 22.90, promocao: true, preco_promocional: 18.90, supermercado: "Supermercados BH" },
  { id: 7, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 29.90, promocao: false, preco_promocional: null, supermercado: "Carrefour" },
  { id: 8, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 8.90, promocao: true, preco_promocional: 6.90, supermercado: "Extra" },
  { id: 9, produto: "Açúcar Cristal 1kg", categoria: "Mercearia", preco_normal: 5.60, promocao: true, preco_promocional: 3.99, supermercado: "Borges" },
  { id: 10, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 16.90, promocao: true, preco_promocional: 13.90, supermercado: "Pão de Açúcar" },
  { id: 11, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 4.90, promocao: true, preco_promocional: 3.50, supermercado: "Supermercados BH" },
  { id: 12, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 3.90, promocao: false, preco_promocional: null, supermercado: "Carrefour" },
  { id: 13, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 5.90, promocao: true, preco_promocional: 4.50, supermercado: "Extra" },
  { id: 15, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 14.90, promocao: true, preco_promocional: 11.90, supermercado: "Pão de Açúcar" },
  { id: 16, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 9.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH" },
  { id: 17, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 8.90, promocao: true, preco_promocional: 6.90, supermercado: "Carrefour" },
  { id: 18, produto: "Biscoito Recheado 140g", categoria: "Mercearia", preco_normal: 3.90, promocao: false, preco_promocional: null, supermercado: "Extra" },
  { id: 20, produto: "Carne Moída Especial Kg", categoria: "Carnes e Aves", preco_normal: 32.90, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar" },
  { id: 21, produto: "Açúcar Cristal 1kg", categoria: "Mercearia", preco_normal: 4.90, promocao: true, preco_promocional: 3.90, supermercado: "Supermercados BH" },
  { id: 22, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 18.90, promocao: false, preco_promocional: null, supermercado: "Carrefour" },
  { id: 23, produto: "Maionese 500g", categoria: "Mercearia", preco_normal: 9.90, promocao: true, preco_promocional: 7.90, supermercado: "Extra" },
  { id: 25, produto: "Manteiga com Sal 200g", categoria: "Laticínios", preco_normal: 12.90, promocao: true, preco_promocional: 9.90, supermercado: "Pão de Açúcar" },
  { id: 26, produto: "Farinha de Trigo 1kg", categoria: "Mercearia", preco_normal: 6.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH" },
  { id: 27, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 2.90, promocao: true, preco_promocional: 1.90, supermercado: "Carrefour" },
  { id: 28, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 9.90, promocao: false, preco_promocional: null, supermercado: "Extra" },
  { id: 30, produto: "Linguiça Toscana Kg", categoria: "Carnes e Aves", preco_normal: 28.90, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar" }
];

export const INITIAL_SUGGESTIONS = [
  "Arroz",
  "Feijão",
  "Leite",
  "Carnes",
  "Limpeza",
  "Promoções"
];
