import React from 'react';
import { PlatformResult } from '../types';
import { formatCurrency, formatPercent } from '../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultCardProps {
  result: PlatformResult;
  colorTheme: 'orange' | 'black' | 'yellow' | 'blue';
  mlListingType?: 'classic' | 'premium';
  onMlListingTypeChange?: (type: 'classic' | 'premium') => void;
  shopeeListingType?: 'standard' | 'free_shipping';
  onShopeeListingTypeChange?: (type: 'standard' | 'free_shipping') => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  colorTheme, 
  mlListingType, 
  onMlListingTypeChange,
  shopeeListingType,
  onShopeeListingTypeChange
}) => {
  
  const themeClasses = {
    orange: { // Shopee
      border: 'border-orange-200',
      bg: 'bg-white',
      header: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-orange-600',
      fill: '#f97316'
    },
    black: { // TikTok
      border: 'border-gray-200',
      bg: 'bg-white',
      header: 'bg-gray-900',
      text: 'text-gray-900',
      fill: '#111827'
    },
    yellow: { // Mercado Livre
      border: 'border-yellow-200',
      bg: 'bg-white',
      header: 'bg-yellow-400',
      text: 'text-yellow-700', // Darker text for readability
      fill: '#facc15'
    },
    blue: { // Amazon
      border: 'border-slate-200',
      bg: 'bg-white',
      header: 'bg-slate-800',
      text: 'text-slate-800',
      fill: '#1e293b'
    }
  };

  const currentTheme = themeClasses[colorTheme];

  // Calculate total money paid to the platform
  const totalFees = result.totalVariableCosts + 
                    result.feesBreakdown.fixedFee + 
                    (result.feesBreakdown.tax || 0) + 
                    (result.feesBreakdown.affiliate || 0);

  // Calculate total cost (Product + Oper + All Fees)
  const totalProdOper = result.totalFixedCosts - result.feesBreakdown.fixedFee;
  const totalSaleCost = totalProdOper + totalFees;

  const chartData = [
    { name: 'Custo Fixo (Prod + Oper)', value: totalProdOper, color: '#9CA3AF' },
    { name: 'Taxas & Comissões', value: totalFees, color: '#EF4444' },
    { name: 'Lucro Líquido', value: result.netProfit > 0 ? result.netProfit : 0, color: '#10B981' },
  ];

  // Custom text color for ML header because yellow background is light
  const headerTextColor = colorTheme === 'yellow' ? 'text-gray-900' : 'text-white';
  
  // Clean platform name for display
  const displayName = result.platformName
    .replace(' (Clássico)', '')
    .replace(' (Premium)', '')
    .replace(' (Sem Frete Grátis)', '')
    .replace(' (Com Frete Grátis)', '');

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden border ${currentTheme.border} ${currentTheme.bg} flex flex-col`}>
      <div className={`${currentTheme.header} ${headerTextColor} p-4 flex justify-between items-center`}>
        <h3 className="font-bold text-lg">{displayName}</h3>
        {result.feesBreakdown.affiliate && result.feesBreakdown.affiliate > 0 ? (
          <span className={`text-xs px-2 py-1 rounded backdrop-blur-sm ${colorTheme === 'yellow' ? 'bg-black/10' : 'bg-white/20'}`}>
             Com Afiliado
          </span>
        ) : null}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        
        {/* Controls Container - Min Height enforced on Desktop for Alignment */}
        <div className="min-h-0 lg:min-h-[8.5rem]">
            {/* Mercado Livre Toggle Section */}
            {colorTheme === 'yellow' && mlListingType && onMlListingTypeChange && (
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Tipo de Anúncio
                    </label>
                    <div className="flex p-1 bg-yellow-50 border border-yellow-200 rounded-lg shadow-inner">
                        <button
                        onClick={() => onMlListingTypeChange('classic')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded uppercase tracking-wide transition-all ${
                            mlListingType === 'classic'
                            ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                            : 'text-yellow-600 hover:text-yellow-800'
                        }`}
                        >
                        Clássico
                        </button>
                        <button
                        onClick={() => onMlListingTypeChange('premium')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded uppercase tracking-wide transition-all ${
                            mlListingType === 'premium'
                            ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                            : 'text-yellow-600 hover:text-yellow-800'
                        }`}
                        >
                        Premium
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 text-center px-1">
                    {mlListingType === 'classic' 
                        ? 'Exposição alta e duração ilimitada.' 
                        : 'Exposição máxima e parcelamento sem juros.'}
                    </p>
                </div>
            )}

            {/* Shopee Toggle Section */}
            {colorTheme === 'orange' && shopeeListingType && onShopeeListingTypeChange && (
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Programa Frete Grátis
                    </label>
                    <div className="flex p-1 bg-orange-50 border border-orange-200 rounded-lg shadow-inner">
                        <button
                        onClick={() => onShopeeListingTypeChange('standard')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded uppercase tracking-wide transition-all ${
                            shopeeListingType === 'standard'
                            ? 'bg-[#ee4d2d] text-white shadow-sm'
                            : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
                        }`}
                        >
                        Sem Frete Grátis
                        </button>
                        <button
                        onClick={() => onShopeeListingTypeChange('free_shipping')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded uppercase tracking-wide transition-all ${
                            shopeeListingType === 'free_shipping'
                            ? 'bg-[#ee4d2d] text-white shadow-sm'
                            : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
                        }`}
                        >
                        Com Frete Grátis
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 text-center px-1">
                    {shopeeListingType === 'standard' 
                        ? 'Comissão padrão (aprox. 14%). Sem selo destaque.' 
                        : 'Comissão maior (aprox. 20%). Selo de Frete Grátis.'}
                    </p>
                </div>
            )}
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Preço de Venda Final</p>
          <div className={`text-4xl font-bold ${currentTheme.text}`}>
            {formatCurrency(result.sellingPrice)}
          </div>
        </div>

        {/* Reverted Grid to 2 columns */}
        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Lucro (R$)</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.netProfit)}</p>
           </div>
           <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Margem</p>
              <p className="text-2xl font-bold text-emerald-600">{formatPercent(result.netProfitMargin)}</p>
           </div>
        </div>

        <div className="mb-6 h-32 w-full relative">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={chartData}
                 cx="50%"
                 cy="50%"
                 innerRadius={40}
                 outerRadius={60}
                 paddingAngle={2}
                 dataKey="value"
               >
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Tooltip formatter={(value: number) => formatCurrency(value)} />
             </PieChart>
           </ResponsiveContainer>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
             <span className="text-xs text-gray-400 font-medium">Detalhamento</span>
           </div>
        </div>

        <div className="space-y-2 text-sm border-t border-gray-100 pt-4 mt-auto">
          <div className="flex justify-between">
            <span className="text-gray-500">Custo Fixo Total (Prod+Op):</span>
            <span className="font-medium text-gray-700">{formatCurrency(totalProdOper)}</span>
          </div>
          <div className="flex justify-between">
             <span className="text-gray-500">Comissão:</span>
             <span className="font-medium text-red-500">-{formatCurrency(result.feesBreakdown.commission)}</span>
          </div>
           {result.feesBreakdown.transactionFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Taxa Transação:</span>
              <span className="font-medium text-red-500">-{formatCurrency(result.feesBreakdown.transactionFee)}</span>
            </div>
          )}
          {result.feesBreakdown.affiliate && result.feesBreakdown.affiliate > 0 && (
             <div className="flex justify-between">
               <span className="text-gray-500">Afiliado:</span>
               <span className="font-medium text-red-500">-{formatCurrency(result.feesBreakdown.affiliate)}</span>
             </div>
          )}
           <div className="flex justify-between">
              <span className="text-gray-500">Taxa Fixa Item:</span>
              <span className="font-medium text-red-500">-{formatCurrency(result.feesBreakdown.fixedFee)}</span>
            </div>
            
            <div className="flex justify-between font-semibold bg-gray-50 rounded px-2 py-1 -mx-2">
               <span className="text-gray-700">Taxas e Encargos Total:</span>
               <span className="text-red-600">-{formatCurrency(totalFees)}</span>
            </div>

           {result.feesBreakdown.tax > 0 && (
             <div className="flex justify-between">
                <span className="text-gray-500">Imposto:</span>
                <span className="font-medium text-red-500">-{formatCurrency(result.feesBreakdown.tax)}</span>
              </div>
           )}

           <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100 mt-2">
              <span>Custo Total da Venda:</span>
              <span>-{formatCurrency(totalSaleCost)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;