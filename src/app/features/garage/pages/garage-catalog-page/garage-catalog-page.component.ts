import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { EngineModel } from '../../../../core/models/engine.model';
import { EngineService } from '../../../../core/services/engine.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { EngineCardComponent } from '../../components/engine-card/engine-card.component';

@Component({
  selector: 'app-garage-catalog-page',
  standalone: true,
  imports: [CommonModule, HeaderNavbarComponent, EngineCardComponent],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <span class="category-tag">CATÁLOGO</span>
          <h1 class="page-title">Garagem de motores</h1>
          <p class="page-subtitle">
            Selecione a base mecânica. Os mapas voltam ao padrão de fábrica ao trocar de motor.
          </p>
        </section>

        <section class="engines-grid-section">
          <div class="engines-grid">
            <app-engine-card
              *ngFor="let engine of engines$ | async; trackBy: trackByEngineId"
              [engine]="engine"
              (selectEngine)="handleSelectEngine($event)"
            ></app-engine-card>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
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

    .engines-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .engines-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .content-container {
        padding: 20px 16px 40px 16px;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .engines-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class GarageCatalogPageComponent implements OnInit {
  engines$!: Observable<EngineModel[]>;

  constructor(private engineService: EngineService) {}

  ngOnInit(): void {
    this.engines$ = this.engineService.getEngines();
  }

  handleSelectEngine(engineId: string): void {
    this.engineService.selectEngine(engineId).subscribe();
  }

  trackByEngineId(index: number, engine: EngineModel): number {
    return engine.id;
  }
}
