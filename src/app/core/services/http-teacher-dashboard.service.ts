import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { TeacherDashboard } from '../models/teacher-dashboard.model';
import { TeacherDashboardService } from './teacher-dashboard.service';

@Injectable({ providedIn: 'root' })
export class HttpTeacherDashboardService extends TeacherDashboardService {
  constructor(private readonly httpClient: HttpClient) {
    super();
  }

  override getDashboard(): Observable<TeacherDashboard> {
    return this.httpClient.get<TeacherDashboard>(API_CONFIG.endpoints.teacherDashboard);
  }
}
