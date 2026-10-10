import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, map, of, switchMap, take, tap } from 'rxjs';
import { EngineModel, EnginePageQuery, EnginePayload, PageResponse } from '../models/engine.model';
import { EngineService } from './engine.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpEngineService implements EngineService {
  private readonly enginesEndpointUrl = API_CONFIG.endpoints.motores;
  private readonly selectedEngineIdSubject = new BehaviorSubject<string | null>(null);
  private readonly selectionLoadedSubject = new BehaviorSubject<boolean>(false);

  constructor(private readonly httpClient: HttpClient) {
    this.loadPersistedSelection();
  }

  getEnginesPage(query: EnginePageQuery): Observable<PageResponse<EngineModel>> {
    const queryParams = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sort', query.sort);

    return this.httpClient
      .get<PageResponse<EngineModel>>(this.enginesEndpointUrl, { params: queryParams })
      .pipe(map((enginesPage) => this.applySelectionFlag(enginesPage)));
  }

  getSelectedEngine(): Observable<EngineModel | null> {
    return this.ensureSelectionLoaded().pipe(
      switchMap(() => this.selectedEngineIdSubject),
      switchMap((selectedEngineId) => {
        if (selectedEngineId === null) {
          return of(null);
        }

        return this.httpClient
          .get<EngineModel>(API_CONFIG.buildEngineByIdUrl(selectedEngineId))
          .pipe(
            map((engineModel) => ({ ...engineModel, isSelected: true })),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 404) {
                this.selectedEngineIdSubject.next(null);
              }
              return of(null);
            })
          );
      })
    );
  }

  selectEngine(engineId: string): Observable<EngineModel> {
    return this.httpClient
      .put<EngineModel>(API_CONFIG.endpoints.motoresSelecionado, { engineId: Number(engineId) })
      .pipe(
        switchMap(() => this.httpClient.get<EngineModel>(API_CONFIG.buildEngineByIdUrl(engineId))),
        map((engineModel) => ({ ...engineModel, isSelected: true })),
        tap(() => this.selectedEngineIdSubject.next(engineId))
      );
  }

  createEngine(payload: EnginePayload): Observable<EngineModel> {
    return this.httpClient.post<EngineModel>(this.enginesEndpointUrl, payload);
  }

  updateEngine(engineId: string, payload: EnginePayload): Observable<EngineModel> {
    return this.httpClient.put<EngineModel>(API_CONFIG.buildEngineByIdUrl(engineId), payload);
  }

  deleteEngine(engineId: string): Observable<void> {
    return this.httpClient.delete<void>(API_CONFIG.buildEngineByIdUrl(engineId)).pipe(
      tap(() => {
        if (this.selectedEngineIdSubject.getValue() === engineId) {
          this.selectedEngineIdSubject.next(null);
        }
      })
    );
  }

  private loadPersistedSelection(): void {
    this.httpClient
      .get<EngineModel | null>(API_CONFIG.endpoints.motoresSelecionado)
      .pipe(catchError(() => of(null)))
      .subscribe((selectedEngine) => {
        this.selectedEngineIdSubject.next(selectedEngine !== null ? String(selectedEngine.id) : null);
        this.selectionLoadedSubject.next(true);
      });
  }

  private ensureSelectionLoaded(): Observable<boolean> {
    return this.selectionLoadedSubject.pipe(filter((isLoaded) => isLoaded), take(1));
  }

  private applySelectionFlag(
    enginesPage: PageResponse<EngineModel>
  ): PageResponse<EngineModel> {
    const selectedEngineId = this.selectedEngineIdSubject.getValue();

    return {
      ...enginesPage,
      content: enginesPage.content.map((engineModel) => ({
        ...engineModel,
        isSelected: selectedEngineId !== null && engineModel.id.toString() === selectedEngineId
      }))
    };
  }
}
