export type Shift = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'SATURDAY';

export interface ClassEnrollmentModel {
  studentId: number;
  fullName: string;
  email: string;
  joinedAt: string;
}

export interface ClassModel {
  id: number;
  name: string;
  code: string;
  shift: Shift;
  professorName: string;
  studentCount: number;
  createdAt: string;
}

export interface ClassDetailModel extends ClassModel {
  students: ClassEnrollmentModel[];
}

export interface ClassQuery {
  search: string;
  shift: Shift | null;
  page: number;
  size: number;
  sort: string;
}

export interface ClassPayload {
  name: string;
  shift: Shift;
}

export interface ClassJoinPayload {
  code: string;
}

export interface ShiftOption {
  value: Shift;
  label: string;
}

export const SHIFT_OPTIONS: ShiftOption[] = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'EVENING', label: 'Noite' },
  { value: 'SATURDAY', label: 'Sábado' },
];

export function shiftLabel(shift: Shift): string {
  return SHIFT_OPTIONS.find((option) => option.value === shift)?.label ?? shift;
}

export type { PageResponse } from './pagination.model';
