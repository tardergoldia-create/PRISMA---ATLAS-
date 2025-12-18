
import React from 'react';
import { Video, StopCircle, AlertTriangle, Monitor } from 'lucide-react';
import { CaptureError } from '../types';

interface ScreenCaptureControlProps {
    isCapturing: boolean;
    startCapture: () => Promise<void>;
    stopCapture: () => void;
    captureError: CaptureError | null;
    videoRef: React.RefObject<HTMLVideoElement>;
}

export const ScreenCaptureControl: React.FC<ScreenCaptureControlProps> = ({
    isCapturing,
    startCapture,
    stopCapture,
    captureError,
    videoRef
}) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Fluxo ao Vivo</h2>
                        <p className="text-sm text-slate-400">Compartilhe sua aba do TradingView ou Gráfico</p>
                    </div>
                </div>
                {isCapturing && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Ao Vivo</span>
                    </div>
                )}
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-700/50 group">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-contain" 
                />
                
                {!isCapturing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 p-6 text-center transition-all">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                            <Video className="w-10 h-10 text-fuchsia-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Pronto para Analisar</h3>
                        <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                            Clique em iniciar para compartilhar sua tela. O <strong>ATLAS SUPREME</strong> monitorará o gráfico em busca de oportunidades de alta precisão.
                        </p>
                    </div>
                )}
            </div>

            {captureError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                         <p className="font-bold">{captureError.title}</p>
                        <p className="opacity-80">{captureError.message}</p>
                    </div>
                </div>
            )}
            
            <button
                onClick={isCapturing ? stopCapture : startCapture}
                className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.98] ${
                    isCapturing 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' 
                    : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-500/20'
                }`}
            >
                {isCapturing ? (
                    <>
                        <StopCircle className="w-5 h-5" />
                        Parar Análise ATLAS
                    </>
                ) : (
                    <>
                        <Video className="w-5 h-5" />
                        Iniciar Leitura ATLAS SUPREME
                    </>
                )}
            </button>
        </div>
    );
};
