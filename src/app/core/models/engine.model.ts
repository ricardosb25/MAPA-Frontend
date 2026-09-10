export type EngineAspirationType = 'ASPIRADO' | 'TURBO';

export interface EngineSpecification {
  displacement: string;
  compressionRatio: string;
  revLimit: string;
}

export interface EngineModel {
  id: string;
  manufacturer: string;
  name: string;
  aspiration: EngineAspirationType;
  description: string;
  specification: EngineSpecification;
  isSelected: boolean;
}
