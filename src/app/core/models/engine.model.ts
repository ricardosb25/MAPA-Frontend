export type EngineAspirationType = 'ASPIRADO' | 'TURBO' | string;

export interface EngineModel {
  id: number;
  manufacturer: string;
  name: string;
  description: string;
  displacementLiters: number;
  displacementCc: number;
  compressionRatio: number;
  rpmCutoff: number;
  aspirationType: EngineAspirationType;
  createdAt: string;
  isSelected?: boolean;
}
