
import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

export class GeminiTradingService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeChartFrame(base64Image: string): Promise<MarketAnalysis> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image.split(',')[1],
                },
              },
              {
                text: `Você é um analista técnico especialista. Analise esta imagem de gráfico de trading.
                1. Identifique o sentimento atual do mercado (bullish, bearish ou sideways).
                2. Estime os principais níveis de suporte e resistência visíveis na escala de preços.
                3. Forneça um breve comentário profissional em PORTUGUÊS sobre a ação do preço atual.
                Retorne os resultados em formato JSON estrito.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ['bullish', 'bearish', 'sideways'] },
              keyLevels: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
              },
              commentary: { type: Type.STRING }
            },
            required: ['sentiment', 'trend', 'keyLevels', 'commentary']
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Erro na Análise Gemini:", error);
      throw error;
    }
  }
}
