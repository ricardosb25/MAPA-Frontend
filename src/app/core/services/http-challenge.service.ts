import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChallengeModel,
  ChallengePerformanceModel,
  ChallengePayload,
  ChallengeQuery,
} from '../models/challenge.model';
import { ChallengeService } from './challenge.service';
import { API_CONFIG } from '../config/api.config';
import { PageResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class HttpChallengeService implements ChallengeService {
  private readonly endpoint = API_CONFIG.endpoints.challenges;

  constructor(private readonly httpClient: HttpClient) {}

  getChallengesByTeacher(query: ChallengeQuery): Observable<PageResponse<ChallengeModel>> {
    const params = this.buildParams(query);
    return this.httpClient.get<PageResponse<ChallengeModel>>(this.endpoint, { params });
  }

  getAvailableChallengesForStudent(query: ChallengeQuery): Observable<PageResponse<ChallengeModel>> {
    const params = this.buildParams(query);
    return this.httpClient.get<PageResponse<ChallengeModel>>(`${this.endpoint}/available`, { params });
  }

  getActiveChallenge(motorId?: number): Observable<ChallengeModel | null> {
    let params = new HttpParams();
    if (motorId) {
      params = params.set('motorId', motorId.toString());
    }
    return this.httpClient.get<ChallengeModel | null>(`${this.endpoint}/active`, { params });
  }

  getChallengeById(id: number): Observable<ChallengeModel> {
    return this.httpClient.get<ChallengeModel>(API_CONFIG.buildChallengeByIdUrl(id));
  }

  createChallenge(payload: ChallengePayload): Observable<ChallengeModel> {
    return this.httpClient.post<ChallengeModel>(this.endpoint, payload);
  }

  updateChallenge(id: number, payload: ChallengePayload): Observable<ChallengeModel> {
    return this.httpClient.put<ChallengeModel>(API_CONFIG.buildChallengeByIdUrl(id), payload);
  }

  deleteChallenge(id: number): Observable<void> {
    return this.httpClient.delete<void>(API_CONFIG.buildChallengeByIdUrl(id));
  }

  selectChallenge(id: number): Observable<ChallengeModel> {
    return this.httpClient.post<ChallengeModel>(API_CONFIG.buildChallengeSelectUrl(id), {});
  }

  getChallengePerformance(id: number): Observable<ChallengePerformanceModel> {
    return this.httpClient.get<ChallengePerformanceModel>(API_CONFIG.buildChallengePerformanceUrl(id));
  }

  private buildParams(query: ChallengeQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('size', query.size.toString());

    if (query.search) params = params.set('search', query.search);
    if (query.classId) params = params.set('classId', query.classId.toString());
    if (query.difficulty) params = params.set('difficulty', query.difficulty);
    if (query.motorId) params = params.set('motorId', query.motorId.toString());
    if (query.sort) params = params.set('sort', query.sort);

    return params;
  }
}
