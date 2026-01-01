import React, { useState, useEffect, useRef } from 'react';
import CalculatorInputs from './components/CalculatorInputs';
import ResultCard from './components/ResultCard';
import AiInsight from './components/AiInsight';
import { UserInputs, CalculationMethod, CalculationContext } from './types';
import { calculateResults } from './utils/calculations';

const App: React.FC = () => {
  const [method, setMethod] = useState<CalculationMethod>(CalculationMethod.TARGET_MARGIN);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  
  const [inputs, setInputs] = useState<UserInputs>({
    productCost: 30.00,
    operationalCost: 2.00,
    targetMargin: 30.0,
    testPrice: 79.90,
    isCNPJ: false,
    taxRate: '',
    mlListingType: 'classic',
    shopeeListingType: 'free_shipping',
  });

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

  const scrollToAI = () => {
    aiSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const PlatformTogglesContent = () => (
    <div className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Shopee</span>
            </div>
            <button onClick={() => togglePlatform('shopee')} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${visiblePlatforms.shopee ? 'bg-[#ee4d2d]' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.shopee ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">TikTok</span>
            </div>
            <button onClick={() => togglePlatform('tiktok')} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${visiblePlatforms.tiktok ? 'bg-black' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.tiktok ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Mercado Livre</span>
            </div>
            <button onClick={() => togglePlatform('mercadolivre')} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${visiblePlatforms.mercadolivre ? 'bg-[#ffe600]' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.mercadolivre ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 pl-2">Amazon</span>
            </div>
            <button onClick={() => togglePlatform('amazon')} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${visiblePlatforms.amazon ? 'bg-[#232f3e]' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visiblePlatforms.amazon ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    </div>
  );

  const hasAnyPlatformVisible = Object.values(visiblePlatforms).some(v => v);

  return (
    <div className="min-h-screen pb-12 relative bg-[#f8fafc]">
      
      {/* Floating AI Bubble */}
      <button 
        onClick={scrollToAI}
        className="fixed bottom-6 right-6 z-[100] bg-indigo-600 text-white p-4 rounded-full shadow-2xl ai-bubble-pulse hover:bg-indigo-700 transition-all flex items-center space-x-2 border-2 border-white"
        title="Ver Análise da IA"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <span className="hidden sm:inline font-bold text-sm">IA Insight</span>
      </button>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
         <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 h-full flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>
              <div className="mb-6">
                 <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center">Plataformas Ativas</h3>
                 <PlatformTogglesContent />
              </div>
              <div className="mt-4 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Guia Rápido</h4>
                  <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="mr-3">🎯</span>
                        <div><p className="text-sm font-bold text-gray-900">Margem Alvo</p><p className="text-xs text-gray-500">Descubra o preço ideal.</p></div>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-3">💰</span>
                        <div><p className="text-sm font-bold text-gray-900">Lucro Real</p><p className="text-xs text-gray-500">Teste um preço de venda.</p></div>
                      </div>
                  </div>
              </div>
            </div>
         </div>
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
             </button>
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">P</span>
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">Precifica<span className="text-indigo-600">Multi</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Netlify Ready</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9 h-full">
               <CalculatorInputs inputs={inputs} setInputs={setInputs} method={method} setMethod={setMethod} />
            </div>
            <div className="hidden xl:block xl:col-span-3 h-full">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
                    <h3 className="flex items-center text-sm font-bold text-gray-900 mb-4">Plataformas Ativas</h3>
                    <PlatformTogglesContent />
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Guia Rápido</h4>
                        <p className="text-xs text-gray-500 mb-2">🎯 <strong>Margem Alvo:</strong> Descubra o preço ideal.</p>
                        <p className="text-xs text-gray-500">💰 <strong>Lucro Real:</strong> Teste um preço de venda.</p>
                    </div>
                </div>
            </div>
          </div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Comparativo de Resultados</h2>
             </div>
             {results && hasAnyPlatformVisible ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visiblePlatforms.shopee && <ResultCard result={results.shopee} colorTheme="orange" shopeeListingType={inputs.shopeeListingType} onShopeeListingTypeChange={(type) => setInputs(prev => ({ ...prev, shopeeListingType: type }))} />}
                    {visiblePlatforms.tiktok && <ResultCard result={results.tiktok} colorTheme="black" />}
                    {visiblePlatforms.mercadolivre && <ResultCard result={results.mercadolivre} colorTheme="yellow" mlListingType={inputs.mlListingType} onMlListingTypeChange={(type) => setInputs(prev => ({ ...prev, mlListingType: type }))} />}
                    {visiblePlatforms.amazon && <ResultCard result={results.amazon} colorTheme="blue" />}
                 </div>
             ) : (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center p-6 text-gray-400 font-medium">Ative as plataformas para ver os cálculos.</div>
             )}
          </div>

          {/* AI Insight Section */}
          <div ref={aiSectionRef}>
            {results && (
              <AiInsight 
                inputs={inputs}
                shopeeResult={results.shopee}
                tiktokResult={results.tiktok}
                mlResult={results.mercadolivre}
                amazonResult={results.amazon}
                method={method}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;