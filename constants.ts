
import { Store } from './types';

// Configurações de Duração dos Banners (em milissegundos)
export const BANNER_HOME_DURATION = 6000; // Banner retangular principal na home
export const BANNER_AD_GRID_DURATION = 5000; // Banner quadrado entre itens (modo grade)
export const BANNER_AD_LIST_DURATION = 4000; // Banner horizontal entre itens (modo lista)
export const BANNER_STORE_PAGE_DURATION = 7000; // Banner na página de supermercados

// Configurações de Ordem Aleatória (Shuffle)
export const BANNER_HOME_SHUFFLE = true; // Define se o banner da home embaralha os slides
export const BANNER_AD_GRID_SHUFFLE = true; // Define se banners em grade embaralham slides
export const BANNER_AD_LIST_SHUFFLE = true; // Define se banners em lista embaralham slides
export const BANNER_STORE_PAGE_SHUFFLE = true; // Define se o banner da página de lojas embaralha

// DATA DE CORTE: Itens com data anterior a esta não serão exibidos
// Formato ISO: YYYY-MM-DD
export const HIDE_ITEMS_BEFORE_DATE = "2024-05-01"; 

/**
 * Helper para validar se um produto deve ser exibido com base na sua data de atualização
 * @param updatedAt string no formato "DD/MM/YYYY HH:MM"
 */
export const isProductFresh = (updatedAt?: string): boolean => {
  if (!updatedAt) return false;
  
  try {
    const [datePart, timePart] = updatedAt.split(' ');
    const [day, month, year] = datePart.split('/');
    const productDate = new Date(`${year}-${month}-${day}T${timePart || '00:00'}:00`);
    const cutoffDate = new Date(`${HIDE_ITEMS_BEFORE_DATE}T00:00:00`);
    
    return productDate >= cutoffDate;
  } catch (e) {
    return false;
  }
};

export const MOCK_STORES: Store[] = [
  {
    id: 'store_bh',
    name: 'Supermercados BH',
    color: 'bg-red-500',
    logo: '🍎',
    distance: '1.2 km',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      reference: 'Próximo à Praça da Matriz'
    }
  },
  {
    id: 'store_carrefour',
    name: 'Carrefour',
    color: 'bg-blue-600',
    logo: '🛒',
    distance: '0.5 km',
    address: {
      street: 'Av. Brasil',
      number: '4500',
      neighborhood: 'Jardim América',
      reference: 'Ao lado do Terminal Rodoviário'
    }
  },
  {
    id: 'store_extra',
    name: 'Extra',
    color: 'bg-red-600',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOf-t-njVAeC0v0M2Xy5e4Kn9QND636ytb9A&s',
    distance: '2.0 km',
    address: {
      street: 'Rua Amazonas',
      number: '88',
      neighborhood: 'Savassi',
      reference: 'Em frente ao Shopping'
    }
  },
  {
    id: 'store_pao',
    name: 'Pão de Açúcar',
    color: 'bg-green-700',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL5Wc0BCEz604XzlbPWbs0eWwVhRErL_Rbbg&s',
    distance: '1.5 km',
    address: {
      street: 'Alameda dos Anjos',
      number: '10',
      neighborhood: 'Lourdes',
      reference: 'Esquina com Rua da Paz'
    },
    flyerUrl: 'https://iframesb.netlify.app/'
  },
  {
    id: 'store_borges',
    name: 'Borges',
    color: 'bg-blue-800',
    logo: '🏗️',
    distance: '3.2 km',
    address: {
      street: 'Rua das Palmeiras',
      number: '777',
      neighborhood: 'Funcionários',
      reference: 'Atrás do Hospital Central'
    },
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
   // ========== MERCEARIA ==========
  // Supermercados BH
  { id: 1, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 24.90, promocao: true, preco_promocional: 19.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 2, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 9.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 3, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 4.90, promocao: true, preco_promocional: 3.50, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 4, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 25.50, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 5, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 10.20, promocao: true, preco_promocional: 8.50, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 6, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 5.20, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 7, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 23.80, promocao: true, preco_promocional: 21.50, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 8, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 9.50, promocao: true, preco_promocional: 8.20, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 9, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 4.70, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 10, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 26.90, promocao: true, preco_promocional: 22.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 11, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 11.50, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 12, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 5.90, promocao: true, preco_promocional: 4.50, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 13, produto: "Arroz Branco Tipo 1 5kg", categoria: "Mercearia", preco_normal: 23.90, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 14, produto: "Feijão Carioca 1kg", categoria: "Mercearia", preco_normal: 8.90, promocao: true, preco_promocional: 7.40, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 15, produto: "Macarrão Espaguete 500g", categoria: "Mercearia", preco_normal: 4.30, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },

  // ========== LATICÍNIOS ==========
  // Supermercados BH
  { id: 16, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 5.90, promocao: true, preco_promocional: 4.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 17, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 17.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 18, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 15.90, promocao: true, preco_promocional: 12.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 19, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 5.60, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 20, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 18.50, promocao: true, preco_promocional: 15.90, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 21, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 16.20, promocao: true, preco_promocional: 13.80, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 22, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 5.70, promocao: true, preco_promocional: 4.80, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 23, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 16.80, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 24, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 14.90, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 25, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 6.20, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 26, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 19.90, promocao: true, preco_promocional: 16.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 27, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 17.50, promocao: true, preco_promocional: 14.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 28, produto: "Leite Integral 1L", categoria: "Laticínios", preco_normal: 5.40, promocao: true, preco_promocional: 4.60, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 29, produto: "Queijo Mussarela Fatiado 300g", categoria: "Laticínios", preco_normal: 16.40, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 30, produto: "Iogurte Natural 1kg", categoria: "Laticínios", preco_normal: 13.90, promocao: true, preco_promocional: 11.90, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },

  // ========== HORTIFRUTI ==========
  // Supermercados BH
  { id: 31, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 5.90, promocao: true, preco_promocional: 4.50, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 32, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 8.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 33, produto: "Batata Inglesa Kg", categoria: "Hortifruti", preco_normal: 4.90, promocao: true, preco_promocional: 3.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 34, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 6.20, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 35, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 9.50, promocao: true, preco_promocional: 7.90, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 36, produto: "Batata Inglesa Kg", categoria: "Hortifruti", preco_normal: 5.20, promocao: true, preco_promocional: 4.20, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 37, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 5.70, promocao: true, preco_promocional: 4.80, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 38, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 8.20, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 39, produto: "Batata Inglesa Kg", categoria: "Hortifruti", preco_normal: 4.60, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 40, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 6.50, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 41, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 10.90, promocao: true, preco_promocional: 8.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 42, produto: "Batata Inglesa Kg", categoria: "Hortifruti", preco_normal: 5.90, promocao: true, preco_promocional: 4.50, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 43, produto: "Banana Nanica Kg", categoria: "Hortifruti", preco_normal: 5.40, promocao: true, preco_promocional: 4.20, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 44, produto: "Tomate Kg", categoria: "Hortifruti", preco_normal: 7.90, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 45, produto: "Batata Inglesa Kg", categoria: "Hortifruti", preco_normal: 4.20, promocao: true, preco_promocional: 3.40, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },

  // ========== BEBIDAS ==========
  // Supermercados BH
  { id: 46, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 8.90, promocao: true, preco_promocional: 6.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 47, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 9.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 48, produto: "Água Mineral 1,5L", categoria: "Bebidas", preco_normal: 2.90, promocao: true, preco_promocional: 2.20, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 49, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 9.20, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 50, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 10.50, promocao: true, preco_promocional: 8.90, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 51, produto: "Água Mineral 1,5L", categoria: "Bebidas", preco_normal: 3.20, promocao: true, preco_promocional: 2.50, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 52, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 8.50, promocao: true, preco_promocional: 7.20, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 53, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 9.40, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 54, produto: "Água Mineral 1,5L", categoria: "Bebidas", preco_normal: 2.70, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 55, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 10.90, promocao: true, preco_promocional: 8.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 56, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 11.90, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 57, produto: "Água Mineral 1,5L", categoria: "Bebidas", preco_normal: 3.50, promocao: true, preco_promocional: 2.80, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 58, produto: "Refrigerante Cola 2L", categoria: "Bebidas", preco_normal: 8.20, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 59, produto: "Suco de Laranja 1L", categoria: "Bebidas", preco_normal: 8.90, promocao: true, preco_promocional: 7.50, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 60, produto: "Água Mineral 1,5L", categoria: "Bebidas", preco_normal: 2.40, promocao: true, preco_promocional: 1.90, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },

  // ========== LIMPEZA ==========
  // Supermercados BH
  { id: 61, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 22.90, promocao: true, preco_promocional: 18.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 62, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 3.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 63, produto: "Amaciante 2L", categoria: "Limpeza", preco_normal: 16.90, promocao: true, preco_promocional: 13.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 64, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 23.50, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 65, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 4.20, promocao: true, preco_promocional: 3.40, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 66, produto: "Amaciante 2L", categoria: "Limpeza", preco_normal: 17.90, promocao: true, preco_promocional: 15.20, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 67, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 21.80, promocao: true, preco_promocional: 19.50, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 68, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 3.70, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 69, produto: "Amaciante 2L", categoria: "Limpeza", preco_normal: 15.90, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 70, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 25.90, promocao: true, preco_promocional: 21.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 71, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 4.90, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 72, produto: "Amaciante 2L", categoria: "Limpeza", preco_normal: 19.90, promocao: true, preco_promocional: 16.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 73, produto: "Sabão em Pó 2kg", categoria: "Limpeza", preco_normal: 20.90, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 74, produto: "Detergente Líquido 500ml", categoria: "Limpeza", preco_normal: 3.40, promocao: true, preco_promocional: 2.80, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 75, produto: "Amaciante 2L", categoria: "Limpeza", preco_normal: 14.90, promocao: true, preco_promocional: 12.50, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },

  // ========== HIGIENE ==========
  // Supermercados BH
  { id: 76, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 29.90, promocao: false, preco_promocional: null, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 77, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 18.90, promocao: true, preco_promocional: 15.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  { id: 78, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 2.90, promocao: true, preco_promocional: 1.90, supermercado: "Supermercados BH", ultima_atualizacao: "22/05/2024 10:30" },
  
  // Carrefour
  { id: 79, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 31.50, promocao: true, preco_promocional: 27.90, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 80, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 19.90, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  { id: 81, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 3.20, promocao: false, preco_promocional: null, supermercado: "Carrefour", ultima_atualizacao: "22/05/2024 09:15" },
  
  // Extra
  { id: 82, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 28.90, promocao: true, preco_promocional: 25.90, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 83, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 17.90, promocao: true, preco_promocional: 15.20, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  { id: 84, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 2.70, promocao: false, preco_promocional: null, supermercado: "Extra", ultima_atualizacao: "21/05/2024 16:45" },
  
  // Pão de Açúcar
  { id: 85, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 34.90, promocao: true, preco_promocional: 29.90, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 86, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 22.90, promocao: false, preco_promocional: null, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  { id: 87, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 3.50, promocao: true, preco_promocional: 2.50, supermercado: "Pão de Açúcar", ultima_atualizacao: "22/05/2024 11:00" },
  
  // Borges
  { id: 88, produto: "Papel Higiênico 16 rolos", categoria: "Higiene", preco_normal: 27.90, promocao: false, preco_promocional: null, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 89, produto: "Shampoo 400ml", categoria: "Higiene", preco_normal: 16.90, promocao: true, preco_promocional: 14.50, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" },
  { id: 90, produto: "Sabonete em Barra 90g", categoria: "Higiene", preco_normal: 2.40, promocao: true, preco_promocional: 1.80, supermercado: "Borges", ultima_atualizacao: "22/05/2024 08:30" }
];

export const INITIAL_SUGGESTIONS = [
  "Arroz",
  "Feijão",
  "Leite",
  "Carnes",
  "Limpeza",
  "Promoções"
];
