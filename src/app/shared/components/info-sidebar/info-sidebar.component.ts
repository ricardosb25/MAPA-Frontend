import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

export interface InfoItem {
  iconName: string;
  title: string;
  description?: string;
}

export type SidebarMode = 'login' | 'register';

@Component({
  selector: 'app-info-sidebar',
  standalone: true,
  imports: [CommonModule, BrandLogoComponent],
  template: `
    <aside class="sidebar-container">
      <div class="sidebar-header">
        <app-brand-logo></app-brand-logo>
      </div>

      <div class="sidebar-body">
        @if (mode === 'login') {
          <h1 class="main-heading login-heading">
            Motor.<br />
            Analysis &.<br />
            Performance.<br />
            Academy.
          </h1>
          <p class="section-subtitle">Principais funcionalidades:</p>
          <div class="info-cards-list">
            <div class="info-card">
              <div class="card-icon-badge">
                <i class="pi pi-car"></i>
              </div>
              <span class="card-text">Catálogo de motores.</span>
            </div>
            <div class="info-card">
              <div class="card-icon-badge">
                <i class="pi pi-sliders-h"></i>
              </div>
              <span class="card-text">Calibragem de ECU.</span>
            </div>
            <div class="info-card">
              <div class="card-icon-badge">
                <i class="pi pi-bolt"></i>
              </div>
              <span class="card-text">Dinamometro virtual.</span>
            </div>
          </div>
        } @else {
          <h1 class="main-heading register-heading">Criar nova conta</h1>
          <p class="section-subtitle">Tipos de perfil:</p>
          <div class="info-cards-list">
            <div class="info-card description-card">
              <div class="card-icon-badge">
                <i class="pi pi-bolt"></i>
              </div>
              <p class="card-description">
                <strong>Professor:</strong> para aqueles que querem ensinar sobre motores, mapas e ecu
              </p>
            </div>
            <div class="info-card description-card">
              <div class="card-icon-badge">
                <i class="pi pi-shield"></i>
              </div>
              <p class="card-description">
                <strong>Aluno:</strong> para aqueles que querem aprender sobre motores, mapas e ecu
              </p>
            </div>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem 2rem;
      box-sizing: border-box;
    }

    .sidebar-header {
      margin-bottom: 2.5rem;
    }

    .main-heading {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.1;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0 0 2rem 0;
    }

    .login-heading {
      font-size: 3rem;
    }

    .section-subtitle {
      font-size: 0.95rem;
      color: #475569;
      font-weight: 500;
      margin: 0 0 1.25rem 0;
    }

    .info-cards-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 1rem 1.25rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
    }

    .card-icon-badge {
      width: 42px;
      height: 42px;
      min-width: 42px;
      background-color: #bae6fd;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0284c7;
      font-size: 1.25rem;
    }

    .card-text {
      font-size: 0.95rem;
      font-weight: 600;
      color: #1e293b;
    }

    .card-description {
      font-size: 0.875rem;
      line-height: 1.4;
      color: #334155;
      margin: 0;
    }

    .card-description strong {
      color: #0f172a;
    }

    @media (max-width: 991px) {
      .sidebar-container {
        padding: 1rem 0;
      }
      .main-heading {
        font-size: 2.25rem;
      }
    }
  `]
})
export class InfoSidebarComponent {
  @Input() mode: SidebarMode = 'login';
}
