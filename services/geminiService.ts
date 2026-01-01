import { GoogleGenAI } from "@google/genai";
import { UserInputs, PlatformResult, CalculationMethod } from "../types";
import { formatCurrency, formatPercent } from "../utils/currency";

const getNumber = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

export const generatePricingAnalysis = async (
  inputs: UserInputs,
  shopeeResult: PlatformResult,
  tiktokResult: PlatformResult,
  mlResult: PlatformResult,
  amazonResult: PlatformResult,
  method: CalculationMethod
): Promise<string> => {
  // Inicialização obrigatória dentro da função para capturar a chave de ambiente mais recente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const methodText = method === CalculationMethod.TARGET_MARGIN 
    ? "Definição de Preço por Margem Alvo" 
    : "Análise de Lucro Real";
  
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMargin = getNumber(inputs.targetMargin);
  const testPrice = getNumber(inputs.testPrice);

  const prompt = `
    Atue como um estrategista financeiro de E-commerce sênior.
    Analise os dados abaixo e forneça uma resposta com EXCELENTE ESPAÇAMENTO e legibilidade.
    
    **Dados do Cenário (${methodText}):**
    - Custo Produto + Operacional: ${formatCurrency(productCost + operationalCost)}
    ${method === CalculationMethod.TARGET_MARGIN ? `- Meta de Margem: ${targetMargin}%` : `- Preço Testado: ${formatCurrency(testPrice)}`}

    **Resultados Apurados:**
    1. **Shopee:** Venda a ${formatCurrency(shopeeResult.sellingPrice)} | Lucro: ${formatCurrency(shopeeResult.netProfit)} (${formatPercent(shopeeResult.netProfitMargin)})
    2. **TikTok:** Venda a ${formatCurrency(tiktokResult.sellingPrice)} | Lucro: ${formatCurrency(tiktokResult.netProfit)} (${formatPercent(tiktokResult.netProfitMargin)})
    3. **Mercado Livre:** Venda a ${formatCurrency(mlResult.sellingPrice)} | Lucro: ${formatCurrency(mlResult.netProfit)} (${formatPercent(mlResult.netProfitMargin)})
    4. **Amazon:** Venda a ${formatCurrency(amazonResult.sellingPrice)} | Lucro: ${formatCurrency(amazonResult.netProfit)} (${formatPercent(amazonResult.netProfitMargin)})

    **Instruções de Resposta (Formato Visual):**

    ### 🏆 Veredito
    [Diga qual plataforma venceu em 1 frase direta e destaque o lucro dela em negrito]

    ### 🔎 Raio-X Comparativo
    *   **Shopee:** [Resumo rápido]
    *   **TikTok:** [Resumo rápido]
    *   **Mercado Livre:** [Resumo rápido]
    *   **Amazon:** [Resumo rápido]
    
    ### 💡 Plano de Ação
    [Uma sugestão tática e concreta para aumentar a margem ou reduzir custos.]

    **Regras Importantes de Estilo:**
    - Use Markdown.
    - Pule SEMPRE uma linha em branco entre cada item de lista e cada parágrafo.
    - Seja conciso e direto.
    - Use emojis para guiar a leitura.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique se a API_KEY foi configurada no Netlify.";
  }
};