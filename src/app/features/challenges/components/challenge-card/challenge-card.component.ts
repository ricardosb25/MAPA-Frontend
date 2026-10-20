import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeModel, getDifficultyLabel, getDifficultySeverity } from '../../../../core/models/challenge.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule, TagModule, ButtonModule, TooltipModule, CardModule, ChipModule],
  template: `
    <p-card styleClass="challenge-card">
      <ng-template pTemplate="header">
        <header class="card-header">
          <div class="header-left">
            <i class="fa-solid fa-bullseye challenge-icon"></i>
            <div class="challenge-info">
              <h3 class="challenge-title">{{ challenge.title }}</h3>
              <span class="motor-info">{{ challenge.motorManufacturer }} {{ challenge.motorName }} · {{ challenge.goalPowerCv }} cv</span>
            </div>
          </div>
          <p-tag 
            [value]="getDifficultyLabel(challenge.difficulty)" 
            [severity]="getDifficultySeverity(challenge.difficulty)"
            styleClass="challenge-difficulty-tag"
          ></p-tag>
        </header>
      </ng-template>

      <ng-template pTemplate="content">
        <div class="card-body">
          <p class="challenge-description">{{ challenge.description }}</p>
          
          <div class="meta-info">
            <p-chip
              [label]="challenge.className + ' (' + challenge.classCode + ')'"
              icon="fa-solid fa-chalkboard-user"
              styleClass="class-badge"
            ></p-chip>
            
            <div class="stats-info">
              <p-chip
                [label]="challenge.completedStudents + '/' + challenge.enrolledStudents"
                icon="fa-solid fa-users-check"
                styleClass="stats-chip"
                pTooltip="Alunos que concluíram / Total matriculados"
                tooltipPosition="top"
              ></p-chip>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <footer class="card-footer">
          <p-button
            label="Ver desempenho"
            icon="pi pi-arrow-right"
            iconPos="right"
            [text]="true"
            styleClass="performance-link"
            (onClick)="viewPerformance.emit(challenge)"
          ></p-button>

          <div class="action-buttons">
            <p-button
              icon="pi pi-pencil"
              severity="secondary"
              [text]="true"
              size="small"
              styleClass="card-icon-button"
              (onClick)="edit.emit(challenge)"
              pTooltip="Editar desafio"
              ariaLabel="Editar desafio"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="secondary"
              [text]="true"
              size="small"
              styleClass="card-icon-button challenge-delete"
              (onClick)="delete.emit(challenge)"
              pTooltip="Excluir desafio"
              ariaLabel="Excluir desafio"
            ></p-button>
          </div>
        </footer>
      </ng-template>
    </p-card>
  `,
  styles: [`
    :host ::ng-deep .challenge-card.p-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      height: 100%;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }

    :host ::ng-deep .challenge-card.p-card:hover {
      transform: translateY(-1px);
      border-color: #93c5fd;
      box-shadow: 0 10px 20px -16px rgba(0, 114, 199, 0.45);
    }

    :host ::ng-deep .challenge-card .p-card-header,
    :host ::ng-deep .challenge-card .p-card-body,
    :host ::ng-deep .challenge-card .p-card-content,
    :host ::ng-deep .challenge-card .p-card-footer {
      padding: 0;
    }

    :host ::ng-deep .challenge-card .p-card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 14px;
    }

    :host ::ng-deep .challenge-card .p-card-content {
      flex: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .header-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .challenge-icon {
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      font-size: 1rem;
      color: #0072c7;
      background: #eef8ff;
      border: 1px solid #d9efff;
      border-radius: 10px;
    }

    .challenge-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .motor-info {
      font-size: 0.68rem;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .challenge-description {
      margin: 0;
      font-size: 0.84rem;
      color: #475569;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.5rem;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 10px;
      margin-top: 8px;
    }

    :host ::ng-deep .class-badge.p-chip,
    :host ::ng-deep .stats-chip.p-chip {
      color: #475569;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 4px 7px;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      height: 24px;
    }

    .stats-info {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    :host ::ng-deep .class-badge.p-chip .p-chip-label,
    :host ::ng-deep .stats-chip.p-chip .p-chip-label {
      font-size: 0.68rem;
    }

    :host ::ng-deep .class-badge.p-chip .p-chip-icon,
    :host ::ng-deep .stats-chip.p-chip .p-chip-icon {
      font-size: 0.62rem;
      color: #0072c7;
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .action-buttons {
      display: flex;
      gap: 2px;
    }

    :host ::ng-deep .performance-link.p-button {
      padding: 0.35rem 0.4rem;
      margin-left: -0.4rem;
      color: #0072c7;
      font-size: 0.78rem;
      font-weight: 800;
      gap: 0.35rem;
      box-shadow: none;
    }

    :host ::ng-deep .performance-link.p-button:not(:disabled):hover {
      background: #eef8ff;
      color: #065ca0;
    }

    :host ::ng-deep .performance-link.p-button .p-button-icon {
      font-size: 0.68rem;
    }

    :host ::ng-deep .card-icon-button.p-button {
      width: 30px;
      height: 30px;
      padding: 0;
      border-radius: 6px;
      color: #64748b;
      background: transparent;
    }

    :host ::ng-deep .card-icon-button.p-button .pi {
      font-size: 0.8rem;
    }

    :host ::ng-deep .card-icon-button.p-button:not(:disabled):hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  `]
})
export class ChallengeCardComponent {
  @Input({ required: true }) challenge!: ChallengeModel;
  @Output() viewPerformance = new EventEmitter<ChallengeModel>();
  @Output() edit = new EventEmitter<ChallengeModel>();
  @Output() delete = new EventEmitter<ChallengeModel>();

  getDifficultyLabel = getDifficultyLabel;
  getDifficultySeverity = getDifficultySeverity;
}
