import React from 'react';
import { UserInputs, CalculationMethod } from '../types';
import { ML_CATEGORIES } from '../utils/calculations';

interface CalculatorInputsProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  method: CalculationMethod;
  setMethod: (m: CalculationMethod) => void;
}

const CalculatorInputs: React.FC<CalculatorInputsProps> = ({ inputs, setInputs, method, setMethod }) => {
  
  const handleChange = (field: keyof UserInputs, value: string | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldId) {
        const nextElement = document.getElementById(nextFieldId);
        if (nextElement) nextElement.focus();
      } else {
        e.currentTarget.blur();
      }
    }
  };

  const handleClear = () => {
    setInputs({
      productCost: '',
      operationalCost: '',
      targetMargin: '',
      testPrice: '',
      isCNPJ: false,
      taxRate: '',
      mlListingType: 'classic',
      shopeeListingType: 'free_shipping',
      useMLCategory: false,
      mlCategory: '',
      mlShippingCost: '',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-8">
      
      {/* Top Section: Global Configs */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
        
        {/* Método de Cálculo */}
        <div className="flex-1 min-w-[200px]">
           <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block text-center lg:text-left">Método de Cálculo</label>
           <div className="flex p-1 bg-gray-100 rounded-lg shadow-inner">
            <button
              onClick={() => setMethod(CalculationMethod.TARGET_MARGIN)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap px-4 ${
                method === CalculationMethod.TARGET_MARGIN
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Margem Alvo
            </button>
            <button
              onClick={() => setMethod(CalculationMethod.REAL_PROFIT)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap px-4 ${
                method === CalculationMethod.REAL_PROFIT
                  ? 'bg-white text-emerald-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 Lucro Real
            </button>
          </div>
        </div>

        {/* CNPJ Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg border border-blue-100 min-w-[180px]">
           <div className="mr-3">
              <span className="text-sm font-bold text-gray-800 block">Empresa (CNPJ)</span>
              <span className="text-[10px] text-blue-600 font-medium leading-tight uppercase">Desconta Imposto</span>
           </div>
           <button 
              onClick={() => handleChange('isCNPJ', !inputs.isCNPJ)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inputs.isCNPJ ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inputs.isCNPJ ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 h-12 mx-1"></div>

        {/* Action Button Desktop */}
        <div className="hidden lg:block">
           <button
            onClick={handleClear}
            className="flex items-center justify-center space-x-1 px-4 py-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-sm font-medium h-[46px]"
            title="Limpar Dados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span className="ml-1">Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
              Custo do Produto (R$)
            </label>
            <input
              id="productCost"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={inputs.productCost}
              onFocus={handleFocus}
              onChange={(e) => handleChange('productCost', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'operationalCost')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>
          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Custos Internos Op. (R$)</label>
            <input
              id="operationalCost"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Ex: Embalagem"
              value={inputs.operationalCost}
              onFocus={handleFocus}
              onChange={(e) => handleChange('operationalCost', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, inputs.isCNPJ ? 'taxRate' : (method === CalculationMethod.TARGET_MARGIN ? 'targetMargin' : 'testPrice'))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>

        {inputs.isCNPJ ? (
          <div className="relative group">
             <label className="block text-sm font-bold text-blue-800 mb-1.5">Alíquota de Imposto (%)</label>
             <div className="relative">
                <input
                  id="taxRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ex: 4.0"
                  value={inputs.taxRate}
                  onFocus={handleFocus}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, method === CalculationMethod.TARGET_MARGIN ? 'targetMargin' : 'testPrice')}
                  className="w-full pl-4 pr-10 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-blue-50/50 text-gray-900 placeholder-gray-400 font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-bold text-lg">%</span>
             </div>
          </div>
        ) : (
          <div className="hidden lg:block"></div>
        )}

        {method === CalculationMethod.TARGET_MARGIN ? (
          <div className="relative group">
            <label className="block text-sm font-bold text-indigo-900 mb-1.5">Meta de Margem Alvo (%)</label>
            <div className="relative">
                <input
                  id="targetMargin"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  value={inputs.targetMargin}
                  onFocus={handleFocus}
                  onChange={(e) => handleChange('targetMargin', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e)} 
                  className="w-full pl-4 pr-10 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900 font-bold bg-indigo-50/50 placeholder-indigo-300"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 font-bold text-lg">%</span>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <label className="block text-sm font-bold text-emerald-900 mb-1.5">Preço Desejado (R$)</label>
            <input
              id="testPrice"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={inputs.testPrice}
              onFocus={handleFocus}
              onChange={(e) => handleChange('testPrice', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-bold bg-emerald-50/50 placeholder-emerald-300"
            />
          </div>
        )}
      </div>

      {/* Advanced: Mercado Livre Category Selector */}
      <div className="pt-6 border-t border-gray-100">
         <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-6 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <div>
                  <h3 className="text-sm font-bold text-yellow-800 flex items-center">
                    <span className="mr-2">📦</span> Mercado Livre: Configurações Precisas
                  </h3>
                  <p className="text-[11px] text-yellow-600 mt-0.5">Ative para incluir taxas de categoria e custos de frete do marketplace.</p>
               </div>
               <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm self-start sm:self-center">
                  <span className={`text-[10px] font-bold mr-3 uppercase tracking-wider ${inputs.useMLCategory ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {inputs.useMLCategory ? 'Ativado' : 'Desativado'}
                  </span>
                  <button 
                    onClick={() => handleChange('useMLCategory', !inputs.useMLCategory)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inputs.useMLCategory ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inputs.useMLCategory ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
               </div>
            </div>

            {inputs.useMLCategory && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="lg:col-span-2 relative">
                    <label className="block text-[10px] font-bold text-yellow-700 uppercase mb-1.5 ml-1">Selecione a Categoria</label>
                    <select
                      value={inputs.mlCategory}
                      onChange={(e) => handleChange('mlCategory', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="">-- Selecione uma categoria --</option>
                      {ML_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.classic * 100}% / {category.premium * 100}%)
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-[38px] pointer-events-none text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-yellow-700 uppercase mb-1.5 ml-1 flex items-center">
                       Custo de Frete (R$)
                       <span className="ml-1 text-[8px] text-yellow-500 normal-case">(Pago ao ML)</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={inputs.mlShippingCost}
                      onFocus={handleFocus}
                      onChange={(e) => handleChange('mlShippingCost', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-yellow-500 outline-none shadow-sm"
                    />
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CalculatorInputs;