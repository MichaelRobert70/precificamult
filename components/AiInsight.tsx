import React, { useState } from 'react';
import { UserInputs, PlatformResult, CalculationMethod } from '../types';
import { generatePricingAnalysis } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiInsightProps {
  inputs: UserInputs;
  shopeeResult: PlatformResult;
  tiktokResult: PlatformResult;
  mlResult: PlatformResult;
  amazonResult: PlatformResult;
  method: CalculationMethod;
}

const AiInsight: React.FC<AiInsightProps> = ({ 
  inputs, 
  shopeeResult, 
  tiktokResult, 
  mlResult, 
  amazonResult, 
  method 
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleGenerateInsight = async () => {
    setLoading(true);
    setAnalysis(null);
    const result = await generatePricingAnalysis(
      inputs, 
      shopeeResult, 
      tiktokResult, 
      mlResult, 
      amazonResult, 
      method
    );
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-lg shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
             </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Análise com Inteligência Artificial</h3>
            <p className="text-sm text-gray-500">Insights estratégicos de rentabilidade</p>
          </div>
        </div>
        
        {!analysis && !loading && (
          <button
            onClick={handleGenerateInsight}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <span>Gerar Análise</span>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {loading && (
          <div className="space-y-4 animate-pulse max-w-2xl">
            <div className="h-5 bg-indigo-100 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            <div className="h-5 bg-indigo-100 rounded w-1/4 mt-6 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center py-6 text-gray-400 text-sm">
            Clique no botão acima para receber uma análise comparativa detalhada entre Shopee e TikTok.
          </div>
        )}

        {analysis && (
          <div className="
            prose prose-sm max-w-none text-gray-600
            prose-headings:text-indigo-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0
            prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-indigo-700 prose-strong:font-bold
            prose-ul:my-4 prose-li:mb-3 prose-li:marker:text-indigo-400
          ">
            <ReactMarkdown>{analysis}</ReactMarkdown>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
               <button onClick={handleGenerateInsight} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Atualizar Análise
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsight;