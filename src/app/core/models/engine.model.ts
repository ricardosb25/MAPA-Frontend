export type EngineAspirationType = 'ASPIRADO' | 'TURBO' | 'SUPERCHARGER';

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

export interface EnginePayload {
  manufacturer: string;
  name: string;
  description: string;
  displacementLiters: number;
  displacementCc: number;
  compressionRatio: number;
  rpmCutoff: number;
  aspirationType: EngineAspirationType;
}

export type { PageResponse } from './pagination.model';

export interface EnginePageQuery {
  page: number;
  size: number;
  sort: string;
}