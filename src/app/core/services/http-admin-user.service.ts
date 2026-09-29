import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUserModel, AdminUserQuery, AdminUserUpdatePayload } from '../models/admin-user.model';
import { PageResponse } from '../models/pagination.model';
import { AdminUserService } from './admin-user.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpAdminUserService implements AdminUserService {
  private readonly usersEndpointUrl = API_CONFIG.endpoints.users;

  constructor(private readonly httpClient: HttpClient) {}

  getUsersPage(query: AdminUserQuery): Observable<PageResponse<AdminUserModel>> {
    let queryParams = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sort', query.sort);

    if (query.role !== null) {
      queryParams = queryParams.set('role', query.role);
    }

    const normalizedSearch = query.search.trim();
    if (normalizedSearch !== '') {
      queryParams = queryParams.set('search', normalizedSearch);
    }

    return this.httpClient.get<PageResponse<AdminUserModel>>(this.usersEndpointUrl, {
      params: queryParams
    });
  }

  updateUser(userId: number, payload: AdminUserUpdatePayload): Observable<AdminUserModel> {
    return this.httpClient.put<AdminUserModel>(`${this.usersEndpointUrl}/${userId}`, payload);
  }
}
