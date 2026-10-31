import { Observable } from 'rxjs';
import { AccountSettings, EmailChangeRequest, PasswordChangeRequest } from '../models/account-settings.model';
import { MessageResponse } from '../models/auth.model';

export abstract class AccountSettingsService {
  abstract getSettings(): Observable<AccountSettings>;
  abstract changeEmail(request: EmailChangeRequest): Observable<MessageResponse>;
  abstract changePassword(request: PasswordChangeRequest): Observable<MessageResponse>;
}
