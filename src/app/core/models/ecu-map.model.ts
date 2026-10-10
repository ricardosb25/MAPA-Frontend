export type EcuMapType = 'IGNITION' | 'FUEL';

export interface EcuMapGrid {
  motorId: number;
  displacementClass: number;
  mapType: EcuMapType;
  label: string;
  unit: string;
  rpmBreakpoints: number[];
  loadBreakpoints: number[];
  values: number[][];
  defaultValues: number[][];
  minValue: number;
  maxValue: number;
  step: number;
  factoryDefault: boolean;
  updatedAt: string | null;
}

export interface EcuMapCellUpdate {
  loadIndex: number;
  rpmIndex: number;
  value: number;
}

export const ECU_MAP_TITLES: Record<EcuMapType, string> = {
  IGNITION: 'MAPA DE IGNIÇÃO — GRAUS DE AVANÇO',
  FUEL: 'MAPA DE COMBUSTÍVEL — VE %'
};
