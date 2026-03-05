import { UserInputs, PlatformResult, CalculationMethod } from '../types';

// Constantes de Taxas fixas e padrões
const SHOPEE_FIXED_FEE = 4.00; // Taxa fixa por item
const SHOPEE_STANDARD_COMMISSION = 0.12; // 12% Comissão Padrão
const SHOPEE_SERVICE_RATE = 0.06; // 6% Taxa de Serviço (Programa Frete Grátis)
const SHOPEE_TRANSACTION_RATE = 0.02; // 2% Taxa de Transação
const SHOPEE_COMMISSION_CAP = 100.00; // Teto da comissão padrão (R$ 100)

const TIKTOK_COMMISSION_RATE = 0.12;
const TIKTOK_FIXED_FEE_THRESHOLD = 79.00;
const TIKTOK_FIXED_FEE_VALUE = 2.00;

const ML_DEFAULT_CLASSIC = 0.14; 
const ML_DEFAULT_PREMIUM = 0.19;

const AMAZON_COMMISSION_RATE = 0.15;
const AMAZON_FIXED_FEE = 0.00;

// Tabela de categorias do Mercado Livre conforme PDF/OCR fornecido
export const ML_CATEGORIES = [
  { id: 'veiculos', name: 'Acessórios para Veículos', classic: 0.12, premium: 0.17 },
  { id: 'alimentos', name: 'Alimentos e Bebidas', classic: 0.12, premium: 0.17 },
  { id: 'bebes', name: 'Bebês', classic: 0.115, premium: 0.165 },
  { id: 'beleza', name: 'Beleza e Cuidado Pessoal', classic: 0.13, premium: 0.18 },
  { id: 'brinquedos', name: 'Brinquedos e Hobbies', classic: 0.115, premium: 0.165 },
  { id: 'calcados', name: 'Calçados, Roupas e Bolsas', classic: 0.14, premium: 0.19 },
  { id: 'cameras', name: 'Câmeras e Acessórios', classic: 0.11, premium: 0.16 },
  { id: 'casa', name: 'Casa, Móveis e Decoração', classic: 0.115, premium: 0.165 },
  { id: 'celulares', name: 'Celulares e Smartphones', classic: 0.11, premium: 0.16 },
  { id: 'eletrodomesticos', name: 'Eletrodomésticos', classic: 0.11, premium: 0.16 },
  { id: 'eletronicos', name: 'Eletrônicos, Áudio e Vídeo', classic: 0.13, premium: 0.18 },
  { id: 'esportes', name: 'Esportes e Fitness', classic: 0.13, premium: 0.18 },
  { id: 'ferramentas', name: 'Ferramentas e Construção', classic: 0.115, premium: 0.165 },
  { id: 'games', name: 'Games', classic: 0.13, premium: 0.18 },
  { id: 'informatica', name: 'Informática (Notebooks, etc)', classic: 0.11, premium: 0.16 },
  { id: 'musicais', name: 'Instrumentos Musicais', classic: 0.115, premium: 0.165 },
  { id: 'joias', name: 'Joias e Relógios', classic: 0.125, premium: 0.175 },
  { id: 'livros', name: 'Livros', classic: 0.12, premium: 0.17 },
  { id: 'pet', name: 'Pet Shop', classic: 0.12, premium: 0.17 },
  { id: 'saude', name: 'Saúde', classic: 0.12, premium: 0.17 },
];

const getNumber = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

const getMLFixedFee = (price: number): number => {
  if (price >= 79.00) return 0;
  if (price > 50.00) return 6.75;
  if (price > 29.00) return 6.50;
  if (price >= 12.50) return 6.25;
  return price * 0.50; 
};

export const calculateResults = (inputs: UserInputs, method: CalculationMethod): { shopee: PlatformResult, tiktok: PlatformResult, mercadolivre: PlatformResult, amazon: PlatformResult } => {
  return { 
    shopee: calculateShopee(inputs, method), 
    tiktok: calculateTikTok(inputs, method), 
    mercadolivre: calculateMercadoLivre(inputs, method), 
    amazon: calculateAmazon(inputs, method) 
  };
};

const getShopeeTierConfig = (price: number) => {
  if (price < 80) return { fixed: 4.00, serviceRate: 0.06 }; // 12% + 6% + 2% = 20%
  if (price < 100) return { fixed: 16.00, serviceRate: 0.00 }; // 12% + 0% + 2% = 14%
  if (price < 200) return { fixed: 20.00, serviceRate: 0.00 }; // 12% + 0% + 2% = 14%
  return { fixed: 26.00, serviceRate: 0.00 }; // 12% + 0% + 2% = 14%
};

const calculateShopee = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const desiredProfit = productCost * targetMarginDecimal;

  let sellingPrice = 0;
  let appliedFixedFee = 0;
  let appliedServiceRate = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const requiredPayoutBase = desiredProfit + productCost + operationalCost;
    
    // Regra Progressiva (Aplicável para CPF e CNPJ conforme novas regras)
    // Tenta encontrar o preço de venda em cada faixa
    
    // Faixa 1: < 80 (Taxa 20% = 12+6+2, Fixed 4)
    const rate1 = SHOPEE_STANDARD_COMMISSION + 0.06 + SHOPEE_TRANSACTION_RATE + taxRateDecimal;
    const sp1 = (requiredPayoutBase + 4.00) / (1 - rate1);
    
    if (sp1 < 80) {
       sellingPrice = sp1;
       appliedFixedFee = 4.00;
       appliedServiceRate = 0.06;
    } else {
       // Faixa 2: 80-99.99 (Taxa 14% = 12+0+2, Fixed 16)
       const rate2 = SHOPEE_STANDARD_COMMISSION + 0.00 + SHOPEE_TRANSACTION_RATE + taxRateDecimal;
       const sp2 = (requiredPayoutBase + 16.00) / (1 - rate2);
       
       if (sp2 >= 80 && sp2 < 100) {
          sellingPrice = sp2;
          appliedFixedFee = 16.00;
          appliedServiceRate = 0.00;
       } else {
          // Faixa 3: 100-199.99 (Taxa 14%, Fixed 20)
          const sp3 = (requiredPayoutBase + 20.00) / (1 - rate2);
          
          if (sp3 >= 100 && sp3 < 200) {
             sellingPrice = sp3;
             appliedFixedFee = 20.00;
             appliedServiceRate = 0.00;
          } else {
             // Faixa 4: >= 200 (Taxa 14%, Fixed 26)
             const sp4 = (requiredPayoutBase + 26.00) / (1 - rate2);
             sellingPrice = sp4;
             appliedFixedFee = 26.00;
             appliedServiceRate = 0.00;
          }
       }
    }
  } else {
    sellingPrice = testPrice;
    
    const config = getShopeeTierConfig(sellingPrice);
    appliedFixedFee = config.fixed;
    appliedServiceRate = config.serviceRate;
  }

  // Cálculo final das taxas
  // Nota: Para CNPJ > 80, o serviceRate é 0, então a comissão é 12% e transação 2% = 14%.
  // O teto de R$ 100 na comissão padrão (12%) ainda se aplica?
  // A regra nova não menciona teto explicitamente na tabela simplificada, mas o teto de R$ 100 é da política geral.
  // Vamos manter o teto de R$ 100 na comissão base (12%) por segurança, embora em 14% de 293 (41 reais) não atinja.
  
  const rawCommissionValue = sellingPrice * SHOPEE_STANDARD_COMMISSION;
  const commissionValue = Math.min(rawCommissionValue, SHOPEE_COMMISSION_CAP);
  
  const serviceFeeValue = sellingPrice * appliedServiceRate;
  const transactionValue = sellingPrice * SHOPEE_TRANSACTION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  
  const totalVariableFees = commissionValue + serviceFeeValue + transactionValue + taxValue;
  const payout = sellingPrice - (totalVariableFees + appliedFixedFee);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName: 'Shopee', sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + appliedFixedFee, 
    totalVariableCosts: commissionValue + serviceFeeValue + transactionValue,
    feesBreakdown: { commission: commissionValue, serviceFee: serviceFeeValue, transactionFee: transactionValue, fixedFee: appliedFixedFee, tax: taxValue }
  };
};

const calculateTikTok = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const variableRate = TIKTOK_COMMISSION_RATE + taxRateDecimal;
  const desiredProfit = productCost * targetMarginDecimal;

  let sellingPrice = 0;
  let appliedFixedFee = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const requiredPayoutWithFee = desiredProfit + productCost + operationalCost + TIKTOK_FIXED_FEE_VALUE;
    const requiredPayoutNoFee = desiredProfit + productCost + operationalCost;
    const spWithFee = requiredPayoutWithFee / (1 - variableRate);
    const spNoFee = requiredPayoutNoFee / (1 - variableRate);
    if (spWithFee < TIKTOK_FIXED_FEE_THRESHOLD) {
      sellingPrice = spWithFee;
      appliedFixedFee = TIKTOK_FIXED_FEE_VALUE;
    } else {
      sellingPrice = spNoFee;
      appliedFixedFee = 0;
    }
  } else {
    sellingPrice = testPrice;
    appliedFixedFee = sellingPrice < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE_VALUE : 0;
  }

  const commissionValue = sellingPrice * TIKTOK_COMMISSION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  const payout = sellingPrice - (commissionValue + taxValue + appliedFixedFee);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName: 'TikTok Shop', sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + appliedFixedFee, totalVariableCosts: commissionValue,
    feesBreakdown: { commission: commissionValue, transactionFee: 0, fixedFee: appliedFixedFee, tax: taxValue }
  };
};

const calculateMercadoLivre = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  const shippingCost = getNumber(inputs.mlShippingCost);
  
  // Lógica de Comissão por Categoria ou Padrão
  let commissionRate = inputs.mlListingType === 'premium' ? ML_DEFAULT_PREMIUM : ML_DEFAULT_CLASSIC;
  
  if (inputs.useMLCategory && inputs.mlCategory) {
    const categoryData = ML_CATEGORIES.find(c => c.id === inputs.mlCategory);
    if (categoryData) {
      commissionRate = inputs.mlListingType === 'premium' ? categoryData.premium : categoryData.classic;
    }
  }

  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const variableRate = commissionRate + taxRateDecimal;
  const desiredProfit = productCost * targetMarginDecimal;
  const requiredPayout = desiredProfit + productCost + operationalCost + shippingCost;

  let sellingPrice = 0;
  let appliedFixedFee = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const sp79 = requiredPayout / (1 - variableRate);
    if (sp79 >= 79) {
      sellingPrice = sp79;
      appliedFixedFee = 0;
    } else {
      const sp675 = (requiredPayout + 6.75) / (1 - variableRate);
      if (sp675 > 50) {
        sellingPrice = sp675;
        appliedFixedFee = 6.75;
      } else {
        const sp650 = (requiredPayout + 6.50) / (1 - variableRate);
        if (sp650 > 29) {
          sellingPrice = sp650;
          appliedFixedFee = 6.50;
        } else {
          const sp625 = (requiredPayout + 6.25) / (1 - variableRate);
          if (sp625 >= 12.50) {
            sellingPrice = sp625;
            appliedFixedFee = 6.25;
          } else {
            const denominator = 1 - variableRate - 0.5;
            if (denominator > 0) {
              sellingPrice = requiredPayout / denominator;
              appliedFixedFee = sellingPrice * 0.5;
            } else {
              sellingPrice = 12.50; 
              appliedFixedFee = 6.25;
            }
          }
        }
      }
    }
  } else {
    sellingPrice = testPrice;
    appliedFixedFee = getMLFixedFee(sellingPrice);
  }

  const commissionValue = sellingPrice * commissionRate;
  const taxValue = sellingPrice * taxRateDecimal;
  const payout = sellingPrice - (commissionValue + taxValue + appliedFixedFee + shippingCost);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName: 'Mercado Livre',
    sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + appliedFixedFee, 
    totalVariableCosts: commissionValue,
    feesBreakdown: { commission: commissionValue, transactionFee: 0, fixedFee: appliedFixedFee, tax: taxValue, shipping: shippingCost }
  };
};

const calculateAmazon = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const variableRate = AMAZON_COMMISSION_RATE + taxRateDecimal;
  const desiredProfit = productCost * targetMarginDecimal;

  let sellingPrice = 0;
  if (method === CalculationMethod.TARGET_MARGIN) {
    const requiredPayout = desiredProfit + productCost + operationalCost + AMAZON_FIXED_FEE;
    sellingPrice = requiredPayout / (1 - variableRate);
  } else {
    sellingPrice = testPrice;
  }

  const commissionValue = sellingPrice * AMAZON_COMMISSION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  const payout = sellingPrice - (commissionValue + taxValue + AMAZON_FIXED_FEE);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName: 'Amazon', sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + AMAZON_FIXED_FEE, totalVariableCosts: commissionValue,
    feesBreakdown: { commission: commissionValue, transactionFee: 0, fixedFee: AMAZON_FIXED_FEE, tax: taxValue }
  };
};