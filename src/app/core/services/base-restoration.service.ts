import { Observable } from 'rxjs';
import { MessageResponse } from '../models/auth.model';

export interface PresentationModeStatus {
  enabled: boolean;
  teacherName: string | null;
}

export abstract class BaseRestorationService {
  abstract getPresentationMode(): Observable<PresentationModeStatus>;
  abstract setPresentationMode(enabled: boolean): Observable<PresentationModeStatus>;
  abstract restoreMotors(): Observable<MessageResponse>;
  abstract restoreMaps(): Observable<MessageResponse>;
}
