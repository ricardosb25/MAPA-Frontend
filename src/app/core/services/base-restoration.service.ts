import { Observable } from 'rxjs';
import { MessageResponse } from '../models/auth.model';

export abstract class BaseRestorationService {
  abstract restoreMotors(): Observable<MessageResponse>;
  abstract restoreMaps(): Observable<MessageResponse>;
}
