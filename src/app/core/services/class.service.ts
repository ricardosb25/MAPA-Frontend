import { Observable } from 'rxjs';
import { PageResponse } from '../models/pagination.model';
import { ClassDetailModel, ClassModel, ClassPayload, ClassQuery } from '../models/class.model';

export abstract class ClassService {
  abstract getTeacherClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>>;
  abstract getClassDetail(classId: number | string): Observable<ClassDetailModel>;
  abstract createClass(payload: ClassPayload): Observable<ClassModel>;
  abstract updateClass(classId: number | string, payload: ClassPayload): Observable<ClassModel>;
  abstract deleteClass(classId: number | string): Observable<void>;
  abstract regenerateClassCode(classId: number | string): Observable<ClassModel>;
  abstract removeStudent(classId: number | string, studentId: number | string): Observable<void>;
  abstract getMyClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>>;
  abstract joinClass(code: string): Observable<ClassModel>;
  abstract leaveClass(classId: number | string): Observable<void>;
}
