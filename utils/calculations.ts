import { UserInputs, PlatformResult, CalculationMethod } from '../types';

// Constantes de Taxas
const SHOPEE_FIXED_FEE = 4.00;
const SHOPEE_STANDARD_COMMISSION = 0.12; 
const SHOPEE_PROGRAM_COMMISSION = 0.18;
const SHOPEE_TRANSACTION_RATE = 0.02;

const TIKTOK_COMMISSION_RATE = 0.12;
const TIKTOK_FIXED_FEE_THRESHOLD = 79.00;
const TIKTOK_FIXED_FEE_VALUE = 2.00;

const ML_CLASSIC_RATE = 0.14; 
const ML_PREMIUM_RATE = 0.19;
const ML_FIXED_FEE_THRESHOLD = 79.00;
const ML_FIXED_FEE_VALUE = 6.00; 

const AMAZON_COMMISSION_RATE = 0.15;
const AMAZON_FIXED_FEE = 0.00;

const getNumber = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

export const calculateResults = (inputs: UserInputs, method: CalculationMethod): { shopee: PlatformResult, tiktok: PlatformResult, mercadolivre: PlatformResult, amazon: PlatformResult } => {
  return { 
    shopee: calculateShopee(inputs, method), 
    tiktok: calculateTikTok(inputs, method), 
    mercadolivre: calculateMercadoLivre(inputs, method), 
    amazon: calculateAmazon(inputs, method) 
  };
};

/**
 * NOVA LÓGICA SOLICITADA:
 * Lucro Desejado = CustoProduto * (MargemAlvo / 100)
 * Repasse Necessário (Payout) = Lucro Desejado + CustoProduto + CustoOperacional
 * PrecoVenda = (Repasse Necessário + TaxaFixa) / (1 - TaxaVariavel)
 */

const calculateShopee = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  
  const baseCommission = inputs.shopeeListingType === 'free_shipping' ? SHOPEE_PROGRAM_COMMISSION : SHOPEE_STANDARD_COMMISSION;
  const platformName = inputs.shopeeListingType === 'free_shipping' ? 'Shopee (Com Frete Grátis)' : 'Shopee (Sem Frete Grátis)';
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  
  const variableRate = baseCommission + SHOPEE_TRANSACTION_RATE + taxRateDecimal;
  const desiredProfit = productCost * targetMarginDecimal;

  let sellingPrice = 0;
  if (method === CalculationMethod.TARGET_MARGIN) {
    const requiredPayout = desiredProfit + productCost + operationalCost;
    if (variableRate < 1) {
      sellingPrice = (requiredPayout + SHOPEE_FIXED_FEE) / (1 - variableRate);
    }
  } else {
    sellingPrice = testPrice;
  }

  const commissionValue = sellingPrice * baseCommission;
  const transactionValue = sellingPrice * SHOPEE_TRANSACTION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  const totalVariableFees = commissionValue + transactionValue + taxValue;
  
  const payout = sellingPrice - (totalVariableFees + SHOPEE_FIXED_FEE);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName, sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + SHOPEE_FIXED_FEE, totalVariableCosts: commissionValue + transactionValue,
    feesBreakdown: { commission: commissionValue, transactionFee: transactionValue, fixedFee: SHOPEE_FIXED_FEE, tax: taxValue, affiliate: 0 }
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
    feesBreakdown: { commission: commissionValue, transactionFee: 0, fixedFee: appliedFixedFee, tax: taxValue, affiliate: 0 }
  };
};

const calculateMercadoLivre = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMarginDecimal = getNumber(inputs.targetMargin) / 100;
  const testPrice = getNumber(inputs.testPrice);
  const commissionRate = inputs.mlListingType === 'premium' ? ML_PREMIUM_RATE : ML_CLASSIC_RATE;
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  
  const variableRate = commissionRate + taxRateDecimal;
  const desiredProfit = productCost * targetMarginDecimal;

  let sellingPrice = 0;
  let appliedFixedFee = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const requiredPayoutWithFee = desiredProfit + productCost + operationalCost + ML_FIXED_FEE_VALUE;
    const requiredPayoutNoFee = desiredProfit + productCost + operationalCost;
    
    const spWithFee = requiredPayoutWithFee / (1 - variableRate);
    const spNoFee = requiredPayoutNoFee / (1 - variableRate);

    if (spWithFee < ML_FIXED_FEE_THRESHOLD) {
      sellingPrice = spWithFee;
      appliedFixedFee = ML_FIXED_FEE_VALUE;
    } else {
      sellingPrice = spNoFee;
      appliedFixedFee = 0;
    }
  } else {
    sellingPrice = testPrice;
    appliedFixedFee = sellingPrice < ML_FIXED_FEE_THRESHOLD ? ML_FIXED_FEE_VALUE : 0;
  }

  const commissionValue = sellingPrice * commissionRate;
  const taxValue = sellingPrice * taxRateDecimal;
  
  const payout = sellingPrice - (commissionValue + taxValue + appliedFixedFee);
  const netProfit = payout - (productCost + operationalCost);
  const netProfitMargin = productCost > 0 ? (netProfit / productCost) * 100 : 0;

  return {
    platformName: inputs.mlListingType === 'premium' ? 'Mercado Livre (Premium)' : 'Mercado Livre (Clássico)',
    sellingPrice, netProfit, netProfitMargin, productBaseCost: productCost,
    totalFixedCosts: (productCost + operationalCost) + appliedFixedFee, totalVariableCosts: commissionValue,
    feesBreakdown: { commission: commissionValue, transactionFee: 0, fixedFee: appliedFixedFee, tax: taxValue }
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