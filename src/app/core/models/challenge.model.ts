import { PageResponse } from './pagination.model';
import { EngineStatus, ENGINE_STATUS_LABELS } from './dyno.model';

export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ChallengeModel {
  id: number;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  motorId: number;
  motorManufacturer: string;
  motorName: string;
  classId: number;
  className: string;
  classCode: string;
  goalPowerCv: number;
  requiredEngineStatus: EngineStatus;
  createdAt: string;
  selected: boolean;
  attempts: number;
  completed: boolean;
  completedCriteria: number;
  criteria: string[];
  completedStudents: number;
  enrolledStudents: number;
}

export interface ChallengeQuery {
  search?: string;
  classId?: number;
  difficulty?: ChallengeDifficulty;
  motorId?: number;
  page: number;
  size: number;
  sort?: string;
}

export interface ChallengePayload {
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  motorId: number;
  classId: number;
  goalPowerCv: number;
  requiredEngineStatus: EngineStatus;
}

export interface ChallengeStudentProgressModel {
  studentId: number;
  fullName: string;
  email: string;
  selected: boolean;
  attempts: number;
  completed: boolean;
  completedCriteria: number;
  lastPeakPower: number | null;
  lastEngineStatus: string | null;
  completedAt: string | null;
}

export interface ChallengePerformanceModel {
  challengeId: number;
  title: string;
  goalPowerCv: number;
  students: ChallengeStudentProgressModel[];
}

export interface ChallengeDifficultyOption {
  value: ChallengeDifficulty;
  label: string;
  severity: 'success' | 'warn' | 'danger';
}

export interface EngineStatusOption {
  value: EngineStatus;
  label: string;
}

export const CHALLENGE_DIFFICULTY_OPTIONS: ChallengeDifficultyOption[] = [
  { value: 'EASY', label: 'Fácil', severity: 'success' },
  { value: 'MEDIUM', label: 'Médio', severity: 'warn' },
  { value: 'HARD', label: 'Difícil', severity: 'danger' },
];

export const ENGINE_STATUS_OPTIONS: EngineStatusOption[] = (
  Object.keys(ENGINE_STATUS_LABELS) as EngineStatus[]
).map((value) => ({ value, label: ENGINE_STATUS_LABELS[value] }));

export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  return CHALLENGE_DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty)?.label ?? difficulty;
}

export function getDifficultySeverity(difficulty: ChallengeDifficulty): 'success' | 'warn' | 'danger' {
  return CHALLENGE_DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty)?.severity ?? 'success';
}
