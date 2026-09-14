import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay, take } from 'rxjs';
import { EngineModel } from '../models/engine.model';
import { EngineService } from './engine.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HttpEngineService implements EngineService {
  private readonly endpointUrl = API_CONFIG.endpoints.motores;
  private selectedEngineIdSubject = new BehaviorSubject<string | null>(null);
  private cachedEngines$!: Observable<EngineModel[]>;

  constructor(private httpClient: HttpClient) {
    this.cachedEngines$ = this.httpClient.get<EngineModel[]>(this.endpointUrl).pipe(shareReplay(1));
  }

  getEngines(): Observable<EngineModel[]> {
    return combineLatest([this.cachedEngines$, this.selectedEngineIdSubject]).pipe(
      map(([fetchedEngines, selectedId]) => {
        const effectiveSelectedId =
          selectedId ?? (fetchedEngines.length > 0 ? fetchedEngines[0].id.toString() : null);

        return fetchedEngines.map((engineItem) => ({
          ...engineItem,
          isSelected:
            effectiveSelectedId !== null && engineItem.id.toString() === effectiveSelectedId
        }));
      })
    );
  }

  getSelectedEngine(): Observable<EngineModel | null> {
    return this.getEngines().pipe(
      map((engineModels) => {
        const selectedModel = engineModels.find((engineModel) => engineModel.isSelected);
        return selectedModel ?? null;
      })
    );
  }

  selectEngine(engineId: string): Observable<EngineModel> {
    this.selectedEngineIdSubject.next(engineId);

    return this.getEngines().pipe(
      take(1),
      map((engineModels) => {
        const targetModel = engineModels.find(
          (engineModel) => engineModel.id.toString() === engineId
        );

        if (!targetModel) {
          throw new Error(`Engine with ID ${engineId} not found.`);
        }

        return targetModel;
      })
    );
  }
}
