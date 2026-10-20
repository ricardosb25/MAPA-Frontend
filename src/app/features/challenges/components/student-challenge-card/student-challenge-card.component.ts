import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeModel, getDifficultyLabel, getDifficultySeverity } from '../../../../core/models/challenge.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-student-challenge-card',
  standalone: true,
  imports: [CommonModule, TagModule, ButtonModule, TooltipModule, ProgressBarModule, CardModule],
  template: `
    <p-card [styleClass]="cardStyleClass">
      <ng-template pTemplate="header">
        <header class="card-header">
          <div class="header-left">
            <i class="fa-solid fa-bullseye challenge-icon"></i>
            <div class="challenge-info">
              <h3 class="challenge-title">{{ challenge.title }}</h3>
              <span class="motor-info">{{ challenge.motorManufacturer }} {{ challenge.motorName }}</span>
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
          
          <div class="goal-box">
            <span class="goal-label">META DE POTÊNCIA</span>
            <span class="goal-value">{{ challenge.goalPowerCv }} cv</span>
          </div>

          <div class="criteria-list">
            @for (criterion of challenge.criteria; track criterion; let i = $index) {
              <div class="criterion-item" [class.met]="i < challenge.completedCriteria">
                <i class="fa-solid" [class.fa-circle-check]="i < challenge.completedCriteria" [class.fa-circle] ="i >= challenge.completedCriteria"></i>
                <span>{{ criterion }}</span>
              </div>
            }
          </div>

          <p-progressbar
            [value]="criteriaProgress"
            [showValue]="false"
            styleClass="criteria-progress"
          ></p-progressbar>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <footer class="card-footer">
          @if (challenge.completed) {
            <div class="completed-badge">
              <i class="fa-solid fa-check-double"></i>
              <span>DESAFIO CONCLUÍDO</span>
            </div>
          } @else if (challenge.selected) {
            <div class="active-badge">
              <i class="fa-solid fa-play"></i>
              <span>DESAFIO ATIVO</span>
            </div>
            <p-button
              label="Ir para Calibração"
              icon="fa-solid fa-microchip"
              styleClass="challenge-primary-button p-button-full"
              (onClick)="goToCalibration.emit(challenge)"
            ></p-button>
          } @else {
            <p-button
              label="Selecionar Desafio"
              icon="fa-solid fa-hand-pointer"
              [outlined]="true"
              styleClass="challenge-secondary-button p-button-full"
              [loading]="loading"
              (onClick)="select.emit(challenge)"
            ></p-button>
          }
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
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      height: 100%;
      position: relative;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }

    :host ::ng-deep .challenge-card.p-card:hover {
      transform: translateY(-1px);
      border-color: #93c5fd;
      box-shadow: 0 10px 20px -16px rgba(0, 114, 199, 0.45);
    }

    :host ::ng-deep .challenge-card.selected {
      border-color: #0099ff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    :host ::ng-deep .challenge-card.completed {
      border-color: #93c5fd;
      background-color: #f7fbff;
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
      margin: 0 0 12px 0;
      font-size: 0.84rem;
      color: #475569;
      line-height: 1.5;
    }

    .goal-box {
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
    }

    .goal-label {
      font-size: 0.63rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.08em;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .goal-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    :host ::ng-deep .criteria-progress {
      height: 6px;
      border-radius: 3px;
      background: #e2e8f0;
    }

    :host ::ng-deep .criteria-progress .p-progressbar-value {
      background: #0099ff;
      border-radius: 3px;
    }

    .criterion-item {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 0.82rem;
      color: #64748b;
    }

    .criterion-item i {
      font-size: 0.82rem;
      color: #cbd5e1;
    }

    .criterion-item.met {
      color: #0f172a;
      font-weight: 700;
    }

    .criterion-item.met i {
      color: #0099ff;
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .p-button-full {
      width: 100%;
    }

    :host ::ng-deep .challenge-primary-button.p-button,
    :host ::ng-deep .challenge-secondary-button.p-button {
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: none;
    }

    :host ::ng-deep .challenge-secondary-button.p-button {
      color: #065ca0;
      border-color: #bce4ff;
      background: #ffffff;
    }

    :host ::ng-deep .challenge-secondary-button.p-button:not(:disabled):hover {
      color: #065ca0;
      border-color: #0099ff;
      background: #eef8ff;
    }

    .completed-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #065ca0;
      font-weight: 800;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      padding: 9px;
      background: #eef8ff;
      border: 1px solid #bce4ff;
      border-radius: 6px;
    }

    .active-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #0072c7;
      font-weight: 800;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      margin-bottom: 2px;
    }
  `]
})
export class StudentChallengeCardComponent {
  @Input({ required: true }) challenge!: ChallengeModel;
  @Input() loading = false;
  
  @Output() select = new EventEmitter<ChallengeModel>();
  @Output() goToCalibration = new EventEmitter<ChallengeModel>();

  getDifficultyLabel = getDifficultyLabel;
  getDifficultySeverity = getDifficultySeverity;

  get cardStyleClass(): string {
    const classes = ['challenge-card'];
    if (this.challenge?.selected) {
      classes.push('selected');
    }
    if (this.challenge?.completed) {
      classes.push('completed');
    }
    return classes.join(' ');
  }

  get criteriaProgress(): number {
    const total = this.challenge?.criteria?.length ?? 0;
    if (total === 0) {
      return 0;
    }
    return (this.challenge.completedCriteria / total) * 100;
  }
}
