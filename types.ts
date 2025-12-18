
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  NEUTRAL = 'NEUTRAL'
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TradingSignal {
  id: string;
  type: SignalType;
  price: number;
  confidence: number;
  timestamp: number;
  reason: string;
  target?: number;
  stopLoss?: number;
  factors: string[];
}

export interface SupportResistanceZone {
  price: number;
  type: 'support' | 'resistance';
  touches: number;
  strength: number;
}

export interface CaptureError {
  title: string;
  message: string;
}

export interface MarketAnalysis {
  sentiment: string;
  trend: 'bullish' | 'bearish' | 'sideways';
  keyLevels: number[];
  commentary: string;
}
