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
      header: 'bg-[#ffe600]',
      text: 'text-[#333333]',
      fill: '#ffe600'
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

  // Taxas Totais (Marketplace + Frete + Impostos)
  const totalFees = result.totalVariableCosts + 
                    result.feesBreakdown.fixedFee + 
                    (result.feesBreakdown.tax || 0) + 
                    (result.feesBreakdown.shipping || 0) +
                    (result.feesBreakdown.affiliate || 0);

  // Custos Operacionais e de Produto (Internos)
  const totalInternalCosts = result.totalFixedCosts - result.feesBreakdown.fixedFee;
  const totalSaleCost = totalInternalCosts + totalFees;
  
  // Repasse (O que sobra após taxas do marketplace e impostos, antes de pagar o produto e op)
  const payout = result.sellingPrice - totalFees;

  const chartData = [
    { name: 'Custo Interno', value: totalInternalCosts, color: '#9CA3AF' },
    { name: 'Taxas & Marketplace', value: totalFees, color: '#EF4444' },
    { name: 'Lucro Líquido', value: result.netProfit > 0 ? result.netProfit : 0, color: '#10B981' },
  ];

  const headerTextColor = colorTheme === 'yellow' ? 'text-gray-900' : 'text-white';
  
  const displayName = result.platformName;

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden border ${currentTheme.border} ${currentTheme.bg} flex flex-col`}>
      <div className={`${currentTheme.header} ${headerTextColor} p-4 flex justify-between items-center`}>
        <h3 className="font-bold text-lg">{displayName}</h3>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="min-h-0 lg:min-h-[8.5rem]">
            {colorTheme === 'yellow' && mlListingType && onMlListingTypeChange && (
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tipo de Anúncio</label>
                    <div className="flex p-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <button onClick={() => onMlListingTypeChange('classic')} className={`flex-1 py-1.5 text-xs font-bold rounded uppercase transition-all ${mlListingType === 'classic' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-yellow-600'}`}>Clássico</button>
                        <button onClick={() => onMlListingTypeChange('premium')} className={`flex-1 py-1.5 text-xs font-bold rounded uppercase transition-all ${mlListingType === 'premium' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-yellow-600'}`}>Premium</button>
                    </div>
                </div>
            )}

            {colorTheme === 'orange' && (
               <div className="hidden">
                   {/* Shopee Toggle Removed */}
               </div>
            )}
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 mb-1 font-medium tracking-tight leading-none uppercase text-[10px]">Preço de Venda Final</p>
          <div className={`text-4xl font-bold ${currentTheme.text}`}>
            {formatCurrency(result.sellingPrice)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Lucro (R$)</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(result.netProfit)}</p>
           </div>
           <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Margem</p>
              <p className="text-xl font-bold text-emerald-600">{formatPercent(result.netProfitMargin)}</p>
           </div>
        </div>

        <div className="mb-6 h-32 w-full relative">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                 {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
               </Pie>
               <Tooltip formatter={(value: number) => formatCurrency(value)} />
             </PieChart>
           </ResponsiveContainer>
        </div>

        <div className="space-y-2 text-sm border-t border-gray-100 pt-4 mt-auto">
          <div className="flex justify-between text-gray-500 text-[12px]">
            <span>Custos Internos (Produto + Op):</span>
            <span className="font-medium">{formatCurrency(totalInternalCosts)}</span>
          </div>
          
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-red-500 font-bold border-b border-red-50 pb-1 text-[13px]">
               <span>Total de Taxas:</span>
               <span>-{formatCurrency(totalFees)}</span>
            </div>
            {/* Detalhamento das Taxas */}
            <div className="pl-2 space-y-0.5 mt-1 border-l-2 border-red-100">
              {result.platformName === 'Shopee' ? (
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Taxa de comissão líquida:</span>
                  <span>-{formatCurrency((result.feesBreakdown.commission || 0) + (result.feesBreakdown.serviceFee || 0))}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                    <span>Taxa de Comissão:</span>
                    <span>-{formatCurrency(result.feesBreakdown.commission)}</span>
                  </div>
                  {(result.feesBreakdown.serviceFee !== undefined && (result.platformName === 'Shopee' || result.platformName === 'TikTok Shop')) && (
                    <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                      <span>Taxa de Frete Grátis:</span>
                      <span>-{formatCurrency(result.feesBreakdown.serviceFee || 0)}</span>
                    </div>
                  )}
                </>
              )}
              {(result.feesBreakdown.transactionFee || 0) > 0 && (
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Taxa de Transação:</span>
                  <span>-{formatCurrency(result.feesBreakdown.transactionFee || 0)}</span>
                </div>
              )}
              {result.feesBreakdown.fixedFee > 0 && (
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Taxa por Item:</span>
                  <span>-{formatCurrency(result.feesBreakdown.fixedFee)}</span>
                </div>
              )}
              {(result.feesBreakdown.shipping || 0) > 0 && (
                <div className="flex justify-between text-[11px] text-gray-500 font-bold italic">
                  <span>Custo de Frete (ML):</span>
                  <span>-{formatCurrency(result.feesBreakdown.shipping || 0)}</span>
                </div>
              )}
              {(result.feesBreakdown.tax || 0) > 0 && (
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Imposto:</span>
                  <span>-{formatCurrency(result.feesBreakdown.tax || 0)}</span>
                </div>
              )}
            </div>
          </div>

           <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100 mt-2 text-[12px]">
              <span>Custo Total da Venda:</span>
              <span>-{formatCurrency(totalSaleCost)}</span>
           </div>

           {/* Bloco Repasse Líquido - Verde */}
           <div className="flex justify-between items-center font-bold text-emerald-700 pt-3 border-t-2 border-dashed border-emerald-100 mt-2 bg-emerald-50/50 -mx-6 px-6 py-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 opacity-80 font-black">Repasse Líquido</span>
                <span className="text-[10px] font-normal text-emerald-500 -mt-1">Cai na conta</span>
              </div>
              <span className="text-xl">{formatCurrency(payout)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;