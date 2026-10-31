import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { HomeStepItem } from '../../models/home.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderNavbarComponent],
  template: `
    <div class="home-layout">
      <app-header-navbar></app-header-navbar>

      <main class="home-main-content">
        <section class="mapa-banner-section">
          <div class="mapa-banner-text-container">
            <span class="mapa-banner-badge">MOTOR ANALYSIS & PERFORMANCE ACADEMY</span>
            <h1 class="mapa-banner-title">MAPA</h1>
            <h2 class="mapa-banner-subtitle">Sua oficina de calibração virtual.</h2>
            <p class="mapa-banner-description">
              Entenda como os ajustes da ECU afetam o motor. Escolha uma base, calibre e
              acompanhe o resultado, sem colocar um motor real em risco.
            </p>
            <div class="mapa-banner-actions">
              <button
                type="button"
                class="mapa-banner-primary-button"
                (click)="navigateToRoute('/garage')"
              >
                <span>Começar pela garagem</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>

        <section class="workflow-section">
          <div class="workflow-header-row">
            <div class="workflow-header-titles">
              <span class="section-tracker-tag">DA ESCOLHA AO RESULTADO</span>
              <h2 class="section-main-title">Como funciona o MAPA</h2>
            </div>
            <div class="workflow-cycle-label">
              <i class="fa-solid fa-arrows-rotate cycle-icon"></i>
              <span>Escolher · Calibrar · Testar · Aprender</span>
            </div>
          </div>

          <div class="workflow-cards-grid">
            <div
              *ngFor="let step of workflowSteps; trackBy: trackByStepNumber"
              class="workflow-card"
            >
              <div class="workflow-card-top">
                <div class="step-icon-badge" [ngClass]="step.accentColor">
                  <i [class]="step.iconClass"></i>
                </div>
                <span class="step-number-watermark">{{ step.stepNumber }}</span>
              </div>

              <div class="workflow-card-body">
                <span class="step-category-label">{{ step.category }}</span>
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-description">{{ step.description }}</p>
                <p class="step-note">{{ step.note }}</p>
              </div>

              <div class="workflow-card-footer">
                <button
                  type="button"
                  class="step-action-button"
                  (click)="navigateToRoute(step.routePath)"
                >
                  <span>{{ step.buttonLabel }}</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .home-layout {
      min-height: 100vh;
      background-color: #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .home-main-content {
      max-width: 1320px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px 64px 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .mapa-banner-section {
      background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
      border: 1px solid #d1d5db;
      border-radius: 16px;
      padding: 44px 48px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
    }

    .mapa-banner-text-container {
      max-width: 720px;
    }

    .mapa-banner-badge {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: #64748b;
      margin-bottom: 8px;
    }

    .mapa-banner-title {
      font-size: 3.25rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1;
      margin: 0 0 12px 0;
    }

    .mapa-banner-subtitle {
      font-size: 1.35rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 14px 0;
      letter-spacing: -0.02em;
    }

    .mapa-banner-description {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }

    .mapa-banner-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mapa-banner-primary-button {
      height: 46px;
      padding: 0 24px;
      border: none;
      border-radius: 10px;
      background-color: #0099ff;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(0, 153, 255, 0.28);
      transition: background-color 0.2s ease, transform 0.1s ease;

      &:hover {
        background-color: #0088e6;
        transform: translateY(-1px);
      }
    }

    .workflow-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .workflow-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }

    .section-tracker-tag {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .section-main-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
    }

    .workflow-cycle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    .cycle-icon {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .workflow-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .workflow-card {
      background-color: #f8fafc;
      border: 1px solid #d1d5db;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      }
    }

    .workflow-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .step-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;

      &.blue {
        background-color: #e0f2fe;
        color: #0284c7;
      }
      &.amber {
        background-color: #fef3c7;
        color: #d97706;
      }
      &.emerald {
        background-color: #dcfce7;
        color: #059669;
      }
    }

    .step-number-watermark {
      font-size: 1.75rem;
      font-weight: 800;
      color: #cbd5e1;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .workflow-card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 24px;
    }

    .step-category-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .step-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
    }

    .step-description {
      font-size: 0.86rem;
      color: #475569;
      line-height: 1.5;
      margin: 0 0 14px 0;
      flex: 1;
    }

    .step-note {
      font-size: 0.76rem;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }

    .workflow-card-footer {
      margin-top: auto;
    }

    .step-action-button {
      width: 100%;
      height: 42px;
      background-color: #e2e8f0;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e293b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #cbd5e1;
        color: #0f172a;
      }
    }

    @media (max-width: 1024px) {
      .mapa-banner-section {
        padding: 32px 24px;
      }

      .workflow-cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    @media (max-width: 640px) {
      .home-main-content {
        padding: 20px 16px 40px 16px;
      }

      .mapa-banner-title {
        font-size: 2.25rem;
      }

      .mapa-banner-subtitle {
        font-size: 1.15rem;
      }
    }
  `]
})
export class HomePageComponent {
  readonly workflowSteps: HomeStepItem[] = [
    {
      stepNumber: '01',
      category: 'GARAGEM',
      title: 'Escolha seu motor',
      description:
        'Conheça os motores disponíveis e compare cilindrada, compressão e aspiração. O motor escolhido será levado para a bancada.',
      note: 'Cada motor tem suas próprias características e limites.',
      routePath: '/garage',
      buttonLabel: 'Explorar motores',
      iconClass: 'fa-solid fa-car',
      accentColor: 'blue'
    },
    {
      stepNumber: '02',
      category: 'ECU',
      title: 'Ajuste a calibração',
      description:
        'Edite os mapas de combustível e ignição. Cada célula representa uma combinação de rotação (RPM) e carga do motor.',
      note: 'As cores da tabela ajudam a comparar os valores do mapa.',
      routePath: '/calibration',
      buttonLabel: 'Abrir calibração',
      iconClass: 'fa-solid fa-table-cells',
      accentColor: 'amber'
    },
    {
      stepNumber: '03',
      category: 'DINAMÔMETRO',
      title: 'Teste e analise',
      description:
        'Execute a simulação e observe as curvas de potência e torque. Confira também os alertas sobre a saúde do motor.',
      note: 'Volte à calibração, faça novos ajustes e teste novamente.',
      routePath: '/dyno',
      buttonLabel: 'Abrir dinamômetro',
      iconClass: 'fa-solid fa-gauge-high',
      accentColor: 'emerald'
    }
  ];

  constructor(private readonly router: Router) { }

  navigateToRoute(path: string): void {
    void this.router.navigate([path]);
  }

  trackByStepNumber(index: number, step: HomeStepItem): string {
    return step.stepNumber;
  }
}
