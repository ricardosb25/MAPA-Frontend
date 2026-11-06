import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, filter, map, of, shareReplay, startWith, switchMap, take, tap } from 'rxjs';
import { EngineModel, EnginePageQuery, EnginePayload, PageResponse } from '../models/engine.model';
import { EngineService } from './engine.service';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpEngineService implements EngineService {
  private readonly enginesEndpointUrl = API_CONFIG.endpoints.motores;
  private readonly selectionRefresh = new BehaviorSubject<void>(undefined);
  private readonly selectedEngine$: Observable<EngineModel | null>;

  constructor(private readonly httpClient: HttpClient, authService: AuthService) {
    this.selectedEngine$ = authService.currentUser$.pipe(
      map((user) => user?.id ?? null),
      distinctUntilChanged(),
      switchMap((userId) => userId === null ? of(null) : this.selectionRefresh.pipe(
        switchMap(() => this.httpClient.get<EngineModel | null>(API_CONFIG.endpoints.motoresSelecionado).pipe(
          map((engine) => engine === null ? null : { ...engine, isSelected: true }),
          startWith(undefined)
        ))
      )),
      shareReplay({ bufferSize: 1, refCount: true }),
      filter((engine) => engine !== undefined)
    );
  }

  getEnginesPage(query: EnginePageQuery): Observable<PageResponse<EngineModel>> {
    const queryParams = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sort', query.sort);

    return combineLatest([
      this.httpClient.get<PageResponse<EngineModel>>(this.enginesEndpointUrl, { params: queryParams }),
      this.getSelectedEngine()
    ]).pipe(
      take(1),
      map(([enginesPage, selectedEngine]) => this.applySelectionFlag(enginesPage, selectedEngine))
    );
  }

  getSelectedEngine(): Observable<EngineModel | null> {
    return this.selectedEngine$;
  }

  selectEngine(engineId: string): Observable<EngineModel> {
    return this.httpClient
      .put<EngineModel>(API_CONFIG.endpoints.motoresSelecionado, { engineId: Number(engineId) })
      .pipe(
        map((engineModel) => ({ ...engineModel, isSelected: true })),
        tap(() => this.selectionRefresh.next())
      );
  }

  createEngine(payload: EnginePayload): Observable<EngineModel> {
    return this.httpClient.post<EngineModel>(this.enginesEndpointUrl, payload);
  }

  updateEngine(engineId: string, payload: EnginePayload): Observable<EngineModel> {
    return this.httpClient.put<EngineModel>(API_CONFIG.buildEngineByIdUrl(engineId), payload).pipe(
      tap(() => this.selectionRefresh.next())
    );
  }

  deleteEngine(engineId: string): Observable<void> {
    return this.httpClient.delete<void>(API_CONFIG.buildEngineByIdUrl(engineId)).pipe(
      tap(() => this.selectionRefresh.next())
    );
  }

  private applySelectionFlag(
    enginesPage: PageResponse<EngineModel>,
    selectedEngine: EngineModel | null
  ): PageResponse<EngineModel> {
    return {
      ...enginesPage,
      content: enginesPage.content.map((engineModel) => ({
        ...engineModel,
        isSelected: selectedEngine !== null && String(engineModel.id) === String(selectedEngine.id)
      }))
    };
  }
}
