import { Shift } from './class.model';

export interface ClassPerformance {
  classId: number;
  className: string;
  classCode: string;
  shift: Shift;
  studentCount: number;
  challengeCount: number;
  activeStudents: number;
  totalAttempts: number;
  completedAssignments: number;
  inProgressAssignments: number;
  notStartedAssignments: number;
  completionRate: number;
}

export interface TeacherDashboard {
  classes: ClassPerformance[];
  generatedAt: string;
}
