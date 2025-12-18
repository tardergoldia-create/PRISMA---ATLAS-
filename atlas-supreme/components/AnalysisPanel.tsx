
import React from 'react';
import { Brain, TrendingUp, TrendingDown, Target, Zap, Layers } from 'lucide-react';
import { MarketAnalysis, TradingSignal, SignalType } from '../types';

interface AnalysisPanelProps {
  analysis: MarketAnalysis | null;
  signals: TradingSignal[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, signals }) => {
  const translateTrend = (trend: string) => {
    switch(trend) {
      case 'bullish': return 'Alta';
      case 'bearish': return 'Baixa';
      case 'sideways': return 'Lateral';
      default: return trend;
    }
  };

  return (
    <>
      {/* Inteligência ATLAS SUPREME */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/10 blur-3xl -mr-10 -mt-10" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30">
            <Brain className="w-5 h-5 text-fuchsia-400" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Inteligência ATLAS SUPREME</h2>
        </div>

        {analysis ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                analysis.trend === 'bullish' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                analysis.trend === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {analysis.trend === 'bullish' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Tendência: {translateTrend(analysis.trend)}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700 uppercase tracking-wider">
                Sentimento: {analysis.sentiment}
              </span>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-fuchsia-500/50 pl-4 py-2 bg-fuchsia-500/5 rounded-r-lg">
              "{analysis.commentary}"
            </p>

            <div className="mt-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Níveis Críticos Identificados
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keyLevels.map((lvl, idx) => (
                  <span key={idx} className="mono text-xs px-3 py-1.5 bg-slate-800/80 rounded border border-slate-700 text-fuchsia-300">
                    {lvl.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Zap className="w-8 h-8 text-slate-700 mb-3 animate-pulse" />
            <p className="text-slate-500 text-sm">Aguardando ATLAS para processamento de mercado...</p>
          </div>
        )}
      </div>

      {/* Sinais de Execução */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Sinais de Execução</h2>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {signals.length > 0 ? (
            signals.map((sig) => (
              <div key={sig.id} className={`p-4 rounded-xl border transition-all animate-in slide-in-from-right-4 ${
                sig.type === SignalType.BUY 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm ${
                    sig.type === SignalType.BUY ? 'bg-green-500 text-green-950' : 'bg-red-500 text-red-950'
                  }`}>
                    {sig.type === SignalType.BUY ? 'COMPRA' : 'VENDA'}
                  </span>
                  <span className="text-[10px] text-slate-500 mono bg-slate-800/50 px-2 py-1 rounded">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-baseline justify-between mb-3">
                  <div className="mono text-2xl font-bold text-white">
                    {sig.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-bold">
                    {sig.confidence}% CONF.
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{sig.reason}</p>
                <div className="flex gap-2">
                  {sig.target && (
                    <div className="flex-1 bg-slate-950/50 p-2 rounded border border-slate-800">
                      <div className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Take Profit</div>
                      <div className="mono text-[11px] text-green-400 font-bold">{sig.target.toFixed(2)}</div>
                    </div>
                  )}
                  {sig.stopLoss && (
                    <div className="flex-1 bg-slate-950/50 p-2 rounded border border-slate-800">
                      <div className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Stop Loss</div>
                      <div className="mono text-[11px] text-red-400 font-bold">{sig.stopLoss.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center opacity-40">
              <p className="text-slate-400 text-sm font-medium">Nenhum sinal detectado pela rede neural ATLAS nesta sessão</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
