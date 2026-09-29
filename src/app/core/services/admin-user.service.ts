import { Observable } from 'rxjs';
import { AdminUserModel, AdminUserQuery, AdminUserUpdatePayload } from '../models/admin-user.model';
import { PageResponse } from '../models/pagination.model';

export abstract class AdminUserService {
  abstract getUsersPage(query: AdminUserQuery): Observable<PageResponse<AdminUserModel>>;
  abstract updateUser(userId: number, payload: AdminUserUpdatePayload): Observable<AdminUserModel>;
}
