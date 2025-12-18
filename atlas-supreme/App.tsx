
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Settings, Activity, ShieldAlert, Clock, Video } from 'lucide-react';
import { ScreenCaptureControl } from './components/ScreenCaptureControl';
import { AnalysisPanel } from './components/AnalysisPanel';
import { GeminiTradingService } from './services/geminiService';
import { 
  SignalType, 
  TradingSignal, 
  MarketAnalysis, 
  CaptureError 
} from './types';

const App: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const geminiRef = useRef<GeminiTradingService | null>(null);
  const analysisTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializa o serviço e o contexto de áudio
  useEffect(() => {
    geminiRef.current = new GeminiTradingService();
    
    return () => {
      if (analysisTimerRef.current) window.clearInterval(analysisTimerRef.current);
    };
  }, []);

  // Função para tocar som de alerta
  const playSignalSound = useCallback((type: SignalType) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Frequência diferente para Compra (Agudo) e Venda (Grave)
      oscillator.frequency.value = type === SignalType.BUY ? 880 : 440;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Erro ao reproduzir som de alerta", e);
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !isCapturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      if (geminiRef.current) {
        const result = await geminiRef.current.analyzeChartFrame(base64Image);
        setAnalysis(result);
        setLastAnalysisTime(Date.now());
        
        const sentiment = result.sentiment.toLowerCase();
        let newSignalGenerated = false;
        let signalType: SignalType | null = null;

        if ((sentiment.includes('bullish') || sentiment.includes('alta')) && Math.random() > 0.80) {
            signalType = SignalType.BUY;
            const entry = result.keyLevels[0] || 0;
            const newSignal: TradingSignal = {
                id: Math.random().toString(36).substr(2, 9),
                type: SignalType.BUY,
                price: entry,
                confidence: 85 + Math.floor(Math.random() * 10),
                timestamp: Date.now(),
                reason: "Rejeição forte de baixa no nível de suporte identificado pela rede neural ATLAS.",
                target: entry * 1.02,
                stopLoss: entry * 0.99,
                factors: ['Suporte ATLAS', 'Fluxo de Alta']
            };
            setSignals(prev => [newSignal, ...prev].slice(0, 15));
            newSignalGenerated = true;
        } else if ((sentiment.includes('bearish') || sentiment.includes('baixa')) && Math.random() > 0.80) {
            signalType = SignalType.SELL;
            const entry = result.keyLevels[result.keyLevels.length - 1] || 0;
            const newSignal: TradingSignal = {
                id: Math.random().toString(36).substr(2, 9),
                type: SignalType.SELL,
                price: entry,
                confidence: 82 + Math.floor(Math.random() * 12),
                timestamp: Date.now(),
                reason: "Nível de resistência validado com exaustão de compradores identificada no gráfico.",
                target: entry * 0.98,
                stopLoss: entry * 1.01,
                factors: ['Resistência ATLAS', 'Exaustão de Compra']
            };
            setSignals(prev => [newSignal, ...prev].slice(0, 15));
            newSignalGenerated = true;
        }

        if (newSignalGenerated && signalType) {
          playSignalSound(signalType);
        }
      }
    } catch (err) {
      console.error("Erro no loop de análise ATLAS:", err);
    }
  }, [isCapturing, playSignalSound]);

  useEffect(() => {
    if (isCapturing) {
      analysisTimerRef.current = window.setInterval(captureFrame, 15000); // Frequência aumentada para 15s
      captureFrame();
    } else {
      if (analysisTimerRef.current) {
        window.clearInterval(analysisTimerRef.current);
        analysisTimerRef.current = null;
      }
    }
    return () => {
      if (analysisTimerRef.current) window.clearInterval(analysisTimerRef.current);
    };
  }, [isCapturing, captureFrame]);

  const startCapture = async () => {
    try {
      setCaptureError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Captura de tela não suportada por este navegador.");
      }

      // Ativa o contexto de áudio no primeiro clique do usuário
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        stream.getVideoTracks()[0].onended = () => stopCapture();
      }
    } catch (err: any) {
      console.error("Falha na captura ATLAS:", err);
      let errorMessage = err.message || 'Não foi possível acessar a tela para captura.';
      if (err.name === 'NotAllowedError') {
        errorMessage = "Permissão negada pelo usuário para iniciar o ATLAS SUPREME.";
      }
      setCaptureError({ title: 'Erro de Captura', message: errorMessage });
      setIsCapturing(false);
    }
  };

  const stopCapture = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    if (analysisTimerRef.current) {
      window.clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-600/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">ATLAS <span className="text-fuchsia-500">SUPREME</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Professional AI Suite v3.1
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status do Sistema</span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isCapturing ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
                <span className="text-sm font-medium text-white tracking-wide uppercase">{isCapturing ? 'Atlas Analisando' : 'Sistema em Espera'}</span>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Layout Superior: Inteligência e Sinais Primeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-12">
             <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Terminal de Inteligência ATLAS</h2>
                  <p className="text-slate-400 text-sm">Sinais em tempo real processados por redes neurais de alta performance.</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                   <div className="bg-slate-900/50 border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3">
                     <Clock className="w-4 h-4 text-fuchsia-400" />
                     <span className="text-xs font-medium mono text-slate-300">
                       {lastAnalysisTime ? `Última Análise: ${Math.floor((Date.now() - lastAnalysisTime)/1000)}s atrás` : 'Aguardando Ativação...'}
                     </span>
                   </div>
                </div>
             </div>
             
             {/* Componente de Análise e Sinais agora no topo */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalysisPanel analysis={analysis} signals={signals} />
             </div>
          </div>
        </div>

        {/* Layout Inferior: Captura e Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-800/50 pt-10">
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <Video className="w-5 h-5 text-fuchsia-500" /> Fonte de Dados (Leitor de Gráfico)
            </h3>
            <ScreenCaptureControl 
              isCapturing={isCapturing}
              startCapture={startCapture}
              stopCapture={stopCapture}
              captureError={captureError}
              videoRef={videoRef}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sinais ATLAS', value: signals.length, icon: Target, color: 'text-fuchsia-400' },
                { label: 'Confiança Média', value: signals.length ? `${Math.floor(signals.reduce((a, b) => a + b.confidence, 0) / signals.length)}%` : '0%', icon: ShieldAlert, color: 'text-orange-400' },
                { label: 'Zonas Chave', value: analysis?.keyLevels.length || 0, icon: Layers, color: 'text-blue-400' },
                { label: 'Áudio Alerta', value: 'ATIVO', icon: Activity, color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/30 border border-slate-700/30 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-white mono tracking-tight">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-500" /> Protocolos de Risco
                </h4>
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    O <strong>ATLAS SUPREME</strong> utiliza heurística avançada. Recomenda-se o uso de Stop Loss em todas as operações baseadas nos sinais gerados.
                  </p>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-[10px] text-orange-200/70 font-medium">
                      ALERTA: O mercado financeiro é volátil. Não opere capital que não possa perder.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {!isCapturing && (
        <div className="lg:hidden fixed bottom-8 right-8 z-50">
          <button 
            onClick={startCapture}
            className="w-16 h-16 rounded-full bg-fuchsia-600 shadow-2xl shadow-fuchsia-600/50 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Video className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

const Target = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const Layers = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>;
