import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-header-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BrandLogoComponent],
  template: `
    <header class="navbar-header">
      <div class="navbar-left">
        <div class="brand-group">
          <app-brand-logo variant="navbar"></app-brand-logo>
        </div>
      </div>

      <nav class="navbar-center">
        <a routerLink="/dashboard" class="nav-item">
          <i class="fa-solid fa-border-all nav-icon"></i>
          <span>Painel</span>
        </a>
        <a routerLink="/garage" routerLinkActive="active" class="nav-item">
          <i class="fa-solid fa-warehouse nav-icon"></i>
          <span>Garagem</span>
        </a>
        <a routerLink="/calibration" class="nav-item">
          <i class="fa-solid fa-sliders nav-icon"></i>
          <span>Calibração</span>
        </a>
        <a routerLink="/dyno" class="nav-item">
          <i class="fa-solid fa-gauge-high nav-icon"></i>
          <span>Dinamômetro</span>
        </a>
      </nav>

      <div class="navbar-right">
        <button type="button" class="theme-toggle-button" aria-label="Toggle theme">
          <i class="fa-regular fa-sun"></i>
        </button>
        
        <div class="class-badge">
          TURMA MEC-4B
        </div>

        <div class="user-profile-info">
          <span class="user-name">{{ (authService.currentUser$ | async)?.fullName ?? 'Visitante' }}</span>
          <span class="user-role">{{ getRoleLabel((authService.currentUser$ | async)?.role) }}</span>
        </div>

        <button type="button" class="theme-toggle-button" aria-label="Sair" (click)="handleLogout()">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      width: 100%;
      height: 64px;
      background-color: #e5e7eb;
      border-bottom: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-sizing: border-box;
    }

    .navbar-left {
      display: flex;
      align-items: center;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .navbar-center {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s ease;

      &:hover {
        background-color: #d1d5db;
        color: #0f172a;
      }

      &.active {
        background-color: #dbeafe;
        color: #0284c7;
        border: 1px solid #bfdbfe;
      }
    }

    .nav-icon {
      font-size: 0.9rem;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .theme-toggle-button {
      background: none;
      border: none;
      color: #64748b;
      font-size: 1rem;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #0f172a;
        background-color: #d1d5db;
      }
    }

    .class-badge {
      border: 1px solid #94a3b8;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #334155;
      background-color: rgba(255, 255, 255, 0.4);
    }

    .user-profile-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
    }

    .user-role {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    @media (max-width: 992px) {
      .navbar-header {
        flex-wrap: wrap;
        height: auto;
        padding: 12px 16px;
        gap: 12px;
      }
    }
  `]
})
export class HeaderNavbarComponent {
  constructor(
    readonly authService: AuthService,
    private readonly router: Router
  ) {}

  getRoleLabel(role: string | undefined): string {
    if (role === 'ADMIN') {
      return 'ADMINISTRADOR';
    }

    if (role === 'TEACHER') {
      return 'PROFESSOR';
    }

    if (role === 'STUDENT') {
      return 'ALUNO';
    }

    return 'VISITANTE';
  }

  handleLogout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
