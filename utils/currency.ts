export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbol, dots, and replace comma with dot
  const cleanValue = value.replace(/[^0-9,]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};