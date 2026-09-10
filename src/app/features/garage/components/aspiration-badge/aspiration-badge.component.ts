import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineAspirationType } from '../../../../core/models/engine.model';

@Component({
  selector: 'app-aspiration-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aspiration-badge" [ngClass]="aspiration.toLowerCase()">
      <i class="badge-icon" [ngClass]="aspiration === 'TURBO' ? 'fa-solid fa-wind' : 'fa-solid fa-bolt'"></i>
      <span class="badge-text">{{ aspiration === 'TURBO' ? 'Turbo' : 'Aspirado' }}</span>
    </div>
  `,
  styles: [`
    .aspiration-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid transparent;
      user-select: none;
    }

    .aspiration-badge.turbo {
      background-color: #e6f4ea;
      color: #1b8754;
      border-color: #a3e635;
    }

    .aspiration-badge.aspirado {
      background-color: #fef3c7;
      color: #d97706;
      border-color: #fcd34d;
    }

    .badge-icon {
      font-size: 0.7rem;
    }
  `]
})
export class AspirationBadgeComponent {
  @Input({ required: true }) aspiration!: EngineAspirationType;
}
