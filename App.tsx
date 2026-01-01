import React, { useState, useEffect } from 'react';
import CalculatorInputs from './components/CalculatorInputs';
import ResultCard from './components/ResultCard';
import { UserInputs, CalculationMethod, CalculationContext } from './types';
import { calculateResults } from './utils/calculations';

const App: React.FC = () => {
  const [method, setMethod] = useState<CalculationMethod>(CalculationMethod.TARGET_MARGIN);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [inputs, setInputs] = useState<UserInputs>({
    productCost: 30.00,
    operationalCost: 2.00,
    targetMargin: 30.0,
    testPrice: 79.90,
    isCNPJ: false,
    taxRate: '',
    mlListingType: 'classic',
    shopeeListingType: 'free_shipping', // Default to common scenario (with program)
  });

  // State to control platform visibility
  const [visiblePlatforms, setVisiblePlatforms] = useState({
    shopee: true,
    mercadolivre: true,
    tiktok: true,
    amazon: true
  });

  const [results, setResults] = useState<CalculationContext | null>(null);

  useEffect(() => {
    const calculation = calculateResults(inputs, method);
    setResults(calculation);
  }, [inputs, method]);

  const togglePlatform = (platform: keyof typeof visiblePlatforms) => {
    setVisiblePlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Helper component for the toggles content to avoid code duplication
  const PlatformTogglesContent = () => (
    <div className="space-y-3">
        {/* Shopee Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Shopee</span>
            </div>
            <button 
                onClick={() => togglePlatform('shopee')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${visiblePlatforms.shopee ? 'bg-[#ee4d2d]' : 'bg-gray-200'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.shopee ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        {/* TikTok Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">TikTok</span>
            </div>
            <button 
                onClick={() => togglePlatform('tiktok')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${visiblePlatforms.tiktok ? 'bg-black' : 'bg-gray-200'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.tiktok ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        {/* Mercado Livre Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Mercado Livre</span>
            </div>
            <button 
                onClick={() => togglePlatform('mercadolivre')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${visiblePlatforms.mercadolivre ? 'bg-[#ffe600]' : 'bg-gray-200'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.mercadolivre ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        {/* Amazon Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Amazon</span>
            </div>
            <button 
                onClick={() => togglePlatform('amazon')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${visiblePlatforms.amazon ? 'bg-[#232f3e]' : 'bg-gray-200'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.amazon ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    </div>
  );

  const hasAnyPlatformVisible = Object.values(visiblePlatforms).some(v => v);

  return (
    <div className="min-h-screen pb-12 relative bg-[#f8fafc]">
      
      {/* Mobile Menu Drawer (Left to Right) */}
      <div 
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
         {/* Backdrop */}
         <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
         ></div>

         {/* Drawer Panel */}
         <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 h-full flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
                 <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>

              <div className="mb-6">
                 <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-500 mr-2">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    Plataformas Ativas
                 </h3>
                 <PlatformTogglesContent />
              </div>

              {/* Added Guia Rapido to Mobile Drawer */}
              <div className="mt-4 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Guia Rápido</h4>
                  <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="mr-3">🎯</span>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Margem Alvo</p>
                            <p className="text-xs text-gray-500">Descubra o preço ideal.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-3">💰</span>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Lucro Real</p>
                            <p className="text-xs text-gray-500">Teste um preço de venda.</p>
                        </div>
                      </div>
                  </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="bg-indigo-50 p-4 rounded-xl">
                   <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                     Ative as plataformas para comparar as taxas automaticamente.
                   </p>
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             {/* Mobile Menu Button */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             </button>

             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">P</span>
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">Precifica<span className="text-indigo-600">Multi</span></h1>
          </div>
          <a href="#" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
            Documentação
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="flex flex-col gap-8">
          
          {/* Top Section: Inputs & Configs (Side by Side on Large Screens) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Calculator Inputs - Takes majority of width */}
            <div className="xl:col-span-9 h-full">
               <CalculatorInputs 
                  inputs={inputs} 
                  setInputs={setInputs} 
                  method={method} 
                  setMethod={setMethod} 
               />
            </div>

            {/* Platform Visibility - Desktop Sidebar Style block */}
            <div className="hidden xl:block xl:col-span-3 h-full">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
                    <h3 className="flex items-center text-sm font-bold text-gray-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500 mr-2">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                        Plataformas Ativas
                    </h3>
                    <PlatformTogglesContent />
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Guia Rápido</h4>
                        <p className="text-xs text-gray-500 mb-2">🎯 <strong>Margem Alvo:</strong> Descubra o preço ideal.</p>
                        <p className="text-xs text-gray-500">💰 <strong>Lucro Real:</strong> Teste um preço de venda.</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Bottom Section: Results (4 Columns) */}
          <div>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Comparativo de Resultados</h2>
             </div>

             {results && hasAnyPlatformVisible ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visiblePlatforms.shopee && (
                      <ResultCard 
                        result={results.shopee} 
                        colorTheme="orange" 
                        shopeeListingType={inputs.shopeeListingType}
                        onShopeeListingTypeChange={(type) => setInputs(prev => ({ ...prev, shopeeListingType: type }))}
                      />
                    )}
                    {/* TikTok before ML as per preference */}
                    {visiblePlatforms.tiktok && (
                      <ResultCard result={results.tiktok} colorTheme="black" />
                    )}
                    {visiblePlatforms.mercadolivre && (
                      <ResultCard 
                        result={results.mercadolivre} 
                        colorTheme="yellow" 
                        mlListingType={inputs.mlListingType}
                        onMlListingTypeChange={(type) => setInputs(prev => ({ ...prev, mlListingType: type }))}
                      />
                    )}
                    {visiblePlatforms.amazon && (
                      <ResultCard result={results.amazon} colorTheme="blue" />
                    )}
                 </div>
             ) : (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                        </svg>
                    </div>
                    <h3 className="text-gray-900 font-medium">Nenhuma plataforma selecionada</h3>
                    <p className="text-gray-500 text-sm mt-1">Ative as plataformas no menu para ver os cálculos.</p>
                </div>
             )}
          </div>

          {/* Quick Help Footer for Mobile Only */}
          <div className="xl:hidden bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-indigo-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Guia Rápido de Métodos
             </h3>
             <div className="space-y-4">
                <div className="flex items-start">
                   <span className="text-xl mr-3">🎯</span>
                   <div>
                      <p className="text-sm font-bold text-gray-900">Margem Alvo</p>
                      <p className="text-xs text-gray-600">Calcula o preço de venda ideal com base no lucro que você deseja receber livre.</p>
                   </div>
                </div>
                <div className="flex items-start">
                   <span className="text-xl mr-3">💰</span>
                   <div>
                      <p className="text-sm font-bold text-gray-900">Lucro Real</p>
                      <p className="text-xs text-gray-600">Analisa quanto sobra em reais após descontar taxas de um preço que você já definiu.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;