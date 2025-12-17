import { UserInputs, PlatformResult, CalculationMethod } from '../types';

// Constants defined in the prompt
const SHOPEE_FIXED_FEE = 4.00;
// Shopee Rates Logic:
// Standard (Sem Programa): ~12% comm + 2% trans = 14%
// Free Shipping (Com Programa): ~12% comm + 6% prog + 2% trans = 20%
const SHOPEE_STANDARD_COMMISSION = 0.12; 
const SHOPEE_PROGRAM_COMMISSION = 0.18; // 12% + 6%
const SHOPEE_TRANSACTION_RATE = 0.02;

const TIKTOK_COMMISSION_RATE = 0.12; // 12% (Includes Trans fee)
const TIKTOK_FIXED_FEE_THRESHOLD = 79.00;
const TIKTOK_FIXED_FEE_VALUE = 2.00;

// Mercado Livre Constants
// Clássico ~12-14% | Premium ~17-19% (Estimates)
const ML_CLASSIC_RATE = 0.14; 
const ML_PREMIUM_RATE = 0.19;
const ML_FIXED_FEE_THRESHOLD = 79.00;
const ML_FIXED_FEE_VALUE = 6.00; 

// Amazon Constants
const AMAZON_COMMISSION_RATE = 0.15; // ~15% Standard
const AMAZON_FIXED_FEE = 0.00; // Assuming professional or simplified view

// Helper to safely convert input to number
const getNumber = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Replace comma with dot just in case, though input type=number usually handles it or returns empty
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

export const calculateResults = (inputs: UserInputs, method: CalculationMethod): { shopee: PlatformResult, tiktok: PlatformResult, mercadolivre: PlatformResult, amazon: PlatformResult } => {
  
  // 1. Calculate Shopee
  const shopeeResult = calculateShopee(inputs, method);
  
  // 2. Calculate TikTok
  const tiktokResult = calculateTikTok(inputs, method);

  // 3. Calculate Mercado Livre
  const mlResult = calculateMercadoLivre(inputs, method);

  // 4. Calculate Amazon
  const amazonResult = calculateAmazon(inputs, method);

  return { shopee: shopeeResult, tiktok: tiktokResult, mercadolivre: mlResult, amazon: amazonResult };
};

const calculateShopee = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMargin = getNumber(inputs.targetMargin);
  const testPrice = getNumber(inputs.testPrice);
  
  // Determine Rate based on listing type
  // Standard: 14% Total (12+2)
  // Free Shipping: 20% Total (12+6+2)
  const baseCommission = inputs.shopeeListingType === 'free_shipping' ? SHOPEE_PROGRAM_COMMISSION : SHOPEE_STANDARD_COMMISSION;
  const platformName = inputs.shopeeListingType === 'free_shipping' ? 'Shopee (Com Frete Grátis)' : 'Shopee (Sem Frete Grátis)';

  // Calculate Tax (if CNPJ)
  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;

  // Total Variable Rate (Denominators): Comm + Trans + Tax
  const totalVariableRate = baseCommission + SHOPEE_TRANSACTION_RATE + taxRateDecimal;
  
  // Total Fixed Amount (Numerators part 1): CP + CFV + Fixed Fee
  const totalFixedAmount = productCost + operationalCost + SHOPEE_FIXED_FEE;

  let sellingPrice = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const marginDecimal = targetMargin / 100;
    const denominator = 1 - (totalVariableRate + marginDecimal);
    
    if (denominator <= 0) {
      sellingPrice = 0; 
    } else {
      sellingPrice = totalFixedAmount / denominator;
    }
  } else {
    sellingPrice = testPrice;
  }

  const commissionValue = sellingPrice * baseCommission;
  const transactionValue = sellingPrice * SHOPEE_TRANSACTION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  
  const totalPlatformFees = commissionValue + transactionValue;
  const totalDeductions = totalPlatformFees + taxValue;
  
  const netProfit = sellingPrice - totalFixedAmount - totalDeductions;
  const netProfitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  return {
    platformName: platformName,
    sellingPrice,
    netProfit,
    netProfitMargin,
    totalFixedCosts: totalFixedAmount,
    totalVariableCosts: totalPlatformFees,
    feesBreakdown: {
      commission: commissionValue,
      transactionFee: transactionValue,
      fixedFee: SHOPEE_FIXED_FEE,
      tax: taxValue,
      affiliate: 0,
    }
  };
};

const calculateTikTok = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMargin = getNumber(inputs.targetMargin);
  const testPrice = getNumber(inputs.testPrice);

  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const totalVariableRate = TIKTOK_COMMISSION_RATE + taxRateDecimal;
  const baseFixedCosts = productCost + operationalCost;

  let sellingPrice = 0;
  let appliedFixedFee = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const marginDecimal = targetMargin / 100;
    const denominator = 1 - (totalVariableRate + marginDecimal);

    if (denominator <= 0) {
      sellingPrice = 0;
    } else {
      const priceWithFee = (baseFixedCosts + TIKTOK_FIXED_FEE_VALUE) / denominator;
      const priceWithoutFee = baseFixedCosts / denominator;

      if (priceWithFee < TIKTOK_FIXED_FEE_THRESHOLD) {
        sellingPrice = priceWithFee;
        appliedFixedFee = TIKTOK_FIXED_FEE_VALUE;
      } else {
        if (priceWithoutFee >= TIKTOK_FIXED_FEE_THRESHOLD) {
          sellingPrice = priceWithoutFee;
          appliedFixedFee = 0;
        } else {
          sellingPrice = priceWithFee; 
          appliedFixedFee = TIKTOK_FIXED_FEE_VALUE;
        }
      }
    }
  } else {
    sellingPrice = testPrice;
    appliedFixedFee = sellingPrice < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE_VALUE : 0;
  }

  const commissionValue = sellingPrice * TIKTOK_COMMISSION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;

  const totalPlatformFees = commissionValue;
  const totalFixedCosts = baseFixedCosts + appliedFixedFee;
  const totalDeductions = totalPlatformFees + taxValue;

  const netProfit = sellingPrice - totalFixedCosts - totalDeductions;
  const netProfitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  return {
    platformName: 'TikTok Shop',
    sellingPrice,
    netProfit,
    netProfitMargin,
    totalFixedCosts,
    totalVariableCosts: totalPlatformFees,
    feesBreakdown: {
      commission: commissionValue,
      transactionFee: 0, 
      fixedFee: appliedFixedFee,
      tax: taxValue,
      affiliate: 0 
    }
  };
};

const calculateMercadoLivre = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMargin = getNumber(inputs.targetMargin);
  const testPrice = getNumber(inputs.testPrice);

  // Determine Rate based on listing type
  const commissionRate = inputs.mlListingType === 'premium' ? ML_PREMIUM_RATE : ML_CLASSIC_RATE;
  const platformName = inputs.mlListingType === 'premium' ? 'Mercado Livre (Premium)' : 'Mercado Livre (Clássico)';

  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const totalVariableRate = commissionRate + taxRateDecimal;
  const baseFixedCosts = productCost + operationalCost;

  let sellingPrice = 0;
  let appliedFixedFee = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const marginDecimal = targetMargin / 100;
    const denominator = 1 - (totalVariableRate + marginDecimal);

    if (denominator <= 0) {
      sellingPrice = 0;
    } else {
      // Logic similar to TikTok for threshold
      const priceWithFee = (baseFixedCosts + ML_FIXED_FEE_VALUE) / denominator;
      const priceWithoutFee = baseFixedCosts / denominator;

      if (priceWithFee < ML_FIXED_FEE_THRESHOLD) {
        sellingPrice = priceWithFee;
        appliedFixedFee = ML_FIXED_FEE_VALUE;
      } else {
        if (priceWithoutFee >= ML_FIXED_FEE_THRESHOLD) {
          sellingPrice = priceWithoutFee;
          appliedFixedFee = 0;
        } else {
          sellingPrice = priceWithFee;
          appliedFixedFee = ML_FIXED_FEE_VALUE;
        }
      }
    }
  } else {
    sellingPrice = testPrice;
    appliedFixedFee = sellingPrice < ML_FIXED_FEE_THRESHOLD ? ML_FIXED_FEE_VALUE : 0;
  }

  const commissionValue = sellingPrice * commissionRate;
  const taxValue = sellingPrice * taxRateDecimal;
  const totalPlatformFees = commissionValue;
  const totalFixedCosts = baseFixedCosts + appliedFixedFee;
  const totalDeductions = totalPlatformFees + taxValue;
  const netProfit = sellingPrice - totalFixedCosts - totalDeductions;
  const netProfitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  return {
    platformName: platformName,
    sellingPrice,
    netProfit,
    netProfitMargin,
    totalFixedCosts,
    totalVariableCosts: totalPlatformFees,
    feesBreakdown: {
      commission: commissionValue,
      transactionFee: 0,
      fixedFee: appliedFixedFee,
      tax: taxValue,
    }
  };
};

const calculateAmazon = (inputs: UserInputs, method: CalculationMethod): PlatformResult => {
  const productCost = getNumber(inputs.productCost);
  const operationalCost = getNumber(inputs.operationalCost);
  const targetMargin = getNumber(inputs.targetMargin);
  const testPrice = getNumber(inputs.testPrice);

  const taxRateDecimal = inputs.isCNPJ ? getNumber(inputs.taxRate) / 100 : 0;
  const totalVariableRate = AMAZON_COMMISSION_RATE + taxRateDecimal;
  const totalFixedCosts = productCost + operationalCost + AMAZON_FIXED_FEE;

  let sellingPrice = 0;

  if (method === CalculationMethod.TARGET_MARGIN) {
    const marginDecimal = targetMargin / 100;
    const denominator = 1 - (totalVariableRate + marginDecimal);
    
    if (denominator <= 0) {
      sellingPrice = 0;
    } else {
      sellingPrice = totalFixedCosts / denominator;
    }
  } else {
    sellingPrice = testPrice;
  }

  const commissionValue = sellingPrice * AMAZON_COMMISSION_RATE;
  const taxValue = sellingPrice * taxRateDecimal;
  const totalPlatformFees = commissionValue;
  const totalDeductions = totalPlatformFees + taxValue;
  const netProfit = sellingPrice - totalFixedCosts - totalDeductions;
  const netProfitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  return {
    platformName: 'Amazon',
    sellingPrice,
    netProfit,
    netProfitMargin,
    totalFixedCosts: totalFixedCosts,
    totalVariableCosts: totalPlatformFees,
    feesBreakdown: {
      commission: commissionValue,
      transactionFee: 0,
      fixedFee: AMAZON_FIXED_FEE,
      tax: taxValue,
    }
  };
};