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

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: string;
}

export interface EnginePageQuery {
  page: number;
  size: number;
  sort: string;
}
