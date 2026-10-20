import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DynoResult } from '../../../../core/models/dyno.model';
import { EngineModel } from '../../../../core/models/engine.model';
import { DynoService } from '../../../../core/services/dyno.service';
import { EngineService } from '../../../../core/services/engine.service';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeModel } from '../../../../core/models/challenge.model';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { ActiveChallengeCardComponent } from '../../../calibration/components/active-challenge-card/active-challenge-card.component';
import { DynoChartComponent } from '../../components/dyno-chart/dyno-chart.component';
import { EngineHealthComponent } from '../../components/engine-health/engine-health.component';

@Component({
  selector: 'app-dyno-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderNavbarComponent,
    ActiveChallengeCardComponent,
    DynoChartComponent,
    EngineHealthComponent
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <span class="category-tag">TESTE DE BANCADA</span>
          <h1 class="page-title">Dinamômetro virtual</h1>
          @if (engine(); as selectedEngine) {
            <p class="page-subtitle">
              {{ selectedEngine.manufacturer }} {{ selectedEngine.name }} — aceleração total da marcha-lenta ao corte
              de {{ selectedEngine.rpmCutoff }} rpm.
            </p>
          } @else {
            <p class="page-subtitle">Selecione um motor no catálogo para executar o teste de bancada.</p>
          }
        </section>

        @if (engine() === null) {
          <section class="empty-state">
            <i class="fa-solid fa-gauge-high empty-state-icon"></i>
            <p class="empty-state-title">Nenhum motor na bancada</p>
            <p class="empty-state-text">Escolha um motor no catálogo para rodar o dinamômetro virtual.</p>
            <a routerLink="/garage" class="catalog-button">
              <i class="fa-solid fa-warehouse"></i>
              <span>Ir para o catálogo</span>
            </a>
          </section>
        }

        @if (engine(); as selectedEngine) {
          <section class="workspace-grid">
            <div class="main-column">
              <div class="chart-card">
                <header class="chart-card-header">
                  <div class="header-stats">
                    <div class="stat-block">
                      <span class="stat-label">POTÊNCIA DE PICO</span>
                      <span class="stat-value stat-power">
                        @if (result(); as currentResult) { {{ currentResult.picoPotencia.toFixed(1) }} cv } @else { — }
                      </span>
                    </div>
                    <div class="stat-block">
                      <span class="stat-label">TORQUE DE PICO</span>
                      <span class="stat-value stat-torque">
                        @if (result(); as currentResult) { {{ currentResult.picoTorque.toFixed(1) }} kgfm } @else { — }
                      </span>
                    </div>
                    @if (challenge(); as activeChallenge) {
                      <div class="stat-block">
                        <span class="stat-label">META DO DESAFIO</span>
                        <span class="stat-value stat-goal">{{ activeChallenge.goalPowerCv }} cv</span>
                      </div>
                    }
                  </div>

                  <button type="button" class="run-button" [disabled]="isRunning()" (click)="handleRunSimulation()">
                    @if (isRunning()) {
                      <i class="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Simulando...</span>
                    } @else {
                      <i class="fa-solid fa-play"></i>
                      <span>Rodar simulação</span>
                    }
                  </button>
                </header>

                @if (result(); as currentResult) {
                  <app-dyno-chart
                    [rpmAxis]="currentResult.rpmEixoX"
                    [powerCurve]="currentResult.curvaPotencia"
                    [torqueCurve]="currentResult.curvaTorque"
                    [afrCurve]="currentResult.curvaAfr"
                  ></app-dyno-chart>
                } @else {
                  <div class="chart-placeholder">
                    <span>Nenhuma passada registrada. Rode a simulação para gerar as curvas.</span>
                  </div>
                }
              </div>

              <app-engine-health [result]="result()"></app-engine-health>

              <a routerLink="/calibration" class="back-button">
                <i class="fa-solid fa-sliders"></i>
                <span>Volta à calibração</span>
              </a>
            </div>

            <aside class="sidebar">
              @if (challenge(); as activeChallenge) {
                <app-active-challenge-card [challenge]="activeChallenge"></app-active-challenge-card>
              }
            </aside>
          </section>
        }
      </main>


      @if (feedbackMessage()) {
        <div class="feedback-toast" [class.feedback-success]="isSuccess()" [class.feedback-error]="!isSuccess()">
          {{ feedbackMessage() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-layout {
        min-height: 100vh;
        background-color: #e5e7eb;
        display: flex;
        flex-direction: column;
      }

      .content-container {
        max-width: 1320px;
        width: 100%;
        margin: 0 auto;
        padding: 32px 24px 64px 24px;
        box-sizing: border-box;
      }

      .page-header {
        max-width: 760px;
        margin-bottom: 32px;
      }

      .category-tag {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #64748b;
        text-transform: uppercase;
        display: block;
        margin-bottom: 6px;
      }

      .page-title {
        margin: 0 0 8px 0;
        font-size: 2.25rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.03em;
      }

      .page-subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: #475569;
        line-height: 1.5;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 48px 24px;
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        text-align: center;
      }

      .empty-state-icon {
        font-size: 2rem;
        color: #94a3b8;
        margin-bottom: 6px;
      }

      .empty-state-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
      }

      .empty-state-text {
        margin: 0 0 12px 0;
        font-size: 0.875rem;
        color: #64748b;
      }

      .catalog-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background-color: #0099ff;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .catalog-button:hover {
        background-color: #0088e6;
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 24px;
        align-items: start;
      }

      .main-column {
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-width: 0;
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .chart-card {
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .chart-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .header-stats {
        display: flex;
        gap: 36px;
        flex-wrap: wrap;
      }

      .stat-label {
        display: block;
        font-family: 'Courier New', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #64748b;
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f172a;
      }

      .stat-power {
        color: #0099ff;
      }

      .stat-torque {
        color: #16a34a;
      }

      .stat-goal {
        font-family: 'Courier New', monospace;
        letter-spacing: 0.04em;
      }

      .run-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 22px;
        background-color: #0099ff;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s ease;
        white-space: nowrap;
      }

      .run-button:hover:not(:disabled) {
        background-color: #0088e6;
      }

      .run-button:disabled {
        opacity: 0.75;
        cursor: not-allowed;
      }

      .chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 340px;
        border: 1px dashed #cbd5e1;
        border-radius: 10px;
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 600;
        text-align: center;
        padding: 0 24px;
      }

      .back-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        align-self: flex-start;
        padding: 12px 20px;
        background-color: #1e293b;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .back-button:hover {
        background-color: #0f172a;
      }

      .feedback-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        z-index: 1000;
        max-width: 420px;
      }

      .feedback-success {
        background-color: #f0fdf4;
        border: 1px solid #86efac;
        color: #166534;
      }

      .feedback-error {
        background-color: #fef2f2;
        border: 1px solid #fca5a5;
        color: #991b1b;
      }

      @media (max-width: 1024px) {
        .workspace-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `
  ]
})
export class DynoPageComponent implements OnInit, OnDestroy {
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4500;
  readonly engine = signal<EngineModel | null>(null);
  readonly result = signal<DynoResult | null>(null);
  readonly isRunning = signal(false);
  readonly feedbackMessage = signal('');
  readonly isSuccess = signal(false);
  readonly challenge = signal<ChallengeModel | null>(null);

  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly dynoService: DynoService,
    private readonly engineService: EngineService,
    private readonly challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.loadActiveChallenge();
    this.subscriptions.push(
      this.engineService.getSelectedEngine().subscribe({
        next: (selectedEngine) => {
          this.engine.set(selectedEngine);
          if (selectedEngine === null) {
            this.result.set(null);
          }
        },
        error: () => this.engine.set(null)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clearFeedbackTimeout();
  }

  handleRunSimulation(): void {
    if (this.isRunning()) {
      return;
    }

    this.isRunning.set(true);
    this.dynoService.runSimulation().subscribe({
      next: (dynoResult) => {
        this.result.set(dynoResult);
        this.loadActiveChallenge(); // Recarrega o desafio para atualizar os critérios atingidos
        this.isRunning.set(false);
        this.showFeedback('Passada concluída. Curvas atualizadas no gráfico.', true);
      },
      error: (error: HttpErrorResponse) => {
        this.isRunning.set(false);
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível executar a simulação.'), false);
      }
    });
  }

  private loadActiveChallenge(): void {
    this.challengeService.getActiveChallenge().subscribe({
      next: (challenge) => this.challenge.set(challenge),
      error: () => this.challenge.set(null)
    });
  }

  private buildErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (error.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }

    const apiError = error.error as { message?: string } | null;
    return apiError?.message ?? fallbackMessage;
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    this.feedbackMessage.set(message);
    this.isSuccess.set(isSuccess);
    this.clearFeedbackTimeout();

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedbackMessage.set('');
      this.feedbackTimeoutId = null;
    }, DynoPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }

    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}
