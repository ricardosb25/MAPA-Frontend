export type EngineStatus = 'INTEGRO' | 'QUEBRADO_POBRE' | 'QUEBRADO_DETONACAO' | 'OVERREV';

export interface DynoResult {
  rpmAxis: number[];
  powerCurve: number[];
  torqueCurve: number[];
  afrCurve: number[];
  finalStatus: EngineStatus;
  peakPower: number;
  peakTorque: number;
}

export interface DynoTest {
  id: number;
  motorId: number;
  maxPower: number;
  maxTorque: number;
  averageAfr: number;
  finalStatus: EngineStatus;
  testedAt: string;
}

export const ENGINE_STATUS_LABELS: Record<EngineStatus, string> = {
  INTEGRO: 'Motor íntegro',
  QUEBRADO_POBRE: 'Quebra por mistura pobre',
  QUEBRADO_DETONACAO: 'Quebra por detonação',
  OVERREV: 'Quebra por excesso de giro'
};
