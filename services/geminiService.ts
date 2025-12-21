
import { GoogleGenAI, Type } from "@google/genai";
import { ProductOffer } from "../types";
import { MOCK_STORES, STORE_PRICING_FACTORS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome do produto (ex: Arroz 5kg)" },
      category: { type: Type.STRING, description: "Categoria (Mercearia, Limpeza, Hortifruti)" },
      basePrice: { type: Type.NUMBER, description: "Preço médio em reais" },
      unit: { type: Type.STRING, description: "Unidade (kg, un, L)" },
    },
    required: ["name", "category", "basePrice", "unit"],
  },
};

export const searchProductsWithGemini = async (query: string): Promise<ProductOffer[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma lista de 6 produtos de supermercado para a busca: "${query}". Foco no mercado brasileiro.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    const productsData = JSON.parse(response.text || "[]");
    const offers: ProductOffer[] = [];

    productsData.forEach((product: any, index: number) => {
      MOCK_STORES.forEach((store) => {
        const storeFactor = STORE_PRICING_FACTORS[store.id] || 1.0;
        const variance = (Math.random() * 0.10) - 0.05;
        const finalPrice = product.basePrice * storeFactor * (1 + variance);

        offers.push({
          id: `off_${index}_${store.id}`,
          baseProductId: `prod_${index}`,
          name: product.name,
          category: product.category,
          storeId: store.id,
          storeName: store.name,
          storeColor: store.color,
          price: Number(finalPrice.toFixed(2)),
          unit: product.unit,
          imageUrl: "", // Removido conforme solicitado
          isPromo: variance < -0.03,
        });
      });
    });

    return offers;
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const suggestRecipe = async (items: string[]): Promise<string> => {
  if (items.length < 2) return "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugira uma receita rápida com: ${items.join(", ")}. Máximo 200 caracteres.`,
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};
