
export enum CalculationMethod {
  TARGET_MARGIN = 'TARGET_MARGIN',
  REAL_PROFIT = 'REAL_PROFIT'
}

export interface UserInputs {
  productCost: number | string; // CP
  operationalCost: number | string; // CFV
  targetMargin: number | string; // Margem Alvo % (0-100)
  testPrice: number | string; // Preço Teste
  isCNPJ: boolean; // Toggle CNPJ
  taxRate: number | string; // Alíquota de Imposto %
  mlListingType: 'classic' | 'premium'; // Tipo de Anúncio ML
  shopeeListingType: 'standard' | 'free_shipping'; // Novo campo: Tipo de Anúncio Shopee
}

export interface PlatformResult {
  platformName: string;
  sellingPrice: number;
  netProfit: number;
  netProfitMargin: number;
  totalFixedCosts: number;
  totalVariableCosts: number;
  feesBreakdown: {
    commission: number;
    transactionFee: number;
    fixedFee: number;
    tax: number;
    affiliate?: number;
  };
}

export interface CalculationContext {
  shopee: PlatformResult;
  tiktok: PlatformResult;
  mercadolivre: PlatformResult;
  amazon: PlatformResult;
}