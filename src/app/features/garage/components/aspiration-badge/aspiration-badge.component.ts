import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineAspirationType } from '../../../../core/models/engine.model';

@Component({
  selector: 'app-aspiration-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aspiration-badge" [ngClass]="normalizedAspiration">
      <i class="badge-icon" [ngClass]="badgeIcon"></i>
      <span class="badge-text">{{ badgeLabel }}</span>
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

    .aspiration-badge.supercharger {
      background-color: #e0f2fe;
      color: #0369a1;
      border-color: #7dd3fc;
    }

    .badge-icon {
      font-size: 0.7rem;
    }
  `]
})
export class AspirationBadgeComponent {
  @Input({ required: true }) aspiration!: EngineAspirationType;

  private readonly badgeConfiguration: Record<
    EngineAspirationType,
    { label: string; iconClass: string }
  > = {
    ASPIRADO: { label: 'Aspirado', iconClass: 'fa-solid fa-bolt' },
    TURBO: { label: 'Turbo', iconClass: 'fa-solid fa-wind' },
    SUPERCHARGER: { label: 'Supercharger', iconClass: 'fa-solid fa-gears' }
  };

  get normalizedAspiration(): string {
    return this.matchedAspiration.toLowerCase();
  }

  get badgeLabel(): string {
    return this.badgeConfiguration[this.matchedAspiration].label;
  }

  get badgeIcon(): string {
    return this.badgeConfiguration[this.matchedAspiration].iconClass;
  }

  private get matchedAspiration(): EngineAspirationType {
    const matchedOption = Object.keys(this.badgeConfiguration).find(
      (aspirationOption) => aspirationOption === this.aspiration.toUpperCase()
    );

    return (matchedOption as EngineAspirationType | undefined) ?? 'ASPIRADO';
  }
}
