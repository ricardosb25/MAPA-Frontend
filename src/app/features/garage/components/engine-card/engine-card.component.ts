import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineModel } from '../../../../core/models/engine.model';
import { AspirationBadgeComponent } from '../aspiration-badge/aspiration-badge.component';
import { EngineSpecItemComponent } from '../engine-spec-item/engine-spec-item.component';

@Component({
  selector: 'app-engine-card',
  standalone: true,
  imports: [CommonModule, AspirationBadgeComponent, EngineSpecItemComponent],
  template: `
    <div class="engine-card" [class.selected]="engine.isSelected">
      <div class="card-header">
        <div class="header-main">
          <span class="manufacturer-text">{{ engine.manufacturer }}</span>
          <h3 class="engine-name">{{ engine.name }}</h3>
        </div>
        <app-aspiration-badge [aspiration]="engine.aspirationType"></app-aspiration-badge>
      </div>

      <p class="description-text">
        {{ engine.description }}
      </p>

      <div class="divider"></div>

      <div class="specs-grid">
        <app-engine-spec-item
          label="Cilindrada"
          [value]="engine.displacementLiters + 'L (' + engine.displacementCc + ' cm³)'"
        ></app-engine-spec-item>
        <app-engine-spec-item
          label="Compressão"
          [value]="engine.compressionRatio + ':1'"
        ></app-engine-spec-item>
        <app-engine-spec-item
          label="Corte"
          [value]="engine.rpmCutoff + ' rpm'"
        ></app-engine-spec-item>
      </div>

      <div class="card-action-row">
        <button
          type="button"
          class="action-button"
          [class.selected-button]="engine.isSelected"
          (click)="onSelectEngine()"
        >
          <ng-container *ngIf="engine.isSelected; else unselectedTemplate">
            <i class="fa-solid fa-check check-icon"></i>
            <span>Motor na bancada</span>
          </ng-container>
          <ng-template #unselectedTemplate>
            <span>Selecionar motor</span>
          </ng-template>
        </button>

        @if (canManage) {
          <button
            type="button"
            class="icon-button edit-button"
            title="Editar motor"
            aria-label="Editar motor"
            (click)="onEditEngine()"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            type="button"
            class="icon-button delete-button"
            title="Excluir motor"
            aria-label="Excluir motor"
            (click)="onDeleteEngine()"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .engine-card {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      &.selected {
        border-color: #38bdf8;
        background-color: #ffffff;
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .manufacturer-text {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #64748b;
      text-transform: uppercase;
    }

    .engine-name {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .description-text {
      margin: 0 0 20px 0;
      font-size: 0.825rem;
      line-height: 1.45;
      color: #475569;
      min-height: 40px;
    }

    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin-bottom: 16px;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .card-action-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-button {
      flex: 1;
      height: 42px;
      border: none;
      border-radius: 8px;
      background-color: #475569;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.2s ease, transform 0.1s ease;

      &:hover {
        background-color: #334155;
      }

      &:active {
        transform: scale(0.99);
      }

      &.selected-button {
        background-color: #0099ff;
        box-shadow: 0 2px 8px rgba(0, 153, 255, 0.3);

        &:hover {
          background-color: #0088e6;
        }
      }
    }

    .check-icon {
      font-size: 0.9rem;
    }

    .icon-button {
      width: 42px;
      height: 42px;
      min-width: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background-color: #ffffff;
      color: #475569;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .edit-button:hover {
      background-color: #0099ff;
      border-color: #0099ff;
      color: #ffffff;
    }

    .delete-button:hover {
      background-color: #dc2626;
      border-color: #dc2626;
      color: #ffffff;
    }
  `]
})
export class EngineCardComponent {
  @Input({ required: true }) engine!: EngineModel;
  @Input() canManage = false;
  @Output() selectEngine = new EventEmitter<string>();
  @Output() editEngine = new EventEmitter<EngineModel>();
  @Output() deleteEngine = new EventEmitter<EngineModel>();

  onSelectEngine(): void {
    if (!this.engine.isSelected) {
      this.selectEngine.emit(this.engine.id.toString());
    }
  }

  onEditEngine(): void {
    this.editEngine.emit(this.engine);
  }

  onDeleteEngine(): void {
    this.deleteEngine.emit(this.engine);
  }
}
