export type EngineStatus = 'INTEGRO' | 'QUEBRADO_POBRE' | 'QUEBRADO_DETONACAO' | 'OVERREV';

export interface DynoResult {
  rpmEixoX: number[];
  curvaPotencia: number[];
  curvaTorque: number[];
  curvaAfr: number[];
  statusFinal: EngineStatus;
  picoPotencia: number;
  picoTorque: number;
}

export interface DynoTest {
  id: number;
  motorId: number;
  potenciaMaxima: number;
  torqueMaximo: number;
  afrMedio: number;
  statusFinal: EngineStatus;
  dataTeste: string;
}

export const ENGINE_STATUS_LABELS: Record<EngineStatus, string> = {
  INTEGRO: 'Motor íntegro',
  QUEBRADO_POBRE: 'Quebra por mistura pobre',
  QUEBRADO_DETONACAO: 'Quebra por detonação',
  OVERREV: 'Quebra por excesso de giro'
};
