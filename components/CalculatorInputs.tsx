import React from 'react';
import { UserInputs, CalculationMethod } from '../types';

interface CalculatorInputsProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  method: CalculationMethod;
  setMethod: (m: CalculationMethod) => void;
}

const CalculatorInputs: React.FC<CalculatorInputsProps> = ({ inputs, setInputs, method, setMethod }) => {
  
  // Allow string or number value to be set directly
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
        if (nextElement) {
          nextElement.focus();
        }
      } else {
        // Se for o último campo, remove o foco (útil para fechar teclado mobile)
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
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
        
        {/* Método de Cálculo */}
        <div className="flex-1 min-w-[200px]">
           <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Método de Cálculo</label>
           <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMethod(CalculationMethod.TARGET_MARGIN)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap px-2 ${
                method === CalculationMethod.TARGET_MARGIN
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Margem Alvo
            </button>
            <button
              onClick={() => setMethod(CalculationMethod.REAL_PROFIT)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap px-2 ${
                method === CalculationMethod.REAL_PROFIT
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 Lucro Real
            </button>
          </div>
        </div>

        {/* CNPJ Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-[180px]">
           <div className="mr-3">
              <span className="text-sm font-bold text-gray-800 block">Sou CNPJ</span>
              <span className="text-[10px] text-gray-500 leading-tight">Calcula impostos</span>
           </div>
           <button 
              onClick={() => handleChange('isCNPJ', !inputs.isCNPJ)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inputs.isCNPJ ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inputs.isCNPJ ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 h-12 mx-2"></div>

        {/* Action Button Desktop */}
        <div className="hidden lg:block">
           <button
            onClick={handleClear}
            className="flex items-center justify-center space-x-1 px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all text-sm font-medium h-[46px]"
            title="Limpar Dados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custo do Produto (R$)</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custo Operacional (R$)</label>
            <input
              id="operationalCost"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={inputs.operationalCost}
              onFocus={handleFocus}
              onChange={(e) => handleChange('operationalCost', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, inputs.isCNPJ ? 'taxRate' : (method === CalculationMethod.TARGET_MARGIN ? 'targetMargin' : 'testPrice'))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-300"
            />
          </div>

        {inputs.isCNPJ && (
          <div className="relative">
             <label className="block text-sm font-bold text-blue-800 mb-1">Imposto - Simples (%)</label>
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
                  className="w-full pl-3 pr-8 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-blue-50/50 text-gray-900 placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
             </div>
          </div>
        )}

        {method === CalculationMethod.TARGET_MARGIN ? (
          <div>
            <label className="block text-sm font-bold text-indigo-900 mb-1">Margem de Lucro Alvo (%)</label>
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
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900 font-semibold bg-indigo-50 placeholder-indigo-300"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-1">Preço de Venda Teste (R$)</label>
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
              className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-semibold bg-emerald-50 placeholder-emerald-300"
            />
          </div>
        )}
      </div>

      {/* Clear Button Mobile Only */}
      <div className="mt-6 pt-6 border-t border-gray-100 lg:hidden">
        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center space-x-2 py-2.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          <span>Limpar Dados</span>
        </button>
      </div>
    </div>
  );
};

export default CalculatorInputs;