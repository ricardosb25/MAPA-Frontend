import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { Component, inject, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EcuMapCellUpdate, EcuMapGrid, EcuMapType, ECU_MAP_TITLES } from '../../../../core/models/ecu-map.model';
import { EngineModel } from '../../../../core/models/engine.model';
import { AuthService } from '../../../../core/services/auth.service';
import { EcuMapService } from '../../../../core/services/ecu-map.service';
import { EngineService } from '../../../../core/services/engine.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ActiveChallengeCardComponent } from '../../components/active-challenge-card/active-challenge-card.component';
import { EcuMapGridComponent } from '../../components/ecu-map-grid/ecu-map-grid.component';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeModel } from '../../../../core/models/challenge.model';

@Component({
  selector: 'app-calibration-page',
  standalone: true,
  imports: [EmptyStateComponent, 
    CommonModule,
    RouterModule,
    HeaderNavbarComponent,
    LoadingComponent,
    EcuMapGridComponent,
    ActiveChallengeCardComponent
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="mapa-page-container">
        <section class="page-header">
          <span class="category-tag">BANCADA</span>
          <h1 class="mapa-page-title">Calibração de ECU</h1>
          @if (engine(); as selectedEngine) {
            <span class="active-engine-badge" title="Motor ativo na bancada deste usuário">
              <i class="fa-solid fa-engine"></i>
              <span>NA BANCADA: {{ selectedEngine.manufacturer }} {{ selectedEngine.name }}</span>
            </span>
            <p class="page-subtitle">
              {{ selectedEngine.manufacturer }} {{ selectedEngine.name }} · eixo X em RPM, eixo Y em carga do
              motor (%). Clique numa célula para editar.
            </p>
          } @else {
            <p class="page-subtitle">Selecione um motor no catálogo para calibrar os mapas da ECU.</p>
          }
        </section>

        @if (isLoading()) {
          <app-loading message="Carregando mapas da ECU..."></app-loading>
        }

        @if (!isLoading() && engine() === null) {
          <app-empty-state icon="fa-solid fa-sliders" title="Nenhum motor na bancada" description="Escolha um motor no catálogo para editar os mapas de ignição e combustível."><a routerLink="/garage" class="catalog-button">
              <i class="fa-solid fa-warehouse"></i>
              <span>Ir para o catálogo</span>
            </a></app-empty-state>
        }

        @if (engine() && activeMap(); as currentMap) {
          <section class="workspace-grid">
            <div class="map-card">
              <header class="map-card-header">
                <span class="map-card-title">{{ mapTitles[currentMap.mapType] }}</span>
                <span class="map-displacement-badge" title="Classe de litragem aproximada usada no mapa genérico de fábrica">
                  <i class="fa-solid fa-gauge-high"></i>
                  {{ currentMap.displacementClass }} L
                </span>
                <div class="legend">
                  <span class="legend-gradient"></span>
                  <span class="legend-label">{{ currentMap.minValue }} → {{ currentMap.maxValue }}</span>
                </div>
              </header>

              <app-ecu-map-grid
                [map]="currentMap"
                [isSaving]="isSaving()"
                (cellSave)="handleCellSave($event)"
              ></app-ecu-map-grid>

              <p class="map-status">
                @if (currentMap.factoryDefault) {
                  <i class="fa-solid fa-circle-check"></i>
                  <span>Mapa de fábrica — nenhuma edição salva para este motor.</span>
                } @else {
                  <i class="fa-solid fa-pen"></i>
                  <span>Mapa calibrado por você — a versão de fábrica continua salva no banco.</span>
                }
              </p>
            </div>

            <aside class="sidebar">
              <div class="sidebar-card">
                <span class="sidebar-tag">MAPA ATIVO</span>

                <button
                  type="button"
                  class="map-type-button"
                  [class.map-type-active]="activeMapType() === 'IGNITION'"
                  (click)="handleSelectMapType('IGNITION')"
                >
                  <i class="fa-solid fa-fire"></i>
                  <span>Ignição</span>
                </button>

                <button
                  type="button"
                  class="map-type-button"
                  [class.map-type-active]="activeMapType() === 'FUEL'"
                  (click)="handleSelectMapType('FUEL')"
                >
                  <i class="fa-solid fa-droplet"></i>
                  <span>Combustível</span>
                </button>

                <div class="sidebar-divider"></div>

                @if (isRestoreConfirmOpen()) {
                  <div class="restore-confirm">
                    <span class="restore-confirm-text">
                      Restaurar o mapa de fábrica? Os seus ajustes serão perdidos.
                    </span>
                    <div class="restore-confirm-actions">
                      <button
                        type="button"
                        class="confirm-cancel-button"
                        [disabled]="isRestoring()"
                        (click)="handleCancelRestore()"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        class="confirm-accept-button"
                        [disabled]="isRestoring()"
                        (click)="handleConfirmRestore()"
                      >
                        @if (isRestoring()) {
                          <span>Restaurando...</span>
                        } @else {
                          <span>Restaurar</span>
                        }
                      </button>
                    </div>
                  </div>
                } @else {
                  <button type="button" class="sidebar-button" (click)="handleRestoreRequest()">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Restaurar mapa de fábrica</span>
                  </button>
                }

                <a routerLink="/dyno" class="sidebar-button dyno-button">
                  <i class="fa-solid fa-play"></i>
                  <span>Levar ao dinamômetro</span>
                </a>
              </div>

              @if (activeChallenge(); as challenge) {
                <app-active-challenge-card [challenge]="challenge"></app-active-challenge-card>
              }
            </aside>
          </section>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: 100vh;
        background-color: var(--mapa-page-background);
        display: flex;
        flex-direction: column;
      }

      .page-header {
        max-width: 760px;
        margin-bottom: 32px;
      }

      .category-tag {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--mapa-gray-500);
        text-transform: uppercase;
        display: block;
        margin-bottom: 6px;
      }

      .active-engine-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 10px 0;
        padding: 6px 12px;
        border: 1px solid #bae6fd;
        border-radius: 999px;
        background-color: #f0f9ff;
        font-family: 'Courier New', monospace;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #0369a1;
        white-space: nowrap;
      }

      .page-subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: var(--mapa-gray-600);
        line-height: 1.5;
      }

      .catalog-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 44px;
        padding: 0 20px;
        border-radius: 10px;
        background-color: var(--mapa-blue-500);
        color: var(--mapa-white);
        font-size: 0.875rem;
        font-weight: 700;
        text-decoration: none;
        transition: background-color 0.2s ease;
      }

      .catalog-button:hover {
        background-color: var(--mapa-blue-600);
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 24px;
        align-items: start;
      }

      .map-card {
        background-color: var(--mapa-gray-50);
        border: 1px solid var(--mapa-gray-300);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .map-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }

      .map-card-title {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--mapa-gray-700);
      }

      .map-displacement-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border: 1px solid var(--mapa-gray-200);
        border-radius: 999px;
        font-family: 'Courier New', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--mapa-gray-600);
        background-color: var(--mapa-gray-50);
        white-space: nowrap;
      }

      .legend {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .legend-gradient {
        width: 96px;
        height: 10px;
        border-radius: 999px;
        background: linear-gradient(90deg, hsl(205 85% 74%), hsl(95 85% 74%), hsl(8 85% 74%));
      }

      .legend-label {
        font-family: 'Courier New', monospace;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--mapa-gray-600);
      }

      .map-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0 0 0;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--mapa-gray-500);
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .sidebar-card {
        background-color: var(--mapa-gray-50);
        border: 1px solid var(--mapa-gray-300);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .sidebar-tag {
        font-family: 'Courier New', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--mapa-gray-500);
      }

      .map-type-button,
      .sidebar-button {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        height: 46px;
        padding: 0 16px;
        border: 1px solid var(--mapa-gray-300);
        border-radius: 10px;
        background-color: var(--mapa-gray-700);
        color: var(--mapa-white);
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }

      .map-type-button:hover,
      .sidebar-button:hover:not(:disabled) {
        background-color: #1e293b;
      }

      .map-type-button.map-type-active {
        background-color: var(--mapa-blue-500);
        border-color: var(--mapa-blue-500);
        box-shadow: 0 2px 8px rgba(0, 153, 255, 0.3);
      }

      .map-type-button.map-type-active:hover {
        background-color: var(--mapa-blue-600);
      }

      .sidebar-divider {
        height: 1px;
        background-color: var(--mapa-gray-200);
      }

      .dyno-button {
        background-color: var(--mapa-blue-500);
        border-color: var(--mapa-blue-500);
        text-decoration: none;
        box-sizing: border-box;
      }

      .dyno-button:disabled {
        opacity: 0.75;
        cursor: not-allowed;
      }

      .dyno-hint {
        font-size: 0.7rem;
        font-weight: 600;
        color: #94a3b8;
        text-align: center;
      }

      .restore-confirm {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border: 1px solid #fcd34d;
        border-radius: 10px;
        background-color: #fffbeb;
      }

      .restore-confirm-text {
        font-size: 0.78rem;
        font-weight: 600;
        color: #92400e;
        line-height: 1.4;
      }

      .restore-confirm-actions {
        display: flex;
        gap: 8px;
      }

      .confirm-cancel-button,
      .confirm-accept-button {
        flex: 1;
        height: 36px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
      }

      .confirm-cancel-button {
        border: 1px solid var(--mapa-gray-300);
        background-color: var(--mapa-white);
        color: var(--mapa-gray-700);
      }

      .confirm-accept-button {
        border: none;
        background-color: #f59e0b;
        color: var(--mapa-white);
      }

      .confirm-cancel-button:disabled,
      .confirm-accept-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .feedback-success {
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
      }

      .feedback-error {
        background-color: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      @media (max-width: 1100px) {
        .workspace-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `
  ]
})
export class CalibrationPageComponent implements OnInit, OnDestroy {
  private readonly feedbackService = inject(FeedbackService);
  readonly authService: AuthService;
  readonly mapTitles = ECU_MAP_TITLES;

  readonly engine = signal<EngineModel | null>(null);
  readonly activeChallenge = signal<ChallengeModel | null>(null);
  readonly maps = signal<EcuMapGrid[]>([]);
  readonly activeMapType = signal<EcuMapType>('FUEL');
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isRestoreConfirmOpen = signal(false);
  readonly isRestoring = signal(false);

  private engineSubscription: Subscription | null = null;


  constructor(
    authService: AuthService,
    private readonly engineService: EngineService,
    private readonly ecuMapService: EcuMapService,
    private readonly challengeService: ChallengeService
  ) {
    this.authService = authService;
  }

  ngOnInit(): void {
    this.loadActiveChallenge();
    this.engineSubscription = this.engineService.getSelectedEngine().subscribe({
      next: (selectedEngine) => {
        this.engine.set(selectedEngine);
        this.isLoading.set(false);

        if (selectedEngine !== null) {
          this.loadMaps(selectedEngine.id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('Não foi possível carregar o motor ativo.', false);
      }
    });
  }

  ngOnDestroy(): void {
    this.engineSubscription?.unsubscribe();
  }

  readonly activeMap = computed(
    () => this.maps().find((map) => map.mapType === this.activeMapType()) ?? null
  );

  handleSelectMapType(mapType: EcuMapType): void {
    if (this.isSaving()) {
      return;
    }

    this.activeMapType.set(mapType);
    this.isRestoreConfirmOpen.set(false);
  }

  handleCellSave(cellUpdate: EcuMapCellUpdate): void {
    const selectedEngine = this.engine();
    if (selectedEngine === null) {
      return;
    }

    this.isSaving.set(true);
    this.ecuMapService.updateCell(selectedEngine.id, this.activeMapType(), cellUpdate).subscribe({
      next: (updatedMap) => {
        this.replaceMap(updatedMap);
        this.isSaving.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível salvar o valor da célula.'), false);
      }
    });
  }

  handleRestoreRequest(): void {
    this.isRestoreConfirmOpen.set(true);
  }

  handleCancelRestore(): void {
    if (this.isRestoring()) {
      return;
    }

    this.isRestoreConfirmOpen.set(false);
  }

  handleConfirmRestore(): void {
    const selectedEngine = this.engine();
    if (selectedEngine === null || this.isRestoring()) {
      return;
    }

    this.isRestoring.set(true);
    this.ecuMapService.restoreFactoryMap(selectedEngine.id, this.activeMapType()).subscribe({
      next: (restoredMap) => {
        this.replaceMap(restoredMap);
        this.isRestoring.set(false);
        this.isRestoreConfirmOpen.set(false);
        this.showFeedback('Mapa restaurado para o padrão de fábrica.', true);
      },
      error: (error: HttpErrorResponse) => {
        this.isRestoring.set(false);
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível restaurar o mapa.'), false);
      }
    });
  }

  private loadActiveChallenge(): void {
    this.challengeService.getActiveChallenge().subscribe({
      next: (challenge) => this.activeChallenge.set(challenge),
      error: () => this.activeChallenge.set(null)
    });
  }

  private loadMaps(engineId: string | number): void {
    this.ecuMapService.getEngineMaps(engineId).subscribe({
      next: (engineMaps) => {
        this.maps.set(engineMaps);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível carregar os mapas da ECU.'), false);
      }
    });
  }

  private replaceMap(updatedMap: EcuMapGrid): void {
    const currentMaps = this.maps();
    const mapIndex = currentMaps.findIndex((map) => map.mapType === updatedMap.mapType);

    if (mapIndex === -1) {
      this.maps.set([...currentMaps, updatedMap]);
      return;
    }

    const updatedMaps = [...currentMaps];
    updatedMaps[mapIndex] = updatedMap;
    this.maps.set(updatedMaps);
  }

  private buildErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (error.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }

    const apiError = error.error as { message?: string } | null;
    return apiError?.message ?? fallbackMessage;
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    if (isSuccess) this.feedbackService.showSuccess('Sucesso', message);
    else this.feedbackService.showError('Erro', message);
  }

}
