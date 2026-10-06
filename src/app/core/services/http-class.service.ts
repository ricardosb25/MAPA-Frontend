import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { PageResponse } from '../models/pagination.model';
import { ClassDetailModel, ClassModel, ClassPayload, ClassQuery } from '../models/class.model';
import { ClassService } from './class.service';

@Injectable({
  providedIn: 'root',
})
export class HttpClassService implements ClassService {
  private readonly classesEndpointUrl = API_CONFIG.endpoints.classes;

  constructor(private readonly httpClient: HttpClient) {}

  getTeacherClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>> {
    return this.httpClient.get<PageResponse<ClassModel>>(this.classesEndpointUrl, {
      params: this.buildQueryParams(query),
    });
  }

  getClassDetail(classId: number | string): Observable<ClassDetailModel> {
    return this.httpClient.get<ClassDetailModel>(`${this.classesEndpointUrl}/${classId}`);
  }

  createClass(payload: ClassPayload): Observable<ClassModel> {
    return this.httpClient.post<ClassModel>(this.classesEndpointUrl, payload);
  }

  updateClass(classId: number | string, payload: ClassPayload): Observable<ClassModel> {
    return this.httpClient.put<ClassModel>(`${this.classesEndpointUrl}/${classId}`, payload);
  }

  deleteClass(classId: number | string): Observable<void> {
    return this.httpClient.delete<void>(`${this.classesEndpointUrl}/${classId}`);
  }

  regenerateClassCode(classId: number | string): Observable<ClassModel> {
    return this.httpClient.post<ClassModel>(`${this.classesEndpointUrl}/${classId}/new-code`, {});
  }

  removeStudent(classId: number | string, studentId: number | string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.classesEndpointUrl}/${classId}/students/${studentId}`,
    );
  }

  getMyClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>> {
    return this.httpClient.get<PageResponse<ClassModel>>(`${this.classesEndpointUrl}/mine`, {
      params: this.buildQueryParams(query),
    });
  }

  joinClass(code: string): Observable<ClassModel> {
    return this.httpClient.post<ClassModel>(`${this.classesEndpointUrl}/join`, { code });
  }

  leaveClass(classId: number | string): Observable<void> {
    return this.httpClient.delete<void>(`${this.classesEndpointUrl}/${classId}/leave`);
  }

  private buildQueryParams(query: ClassQuery): HttpParams {
    let queryParams = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sort', query.sort);

    const normalizedSearch = query.search.trim();
    if (normalizedSearch !== '') {
      queryParams = queryParams.set('search', normalizedSearch);
    }

    if (query.shift !== null) {
      queryParams = queryParams.set('shift', query.shift);
    }

    return queryParams;
  }
}
