import { Observable } from 'rxjs';
import { TeacherDashboard } from '../models/teacher-dashboard.model';

export abstract class TeacherDashboardService {
  abstract getDashboard(): Observable<TeacherDashboard>;
}
