import { Observable } from 'rxjs';
import {
  ChallengeModel,
  ChallengePerformanceModel,
  ChallengePayload,
  ChallengeQuery,
} from '../models/challenge.model';
import { PageResponse } from '../models/pagination.model';

export abstract class ChallengeService {
  abstract getChallengesByTeacher(query: ChallengeQuery): Observable<PageResponse<ChallengeModel>>;
  abstract getAvailableChallengesForStudent(query: ChallengeQuery): Observable<PageResponse<ChallengeModel>>;
  abstract getActiveChallenge(motorId?: number): Observable<ChallengeModel | null>;
  abstract getChallengeById(id: number): Observable<ChallengeModel>;
  abstract createChallenge(payload: ChallengePayload): Observable<ChallengeModel>;
  abstract updateChallenge(id: number, payload: ChallengePayload): Observable<ChallengeModel>;
  abstract deleteChallenge(id: number): Observable<void>;
  abstract selectChallenge(id: number): Observable<ChallengeModel>;
  abstract getChallengePerformance(id: number): Observable<ChallengePerformanceModel>;
}
